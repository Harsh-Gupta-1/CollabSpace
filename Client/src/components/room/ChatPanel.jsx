import { useState, useEffect, useRef } from "react";
import { getSocket } from "../../sockets/socket";

export default function ChatPanel({ roomId, user, messages: initialMessages, userCount, participants, isConnected }) {
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'participants'
  const [messages, setMessages] = useState(initialMessages || []);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("receive-message", handleReceiveMessage);
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !isConnected || !socketRef.current) return;

    const msg = {
      user,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: input.trim(),
      id: `${Date.now()}-${Math.random()}`,
    };

    socketRef.current.emit("send-message", { roomId, msg });
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <aside className="fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-outline-variant/10 bg-neutral-950 shadow-[-8px_0_24px_-4px_rgba(0,0,0,0.5)] dark:bg-[#0e0e0e]">
      <div className="p-6 flex flex-col h-full bg-surface">
        {/* Header & Toggler */}
        <div className="mb-6 flex flex-col gap-4">
          <span className="text-sm font-bold uppercase tracking-widest text-[#adaaaa] font-label">Room Activity</span>
          
          <div className="flex bg-surface-container-high rounded-sm p-1 border border-outline-variant/20">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-label uppercase tracking-widest transition-all rounded-sm ${
                activeTab === "chat" 
                  ? "bg-primary text-on-primary font-bold shadow-sm" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">forum</span>
              Chat
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-label uppercase tracking-widest transition-all rounded-sm ${
                activeTab === "participants" 
                  ? "bg-secondary text-on-secondary font-bold shadow-sm" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">group</span>
              Users ({userCount})
            </button>
          </div>
        </div>

        {/* Dynamic Content Area */}
        {activeTab === "chat" ? (
          <>
            {/* Chat History */}
            <div className="flex-1 overflow-auto space-y-6 mb-6 pr-2 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-50">
                  <span className="material-symbols-outlined text-4xl mb-2">chat_bubble_outline</span>
                  <span className="font-label text-xs uppercase tracking-widest">No messages yet</span>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMe = msg.user === user;
                    const colorClass = isMe ? "text-primary border-primary/20" : "text-secondary border-secondary/20";
                    return (
                      <div key={msg.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-label text-[10px] uppercase tracking-widest ${isMe ? "text-primary" : "text-secondary font-bold"}`}>
                            {isMe ? "You" : msg.user || "Guest"}
                          </span>
                          <span className="text-[9px] text-on-surface-variant opacity-50">{msg.time}</span>
                        </div>
                        <div className={`bg-surface-container-high p-3 rounded-sm text-xs leading-relaxed font-mono border-l-2 ${colorClass} text-on-surface`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="mt-auto relative">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-sm p-3 focus-within:border-primary/50 transition-colors">
                <textarea
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-mono placeholder:text-outline-variant/60 text-on-surface resize-none"
                  placeholder={isConnected ? "Send a message..." : "Connecting..."}
                  rows="2"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={!isConnected}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary transition-colors">attach_file</span>
                    <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary transition-colors">mood</span>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || !isConnected}
                    className="bg-primary text-on-primary p-1.5 rounded-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Participants List */
          <div className="flex-1 overflow-auto space-y-2 pr-2 custom-scrollbar">
            {participants.length === 0 ? (
              <div className="text-center text-on-surface-variant text-xs font-mono mt-10">
                No participants found.
              </div>
            ) : (
              participants.map((p) => {
                const isMe = p.username === user;
                return (
                  <div key={p.id} className="bg-surface-container-high p-3 rounded-sm border border-outline-variant/10 flex items-center justify-between group hover:border-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold text-xs ${isMe ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {(p.username || "G").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold truncate max-w-[120px] ${isMe ? 'text-primary' : 'text-on-surface'}`}>
                          {isMe ? `${p.username} (You)` : p.username || `Guest-${p.id.slice(0,4)}`}
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                          <span className="text-[9px] text-on-surface-variant uppercase tracking-widest font-label">Active in Session</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </aside>
  );
}