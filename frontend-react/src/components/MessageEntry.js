import React, { useState } from 'react';
import axios from 'axios';
import './MessageEntry.css';
import AudioRecorder from './AudioRecorder';

const MessageEntry = ({ onNewMessage }) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        timestamp: new Date().toISOString(),
        character: "Ama",
        message: message
      };
      
      // Actualizar el estado local inmediatamente
      onNewMessage(newMessage);
      
      // Limpiar el input
      setMessage('');

      try {
        await axios.post('http://localhost:8080/chat', { user_input: message });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleSendImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      const response = await axios.post('http://localhost:8080/upload_image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image uploaded:', response.data);
      // Handle image URL if needed
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      handleSendImage(file);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleAudioStop = (audioUrl) => {
    // Handle the audio URL after recording stops and the file is uploaded
    console.log('Audio URL:', audioUrl);
    // You can also send the audio URL to the backend or add it to the chat messages here
  };

  return (
    <div className="message-entry">
      <img src={`${process.env.PUBLIC_URL}/resources/icons/BM_PLUS.png`} alt="Plus Icon" className="icon plus-icon" />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        className="message-input"
        onKeyPress={handleKeyPress}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
        id="imageUpload"
      />
      <label htmlFor="imageUpload">
        <img src={`${process.env.PUBLIC_URL}/resources/icons/BM_CAMERA.png`} alt="Camera Icon" className="icon camera-icon" />
      </label>
      <AudioRecorder onStopRecording={handleAudioStop} />
      <img
        src={`${process.env.PUBLIC_URL}/resources/icons/BM_SEND_BUTTON.png`}
        alt="Send Icon"
        className="send-button icon"
        onClick={handleSendMessage}
      />
    </div>
  );
};

export default MessageEntry;