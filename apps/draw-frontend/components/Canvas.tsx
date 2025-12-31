"use client";

import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import {
  Circle,
  Pencil,
  RectangleHorizontalIcon,
  Hand,
  MousePointer2,
  Lock,
  Type,
  Image as ImageIcon,
  Eraser,
  Minus,
  ArrowRight,
  Diamond,
} from "lucide-react";
import Topbar from "./Topbar";

export type Tool =
  | "lock"
  | "hand"
  | "select"
  | "rect"
  | "diamond"
  | "circle"
  | "arrow"
  | "line"
  | "pencil"
  | "text"
  | "image"
  | "eraser";

export function Canvass({
  roomId,
  socket,
}: {
  socket: WebSocket;
  roomId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");

  // expose tool to draw logic (unchanged)
  useEffect(() => {
    // @ts-ignore
    window.selectedTool = selectedTool;
  }, [selectedTool]);

  useEffect(() => {
    if (!canvasRef.current) return;
    initDraw(canvasRef.current, roomId, socket);
  }, [roomId, socket]);

  return (
    <div className="h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      />
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}
