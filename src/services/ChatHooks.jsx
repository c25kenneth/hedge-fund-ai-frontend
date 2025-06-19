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

  const fetchMessages = async (id = userId) => {
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
  
      const formatted = data.map(msg => ({
        id: msg.id,
        sender: msg.sender_uid === CHATBOT_UUID ? 'ai' : 'user',
        text: msg.message_text,
        timestamp: msg.timestamp
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
      { id: aiMessageId, sender: 'ai', text: '' }
    ]);

    try {
      let aiText = '';
      
      await sendToBot(msg, (chunk) => {
        aiText += chunk;
        
        setMessages(prev => {
          const updated = [...prev];
          const aiIndex = updated.findIndex(m => m.id === aiMessageId);
          if (aiIndex !== -1) {
            updated[aiIndex].text = aiText;
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
      body: JSON.stringify({ 
        message: message, 
        uid: userId 
      })
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        if (chunk) {
          onChunk(chunk);
        }
      }
      
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  };

  const handleDocumentUpload = async (file, message = '') => {
    if (!file || isLoading) return;
    
    setIsLoading(true);
    setError(null);

    const tempId = Date.now();
    const aiMessageId = tempId + 1;
    
    setLoadingMessageId(aiMessageId);
    
    const displayMessage = `Uploaded: ${file.name} - ` + message || `Uploaded: ${file.name}`;
    
    setMessages(prev => [...prev, 
      { id: tempId, sender: 'user', text: displayMessage }, 
      { id: aiMessageId, sender: 'ai', text: '' }
    ]);

    try {
      let aiText = '';
      
      await sendDocumentToBot(file, message, (chunk) => {
        aiText += chunk;
        
        setMessages(prev => {
          const updated = [...prev];
          const aiIndex = updated.findIndex(m => m.id === aiMessageId);
          if (aiIndex !== -1) {
            updated[aiIndex].text = aiText;
          }
          return updated;
        });
      });
      
    } catch (err) {
      console.error('Document upload error', err);
      setError("Failed to upload document.");
      setMessages(prev => prev.filter(m => m.id !== aiMessageId));
    } finally {
      setIsLoading(false);
      setLoadingMessageId(null);
    }
  };

  const sendDocumentToBot = async (file, message, onChunk) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uid', userId);
    formData.append('message', message);

    const res = await fetch(`${API_URL}/chatDocument`, {
      method: 'POST',
      body: formData // No Content-Type header for FormData
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        if (chunk) {
          onChunk(chunk);
        }
      }
      
    } catch (error) {
      console.error('Document streaming error:', error);
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
    handleDocumentUpload,
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