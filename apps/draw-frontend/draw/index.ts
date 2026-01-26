import { HTTP_BACKEND } from "@/config";
import { updateCursor } from "./cursor";
import axios from "axios";
import { eraseAtPoint } from "./eraser";

export type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number; id: string }
  | { type: "circle"; centerX: number; centerY: number; radiusX: number; radiusY: number; id: string }
  | { type: "line"; startX: number; startY: number; endX: number; endY: number; id: string }
  | { type: "arrow"; startX: number; startY: number; endX: number; endY: number; id: string }
  | { type: "diamond"; centerX: number; centerY: number; width: number; height: number; id: string }
  | { type: "pencil"; points: { x: number; y: number }[]; id: string };

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let existingShapes: Shape[] = [];
  try {
    existingShapes = await getExistingShapes(roomId);
  } catch (e) {
    console.error("Failed to get existing shapes:", e);
  }
  let previewShape: Shape | null = null;
  let pencilPoints: { x: number; y: number }[] = [];

  const saveState = () => {
    // Basic undo (local only for now, complex to sync)
  };

  socket.onmessage = (event) => {
    const message = safeParseJSON(event.data);
    if (!message || message.type !== "chat") return;

    const parsed = safeParseJSON(message.message);

    if (parsed.type === "delete") {
      existingShapes = existingShapes.filter(s => s.id !== parsed.id);
      clearCanvas(existingShapes, canvas, ctx);
    } else {
      const shape = parsed.shape ?? parsed;
      if (shape && shape.id) {
        // If we already have this ID (e.g. from local optimistic update), update it or ignore
        // But for now just push if new
        if (!existingShapes.find(s => s.id === shape.id)) {
          existingShapes.push(shape);
          clearCanvas(existingShapes, canvas, ctx);
        }
      }
    }
  };

  clearCanvas(existingShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.onmousedown = (e) => {
    clicked = true;
    startX = e.offsetX;
    startY = e.offsetY;

    if ((window as any).selectedTool === "pencil") {
      pencilPoints = [{ x: startX, y: startY }];
      previewShape = {
        type: "pencil",
        points: pencilPoints,
        id: generateId()
      }
    }
  };

  canvas.onmouseup = () => {
    if (!clicked) return;
    clicked = false;

    if (previewShape) {
      existingShapes.push(previewShape);

      socket.send(
        JSON.stringify({
          type: "chat",
          roomId,
          message: JSON.stringify({ shape: previewShape }),
        })
      );

      previewShape = null;
      pencilPoints = [];
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  canvas.onmousemove = (e) => {
    const tool = (window as any).selectedTool;
    updateCursor(canvas, tool);

    if (!clicked) return;

    const x = e.offsetX;
    const y = e.offsetY;

    if (tool === "eraser") {
      const newShapes = eraseAtPoint(x, y, existingShapes);

      // Calculate diff
      const newIds = new Set(newShapes.map(s => s.id));
      const oldIds = new Set(existingShapes.map(s => s.id));

      const added = newShapes.filter(s => !oldIds.has(s.id));
      const removed = existingShapes.filter(s => !newIds.has(s.id));

      // Send updates
      removed.forEach(s => {
        socket.send(JSON.stringify({
          type: "chat",
          roomId,
          message: JSON.stringify({ type: "delete", id: s.id })
        }))
      });

      added.forEach(s => {
        socket.send(JSON.stringify({
          type: "chat",
          roomId,
          message: JSON.stringify({ shape: s })
        }))
      });

      existingShapes = newShapes;
      clearCanvas(existingShapes, canvas, ctx);
      return;
    }

    if (tool === "pencil") {
      if (previewShape && previewShape.type === "pencil") {
        previewShape.points.push({ x, y });
      }
      clearCanvas(existingShapes, canvas, ctx);
      drawShape(ctx, previewShape);
      return;
    }

    const width = x - startX;
    const height = y - startY;
    const id = generateId(); // Temporary ID for preview, but onMouseUp we need to stabilize it.
    // Actually, we should keep the SAME ID during preview.
    const currentId = previewShape?.id || generateId();

    if (tool === "rect") {
      previewShape = { type: "rect", x: startX, y: startY, width, height, id: currentId };
    }

    if (tool === "circle") {
      previewShape = {
        type: "circle",
        centerX: startX + width / 2,
        centerY: startY + height / 2,
        radiusX: Math.abs(width) / 2,
        radiusY: Math.abs(height) / 2,
        id: currentId
      };
    }

    if (tool === "line" || tool === "arrow") {
      previewShape = { type: tool, startX, startY, endX: x, endY: y, id: currentId };
    }

    if (tool === "diamond") {
      previewShape = {
        type: "diamond",
        centerX: startX + width / 2,
        centerY: startY + height / 2,
        width: Math.abs(width),
        height: Math.abs(height),
        id: currentId
      };
    }

    clearCanvas(existingShapes, canvas, ctx);
    drawShape(ctx, previewShape);
  };
}

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape | null) {
  if (!shape) return;

  ctx.beginPath();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  if (shape.type === "rect") {
    ctx.rect(shape.x, shape.y, shape.width, shape.height);
  }

  if (shape.type === "circle") {
    ctx.ellipse(
      shape.centerX,
      shape.centerY,
      shape.radiusX,
      shape.radiusY,
      0,
      0,
      Math.PI * 2
    );
  }

  if (shape.type === "line") {
    ctx.moveTo(shape.startX, shape.startY);
    ctx.lineTo(shape.endX, shape.endY);
  }

  if (shape.type === "arrow") {
    const { startX, startY, endX, endY } = shape;
    const headLength = 10;
    const angle = Math.atan2(endY - startY, endX - startX);

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);

    ctx.lineTo(
      endX - headLength * Math.cos(angle - Math.PI / 6),
      endY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle + Math.PI / 6),
      endY - headLength * Math.sin(angle + Math.PI / 6)
    );
  }

  if (shape.type === "diamond") {
    ctx.moveTo(shape.centerX, shape.centerY - shape.height / 2);
    ctx.lineTo(shape.centerX + shape.width / 2, shape.centerY);
    ctx.lineTo(shape.centerX, shape.centerY + shape.height / 2);
    ctx.lineTo(shape.centerX - shape.width / 2, shape.centerY);
    ctx.closePath();
  }

  if (shape.type === "pencil") {
    ctx.moveTo(shape.points[0].x, shape.points[0].y);
    shape.points.forEach((p) => ctx.lineTo(p.x, p.y));
  }

  ctx.stroke();
}

function clearCanvas(
  shapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  shapes.forEach((s) => drawShape(ctx, s));
}

async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
  const messages = res.data.messages;

  const shapes: Shape[] = [];

  messages.forEach((x: any) => {
    const messageData = safeParseJSON(x.message);
    if (messageData.type === "delete") {
      // Remove shape with this ID
      // Using index since we might have duplicates if ID not unique? Assumed unique.
      const index = shapes.findIndex(s => s.id === messageData.id);
      if (index !== -1) {
        shapes.splice(index, 1);
      }
    } else {
      // It's a shape
      const shape = messageData.shape || messageData;
      if (shape && shape.id) {
        shapes.push(shape);
      }
    }
  });

  return shapes;
}

function safeParseJSON(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
