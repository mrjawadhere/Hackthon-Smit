import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useChat } from "@/hooks/useApi";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use a default thread ID - in a real app, this would be user-specific
  const threadId = "default-thread";
  const { sendMessage, isSending, chatData } = useChat(threadId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update messages when chat data changes
  useEffect(() => {
    if (chatData?.history) {
      const formattedMessages: Message[] = chatData.history.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role === "assistant" ? "assistant" : "user",
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(formattedMessages);
    }
  }, [chatData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date()
    };

    // Optimistically add user message
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");

    try {
      // Send message to backend - this will be handled by the useChat hook
      // For now, we'll simulate a response since the chat endpoint might not be working
      sendMessage({ user_input: currentInput });
      
      // Add a simulated response for demo purposes
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `I received your message: "${currentInput}". The student management AI agent is currently being set up. You can try asking about student management, campus information, or analytics.`,
          role: "assistant",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
      
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <Navbar />
      
      {/* Chat Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-white p-6"
        style={{ background: 'var(--gradient-admin)' }}
      >
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-2">Campus Admin AI Agent</h1>
          <p className="text-white/80">Ask me anything about students, departments, or campus operations</p>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="container mx-auto max-w-4xl">
          <AnimatePresence>
            {messages.length === 0 && !isSending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to Campus AI</h3>
                <p className="text-muted-foreground">Start a conversation to get insights about your campus</p>
                <div className="mt-4 text-sm text-muted-foreground space-y-1">
                  <p>Try asking:</p>
                  <p>"Add a new student" or "Show me all students"</p>
                  <p>"What is the campus email?" or "Tell me about departments"</p>
                </div>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex mb-6 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start space-x-3 max-w-2xl ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user" 
                      ? "text-primary-foreground" 
                      : "text-white"
                  }`}
                  style={{
                    background: message.role === "user" 
                      ? 'var(--gradient-primary)' 
                      : 'var(--gradient-secondary)'
                  }}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={message.role === "user" ? "message-user" : "message-ai"}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-6"
              >
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center"
                    style={{ background: 'var(--gradient-secondary)' }}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="message-ai">
                    <div className="typing-dots">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="border-t border-border bg-card/50 backdrop-blur-sm p-6"
      >
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about students, departments, or campus info..."
                className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                rows={1}
                maxLength={1000}
                disabled={isSending}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {input.length}/1000
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!input.trim() || isSending}
              className={`btn-admin p-3 ${
                input.trim() && !isSending 
                  ? "animate-pulse-glow" 
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;