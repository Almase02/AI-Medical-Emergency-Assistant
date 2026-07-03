import { useState } from "react";

export default function ChatInput({ value, onChange, onSend }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        padding: "12px",
        borderTop: "1px solid #ccc",
      }}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your emergency..."
        style={{
          flex: 1,
          padding: "12px",
          fontSize: "15px",
          borderRadius: "6px",
          border: "1px solid #aaa",
        }}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />

      <button
        onClick={onSend}
        style={{
          padding: "12px 18px",
          background: "#b11212",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Send
      </button>
    </div>
  );
}
