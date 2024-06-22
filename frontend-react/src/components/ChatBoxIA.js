import React, { useState, useEffect, forwardRef, useRef } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import './ChatBox.css';

const ChatBoxIA = forwardRef(({ messages, loadIaConversation }, ref) => {
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevMessagesRef = useRef([]);

  useEffect(() => {
    setDisplayedMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (loading) return;

    if (messages.length === 0) {
      setDisplayedMessages([]);
      return;
    }

    if (displayedMessages.length === 0 && messages.length > 0) {
      setDisplayedMessages(messages);
      return;
    }

    const lastDisplayedMessage = displayedMessages[displayedMessages.length - 1];
    const lastDisplayedIndex = messages.findIndex(msg => msg.timestamp === lastDisplayedMessage.timestamp);

    if (lastDisplayedIndex === -1) {
      setDisplayedMessages(messages);
      return;
    }

    const nextMessage = messages[lastDisplayedIndex + 1];
    if (nextMessage) {
      const delay = Math.min(nextMessage.message.length * 100, 3000);
      setIsTyping(true);
      setLoading(true);
      setTimeout(() => {
        setIsTyping(false);
        setDisplayedMessages(prev => [...prev, nextMessage]);
        setLoading(false);
      }, delay);
    }
  }, [messages, displayedMessages, loading]);

  useEffect(() => {
    if (ref.current) {
      const prevMessages = prevMessagesRef.current;
      if (prevMessages.length < displayedMessages.length) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
      prevMessagesRef.current = displayedMessages;
    }
  }, [displayedMessages, isTyping]);

  const shouldShowDate = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();
    return currentDate !== previousDate;
  };

  const formatDate = (timestamp) => {
    const currentDate = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (currentDate.toDateString() === now.toDateString()) {
      return 'Hoy';
    } else if (currentDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return currentDate.toLocaleDateString();
    }
  };

  return (
    <div className="chat-box" ref={ref}>
      {displayedMessages.map((message, index) => (
        <React.Fragment key={index}>
          {shouldShowDate(message, displayedMessages[index - 1]) && (
            <div className="date-separator">
              {formatDate(message.timestamp)}
            </div>
          )}
          <ChatMessage message={message} isMarta={message.character === "Marta"} />
        </React.Fragment>
      ))}
      {isTyping && (
        <div className="message Marta">
          <TypingIndicator />
        </div>
      )}
    </div>
  );
});

export default ChatBoxIA;
