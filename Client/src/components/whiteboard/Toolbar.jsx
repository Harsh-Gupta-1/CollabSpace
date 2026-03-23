import { useState } from "react";
import { DS } from "./fabricDesignSystem";

const ACCENTS = [
  { hex: DS.primary, name: "Primary" },
  { hex: DS.secondary, name: "Secondary" },
  { hex: DS.tertiary, name: "Tertiary" },
  { hex: DS.onSurfaceVariant, name: "Muted" },
  { hex: DS.onSurface, name: "Highlight" },
];

function isShapeTool(t) {
  return Boolean(t && t.startsWith("shape-"));
}

export default function Toolbar({
  tool,
  setTool,
  deleteSelected,
  undo,
  clearCanvas,
  resetZoom,
  zoomIn,
  zoomOut,
  setColor,
  setBrushSize,
  zoom,
  color,
  brushSize,
}) {
  const [showSettings, setShowSettings] = useState(false);

  const activeClass =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary text-on-primary transition-colors";
  const defaultClass =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary";

  const panelClass =
    "absolute left-[4.5rem] top-1/2 z-40 max-h-[min(22rem,calc(100%-2rem))] min-w-[220px] -translate-y-1/2 overflow-y-auto rounded-lg bg-surface-container-highest p-4 font-label ring-1 ring-outline-variant/[0.15]";

  const shapePanelClass =
    "absolute left-[4.5rem] top-1/2 z-40 max-h-[min(22rem,calc(100%-2rem))] w-[8.5rem] -translate-y-1/2 overflow-y-auto rounded-lg bg-surface-container-highest p-3 font-label ring-1 ring-outline-variant/[0.15]";

  const showShapePicker = isShapeTool(tool);

  const closeSettingsOpenShapes = () => setShowSettings(false);

  const toggleSettingsPanel = () => {
    setShowSettings((open) => {
      if (open) return false;
      setTool("select");
      return true;
    });
  };

  return (
    <>
      {showSettings && (
        <div className={panelClass}>
          <p className="mb-4 font-label text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Stroke & ink
          </p>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block font-label text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface">
                Weight — {brushSize}px
              </label>
              <input
                type="range"
                min="1"
                max="24"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                className="slider-thumb-primary h-1 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-lowest outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block font-label text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface">
                Functional accents
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ACCENTS.map(({ hex, name }) => (
                  <button
                    key={hex}
                    type="button"
                    title={name}
                    onClick={() => setColor(hex)}
                    className={`relative h-8 w-full rounded-sm transition-transform hover:scale-105 ${
                      color === hex
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-container-highest"
                        : "ring-1 ring-outline-variant/20"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showShapePicker && (
        <div className={shapePanelClass}>
          <p className="mb-2 font-label text-[9px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Press and drag on canvas
          </p>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                setTool("shape-rect");
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-sm transition-colors ${
                tool === "shape-rect"
                  ? "bg-surface-container-high text-primary"
                  : "text-on-surface hover:bg-surface-container-high hover:text-primary"
              }`}
              title="Rectangle"
            >
              <span className="material-symbols-outlined text-lg">rectangle</span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                setTool("shape-circle");
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-sm transition-colors ${
                tool === "shape-circle"
                  ? "bg-surface-container-high text-primary"
                  : "text-on-surface hover:bg-surface-container-high hover:text-primary"
              }`}
              title="Ellipse"
            >
              <span className="material-symbols-outlined text-lg">radio_button_unchecked</span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                setTool("shape-triangle");
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-sm transition-colors ${
                tool === "shape-triangle"
                  ? "bg-surface-container-high text-primary"
                  : "text-on-surface hover:bg-surface-container-high hover:text-primary"
              }`}
              title="Triangle"
            >
              <span className="material-symbols-outlined text-lg">change_history</span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                setTool("shape-line");
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-sm transition-colors ${
                tool === "shape-line"
                  ? "bg-surface-container-high text-primary"
                  : "text-on-surface hover:bg-surface-container-high hover:text-primary"
              }`}
              title="Line"
            >
              <span className="material-symbols-outlined text-lg">horizontal_rule</span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                setTool("shape-diamond");
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-sm transition-colors ${
                tool === "shape-diamond"
                  ? "bg-surface-container-high text-primary"
                  : "text-on-surface hover:bg-surface-container-high hover:text-primary"
              }`}
              title="Diamond"
            >
              <span className="material-symbols-outlined text-lg">diamond</span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                setTool("shape-hexagon");
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-sm transition-colors ${
                tool === "shape-hexagon"
                  ? "bg-surface-container-high text-primary"
                  : "text-on-surface hover:bg-surface-container-high hover:text-primary"
              }`}
              title="Hexagon"
            >
              <span className="material-symbols-outlined text-lg">hexagon</span>
            </button>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-4 top-4 bottom-36 z-30 flex min-h-0 flex-col items-start sm:left-6 sm:bottom-28">
        <nav className="pointer-events-auto flex max-h-full min-h-0 w-[3.25rem] flex-col gap-3 overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg bg-surface-container-highest p-1.5 shadow-[0_0_24px_-4px_rgba(115,255,227,0.1)] ring-1 ring-outline-variant/[0.15] [scrollbar-color:rgba(115,255,227,0.35)_transparent] [scrollbar-width:thin]">
          <div className="flex shrink-0 flex-col items-center gap-0.5 py-1 opacity-40">
            <div className="flex gap-1">
              <div className="h-0.5 w-0.5 rounded-full bg-outline" />
              <div className="h-0.5 w-0.5 rounded-full bg-outline" />
            </div>
            <div className="flex gap-1">
              <div className="h-0.5 w-0.5 rounded-full bg-outline" />
              <div className="h-0.5 w-0.5 rounded-full bg-outline" />
            </div>
            <div className="flex gap-1">
              <div className="h-0.5 w-0.5 rounded-full bg-outline" />
              <div className="h-0.5 w-0.5 rounded-full bg-outline" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                setTool("select");
              }}
              className={tool === "select" ? activeClass : defaultClass}
              title="Select & move objects (drag empty area to box-select)"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: tool === "select" ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                near_me
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                setTool("pen");
              }}
              className={tool === "pen" ? activeClass : defaultClass}
              title="Draw"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                setTool("eraser");
              }}
              className={tool === "eraser" ? activeClass : defaultClass}
              title="Hold left-click and drag across items to erase"
            >
              <span className="material-symbols-outlined">ink_eraser</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setShowSettings(false);
                setTool((t) => (isShapeTool(t) ? "select" : "shape-rect"));
              }}
              className={isShapeTool(tool) ? activeClass : defaultClass}
              title="Shapes — drag on canvas to size. Click again to leave."
            >
              <span className="material-symbols-outlined">category</span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                setTool((t) => (t === "text" ? "select" : "text"));
              }}
              className={tool === "text" ? activeClass : defaultClass}
              title="Click once on canvas to place text"
            >
              <span className="material-symbols-outlined">text_fields</span>
            </button>
            <button
              type="button"
              onClick={toggleSettingsPanel}
              className={defaultClass}
              title="Stroke weight & color"
            >
              <div
                className="h-4 w-4 rounded-sm ring-1 ring-outline-variant/30"
                style={{ backgroundColor: color }}
              />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                undo();
              }}
              className={defaultClass}
              title="Undo"
            >
              <span className="material-symbols-outlined">undo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                deleteSelected();
              }}
              className={`${defaultClass} hover:text-tertiary`}
              title="Delete selected"
            >
              <span className="material-symbols-outlined">delete_sweep</span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeSettingsOpenShapes();
                clearCanvas();
              }}
              className={`${defaultClass} hover:text-error`}
              title="Clear entire board"
            >
              <span className="material-symbols-outlined">delete_forever</span>
            </button>
          </div>
        </nav>

        <p className="pointer-events-none mt-2 max-w-[10rem] pl-0.5 font-label text-[8px] uppercase leading-snug tracking-[0.12em] text-on-surface-variant opacity-80">
          Pan: space + drag or middle mouse
        </p>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-40 flex max-w-full flex-wrap items-center gap-1 rounded-lg bg-surface-container-highest p-1.5 font-label shadow-[0_0_24px_-4px_rgba(115,255,227,0.1)] ring-1 ring-outline-variant/[0.15] sm:bottom-6 sm:left-6 sm:right-auto">
        <button
          type="button"
          onClick={zoomOut}
          className="flex h-8 w-8 items-center justify-center rounded-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
        >
          <span className="material-symbols-outlined text-sm">remove</span>
        </button>
        <span className="min-w-[40px] px-2 text-center font-label text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface">
          {zoom}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          className="flex h-8 w-8 items-center justify-center rounded-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
        >
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
        <button
          type="button"
          onClick={resetZoom}
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-secondary"
          title="Reset view"
        >
          <span className="material-symbols-outlined text-sm">center_focus_strong</span>
        </button>
      </div>

      {showSettings && (
        <div
          className="absolute inset-0 z-20"
          aria-hidden
          onClick={() => setShowSettings(false)}
        />
      )}

      <style>{`
        .slider-thumb-primary::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 2px;
          background: ${DS.primary};
          box-shadow: 0 0 24px -4px rgba(115, 255, 227, 0.35);
          cursor: pointer;
        }
        .slider-thumb-primary::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          background: ${DS.primary};
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
}
