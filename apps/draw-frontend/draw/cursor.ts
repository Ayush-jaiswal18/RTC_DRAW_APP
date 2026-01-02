
export function updateCursor(canvas: HTMLCanvasElement, tool: string) {
  switch (tool) {
    case "eraser":
      canvas.style.cursor = "not-allowed"; // 🧽
      break;

    case "pencil":
    case "rect":
    case "circle":
    case "line":
    case "arrow":
    case "diamond":
      canvas.style.cursor = "crosshair"; 
      break;

    default:
      canvas.style.cursor = "crosshair"; 
  }
}
