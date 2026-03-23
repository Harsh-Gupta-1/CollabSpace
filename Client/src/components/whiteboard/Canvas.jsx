import { useEffect, useRef, useCallback } from "react";
import {
  applyFabricDesignSystem,
  configureCanvasChrome,
  getDefaultTextOptions,
  getShapeStrokeOptions,
} from "./fabricDesignSystem";

const MIN_SHAPE_PX = 6;

/** @typedef {'rect'|'ellipse'|'triangle'|'line'|'diamond'|'hexagon'} ShapeKind */

function toolToShapeKind(tool) {
  if (tool === "shape-rect") return "rect";
  if (tool === "shape-circle") return "ellipse";
  if (tool === "shape-triangle") return "triangle";
  if (tool === "shape-line") return "line";
  if (tool === "shape-diamond") return "diamond";
  if (tool === "shape-hexagon") return "hexagon";
  return null;
}

function absPointsToPolygon(absPoints, strokeOpts, id) {
  const xs = absPoints.map((p) => p.x);
  const ys = absPoints.map((p) => p.y);
  const minPx = Math.min(...xs);
  const minPy = Math.min(...ys);
  const rel = absPoints.map((p) => ({ x: p.x - minPx, y: p.y - minPy }));
  return new fabric.Polygon(rel, {
    ...strokeOpts,
    left: minPx,
    top: minPy,
    id,
  });
}

function makeDiamondAbsPoints(x1, y1, x2, y2) {
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const maxX = Math.max(x1, x2);
  const maxY = Math.max(y1, y2);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return [
    { x: cx, y: minY },
    { x: maxX, y: cy },
    { x: cx, y: maxY },
    { x: minX, y: cy },
  ];
}

function makeHexagonAbsPoints(x1, y1, x2, y2) {
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const maxX = Math.max(x1, x2);
  const maxY = Math.max(y1, y2);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rx = (maxX - minX) / 2;
  const ry = (maxY - minY) / 2;
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    pts.push({
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    });
  }
  return pts;
}

