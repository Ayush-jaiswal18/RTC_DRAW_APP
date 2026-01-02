import { HTTP_BACKEND } from "@/config";
import { updateCursor } from "./cursor";
import axios from "axios";
import { eraseAtPoint } from "./eraser";

export type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radiusX: number; radiusY: number }
  | { type: "line"; startX: number; startY: number; endX: number; endY: number }
  | { type: "arrow"; startX: number; startY: number; endX: number; endY: number }
  | { type: "diamond"; centerX: number; centerY: number; width: number; height: number }
  | { type: "pencil"; points: { x: number; y: number }[] };

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let existingShapes: Shape[] = await getExistingShapes(roomId);
  let previewShape: Shape | null = null;

  let undoStack: Shape[][] = [];
  let redoStack: Shape[][] = [];

  const saveState = () => {
    undoStack.push(JSON.parse(JSON.stringify(existingShapes)));
    redoStack = [];
  };

  (window as any).undo = () => {
    if (!undoStack.length) return;
    redoStack.push(JSON.parse(JSON.stringify(existingShapes)));
    existingShapes = undoStack.pop()!;
    clearCanvas(existingShapes, canvas, ctx);
  };

  (window as any).redo = () => {
    if (!redoStack.length) return;
    undoStack.push(JSON.parse(JSON.stringify(existingShapes)));
    existingShapes = redoStack.pop()!;
    clearCanvas(existingShapes, canvas, ctx);
  };

  socket.onmessage = (event) => {
    const message = safeParseJSON(event.data);
    if (!message || message.type !== "chat") return;

    const parsed = safeParseJSON(message.message);
    const shape = parsed?.shape ?? parsed;

    if (shape) {
      saveState();
      existingShapes.push(shape);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  clearCanvas(existingShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;
  let pencilPoints: { x: number; y: number }[] = [];

  canvas.onmousedown = (e) => {
    clicked = true;
    saveState();

    startX = e.offsetX;
    startY = e.offsetY;

    if ((window as any).selectedTool === "pencil") {
      pencilPoints = [{ x: startX, y: startY }];
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
      existingShapes = eraseAtPoint(x, y, existingShapes);
      clearCanvas(existingShapes, canvas, ctx);
      return;
    }

    if (tool === "pencil") {
      pencilPoints.push({ x, y });

      previewShape = {
        type: "pencil",
        points: pencilPoints,
      };

      clearCanvas(existingShapes, canvas, ctx);
      drawShape(ctx, previewShape);
      return;
    }

    const width = x - startX;
    const height = y - startY;

    if (tool === "rect") {
      previewShape = { type: "rect", x: startX, y: startY, width, height };
    }

    if (tool === "circle") {
      previewShape = {
        type: "circle",
        centerX: startX + width / 2,
        centerY: startY + height / 2,
        radiusX: Math.abs(width) / 2,
        radiusY: Math.abs(height) / 2,
      };
    }

    if (tool === "line" || tool === "arrow") {
      previewShape = { type: tool, startX, startY, endX: x, endY: y };
    }

    if (tool === "diamond") {
      previewShape = {
        type: "diamond",
        centerX: startX + width / 2,
        centerY: startY + height / 2,
        width: Math.abs(width),
        height: Math.abs(height),
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
  return res.data.messages
    .map((m: any) => safeParseJSON(m.message)?.shape)
    .filter(Boolean);
}

function safeParseJSON(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
