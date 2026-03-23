import { useEffect, useRef } from "react";
import { getSocket } from "../../sockets/socket";
import { debounce } from "lodash";
import { DS } from "./fabricDesignSystem";

export default function useSocketLogic({ roomId, fabricCanvasRef, isLoadingRef, saveCanvasState }) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();

    // Enhanced object data optimization
    const optimizeObjectData = (obj) => {
      const baseData = {
        type: obj.type,
        id: obj.id,
        left: obj.left,
        top: obj.top
      };

      switch (obj.type) {
        case 'path':
          return {
            ...baseData,
            path: obj.path,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            fill: obj.fill || 'transparent',
            pathOffset: obj.pathOffset,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle
          };
        case 'rect':
          return {
            ...baseData,
            width: obj.width,
            height: obj.height,
            fill: obj.fill,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle
          };
        case "circle":
          return {
            ...baseData,
            radius: obj.radius,
            fill: obj.fill,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle,
          };
        case "ellipse":
          return {
            ...baseData,
            rx: obj.rx,
            ry: obj.ry,
            originX: obj.originX,
            originY: obj.originY,
            fill: obj.fill,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle,
          };
        case "triangle":
          return {
            ...baseData,
            width: obj.width,
            height: obj.height,
            fill: obj.fill,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle,
          };
        case "line":
          return {
            ...baseData,
            x1: obj.x1,
            y1: obj.y1,
            x2: obj.x2,
            y2: obj.y2,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle,
          };
        case "polygon":
          return {
            ...baseData,
            points: obj.points,
            fill: obj.fill,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle,
          };
        case "i-text":
          return {
            ...baseData,
            text: obj.text,
            fill: obj.fill,
            fontSize: obj.fontSize,
            fontFamily: obj.fontFamily,
            fontWeight: obj.fontWeight,
            charSpacing: obj.charSpacing,
            lineHeight: obj.lineHeight,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle,
          };
        default:
          const fullObj = obj.toObject(['id']);
          if (obj.type === 'path' && !fullObj.fill) {
            fullObj.fill = 'transparent';
          }
          return fullObj;
      }
    };

    // Enhanced object creation from data
    const createObjectFromData = (objData, callback) => {
      switch (objData.type) {
        case 'path':
          const pathObj = new fabric.Path(objData.path, {
            ...objData,
            fill: objData.fill === undefined ? 'transparent' : objData.fill
          });
          callback(pathObj);
          break;
        case 'rect':
          const rectObj = new fabric.Rect(objData);
          callback(rectObj);
          break;
        case "circle":
          const circleObj = new fabric.Circle(objData);
          callback(circleObj);
          break;
        case "ellipse":
          const ellipseObj = new fabric.Ellipse(objData);
          callback(ellipseObj);
          break;
        case "triangle":
          const triangleObj = new fabric.Triangle(objData);
          callback(triangleObj);
          break;
        case "line":
          const lineObj = new fabric.Line(
            [objData.x1, objData.y1, objData.x2, objData.y2],
            objData
          );
          callback(lineObj);
          break;
        case "polygon":
          const polyObj = new fabric.Polygon(objData.points, objData);
          callback(polyObj);
          break;
        case 'i-text':
          const textObj = new fabric.IText(objData.text || '', objData);
          callback(textObj);
          break;
        default:
          fabric.util.enlivenObjects([objData], (objects) => {
            if (objects && objects[0]) {
              if (objects[0].type === 'path' && objData.fill === 'transparent') {
                objects[0].set('fill', 'transparent');
              }
              callback(objects[0]);
            }
          });
          break;
      }
    };

    // Socket event handlers
    const handleWhiteboardUpdate = ({ data }) => {
      if (isLoadingRef.current) return;
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      if (data.type === 'full-sync') {
        isLoadingRef.current = true;
        canvas.loadFromJSON(data.canvasData, () => {
          canvas.getObjects().forEach(obj => {
            if (obj.type === "path" && obj.fill !== "transparent" && !obj.stroke) {
              obj.set("fill", "transparent");
              obj.set("stroke", obj.fill || DS.primary);
            }
          });
          canvas.renderAll();
          isLoadingRef.current = false;
        });
      } else if (data.type === 'object-added' && data.object) {
        const existing = canvas.getObjects().find(o => o.id === data.object.id);
        if (!existing) {
          createObjectFromData(data.object, (newObj) => {
            newObj.id = data.object.id;
            canvas.add(newObj);
            canvas.renderAll();
          });
        }
      } else if (data.type === 'object-modified' && data.object) {
        const obj = canvas.getObjects().find(o => o.id === data.object.id);
        if (obj) {
          const updateProps = { ...data.object };
          delete updateProps.type;
          obj.set(updateProps);
          canvas.renderAll();
        }
      } else if (data.type === 'object-removed' && data.objectId) {
        const obj = canvas.getObjects().find(o => o.id === data.objectId);
        if (obj) {
          canvas.remove(obj);
          canvas.renderAll();
        }
      } else if (data.type === "clear") {
        canvas.clear();
        canvas.backgroundColor = "rgba(0,0,0,0)";
        canvas.renderAll();
      }
    };

    // Canvas event handlers
    const handleObjectAdded = debounce((e) => {
      if (isLoadingRef.current) return;
      const obj = e.target;
      if (!obj.id) {
        obj.id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      if (obj.type === 'path' && !obj.stroke && obj.fill) {
        obj.set('stroke', obj.fill);
        obj.set('fill', 'transparent');
      }

      socketRef.current?.emit('whiteboard-update', {
        roomId,
        data: {
          type: 'object-added',
          object: optimizeObjectData(obj)
        }
      });

      saveCanvasState();
    }, 100);

    const handleObjectModified = debounce((e) => {
      if (isLoadingRef.current) return;
      const obj = e.target;
      socketRef.current?.emit('whiteboard-update', {
        roomId,
        data: {
          type: 'object-modified',
          object: optimizeObjectData(obj)
        }
      });

      saveCanvasState();
    }, 100);

    const handleObjectRemoved = (e) => {
      if (isLoadingRef.current) return;
      const obj = e.target;
      socketRef.current?.emit('whiteboard-update', {
        roomId,
        data: {
          type: 'object-removed',
          objectId: obj.id
        }
      });

      saveCanvasState();
    };

    // Attach event listeners
    const canvas = fabricCanvasRef.current;
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:removed', handleObjectRemoved);
    socketRef.current?.on('whiteboard-update', handleWhiteboardUpdate);

    return () => {
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:removed', handleObjectRemoved);
      socketRef.current?.off('whiteboard-update', handleWhiteboardUpdate);
    };
  }, [roomId, fabricCanvasRef, isLoadingRef, saveCanvasState]);
}