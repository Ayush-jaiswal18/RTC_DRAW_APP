import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

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
    rooms: string[];
    userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (!decoded || !decoded.userId) {
            return null;
        }

        return decoded.userId;
    } catch {
        return null;
    }
}

wss.on("connection", function connection(ws, request) {
    const url = request.url;
    if (!url) {
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") || "";
    const userId = checkUser(token);

    if (userId == null) {
        ws.close();
        return;
    }

    users.push({
        userId,
        rooms: [],
        ws,
    });

    ws.on("message", function message(data) {
        const parsedData = JSON.parse(data as unknown as string);

        if (parsedData.type === "join_room") {
            const user = users.find((x) => x.ws === ws);
            user?.rooms.push(parsedData.roomId);
        }

        if (parsedData.type === "leave_room") {
            const user = users.find((x) => x.ws === ws);
            if (!user) {
                return;
            }
            user.rooms = user.rooms.filter((x) => x !== parsedData.roomId);
        }

        if (parsedData.type === "chat") {
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            users.forEach((user) => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(
                        JSON.stringify({
                            type: "chat",
                            message,
                            roomId,
                        })
                    );
                }
            });
        }
    });
});
