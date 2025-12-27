import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let existingShapes: Shape[] = await getExistingShapes(roomId);

  socket.onmessage = (event) => {
    let message: any;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }

    if (message.type === "chat") {
      const parsed = safeParseJSON(message.message);
      const shape = parsed?.shape ?? parsed;
      if (shape && typeof shape === "object") {
        existingShapes.push(shape as Shape);
        clearCanvas(existingShapes, canvas, ctx);
      }
    }
  };

  clearCanvas(existingShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  // 🔧 FIX: prevent duplicate listeners
  canvas.onmousedown = (e) => {
    clicked = true;
    startX = e.offsetX;
    startY = e.offsetY;
  };

  canvas.onmouseup = (e) => {
    if (!clicked) return;
    clicked = false;

    const width = e.offsetX - startX;
    const height = e.offsetY - startY;

    const shape: Shape = {
      type: "rect",
      x: startX,
      y: startY,
      width,
      height,
    };

    existingShapes.push(shape);

    socket.send(
      JSON.stringify({
        type: "chat",
        roomId,
        message: JSON.stringify({ shape }),
      })
    );

    clearCanvas(existingShapes, canvas, ctx);
  };

  canvas.onmousemove = (e) => {
    if (!clicked) return;

    const width = e.offsetX - startX;
    const height = e.offsetY - startY;

    clearCanvas(existingShapes, canvas, ctx);
    ctx.strokeStyle = "rgba(255, 255, 255)";
    ctx.strokeRect(startX, startY, width, height);
  };
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.forEach((shape) => {
    if (shape.type === "rect") {
      ctx.strokeStyle = "rgba(255, 255, 255)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
  });
}

async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
  const messages = res.data.messages;

  const shapes: Shape[] = [];

  messages.forEach((x: { message: string }) => {
    const parsed = safeParseJSON(x.message);
    const shape = parsed?.shape ?? parsed;
    if (shape && typeof shape === "object") {
      shapes.push(shape as Shape);
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
