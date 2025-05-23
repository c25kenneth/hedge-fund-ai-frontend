import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;
const CHATBOT_UUID = "00000000-0000-0000-0000-000000000001";

export default function useChatMessages(navigate) {
  const [messages, setMessages] = useState([]);
  const [unformattedMessages, setUnformattedMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loadingMessageId, setLoadingMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/signin");
          return;
        }
        setUserId(session.user.id);
        await createUser(session.user.id);
        await fetchMessages(session.user.id);
      } catch (error) {
        console.error("Auth error:", error);
        setError("Authentication error. Please sign in again.");
      } finally {
        setIsFetching(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const createUser = async (uid) => {
    try {
      const res = await fetch(`${API_URL}/createUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      });
      if (!res.ok) console.warn('User creation warning');
    } catch (err) {
      console.error('Create user error', err);
    }
  };

  const fetchMessages = async (id = userId, preserveRecentSources = false) => {
    setIsFetching(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/getUserChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: id })
      });
  
      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }
  
      const data = await res.json();
      console.log('Fetched chat data:', data);
  
      let existingSources = {};
      if (preserveRecentSources) {
        messages.slice(-5).forEach(msg => {
          if (msg.sources && msg.sources.length > 0) {
            existingSources[msg.text] = msg.sources;
          }
        });
      }
  
      const formatted = data.map(msg => ({
        id: msg.id,
        sender: msg.sender_uid === CHATBOT_UUID ? 'ai' : 'user',
        text: msg.message_text,
        timestamp: msg.timestamp,
        sources: existingSources[msg.message_text] || msg.sources || []
      }));
  
      const unformatted = data.map(msg => ({
        role: msg.sender_uid === CHATBOT_UUID ? 'assistant' : 'user',
        content: msg.message_text
      }));
  
      setMessages(formatted);
      setUnformattedMessages(unformatted);
    } catch (err) {
      console.error('Fetch error', err);
      setError("Failed to load chat history.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    const tempId = Date.now();
    const aiMessageId = tempId + 1;
    
    setLoadingMessageId(aiMessageId);
    
    setMessages(prev => [...prev, 
      { id: tempId, sender: 'user', text: msg }, 
      { id: aiMessageId, sender: 'ai', text: '', sources: [] }
    ]);

    try {
      let aiText = '';
      let sources = [];
      
      await sendToBot(msg, (chunk, metadata) => {
        if (metadata) {
          sources = metadata.sources || [];
        } else {
          aiText += chunk;
        }
        
        setMessages(prev => {
          const updated = [...prev];
          const aiIndex = updated.findIndex(m => m.id === aiMessageId);
          if (aiIndex !== -1) {
            updated[aiIndex].text = aiText;
            updated[aiIndex].sources = sources;
          }
          return updated;
        });
      });
      
    } catch (err) {
      console.error('Send error', err);
      setError("Failed to send message.");
      setMessages(prev => prev.filter(m => m.id !== aiMessageId));
    } finally {
      setIsLoading(false);
      setLoadingMessageId(null);
    }
  };

  const sendToBot = async (message, onChunk) => {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, uid: userId, messageContext: unformattedMessages })
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const reader = res.body.getReader();
    let accumulatedData = '';
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const decoder = new TextDecoder('utf-8');
        const chunk = decoder.decode(value, { stream: true });
        
        accumulatedData += chunk;
        
        if (accumulatedData.includes('[[META]]')) {
          const parts = accumulatedData.split('[[META]]');
          const textPart = parts[0];
          const metaPart = parts[1];
          
          onChunk(textPart, null);
          
          try {
            const metadata = JSON.parse(metaPart);
            onChunk('', metadata);
          } catch (e) {
            console.error('Failed to parse metadata:', e);
          }
          break;
        } else {

          const safeBreakPoints = ['. ', '.\n', '? ', '!\n', '! '];
          let lastSafePoint = -1;
          
          for (const breakPoint of safeBreakPoints) {
            const index = accumulatedData.lastIndexOf(breakPoint);
            if (index > lastSafePoint) {
              lastSafePoint = index + breakPoint.length;
            }
          }
          
          if (lastSafePoint > 0) {
            const safeText = accumulatedData.substring(0, lastSafePoint);
            if (!safeText.includes('【') || safeText.lastIndexOf('】') > safeText.lastIndexOf('【')) {
              onChunk(safeText, null);
            }
          }
        }
      }
      
      if (!accumulatedData.includes('[[META]]')) {
        onChunk(accumulatedData, null);
      }
      
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  };

  return {
    messages,
    input,
    setInput,
    handleSend,
    error,
    isLoading,
    isFetching,
    loadingMessageId,
    handleRefresh: () => fetchMessages(userId),
    signOutAndRedirect: async () => {
      await supabase.auth.signOut();
      navigate("/signin");
    },
    messagesEndRef
  };
}