export default function useCanvasInitialization({
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
}) {
  const toolRef = useRef(tool);
  const colorRef = useRef(color);
  const brushSizeRef = useRef(brushSize);
  const setToolRef = useRef(setTool);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);
  useEffect(() => {
    colorRef.current = color;
  }, [color]);
  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);
  useEffect(() => {
    setToolRef.current = setTool;
  }, [setTool]);

  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });
  const viewportTransformRef = useRef([1, 0, 0, 1, 0, 0]);
  const spaceDownRef = useRef(false);

  const shapeDrawRef = useRef({
    active: false,
    kind: /** @type {ShapeKind|null} */ (null),
    startX: 0,
    startY: 0,
    preview: null,
  });
  const lastShapePointerRef = useRef({ x: 0, y: 0 });
  const eraserSaveRafRef = useRef(0);

  const saveCanvasStateRef = useRef(() => {});

  const saveCanvasState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || isLoadingRef.current) return;

    viewportTransformRef.current = canvas.viewportTransform.slice();

    const state = JSON.stringify(canvas.toJSON(["id"]));
    undoStackRef.current.push(state);
    if (undoStackRef.current.length > 20) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];

    if (canvasStateRef) {
      canvasStateRef.current = state;
    }
  }, [fabricCanvasRef, isLoadingRef, undoStackRef, redoStackRef, canvasStateRef]);

  useEffect(() => {
    saveCanvasStateRef.current = saveCanvasState;
  }, [saveCanvasState]);

  const cancelShapePreview = useCallback((canvas) => {
    const d = shapeDrawRef.current;
    if (d.preview) {
      canvas.remove(d.preview);
      d.preview = null;
      canvas.requestRenderAll();
    }
    d.active = false;
    d.kind = null;
  }, []);

  const finalizeShapeFromDrag = useCallback(
    (canvas, x1, y1, x2, y2) => {
      const d0 = shapeDrawRef.current;
      if (!d0.active || !d0.kind) return;
      const kind = d0.kind;
      d0.kind = null;
      d0.active = false;

      const strokeOpts = getShapeStrokeOptions(colorRef.current);
      const id = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const w = Math.abs(x2 - x1);
      const h = Math.abs(y2 - y1);
      const dist = Math.hypot(x2 - x1, y2 - y1);

      if (kind === "line") {
        if (dist < MIN_SHAPE_PX) {
          cancelShapePreview(canvas);
          setToolRef.current("select");
          return;
        }
      } else {
        if (Math.max(w, h) < MIN_SHAPE_PX) {
          cancelShapePreview(canvas);
          setToolRef.current("select");
          return;
        }
      }

      let shape;
      if (kind === "rect") {
        shape = new fabric.Rect({
          ...strokeOpts,
          left: minX,
          top: minY,
          width: w,
          height: h,
          rx: 3,
          ry: 3,
          id,
        });
      } else if (kind === "ellipse") {
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const rx = w / 2;
        const ry = h / 2;
        shape = new fabric.Ellipse({
          ...strokeOpts,
          left: cx,
          top: cy,
          originX: "center",
          originY: "center",
          rx,
          ry,
          id,
        });
      } else if (kind === "triangle") {
        shape = new fabric.Triangle({
          ...strokeOpts,
          left: minX,
          top: minY,
          width: w,
          height: h,
          id,
        });
      } else if (kind === "line") {
        shape = new fabric.Line([x1, y1, x2, y2], {
          ...strokeOpts,
          fill: "",
          strokeLineCap: "round",
          id,
        });
      } else if (kind === "diamond") {
        shape = absPointsToPolygon(makeDiamondAbsPoints(x1, y1, x2, y2), strokeOpts, id);
      } else if (kind === "hexagon") {
        shape = absPointsToPolygon(makeHexagonAbsPoints(x1, y1, x2, y2), strokeOpts, id);
      }

      if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.requestRenderAll();
        saveCanvasStateRef.current();
      }
      cancelShapePreview(canvas);
      setToolRef.current("select");
    },
    [cancelShapePreview]
  );

  const updateShapePreview = useCallback((canvas, x1, y1, x2, y2) => {
    const d = shapeDrawRef.current;
    const kind = d.kind;
    if (!kind) return;
    const strokeOpts = getShapeStrokeOptions(colorRef.current);
    strokeOpts.strokeDashArray = [6, 4];
    strokeOpts.fill = "rgba(115, 255, 227, 0.06)";

    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    const dist = Math.hypot(x2 - x1, y2 - y1);

    if (d.preview) {
      canvas.remove(d.preview);
      d.preview = null;
    }

    if (kind === "line") {
      if (dist < 2) {
        canvas.requestRenderAll();
        return;
      }
    } else if (Math.max(w, h) < 2) {
      canvas.requestRenderAll();
      return;
    }

    let preview;
    if (kind === "line") {
      preview = new fabric.Line([x1, y1, x2, y2], {
        ...strokeOpts,
        fill: "",
        strokeDashArray: [6, 4],
        strokeLineCap: "round",
        selectable: false,
        evented: false,
      });
    } else if (kind === "rect") {
      preview = new fabric.Rect({
        ...strokeOpts,
        left: minX,
        top: minY,
        width: w,
        height: h,
        rx: 3,
        ry: 3,
        selectable: false,
        evented: false,
      });
    } else if (kind === "ellipse") {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      preview = new fabric.Ellipse({
        ...strokeOpts,
        left: cx,
        top: cy,
        originX: "center",
        originY: "center",
        rx: w / 2,
        ry: h / 2,
        selectable: false,
        evented: false,
      });
    } else if (kind === "triangle") {
      preview = new fabric.Triangle({
        ...strokeOpts,
        left: minX,
        top: minY,
        width: w,
        height: h,
        selectable: false,
        evented: false,
      });
    } else if (kind === "diamond") {
      const pts = makeDiamondAbsPoints(x1, y1, x2, y2);
      preview = absPointsToPolygon(pts, { ...strokeOpts, strokeDashArray: [6, 4] }, "__preview__");
      preview.selectable = false;
      preview.evented = false;
    } else if (kind === "hexagon") {
      const pts = makeHexagonAbsPoints(x1, y1, x2, y2);
      preview = absPointsToPolygon(pts, { ...strokeOpts, strokeDashArray: [6, 4] }, "__preview__");
      preview.selectable = false;
      preview.evented = false;
    }

    if (preview) {
      d.preview = preview;
      canvas.add(preview);
      canvas.requestRenderAll();
    }
  }, []);

  // Canvas init once — do not depend on `tool` (avoids full remount on every tool change)
  useEffect(() => {
    if (!canvasRef.current || typeof fabric === "undefined") return;

    applyFabricDesignSystem(fabric);

    const parent = canvasRef.current.parentElement;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: parent.clientWidth,
      height: parent.clientHeight,
      backgroundColor: "rgba(0,0,0,0)",
      selection: true,
      fireRightClick: true,
    });

    fabricCanvasRef.current = canvas;
    configureCanvasChrome(canvas);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => canvas.requestRenderAll());
    }

    if (canvasStateRef?.current) {
      try {
        isLoadingRef.current = true;
        const canvasData = JSON.parse(canvasStateRef.current);
        canvas.loadFromJSON(canvasData, () => {
          const bg = canvasData.backgroundColor;
          canvas.backgroundColor =
            !bg || bg === "#ffffff" || bg === "rgb(255,255,255)" ? "rgba(0,0,0,0)" : bg;
          canvas.getObjects().forEach((obj) => {
            if (obj.type === "path" && obj.fill && obj.fill !== "transparent" && !obj.stroke) {
              obj.set("fill", "transparent");
              obj.set("stroke", obj.fill);
            }
          });
          canvas.setViewportTransform(viewportTransformRef.current);
          canvas.renderAll();
          isLoadingRef.current = false;
        });
      } catch (error) {
        console.error("Error restoring canvas:", error);
        isLoadingRef.current = false;
      }
    }

    saveCanvasStateRef.current();

    const onKeyDown = (e) => {
      if (e.code === "Space" && !e.repeat) {
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        spaceDownRef.current = true;
        e.preventDefault();
      }
      if (e.key === "Escape") {
        const t = toolRef.current;
        if (t && t.startsWith("shape-")) {
          cancelShapePreview(canvas);
          setToolRef.current("select");
        }
        if (t === "text") {
          setToolRef.current("select");
        }
      }
    };
    const onKeyUp = (e) => {
      if (e.code === "Space") {
        spaceDownRef.current = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const startPan = (opt) => {
      isPanningRef.current = true;
      canvas.defaultCursor = "grabbing";
      canvas.selection = false;
      canvas.discardActiveObject();
      lastPanPointRef.current = { x: opt.e.clientX, y: opt.e.clientY };
      opt.e.preventDefault();
    };

    const handleMouseDown = (opt) => {
      const t = toolRef.current;
      const e = opt.e;

      const panBySpaceOrMiddle =
        e.button === 1 || (spaceDownRef.current && e.button === 0);
      if (panBySpaceOrMiddle) {
        startPan(opt);
        return;
      }

      const kind = toolToShapeKind(t);
      if (kind && e.button === 0) {
        const p = canvas.getPointer(e);
        shapeDrawRef.current = {
          active: true,
          kind,
          startX: p.x,
          startY: p.y,
          preview: null,
        };
        lastShapePointerRef.current = { x: p.x, y: p.y };
        canvas.selection = false;
        canvas.discardActiveObject();
        const upper = canvas.upperCanvasEl;
        if (upper && typeof e.pointerId === "number") {
          try {
            upper.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }
        opt.e.preventDefault();
        opt.e.stopPropagation();
        return;
      }

      if (t === "text" && e.button === 0) {
        const pointer = canvas.getPointer(e);
        const text = new fabric.IText("Annotation", {
          ...getDefaultTextOptions(colorRef.current),
          left: pointer.x,
          top: pointer.y,
          id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.setCoords();
        setTimeout(() => {
          text.enterEditing();
          text.selectAll();
        }, 0);
        setToolRef.current("select");
        saveCanvasStateRef.current();
        opt.e.preventDefault();
        opt.e.stopPropagation();
        return;
      }

      /* Eraser: hover-only; removal happens on mouse:move (see below) */
    };

    const scheduleSaveAfterEraser = () => {
      if (eraserSaveRafRef.current) return;
      eraserSaveRafRef.current = requestAnimationFrame(() => {
        eraserSaveRafRef.current = 0;
        saveCanvasStateRef.current();
      });
    };

    const eraseTargetAtEvent = (nativeEvent) => {
      if (toolRef.current !== "eraser") return;
      if (isLoadingRef.current) return;
      if (
        nativeEvent &&
        typeof nativeEvent.buttons === "number" &&
        (nativeEvent.buttons & 1) !== 1
      ) {
        return;
      }
      const upper = canvas.upperCanvasEl;
      if (upper && nativeEvent?.clientX != null) {
        const r = upper.getBoundingClientRect();
        if (
          nativeEvent.clientX < r.left ||
          nativeEvent.clientX > r.right ||
          nativeEvent.clientY < r.top ||
          nativeEvent.clientY > r.bottom
        ) {
          return;
        }
      }
      let target =
        typeof canvas.findTarget === "function"
          ? canvas.findTarget(nativeEvent)
          : null;
      if (!target && nativeEvent) {
        const point = canvas.getPointer(nativeEvent);
        const objs = canvas.getObjects();
        for (let i = objs.length - 1; i >= 0; i--) {
          const o = objs[i];
          if (typeof o.containsPoint === "function" && o.containsPoint(point)) {
            target = o;
            break;
          }
        }
      }
      if (!target) return;
      canvas.remove(target);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      scheduleSaveAfterEraser();
    };

    const handleMouseMove = (opt) => {
      if (isPanningRef.current) {
        const deltaX = opt.e.clientX - lastPanPointRef.current.x;
        const deltaY = opt.e.clientY - lastPanPointRef.current.y;
        const vpt = canvas.viewportTransform.slice();
        vpt[4] += deltaX / canvas.getZoom();
        vpt[5] += deltaY / canvas.getZoom();
        canvas.setViewportTransform(vpt);
        viewportTransformRef.current = vpt.slice();
        lastPanPointRef.current = { x: opt.e.clientX, y: opt.e.clientY };
        opt.e.preventDefault();
        opt.e.stopPropagation();
      }
    };

    /** Shape drag + eraser: use pointer events so capture / coords stay consistent off-canvas */
    const handleWindowPointerMove = (e) => {
      const d = shapeDrawRef.current;
      if (d.active && d.kind) {
        const p = canvas.getPointer(e);
        lastShapePointerRef.current = { x: p.x, y: p.y };
        updateShapePreview(canvas, d.startX, d.startY, p.x, p.y);
        return;
      }
      if (toolRef.current === "eraser") {
        eraseTargetAtEvent(e);
      }
    };

    const applyCursorForTool = () => {
      const t = toolRef.current;
      if (t === "pen") {
        canvas.defaultCursor = "crosshair";
        canvas.hoverCursor = "crosshair";
      } else if (t === "eraser") {
        canvas.defaultCursor = "crosshair";
        canvas.hoverCursor = "crosshair";
      } else if (t && t.startsWith("shape-")) {
        canvas.defaultCursor = "crosshair";
        canvas.hoverCursor = "crosshair";
      } else if (t === "text") {
        canvas.defaultCursor = "text";
        canvas.hoverCursor = "text";
      } else {
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
      }
    };

    const endPan = (opt) => {
      if (!isPanningRef.current) return;
      isPanningRef.current = false;
      viewportTransformRef.current = canvas.viewportTransform.slice();
      const t = toolRef.current;
      canvas.selection = t === "select";
      applyCursorForTool();
      opt.e.preventDefault();
    };

    const handleMouseUp = (opt) => {
      if (isPanningRef.current) {
        endPan(opt);
      }
    };

    const handleWindowPointerUp = (e) => {
      const upper = canvas.upperCanvasEl;
      if (e && typeof e.pointerId === "number" && upper?.releasePointerCapture) {
        try {
          upper.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
      const d = shapeDrawRef.current;
      if (d.active && d.kind) {
        let x2 = lastShapePointerRef.current.x;
        let y2 = lastShapePointerRef.current.y;
        if (e && typeof e.clientX === "number") {
          try {
            const p = canvas.getPointer(e);
            x2 = p.x;
            y2 = p.y;
          } catch {
            /* use lastShapePointerRef */
          }
        }
        finalizeShapeFromDrag(canvas, d.startX, d.startY, x2, y2);
      }
      if (isPanningRef.current) {
        isPanningRef.current = false;
        viewportTransformRef.current = canvas.viewportTransform.slice();
        const t = toolRef.current;
        canvas.selection = t === "select";
        applyCursorForTool();
      }
    };

    canvas.on("mouse:wheel", function (opt) {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      setZoom(Math.round(zoom * 100));
      viewportTransformRef.current = canvas.viewportTransform.slice();
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    let lastTouchDistance = 0;
    canvas.on("touch:gesture", function (e) {
      if (e.e.touches && e.e.touches.length === 2) {
        const touch1 = e.e.touches[0];
        const touch2 = e.e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        const center = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        };
        if (lastTouchDistance > 0) {
          const scale = distance / lastTouchDistance;
          let z = canvas.getZoom() * scale;
          if (z > 20) z = 20;
          if (z < 0.01) z = 0.01;
          canvas.zoomToPoint({ x: center.x, y: center.y }, z);
          setZoom(Math.round(z * 100));
          viewportTransformRef.current = canvas.viewportTransform.slice();
        }
        lastTouchDistance = distance;
        e.e.preventDefault();
      }
    });
    canvas.on("touch:end", function () {
      lastTouchDistance = 0;
    });

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    const usePointer = typeof window.PointerEvent !== "undefined";
    if (usePointer) {
      window.addEventListener("pointermove", handleWindowPointerMove);
      window.addEventListener("pointerup", handleWindowPointerUp);
      window.addEventListener("pointercancel", handleWindowPointerUp);
    } else {
      window.addEventListener("mousemove", handleWindowPointerMove);
      window.addEventListener("mouseup", handleWindowPointerUp);
    }

    const handleResize = () => {
      canvas.setDimensions({
        width: parent.clientWidth,
        height: parent.clientHeight,
      });
      canvas.renderAll();
    };

    const handleCanvasRestore = () => {
      if (canvasStateRef?.current) {
        try {
          isLoadingRef.current = true;
          const canvasData = JSON.parse(canvasStateRef.current);
          canvas.loadFromJSON(canvasData, () => {
            const bg = canvasData.backgroundColor;
            canvas.backgroundColor =
              !bg || bg === "#ffffff" || bg === "rgb(255,255,255)" ? "rgba(0,0,0,0)" : bg;
            canvas.getObjects().forEach((obj) => {
              if (obj.type === "path" && obj.fill && obj.fill !== "transparent" && !obj.stroke) {
                obj.set("fill", "transparent");
                obj.set("stroke", obj.fill);
              }
            });
            canvas.setViewportTransform(viewportTransformRef.current);
            canvas.renderAll();
            isLoadingRef.current = false;
          });
        } catch (error) {
          console.error("Error restoring canvas:", error);
          isLoadingRef.current = false;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("canvasRestore", handleCanvasRestore);

    return () => {
      if (eraserSaveRafRef.current) {
        cancelAnimationFrame(eraserSaveRafRef.current);
      }
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (typeof window.PointerEvent !== "undefined") {
        window.removeEventListener("pointermove", handleWindowPointerMove);
        window.removeEventListener("pointerup", handleWindowPointerUp);
        window.removeEventListener("pointercancel", handleWindowPointerUp);
      } else {
        window.removeEventListener("mousemove", handleWindowPointerMove);
        window.removeEventListener("mouseup", handleWindowPointerUp);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("canvasRestore", handleCanvasRestore);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [
    canvasRef,
    fabricCanvasRef,
    isLoadingRef,
    canvasStateRef,
    setZoom,
    cancelShapePreview,
    finalizeShapeFromDrag,
    updateShapePreview,
  ]);

  const updateCanvasSettings = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const t = tool;
    canvas.isDrawingMode = t === "pen";
    canvas.selection = t === "select";
    canvas.skipTargetFind =
      t === "pen" || (t && t.startsWith("shape-")) || t === "text";

    if (t === "pen") {
      const brush = canvas.freeDrawingBrush;
      brush.width = brushSize;
      brush.color = color;
      brush.fill = "transparent";
      try {
        brush.decimate = 0.55;
      } catch {
        /* optional */
      }
      brush.strokeLineCap = "round";
      brush.strokeLineJoin = "round";
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
    } else if (t === "select") {
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
    } else if (t === "eraser") {
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
    } else if (t && t.startsWith("shape-")) {
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
    } else if (t === "text") {
      canvas.defaultCursor = "text";
      canvas.hoverCursor = "text";
    } else {
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "default";
    }

    canvas.setViewportTransform(viewportTransformRef.current);
    canvas.renderAll();
  }, [tool, color, brushSize]);

  useEffect(() => {
    updateCanvasSettings();
  }, [updateCanvasSettings]);

  const deleteSelected = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.remove(...activeObjects);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      saveCanvasState();
    }
  }, [saveCanvasState]);

  const undo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || undoStackRef.current.length <= 1) return;

    redoStackRef.current.push(undoStackRef.current.pop());
    const previousState = undoStackRef.current[undoStackRef.current.length - 1];

    if (previousState) {
      isLoadingRef.current = true;
      canvas.loadFromJSON(previousState, () => {
        canvas.setViewportTransform(viewportTransformRef.current);
        canvas.renderAll();
        isLoadingRef.current = false;
      });
    }
  }, [fabricCanvasRef, isLoadingRef, undoStackRef, redoStackRef]);

  const clearCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = "rgba(0,0,0,0)";
    canvas.setViewportTransform(viewportTransformRef.current);
    canvas.renderAll();

    const canvasData = {
      objects: [],
      backgroundColor: "rgba(0,0,0,0)",
    };
    if (canvasStateRef) {
      canvasStateRef.current = JSON.stringify(canvasData);
    }
  }, [fabricCanvasRef, canvasStateRef]);

  const resetZoom = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.setZoom(1);
    canvas.absolutePan({ x: 0, y: 0 });
    viewportTransformRef.current = [1, 0, 0, 1, 0, 0];
    setZoom(100);
  }, [fabricCanvasRef, setZoom]);

  const zoomIn = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let z = canvas.getZoom() * 1.1;
    if (z > 20) z = 20;
    canvas.setZoom(z);
    viewportTransformRef.current = canvas.viewportTransform.slice();
    setZoom(Math.round(z * 100));
  }, [fabricCanvasRef, setZoom]);

  const zoomOut = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let z = canvas.getZoom() * 0.9;
    if (z < 0.01) z = 0.01;
    canvas.setZoom(z);
    viewportTransformRef.current = canvas.viewportTransform.slice();
    setZoom(Math.round(z * 100));
  }, [fabricCanvasRef, setZoom]);

  return {
    saveCanvasState,
    deleteSelected,
    undo,
    clearCanvas,
    resetZoom,
    zoomIn,
    zoomOut,
  };
}
