// Room.jsx

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getRoom } from "../api/roomAPI";
import { getSocket, disconnectSocket } from "../sockets/socket";
import Whiteboard from "../components/whiteboard/Whiteboard";
import CodeEditor from "../components/room/CodeEditor";
import ChatPanel from "../components/room/ChatPanel";
import Sidebar from "../components/room/Sidebar";
import { executeCode } from "../api/executeAPI";

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const canvasStateRef = useRef(null);
  const [mode, setMode] = useState("whiteboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomName, setRoomName] = useState("Untitled Room");
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(1);
  const [participants, setParticipants] = useState([]);
  const hasJoinedRoom = useRef(false);
  const socketRef = useRef(null);

  const userName = location.state?.name;

  const bumpLayout = useCallback(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((o) => !o);
    setTimeout(bumpLayout, 320);
  }, [bumpLayout]);

  useEffect(() => {
    if (!userName) {
      navigate("/");
    }
    const fetchRoom = async () => {
      try {
        const room = await getRoom(id);
        setCodeSnippet(room.codeSnippet || "");
        setRoomName(room.name || "Untitled Room");
      } catch {
        setError("Failed to load room");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();

    const socket = getSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      setIsConnected(true);
      if (!hasJoinedRoom.current) {
        socket.emit("join-room", { roomId: id, username: userName });
        hasJoinedRoom.current = true;
        setTimeout(() => {
          socket.emit("get-users", id);
          socket.emit("get-room-state", { roomId: id });
        }, 100);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      hasJoinedRoom.current = false;
    };

    const handleCodeUpdate = (code) => setCodeSnippet(code);

    const handleReceiveMessage = (msg) => {
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
    };

    const handleRoomUsers = ({ users }) => {
      setUserCount(users.length);
      setParticipants(users);
    };

    const handleRoomState = ({ messages, code, whiteboard }) => {
      if (code) setCodeSnippet(code);
      if (messages) {
        const combined = [...messages, ...messages];
        setMessages(
          Array.from(new Map(combined.map((m) => [m.id, m])).values())
        );
      }
      if (whiteboard) {
        canvasStateRef.current = JSON.stringify(whiteboard);
        if (mode === "whiteboard") {
          window.dispatchEvent(new Event("canvasRestore"));
        }
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("code-update", handleCodeUpdate);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("room-users", handleRoomUsers);
    socket.on("room-state", handleRoomState);

    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("code-update", handleCodeUpdate);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("room-users", handleRoomUsers);
      socket.off("room-state", handleRoomState);
    };
  }, [id, userName]);

  const handleCodeChange = useCallback(
    (code) => {
      setCodeSnippet(code);
      socketRef.current?.emit("code-update", { roomId: id, code });
    },
    [id]
  );

  const handleExecute = useCallback(async () => {
    try {
      const result = await executeCode(codeSnippet);
      setOutput(result.output || "Code executed successfully");
    } catch {
      setOutput("Error executing code");
      // toast.error("Execution failed", { autoClose: 4000 });
    }
  }, [codeSnippet]);

  const handleLeave = useCallback(() => {
    socketRef.current?.emit("leave-room", { roomId: id, username: userName });
    disconnectSocket();
    navigate("/dashboard");
  }, [id, userName, navigate]);

  const handleSendMessage = useCallback(
    (text) => {
      if (!text.trim()) return;
      const msg = {
        id: `${Date.now()}-${Math.random()}`,
        user: userName,
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      socketRef.current?.emit("send-message", { roomId: id, msg });
      setMessages((prev) => [...prev, msg]);
    },
    [id, userName]
  );

  const handleModeChange = (newMode) => {
    if (mode !== newMode) {
      setMode(newMode);
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        if (newMode === "whiteboard") {
          socketRef.current?.emit("get-room-state", { roomId: id });
          window.dispatchEvent(new Event("canvasRestore"));
        }
      }, 150);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono">
        Loading room...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500 font-mono">
        {error}
      </div>
    );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background font-body text-on-surface">
      {/* LEFT SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 border-r-0 bg-neutral-950 shadow-[0_0_24px_-4px_rgba(115,255,227,0.1)] transition-transform duration-300 ease-out dark:bg-[#0e0e0e] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          roomId={id}
          userCount={userCount}
          mode={mode}
          onModeChange={handleModeChange}
          onLeave={handleLeave}
        />
      </aside>

      {/* Sidebar toggle — bottom seam avoids overlap with whiteboard toolbar (left rail is top-heavy) */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        className={`fixed bottom-24 z-[60] flex h-10 w-8 items-center justify-center rounded-r-md border border-outline-variant/30 bg-surface-container-highest text-on-surface-variant shadow-[0_0_16px_-4px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-primary/40 hover:text-primary ${
          sidebarOpen ? "left-[256px]" : "left-0"
        }`}
      >
        <span className="material-symbols-outlined text-sm">
          {sidebarOpen ? "chevron_left" : "chevron_right"}
        </span>
      </button>

      {/* MAIN — dotted grid only in whiteboard mode; code mode uses flat surface */}
      <main
        className={`relative flex min-h-0 min-w-0 flex-1 flex-col transition-[margin] duration-300 ease-out ${
          sidebarOpen ? "ml-64" : "ml-0"
        } mr-80 h-full ${
          mode === "whiteboard"
            ? "bg-surface kinetic-grid"
            : "bg-[#0e0e0e]"
        }`}
      >
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          {mode === "whiteboard" ? (
            <Whiteboard
              roomId={id}
              socket={socketRef.current}
              canvasStateRef={canvasStateRef}
            />
          ) : (
            <CodeEditor
              code={codeSnippet}
              onChange={handleCodeChange}
              onExecute={handleExecute}
              output={output}
              roomId={id}
            />
          )}
        </div>
      </main>

      {/* RIGHT: chat + participants */}
      <ChatPanel
        roomId={id}
        user={userName}
        onSendMessage={handleSendMessage}
        messages={messages}
        userCount={userCount}
        participants={participants}
        isConnected={isConnected}
      />

    </div>
  );
}
