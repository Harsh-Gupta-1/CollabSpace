import { useRef, useState } from "react";
import useSocketLogic from "./SocketLogic";
import useCanvasInitialization from "./Canvas";
import Toolbar from "./Toolbar";

export default function EnhancedWhiteboard({ roomId = "demo", canvasStateRef }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const isLoadingRef = useRef(false);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);

  const [tool, setTool] = useState("select");
  const [color, setColor] = useState("#73ffe3");
  const [brushSize, setBrushSize] = useState(3);
  const [zoom, setZoom] = useState(100);

  const {
    saveCanvasState,
    deleteSelected,
    undo,
    clearCanvas,
    resetZoom,
    zoomIn,
    zoomOut,
  } = useCanvasInitialization({
    canvasRef,
    fabricCanvasRef,
    isLoadingRef,
    undoStackRef,
    redoStackRef,
    canvasStateRef,
    tool,
    color,
    brushSize,
    setZoom,
    setTool,
  });

  useSocketLogic({ roomId, fabricCanvasRef, isLoadingRef, saveCanvasState });

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full" />

      <Toolbar
        tool={tool}
        setTool={setTool}
        deleteSelected={deleteSelected}
        undo={undo}
        clearCanvas={clearCanvas}
        resetZoom={resetZoom}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        setColor={setColor}
        setBrushSize={setBrushSize}
        zoom={zoom}
        color={color}
        brushSize={brushSize}
      />
    </div>
  );
}
