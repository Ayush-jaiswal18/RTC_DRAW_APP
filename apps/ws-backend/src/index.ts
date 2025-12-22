import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const PORT = Number(process.env.PORT) || 8080;

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

wss.on("error", (error: any) => {
  console.error("WebSocket server error:", error);
  process.exit(1);
});

interface User {
  ws: WebSocket;
  rooms: number[]; // ✅ FIX: use number instead of string
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded?.userId ?? null;
  } catch {
    return null;
  }
}

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) return;

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    ws,
    rooms: [],
    userId,
  });

  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data.toString());

    if (parsedData.type === "join_room") {
      const user = users.find((u) => u.ws === ws);
      const roomId = Number(parsedData.roomId); // ✅ FIX: convert to number
      if (!user || isNaN(roomId)) return;

      if (!user.rooms.includes(roomId)) {
        user.rooms.push(roomId); // ✅ FIX: consistent room type
      }
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((u) => u.ws === ws);
      const roomId = Number(parsedData.roomId); // ✅ FIX
      if (!user || isNaN(roomId)) return;

      user.rooms = user.rooms.filter((r) => r !== roomId); // ✅ FIX
    }

    if (parsedData.type === "chat") {
      const roomId = Number(parsedData.roomId); // ✅ FIX
      const message = parsedData.message;

      if (isNaN(roomId) || typeof message !== "string") return;

      await prismaClient.chat.create({
        data: {
          roomId, // ✅ FIX: Prisma expects Int
          message,
          userId,
        },
      });

      users.forEach((u) => {
        if (u.rooms.includes(roomId)) { // ✅ FIX: number vs number
          u.ws.send(
            JSON.stringify({
              type: "chat",
              roomId,
              message,
            })
          );
        }
      });
    }
  });
});
