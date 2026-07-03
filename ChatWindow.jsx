import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages }) {
  return (
    <div className="chat-window">
      {messages.map((m, i) => (
        <MessageBubble key={i} from={m.from} text={m.text} />
      ))}
    </div>
  );
}
