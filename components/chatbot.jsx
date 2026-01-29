"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "👋 Hi! I'm here to help you find the perfect bike. You can ask me about bikes, search by category or price, book test drives, or reserve a bike. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const MESSAGE_DELAY = 1000; // Minimum 1 second between messages

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Rate limiting
    const now = Date.now();
    if (now - lastMessageTime < MESSAGE_DELAY) {
      return;
    }

    setLastMessageTime(now);

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            userMessage,
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error (${response.status}): ${errorData.error || "Failed to send message"}`);
      }

      const data = await response.json();

      if (!data.content) {
        throw new Error("No response content received from API");
      }

      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content: data.content,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-shadow"
            size="icon"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Bike Assistant</h3>
                <p className="text-xs text-blue-100">Always here to help</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about bikes..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
