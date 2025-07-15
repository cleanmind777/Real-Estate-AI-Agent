import React from "react";
import Chat from "./components/Chat";
import Voice from "./components/Voice";

function App() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Real Estate Agent</h1>
      <Chat />
      <Voice />
    </div>
  );
}

export default App;
