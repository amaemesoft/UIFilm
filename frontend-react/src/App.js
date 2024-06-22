import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatBoxGuionizadoStream from './components/ChatBoxGuionizadoStream';
import ChatBoxIA from './components/ChatBoxIA';
import MessageEntry from './components/MessageEntry';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [iaMessages, setIaMessages] = useState([]);
  const [mode, setMode] = useState('guionizado');
  const [scrollPosition, setScrollPosition] = useState(0);
  const chatBoxRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:8080/chat_history');
      setMessages(response.data.history);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchMode = async () => {
    try {
      const response = await axios.get('http://localhost:8080/get_mode');
      handleModeChange(response.data.mode);
    } catch (error) {
      console.error("Error fetching mode:", error);
    }
  };

  const handleModeChange = (newMode) => {
    if (chatBoxRef.current) {
      setScrollPosition(chatBoxRef.current.scrollTop);
    }
    setMode(newMode);
  };

  const handleNewMessage = (newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const loadIaConversation = async () => {
    try {
      const response = await axios.post('http://localhost:8080/generate_conversation', { prompts: ["Generar conversación previa"] });
      setIaMessages(prevIaMessages => [...response.data.conversation, ...prevIaMessages]);
    } catch (error) {
      console.error("Error loading IA conversation:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchMode();
    const interval = setInterval(() => {
      fetchMessages();
      fetchMode();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatBoxRef.current && scrollPosition > 0) {
      chatBoxRef.current.scrollTop = scrollPosition;
    }
  }, [mode, scrollPosition]);

  const renderChatBox = () => {
    const props = {
      messages: [...iaMessages, ...messages],
      ref: chatBoxRef,
      loadIaConversation
    };

    if (mode === 'IA') {
      return <ChatBoxIA {...props} />;
    }
    return <ChatBoxGuionizadoStream {...props} />;
  };

  return (
    <div className="App">
      <Header />
      {renderChatBox()}
      <MessageEntry onNewMessage={handleNewMessage} />
    </div>
  );
}

export default App;