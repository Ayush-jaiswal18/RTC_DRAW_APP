import { IconButton } from "./IconButton";
import {
  Lock,
  Hand,
  MousePointer2,
  RectangleHorizontalIcon,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Image as ImageIcon,
  Eraser,
} from "lucide-react";
import { Tool } from "./Canvas"; // adjust path if Tool is exported elsewhere

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#1e1e1e] rounded-xl px-3 py-2 flex gap-2 shadow-lg">
      <IconButton
        icon={<Lock />}
        activated={selectedTool === "lock"}
        onClick={() => setSelectedTool("lock")}
      />
      <IconButton
        icon={<Hand />}
        activated={selectedTool === "hand"}
        onClick={() => setSelectedTool("hand")}
      />
      <IconButton
        icon={<MousePointer2 />}
        activated={selectedTool === "select"}
        onClick={() => setSelectedTool("select")}
      />

      <IconButton
        icon={<RectangleHorizontalIcon />}
        activated={selectedTool === "rect"}
        onClick={() => setSelectedTool("rect")}
      />
      <IconButton
        icon={<Diamond />}
        activated={selectedTool === "diamond"}
        onClick={() => setSelectedTool("diamond")}
      />
      <IconButton
        icon={<Circle />}
        activated={selectedTool === "circle"}
        onClick={() => setSelectedTool("circle")}
      />

      <IconButton
        icon={<ArrowRight />}
        activated={selectedTool === "arrow"}
        onClick={() => setSelectedTool("arrow")}
      />
      <IconButton
        icon={<Minus />}
        activated={selectedTool === "line"}
        onClick={() => setSelectedTool("line")}
      />
      <IconButton
        icon={<Pencil />}
        activated={selectedTool === "pencil"}
        onClick={() => setSelectedTool("pencil")}
      />

      <IconButton
        icon={<Type />}
        activated={selectedTool === "text"}
        onClick={() => setSelectedTool("text")}
      />
      <IconButton
        icon={<ImageIcon />}
        activated={selectedTool === "image"}
        onClick={() => setSelectedTool("image")}
      />
      <IconButton
        icon={<Eraser />}
        activated={selectedTool === "eraser"}
        onClick={() => setSelectedTool("eraser")}
      />
    </div>
  );
}

export default Topbar;
