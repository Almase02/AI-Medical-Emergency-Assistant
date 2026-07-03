<ChatInput
  onSend={sendMessage}
  onLocationEnabled={(loc) => {
    setLocation(loc);
    setLocationEnabled(true);
  }}
/>
