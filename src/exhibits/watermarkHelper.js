// Shared archival watermark renderer for Canvas2D museum exhibits
export function drawCanvasWatermark(ctx, width, height, lang = 'zh', bottomOffset = 84) {
  ctx.save();

  // 1. Subtle diagonal geometric provenance grid inside the canvas itself
  const diagText = lang === 'zh' ? 'DYCSHOW · 万象归序' : 'DYCSHOW · PANTHEON OF ORDER';
  const fontFace =
    lang === 'zh'
      ? '"Noto Serif SC", "Songti SC", serif'
      : '"Cormorant Garamond", Georgia, serif';

  ctx.font = `400 13px ${fontFace}`;
  ctx.fillStyle = 'rgba(212, 175, 55, 0.045)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const stepX = 340;
  const stepY = 200;
  ctx.translate(width * 0.5, height * 0.5);
  ctx.rotate(-0.46);
  for (let y = -height; y <= height; y += stepY) {
    const rowShift = Math.abs(Math.round(y / stepY)) % 2 === 1 ? stepX * 0.5 : 0;
    for (let x = -width; x <= width; x += stepX) {
      ctx.fillText(diagText, x + rowShift, y);
    }
  }
  ctx.restore();

  // 2. Crisp curatorial seal stamp in lower-right corner above HUD
  ctx.save();
  const sealLabel =
    lang === 'zh' ? '© DYCSHOW · 万象归序艺术殿堂' : '© DYCSHOW · THE PANTHEON OF ORDER';
  ctx.font = `500 10.5px ${fontFace}`;
  const metrics = ctx.measureText(sealLabel);
  const padX = 10;
  const boxW = metrics.width + padX * 2;
  const boxH = 22;
  const bx = Math.max(16, width - boxW - 18);
  const by = Math.max(70, height - bottomOffset - boxH);

  ctx.fillStyle = 'rgba(7, 7, 10, 0.65)';
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.32)';
  ctx.lineWidth = 1;
  ctx.fillRect(bx, by, boxW, boxH);
  ctx.strokeRect(bx, by, boxW, boxH);

  ctx.fillStyle = 'rgba(212, 175, 55, 0.78)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(sealLabel, bx + boxW - padX, by + boxH * 0.5 + 0.5);
  ctx.restore();
}
