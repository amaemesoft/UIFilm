// src/components/ChatBox.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TypingIndicator from './TypingIndicator';
import ChatMessage from './ChatMessage';
import './ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para controlar la carga

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:8080/chat_history');
      setMessages(response.data.history);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const showTypingIndicatorAndAddMessage = () => {
      if (loading) return; // Evitar solapamientos de carga
      setLoading(true);

      if (messages.length > displayedMessages.length) {
        const nextMessage = messages[displayedMessages.length];
        if (nextMessage.character === "Marta") {
          const delay = Math.min(nextMessage.message.length * 100, 3000);
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setDisplayedMessages(prev => [...prev, nextMessage]);
            setLoading(false);
          }, delay);
        } else {
          setDisplayedMessages(prev => [...prev, nextMessage]);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    showTypingIndicatorAndAddMessage();
  }, [messages, displayedMessages.length]);

  return (
    <div className="chat-box">
      {displayedMessages.map((message, index) => (
        <ChatMessage key={index} message={message} isMarta={message.character === "Marta"} />
      ))}
      {isTyping && (
        <div className="message Marta">
          <TypingIndicator />
        </div>
      )}
    </div>
  );
};

export default ChatBox;