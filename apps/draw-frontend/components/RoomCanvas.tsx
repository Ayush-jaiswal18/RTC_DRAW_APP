"use client"
import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvass } from "./Canvas";

export function RoomCanvas({ roomId, token }: { roomId: string, token: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setError(null);

        if (!token) {
            setError("No token found");
            return;
        }

        const ws = new WebSocket(`${WS_URL}?token=${token}`)

        ws.onopen = () => {
            console.info("WebSocket opened", WS_URL);
            setSocket(ws)
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }

        ws.onerror = (ev) => {
            console.error("WebSocket error", ev);
            setError("WebSocket error");
        }

        ws.onclose = (ev) => {
            console.warn("WebSocket closed", ev.code, ev.reason);
            // if it closed before open, show a helpful error
            if (!socket) setError("Connection closed by server");
        }

        // cleanup on unmount or roomId change
        return () => {
            try { ws.close(); } catch (e) { /* ignore */ }
        }
    }, [roomId])


    if (!socket) {
        return <div>
            {error ? `Connection error: ${error}` : "Connecting to server..."}
        </div>
    }

    return <div>
        <Canvass roomId={roomId} socket={socket} />
    </div>
}