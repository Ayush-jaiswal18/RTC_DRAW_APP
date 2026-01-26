import type { Shape } from "./index";

const ERASE_RADIUS = 10;

export function eraseAtPoint(
  x: number,
  y: number,
  shapes: Shape[]
): Shape[] {
  return shapes
    .map((shape) => {
      if (shape.type === "pencil") {
        const chunks: { x: number; y: number }[][] = [];
        let current: { x: number; y: number }[] = [];

        for (const p of shape.points) {
          if (Math.hypot(p.x - x, p.y - y) > ERASE_RADIUS) {
            current.push(p);
          } else {
            if (current.length > 1) chunks.push(current);
            current = [];
          }
        }

        if (current.length > 1) chunks.push(current);

        if (chunks.length === 1 && chunks[0].length === shape.points.length) {
          return shape; // No change
        }

        return chunks.map((points) => ({
          type: "pencil",
          points,
          id: Math.random().toString(36).substring(2, 9)
        }));
      }

      const isInside = isPointInsideShape(x, y, shape);
      if (isInside) {
        return null;
      }

      return shape;
    })
    .flat()
    .filter(Boolean) as Shape[];
}

function isPointInsideShape(
  x: number,
  y: number,
  shape: Shape
): boolean {
  switch (shape.type) {
    case "rect":
      return (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      );

    case "circle":
      return (
        Math.abs(x - shape.centerX) <= shape.radiusX &&
        Math.abs(y - shape.centerY) <= shape.radiusY
      );

    case "line":
    case "arrow":
      return isNearLine(
        x,
        y,
        shape.startX,
        shape.startY,
        shape.endX,
        shape.endY
      );

    case "diamond":
      return (
        Math.abs(x - shape.centerX) <= shape.width / 2 &&
        Math.abs(y - shape.centerY) <= shape.height / 2
      );

    default:
      return false;
  }
}

function isNearLine(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const t = Math.max(0, Math.min(1, dot / lenSq));

  const xx = x1 + t * C;
  const yy = y1 + t * D;

  return Math.hypot(px - xx, py - yy) < ERASE_RADIUS;
}
