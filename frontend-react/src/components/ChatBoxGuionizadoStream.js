import React, { useState, useEffect, forwardRef } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import './ChatBox.css';

const ChatBoxGuionizadoStream = forwardRef(({ messages }, ref) => {
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const showTypingIndicatorAndAddMessage = () => {
      if (loading) return;
      setLoading(true);

      if (messages.length > displayedMessages.length) {
        const nextMessage = messages[displayedMessages.length];
        if (nextMessage.character === "Marta") {
          const previousMessage = messages[displayedMessages.length - 1];
          const thinkingDelay = previousMessage && previousMessage.character === "Ama" 
            ? Math.min(previousMessage.message.length * 100, 3000)
            : 1000;

          setTimeout(() => {
            setIsTyping(true);
            const typingDelay = Math.min(nextMessage.message.length * 100, 3000);
            setTimeout(() => {
              setIsTyping(false);
              setDisplayedMessages(prev => [...prev, nextMessage]);
              setLoading(false);
            }, typingDelay);
          }, thinkingDelay);
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

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
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

export default ChatBoxGuionizadoStream;