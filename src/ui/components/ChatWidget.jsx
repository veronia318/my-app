import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import API_ENDPOINTS, {
  fetchWithAuth,
} from "../../infrastructure/api/api.config";
import "../styles/ChatWidget.css";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I'm your EnergySaver assistant. Ask me anything about your devices, energy usage, or how to save power.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetchWithAuth(API_ENDPOINTS.CHAT, {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply || "Sorry, I couldn't process that.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "Something went wrong. Please try again." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Couldn't connect to the assistant. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        className="chat-widget__fab"
        onClick={() => setIsOpen((prev) => !prev)}
        title={isOpen ? "Close assistant" : "Ask the AI assistant"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="chat-widget__panel">
          <div className="chat-widget__header">
            <Bot size={20} />
            <span>EnergySaver Assistant</span>
          </div>

          <div className="chat-widget__messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-widget__bubble ${
                  msg.sender === "user"
                    ? "chat-widget__bubble--user"
                    : "chat-widget__bubble--ai"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-widget__bubble chat-widget__bubble--ai chat-widget__typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-widget__input-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your energy usage..."
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
