import { useCallback } from "react";
import { toast } from "react-toastify";

export default function Sidebar({
  roomId,
  userCount,
  mode,
  onModeChange,
  onLeave
}) {
  const handleCopyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard!", { autoClose: 2000 });
    } catch (err) {
      toast.error("Failed to copy Room ID", { autoClose: 2000 });
    }
  }, [roomId]);

  return (
    <aside className="flex h-full w-full flex-col justify-between border-r-0 bg-neutral-950 py-6 px-4 shadow-[0_0_24px_-4px_rgba(115,255,227,0.1)] dark:bg-[#0e0e0e]">
      <div>
        <div className="flex flex-col gap-1 mb-10 px-2">
          <div className="flex items-center gap-3 mb-1">
            <img src="/logo.svg" alt="CollabSpace Logo" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tighter text-[#73ffe3] font-headline uppercase">CollabSpace</span>
          </div>
          <span className="font-headline font-semibold text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">System Architecture v2</span>
          <div className="flex items-center gap-2 mt-4">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-label text-[10px] uppercase tracking-wider text-secondary">Live • {userCount} users</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {/* Whiteboard */}
          <button
            onClick={() => onModeChange("whiteboard")}
            className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-150 w-full ${mode === "whiteboard"
                ? "text-[#73ffe3] border-l-2 border-[#73ffe3] bg-neutral-900 dark:bg-[#1a1a1a] font-bold shadow-[0_0_15px_-3px_rgba(115,255,227,0.4)]"
                : "text-neutral-500 dark:text-[#adaaaa] hover:bg-neutral-800 dark:hover:bg-[#252525] hover:text-[#73ffe3]"
              }`}
          >
            <span className="material-symbols-outlined text-xl">edit_square</span>
            <span className="font-label text-sm uppercase tracking-widest text-left flex-1">Whiteboard</span>
          </button>

          {/* Code */}
          <button
            onClick={() => onModeChange("code")}
            className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-150 w-full ${mode === "code"
                ? "text-[#73ffe3] border-l-2 border-[#73ffe3] bg-neutral-900 dark:bg-[#1a1a1a] font-bold shadow-[0_0_15px_-3px_rgba(115,255,227,0.4)]"
                : "text-neutral-500 dark:text-[#adaaaa] hover:bg-neutral-800 dark:hover:bg-[#252525] hover:text-[#73ffe3]"
              }`}
          >
            <span className="material-symbols-outlined text-xl">code</span>
            <span className="font-label text-sm uppercase tracking-widest text-left flex-1">Code</span>
          </button>

          {/* Share */}
          <button
            onClick={handleCopyId}
            className="flex items-center gap-3 px-3 py-2 rounded-sm text-neutral-500 dark:text-[#adaaaa] hover:bg-neutral-800 dark:hover:bg-[#252525] hover:text-[#73ffe3] transition-all w-full"
          >
            <span className="material-symbols-outlined text-xl">share</span>
            <span className="font-label text-sm uppercase tracking-widest text-left flex-1">Share ID</span>
          </button>
        </nav>
      </div>

      <div className="flex flex-col gap-1">
        <button
          onClick={onLeave}
          className="bg-error-container text-on-background font-label text-xs uppercase tracking-widest font-bold py-3 px-4 rounded-sm mb-6 hover:brightness-110 active:scale-95 transition-all text-center"
        >
          Leave Session
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-neutral-500 dark:text-[#adaaaa] hover:text-[#73ffe3] transition-all w-full text-left">
          <span className="material-symbols-outlined text-xl">settings</span>
          <span className="font-label text-sm uppercase tracking-widest">Settings</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-neutral-500 dark:text-[#adaaaa] hover:text-[#73ffe3] transition-all w-full text-left">
          <span className="material-symbols-outlined text-xl">account_circle</span>
          <span className="font-label text-sm uppercase tracking-widest">Profile</span>
        </button>
      </div>
    </aside>
  );
}
