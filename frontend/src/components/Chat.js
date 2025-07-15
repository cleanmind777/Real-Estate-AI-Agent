import React, { useState } from "react";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessages([...messages, { text: input, sender: "user" }]);
    setInput("");

    const response = await fetch("/chat_stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input }),
    });

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let result = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          if (
            newMessages.length > 0 &&
            newMessages[newMessages.length - 1].sender === "assistant"
          ) {
            newMessages[newMessages.length - 1].text += chunk;
          } else {
            newMessages.push({ text: chunk, sender: "assistant" });
          }
          return newMessages;
        });
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chat Interface</h2>
      <div
        style={{
          height: "400px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "10px",
            }}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "80%", padding: "5px" }}
          placeholder="Type your query..."
        />
        <button onClick={handleSubmit} style={{ padding: "5px 10px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
