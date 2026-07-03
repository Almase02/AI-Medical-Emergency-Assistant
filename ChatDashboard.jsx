import { useState, useEffect, useRef } from "react";
import MapScreen from "./MapScreen";

export default function ChatDashboard() {
  const [showMap, setShowMap] = useState(false);

  // ✅ current chat messages
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 I’m your Emergency AI Assistant. How can I help?" }
  ]);

  // ✅ chat history (each chat = full conversation)
  const [history, setHistory] = useState([]);

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [voices, setVoices] = useState([]);
  const [voiceType, setVoiceType] = useState("normal");
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [listening, setListening] = useState(false);

  const messagesEndRef = useRef(null);

  // 🔽 scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔊 voices
  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // 🎤 voice input
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";

    setListening(true);

    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  };

  // 🔊 voice output
  const getVoice = () => {
    if (voiceType === "female") {
      return voices.find(v => v.name.includes("Zira")) || voices[0];
    }
    if (voiceType === "male") {
      return voices.find(v => v.name.includes("David")) || voices[0];
    }
    return voices[0];
  };

  const toggleSpeak = (text, i) => {
    if (speakingIndex === i) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.voice = getVoice();

    speech.onend = () => setSpeakingIndex(null);

    window.speechSynthesis.speak(speech);
    setSpeakingIndex(i);
  };

  // 📤 SEND MESSAGE (FIXED)
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    const userMsg = { from: "user", text: userText };

    // add user message
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      const botMsg = { from: "bot", text: data.response };

      // add bot response
      setMessages(prev => [...prev, botMsg]);

      // 🚨 Auto open map
      if (data.severity === "HIGH") {
        setShowMap(true);
      }

    } catch {
      setMessages(prev => [...prev, { from: "bot", text: "❌ Error" }]);
    }
  };

  // ➕ NEW CHAT (FIXED)
  const startNewChat = () => {
    if (messages.length > 1) {
      setHistory(prev => [
        { title: messages[1]?.text?.slice(0, 20) || "Chat", messages },
        ...prev
      ]);
    }

    setMessages([
      { from: "bot", text: "👋 I’m your Emergency AI Assistant. How can I help?" }
    ]);
  };

  // 👉 open map
  if (showMap) {
    return <MapScreen onBack={() => setShowMap(false)} />;
  }

  const filteredHistory = history.filter(h =>
    h.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* SIDEBAR */}
      <div style={{
        width: "260px",
        background: "#111827",
        color: "white",
        padding: "15px",
        display: "flex",
        flexDirection: "column"
      }}>
        <h2>🚨 Emergency AI</h2>

        <button onClick={startNewChat}>➕ New Chat</button>

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ flex: 1 }}>
          {filteredHistory.map((h, i) => (
            <div key={i} onClick={() => setMessages(h.messages)}>
              {h.title}
            </div>
          ))}
        </div>

        <div>👤 Almase</div>
      </div>

      {/* CHAT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <div style={{ background: "red", color: "white", padding: "10px" }}>
          Emergency Chat
        </div>

        {/* 🔥 CHAT UI FIXED */}
        <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.from === "user" ? "flex-end" : "flex-start",
                marginBottom: "10px"
              }}
            >
              <div
                style={{
                  background: m.from === "user" ? "#007bff" : "#e4e6eb",
                  color: m.from === "user" ? "white" : "black",
                  padding: "10px",
                  borderRadius: "10px",
                  maxWidth: "60%"
                }}
              >
                {m.text}

                {m.from === "bot" && (
                  <span
                    style={{ marginLeft: "10px", cursor: "pointer" }}
                    onClick={() => toggleSpeak(m.text, i)}
                  >
                    {speakingIndex === i ? "⏹" : "🔊"}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div style={{ display: "flex", gap: "10px", padding: "10px" }}>

          <button onClick={startListening}>🎤</button>
          <button>📎</button>

          <select onChange={(e) => setVoiceType(e.target.value)}>
            <option>🎙</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={{ flex: 1 }}
          />

          <button onClick={() => setShowMap(true)}>🗺️</button>

          <a href="tel:112">
            <button>📞</button>
          </a>

          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}