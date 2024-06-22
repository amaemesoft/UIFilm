import React from 'react';
import PropTypes from 'prop-types';
import './ChatMessage.css';

const ChatMessage = ({ message, isMarta }) => {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderMessageContent = () => {
    if (message.audio_url) {
      return (
        <div className="audio-message">
          <audio controls>
            <source src={`http://localhost:8080${message.audio_url}`} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }
    if (message.image_url) {
      return (
        <div className="image-message">
          <img src={`http://localhost:8080${message.image_url}`} alt="Uploaded" />
        </div>
      );
    }
    return <span className="message-text">{message.message}</span>;
  };

  return (
    <div className={`chat-message ${isMarta ? 'marta' : 'ama'}`}>
      <div className="message-bubble">
        {renderMessageContent()}
        <div className="message-info">
          <span className="message-time">{formattedTime}</span>
          {isMarta && <img src={`${process.env.PUBLIC_URL}/resources/icons/DOBLECLICK_BL.png`} alt="Delivered" className="message-ticks" />}
        </div>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    timestamp: PropTypes.string.isRequired,
    message: PropTypes.string,
    audio_url: PropTypes.string,
    image_url: PropTypes.string,
  }).isRequired,
  isMarta: PropTypes.bool,
};

ChatMessage.defaultProps = {
  isMarta: false,
};

export default ChatMessage;
