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
    setMessages(prev => [...prev, { id: tempId, sender: 'user', text: msg }, { id: tempId + 1, sender: 'ai', text: '' }]);

    try {
      let aiText = '';
      await sendToBot(msg, chunk => {
        aiText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          const aiIndex = updated.findIndex(m => m.id === tempId + 1);
          if (aiIndex !== -1) updated[aiIndex].text = aiText;
          return updated;
        });
      });
      setTimeout(() => fetchMessages(), 1000);
    } catch (err) {
      console.error('Send error', err);
      setError("Failed to send message.");
      setMessages(prev => prev.filter(m => m.id !== tempId + 1));
    } finally {
      setIsLoading(false);
    }
  };

  const sendToBot = async (message, onChunk) => {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, uid: userId, messageContext: unformattedMessages })
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
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
    handleRefresh: () => fetchMessages(userId),
    signOutAndRedirect: async () => {
      await supabase.auth.signOut();
      navigate("/signin");
    },
    messagesEndRef
  };
}