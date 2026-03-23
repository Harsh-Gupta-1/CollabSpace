import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Terminal from "./Terminal";
import { getSocket } from "../../sockets/socket";

export default function CodeEditor({
  code,
  onChange,
  onExecute,
  output = "",
  hideTerminal = false,
  hideHeader = false,
  roomId = null,
}) {
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const isLocalChange = useRef(false);

  useEffect(() => {
    if (!roomId) return;
    const socket = getSocket();
    socketRef.current = socket;

    const handleCodeUpdate = (newCode) => {
      if (onChange && !isLocalChange.current) {
        isLocalChange.current = true;
        onChange(newCode);
        setTimeout(() => { isLocalChange.current = false; }, 100);
      }
    };

    socket.on("code-update", handleCodeUpdate);
    return () => { socket.off("code-update", handleCodeUpdate); };
  }, [roomId, onChange]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // --- DESIGN SYSTEM: THE TACTICAL BLUEPRINT ---
    monaco.editor.defineTheme("precisionDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        // 1. PRIMARY: SYSTEM ACTIONS & STRUCTURE (#73ffe3)
        { token: "keyword", foreground: "73ffe3", fontStyle: "bold" },
        { token: "keyword.js", foreground: "73ffe3", fontStyle: "bold" },
        { token: "operator", foreground: "73ffe3" },
        { token: "operator.js", foreground: "73ffe3" },
        { token: "function", foreground: "73ffe3" },
        { token: "predefined", foreground: "73ffe3" },
        { token: "type", foreground: "73ffe3" },

        // 2. BLUEPRINT LINES: EXHAUSTIVE DELIMITER OVERRIDE (#73ffe3)
        // This forces all brackets and parens to Cyan, killing the yellow/purple
        { token: "delimiter", foreground: "73ffe3" },
        { token: "delimiter.js", foreground: "73ffe3" },
        { token: "delimiter.bracket", foreground: "73ffe3" },
        { token: "delimiter.bracket.js", foreground: "73ffe3" },
        { token: "delimiter.parenthesis", foreground: "73ffe3" },
        { token: "delimiter.parenthesis.js", foreground: "73ffe3" },
        { token: "delimiter.curly", foreground: "73ffe3" },
        { token: "delimiter.curly.js", foreground: "73ffe3" },

        // 3. NEUTRAL: PARTS & IDENTIFIERS (#adaaaa)
        { token: "identifier", foreground: "adaaaa" },
        { token: "identifier.js", foreground: "adaaaa" },
        { token: "variable", foreground: "adaaaa" },
        { token: "variable.js", foreground: "adaaaa" },
        { token: "property", foreground: "adaaaa" },
        { token: "property.js", foreground: "adaaaa" },
        { token: "attribute.name", foreground: "adaaaa" },

        // 4. SECONDARY: DATA PAYLOAD (#c3f400)
        { token: "string", foreground: "c3f400" },
        { token: "string.js", foreground: "c3f400" },

        // 5. TERTIARY: HARDCODED CONSTANTS (#ffa44c)
        { token: "number", foreground: "ffa44c" },
        { token: "number.js", foreground: "ffa44c" },

        // 6. ON_SURFACE_VARIANT
        { token: "comment", foreground: "4a4a4a", fontStyle: "italic" },
      ],
      colors: {
        "editor.background": "#0e0e0e",           // Base Surface
        "editor.foreground": "#adaaaa",           // on_surface_variant
        "editorLineNumber.foreground": "#3d3d3d", // Dimmed Gutters
        "editorLineNumber.activeForeground": "#73ffe3",
        "editor.lineHighlightBackground": "#161616",
        "editor.selectionBackground": "#73ffe315",
        "editorCursor.foreground": "#73ffe3",
        "editorIndentGuide.background": "#1a1a1a",
        "editorActiveLineNumber.foreground": "#73ffe3",
        "editorBracketMatch.background": "#00000000",
        "editorBracketMatch.border": "#00000000",
      },
    });

    monaco.editor.setTheme("precisionDark");

    editor.updateOptions({
      lineNumbers: "on",
      lineNumbersMinChars: 4,
      fontSize: 14,
      lineHeight: 24,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: "400",
      letterSpacing: 0.5,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      minimap: { enabled: false },
      renderLineHighlight: "all",
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        useShadows: false,
      },
      padding: { top: 24 },
      // CRITICAL: Hard-disable colorized brackets and semantic highlighting
      bracketPairColorization: { enabled: false },
      matchBrackets: "never",
      occurrencesHighlight: false,
      selectionHighlight: false,
      semanticHighlighting: { enabled: false },
      renderWhitespace: "none",
    });
  };

  const handleCodeChange = (value) => {
    if (onChange) onChange(value);
    if (roomId && socketRef.current?.connected && !isLocalChange.current) {
      isLocalChange.current = true;
      socketRef.current.emit("code-update", { roomId, code: value });
      setTimeout(() => { isLocalChange.current = false; }, 100);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0e0e0e] overflow-hidden">
      {!hideHeader && (
        <div className="flex items-center justify-between px-8 py-4 bg-[#1a1a1a] select-none">
          <div className="flex items-center gap-6">
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.2em] font-semibold text-[#73ffe3]">
              Active_Buffer // index.js
            </span>
          </div>
          <button
            onClick={onExecute}
            className="bg-[#73ffe3] text-[#0e0e0e] text-[10px] uppercase tracking-[0.1em] font-bold px-6 py-2 rounded-[0.125rem] transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ boxShadow: "0 0 24px -6px rgba(115,255,227,0.4)" }}
          >
            Run_Precision_Build
          </button>
        </div>
      )}

      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="precisionDark"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
        />
      </div>

      {!hideTerminal && (
        <div className="h-[25%] bg-[#000000] flex flex-col">
          <div className="bg-[#1a1a1a] px-8 py-2">
            <span className="font-['Space_Grotesk'] text-[9px] uppercase tracking-[0.15em] font-bold text-[#adaaaa]">
              System_Output_Log
            </span>
          </div>
          <div className="flex-1 overflow-auto p-6 font-['JetBrains_Mono'] text-sm">
            <Terminal output={output} />
          </div>
        </div>
      )}
    </div>
  );
}