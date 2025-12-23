import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";


export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
            const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NjBiM2RjMC1iYTUzLTRmMjQtYTRiMC05Y2JhZTIwMzZhNTQiLCJpYXQiOjE3NjYzMTQ0MjJ9.zeqvViJFTP6n-DHjNNf-hF0ywSw9oP47sDLt41KDqIk`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        socket,
        loading
    }
}