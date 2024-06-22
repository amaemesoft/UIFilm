import React, { useState, useEffect } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';
import './AudioRecorder.css';

const AudioRecorder = ({ onStopRecording }) => {
  const [record, setRecord] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');

  useEffect(() => {
    let timer;
    if (record) {
      setStartTime(Date.now());
      timer = setInterval(() => {
        const now = Date.now();
        const diff = now - startTime;
        const minutes = String(Math.floor(diff / 60000)).padStart(2, '0');
        const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        setElapsedTime(`${minutes}:${seconds}`);
      }, 1000);
    } else {
      clearInterval(timer);
      setElapsedTime('00:00');
    }
    return () => clearInterval(timer);
  }, [record, startTime]);

  const startRecording = () => {
    console.log("Recording started");
    setRecord(true);
  };

  const stopRecording = () => {
    console.log("Recording stopped");
    setRecord(false);
  };

  const onData = (recordedBlob) => {
    console.log('Chunk of real-time data is: ', recordedBlob);
  };

  const onStop = async (recordedBlob) => {
    console.log('Recorded Blob is: ', recordedBlob);
    const formData = new FormData();
    formData.append('audio', recordedBlob.blob, 'recording.webm');

    // Verificar el contenido del Blob antes de enviarlo
    console.log('Recorded Blob Size:', recordedBlob.blob.size);
    console.log('Recorded Blob Type:', recordedBlob.blob.type);

    try {
      const response = await axios.post('http://localhost:8080/upload_audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Server Response:', response.data);
      onStopRecording(response.data.audioUrl);
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  return (
    <div className="audio-recorder">
      <ReactMic
        record={record}
        className="sound-wave"
        onStop={onStop}
        onData={onData}
        mimeType="audio/wav"
        strokeColor="#000000"
        backgroundColor="transparent" // Hacer el fondo transparente
      />
      {record && (
        <div className="recording-indicator">
          <span className="timer">{elapsedTime}</span>
        </div>
      )}
      <button
        className={`audio-record-button ${record ? 'recording' : ''}`}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
      >
        <img src={`${process.env.PUBLIC_URL}/resources/icons/BM_AUDIO.png`} alt="Microphone Icon" />
      </button>
    </div>
  );
};

export default AudioRecorder;
