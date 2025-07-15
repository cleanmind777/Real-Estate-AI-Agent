import React, { useState, useRef } from "react";

function Voice() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.wav");

        const response = await fetch("/voice", {
          method: "POST",
          body: formData,
        });

        if (response.body) {
          const audio = new Audio();
          audio.src = URL.createObjectURL(await response.blob());
          audio.play();
        }
        audioChunks.current = [];
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to use voice features.");
    }
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setIsRecording(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Voice Interface</h2>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{ padding: "10px 20px", marginRight: "10px" }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}

export default Voice;
