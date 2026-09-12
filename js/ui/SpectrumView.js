import { TECHNOLOGIES, PHYSICS } from '../config/constants.js';
import { formatLength } from '../utils/format.js';

export default class SpectrumView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.w = 940;
    this.h = 360;
    this.data = null;
    this.phase = 0;

    canvas.width = this.w * this.dpr;
    canvas.height = this.h * this.dpr;
    canvas.style.aspectRatio = `${this.w} / ${this.h}`;
    this.ctx.scale(this.dpr, this.dpr);

    this.loop();
  }

  render(state, result) {
    this.data = { state, result };
  }

  loop() {
    this.draw();
    this.phase += 0.04;
    requestAnimationFrame(() => this.loop());
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    this.drawBars(ctx);
    this.drawWave(ctx);
  }

  cm(tech) {
    return (PHYSICS.speedOfLight / tech.frequencyHz) * 100;
  }

  drawBars(ctx) {
    const selectedId = this.data ? this.data.state.technology.id : null;
    const maxCm = Math.max(...TECHNOLOGIES.map((t) => this.cm(t)));
    const barMax = this.w - 360;
    const rowH = 52;
    const top = 24;

    ctx.textBaseline = 'middle';
    TECHNOLOGIES.forEach((t, i) => {
      const y = top + i * rowH;
      const selected = t.id === selectedId;
      const cm = this.cm(t);
      const len = Math.max(8, (cm / maxCm) * barMax);

      ctx.fillStyle = selected ? 'rgba(255,255,255,0.95)' : 'rgba(159,179,209,0.55)';
      ctx.font = selected ? '700 15px Rajdhani, sans-serif' : '500 14px Rajdhani, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(t.name, 110, y);

      ctx.save();
      ctx.shadowColor = t.color;
      ctx.shadowBlur = selected ? 14 : 0;
      ctx.globalAlpha = selected ? 1 : 0.4;
      ctx.fillStyle = t.color;
      ctx.fillRect(130, y - 7, len, 14);
      ctx.restore();

      ctx.fillStyle = selected ? t.color : 'rgba(159,179,209,0.6)';
      ctx.font = '600 14px Rajdhani, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(t.band, 140 + len, y);

      ctx.fillStyle = 'rgba(159,179,209,0.75)';
      ctx.font = '600 13px Consolas, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`λ = ${formatLength(PHYSICS.speedOfLight / t.frequencyHz)}`, this.w - 20, y);
    });
  }

  drawWave(ctx) {
    if (!this.data) return;
    const { state, result } = this.data;
    const color = state.technology.color;

    const waveTop = this.h - 130;
    const cx = 60;
    const width = this.w - 120;
    const cy = waveTop + 45;
    const amp = 34;
    const cycles = 3;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let px = 0; px <= width; px += 2) {
      const t = (px / width) * cycles * Math.PI * 2 + this.phase;
      const y = cy + Math.sin(t) * amp;
      if (px === 0) ctx.moveTo(cx + px, y);
      else ctx.lineTo(cx + px, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(159,179,209,0.3)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + width, cy);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = '700 15px Rajdhani, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${state.technology.name} — λ = ${formatLength(result.wavelengthM)}`,
      cx,
      waveTop - 10
    );
  }
}
