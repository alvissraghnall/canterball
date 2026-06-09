export const CANVAS = {
  WIDTH: 800,
  HEIGHT: 480,
  PADDING: 20,
} as const;

export function fieldToCanvas(fx: number, fy: number): { x: number; y: number } {
  const w = CANVAS.WIDTH - CANVAS.PADDING * 2;
  const h = CANVAS.HEIGHT - CANVAS.PADDING * 2;
  return {
    x: CANVAS.PADDING + (fx / 100) * w,
    y: CANVAS.PADDING + (fy / 60) * h,
  };
}

export function canvasToField(cx: number, cy: number): { x: number; y: number } {
  const w = CANVAS.WIDTH - CANVAS.PADDING * 2;
  const h = CANVAS.HEIGHT - CANVAS.PADDING * 2;
  return {
    x: ((cx - CANVAS.PADDING) / w) * 100,
    y: ((cy - CANVAS.PADDING) / h) * 60,
  };
}
