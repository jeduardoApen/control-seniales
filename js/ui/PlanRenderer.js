const COLORS = {
  grid: 'rgba(40, 60, 90, 0.28)',
  perimeter: '#00f0ff',
  cell: '#ff2bd6',
  tower: '#00ff88',
  receiver: '#f0ff00',
  los: 'rgba(255, 255, 255, 0.35)',
  label: '#9fb3d1',
};

function rgb(c) {
  return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export default class PlanRenderer {
  constructor(calculator, canvas, tooltip) {
    this.calculator = calculator;
    this.canvas = canvas;
    this.tooltip = tooltip;
    this.ctx = canvas.getContext('2d');

    this.cssWidth = 940;
    this.worldWidthM = 250;
    this.worldHeightM = 170;
    this.scale = this.cssWidth / this.worldWidthM;
    this.cssHeight = Math.round(this.scale * this.worldHeightM);

    this.dpr = window.devicePixelRatio || 1;
    canvas.width = this.cssWidth * this.dpr;
    canvas.height = this.cssHeight * this.dpr;
    canvas.style.aspectRatio = `${this.cssWidth} / ${this.cssHeight}`;
    this.ctx.scale(this.dpr, this.dpr);

    this.setupHover();
  }

  px(x, y) {
    return [x * this.scale, y * this.scale];
  }

  render(state, result) {
    this.state = state;
    this.result = result;
    this.geometry = this.computeGeometry(state);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
    this.drawGrid(ctx);
    this.drawSignalField(ctx);
    this.drawContours(ctx);
    this.drawShadows(ctx);
    this.drawWalls(ctx);
    this.drawNodes(ctx);
    this.drawLabels(ctx);
  }

  computeGeometry(state) {
    const tower = { x: 12, y: this.worldHeightM / 2 };
    const facility = {
      left: state.distanceM,
      top: 25,
      width: 70,
      height: this.worldHeightM - 50,
    };
    const cell = {
      left: facility.left + (facility.width - 30) / 2,
      top: facility.top + (facility.height - 44) / 2,
      width: 30,
      height: 44,
    };
    return { tower, facility, cell };
  }

  drawGrid(ctx) {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= this.worldWidthM; x += 25) {
      ctx.moveTo(x * this.scale, 0);
      ctx.lineTo(x * this.scale, this.cssHeight);
    }
    for (let y = 0; y <= this.worldHeightM; y += 25) {
      ctx.moveTo(0, y * this.scale);
      ctx.lineTo(this.cssWidth, y * this.scale);
    }
    ctx.stroke();
  }

  drawSignalField(ctx) {
    const [cx, cy] = this.px(this.geometry.tower.x, this.geometry.tower.y);
    const radius = Math.hypot(this.cssWidth, this.cssHeight);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    const freq = this.result.frequencyHz;
    const tx = this.calculator.txPowerDbm;

    [0.5, 2, 5, 10, 20, 40, 80, 160, 300, 500].forEach((d) => {
      const power = tx - this.calculator.freeSpacePathLoss(d, freq);
      const offset = Math.min(1, Math.max(0, (d * this.scale) / radius));
      grad.addColorStop(offset, this.colorForDbm(power));
    });

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
  }

  drawContours(ctx) {
    const freq = this.result.frequencyHz;
    const [cx, cy] = this.px(this.geometry.tower.x, this.geometry.tower.y);

    const ring = (powerDbm, color, dash) => {
      const r = this.distanceForPower(powerDbm, freq) * this.scale;
      if (r < 0 || r > Math.hypot(this.cssWidth, this.cssHeight)) return;
      ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    ring(-70, 'rgba(240, 255, 0, 0.5)', [4, 6]);
    ring(this.result.thresholdDbm, 'rgba(255, 51, 85, 0.6)', [6, 6]);
  }

  drawShadows(ctx) {
    const s = this.scale;
    const loss = this.result.perWallLossDb;
    const facility = this.geometry.facility;
    const cell = this.geometry.cell;

    ctx.fillStyle = `rgba(0, 0, 10, ${Math.min(0.85, loss / 70)})`;
    ctx.fillRect(facility.left * s, facility.top * s, facility.width * s, facility.height * s);

    ctx.fillStyle = `rgba(0, 0, 10, ${Math.min(0.9, loss / 70)})`;
    ctx.fillRect(cell.left * s, cell.top * s, cell.width * s, cell.height * s);
  }

  drawWalls(ctx) {
    const s = this.scale;
    const facility = this.geometry.facility;
    const cell = this.geometry.cell;

    ctx.strokeStyle = COLORS.perimeter;
    ctx.lineWidth = 0.5 * s;
    ctx.strokeRect(facility.left * s, facility.top * s, facility.width * s, facility.height * s);

    ctx.strokeStyle = COLORS.cell;
    ctx.lineWidth = Math.max(1.5, this.state.thicknessM * s);
    ctx.strokeRect(cell.left * s, cell.top * s, cell.width * s, cell.height * s);
  }

  drawNodes(ctx) {
    const s = this.scale;
    const g = this.geometry;
    const [tx, ty] = this.px(g.tower.x, g.tower.y);
    const rx = (g.cell.left + g.cell.width / 2) * s;
    const ry = (g.cell.top + g.cell.height / 2) * s;

    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = COLORS.los;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(rx, ry);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = COLORS.tower;
    ctx.beginPath();
    ctx.moveTo(tx, ty - 14);
    ctx.lineTo(tx - 9, ty + 6);
    ctx.lineTo(tx + 9, ty + 6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tx, ty, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.receiver;
    ctx.shadowColor = COLORS.receiver;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(rx, ry, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawLabels(ctx) {
    const s = this.scale;
    const g = this.geometry;
    ctx.font = '600 11px Rajdhani, sans-serif';

    this.label(ctx, 'TORRE (Tx)', g.tower.x * s, g.tower.y * s - 24);
    this.label(ctx, 'MURO PERIMETRAL', g.facility.left * s - 8, g.facility.top * s - 10, true);
    this.label(
      ctx,
      `MURO CELDA (${this.state.thicknessM.toFixed(2)} m)`,
      g.cell.left * s,
      g.cell.top * s - 10
    );
    this.label(
      ctx,
      'CELDA (Rx)',
      (g.cell.left + g.cell.width / 2) * s,
      (g.cell.top + g.cell.height / 2) * s + 18
    );
  }

  label(ctx, text, x, y, alignRight = false) {
    ctx.fillStyle = COLORS.label;
    ctx.textAlign = alignRight ? 'right' : 'center';
    ctx.fillText(text, x, y);
  }

  distanceForPower(powerDbm, freq) {
    const n =
      this.calculator.txPowerDbm -
      powerDbm -
      20 * Math.log10(freq) -
      this.calculator.fsplOffsetDb;
    return Math.pow(10, n / 20);
  }

  colorForDbm(dbm) {
    const ramp = [
      [-40, [0, 255, 136]],
      [-55, [120, 255, 60]],
      [-70, [240, 255, 0]],
      [-85, [255, 150, 0]],
      [-95, [255, 40, 60]],
    ];
    if (dbm >= ramp[0][0]) return rgb(ramp[0][1]);
    for (let i = 0; i < ramp.length - 1; i++) {
      const [hi, cHi] = ramp[i];
      const [lo, cLo] = ramp[i + 1];
      if (dbm >= lo) {
        const t = (hi - dbm) / (hi - lo);
        return rgb(lerpColor(cHi, cLo, t));
      }
    }
    return '#10030a';
  }

  setupHover() {
    this.canvas.addEventListener('mousemove', (e) => this.onMove(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.tooltip.style.display = 'none';
    });
  }

  onMove(e) {
    if (!this.geometry || !this.result) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.cssWidth / rect.width);
    const y = (e.clientY - rect.top) * (this.cssHeight / rect.height);

    const wx = x / this.scale;
    const wy = y / this.scale;
    const g = this.geometry;

    const d = Math.hypot(wx - g.tower.x, wy - g.tower.y);
    let walls = 0;
    if (wx >= g.facility.left) walls = 1;
    if (this.inside(wx, wy, g.cell)) walls = 2;

    const power =
      this.calculator.txPowerDbm -
      this.calculator.freeSpacePathLoss(d, this.result.frequencyHz) -
      walls * this.result.perWallLossDb;

    this.tooltip.style.display = 'block';
    this.tooltip.style.left = `${x + 12}px`;
    this.tooltip.style.top = `${y + 12}px`;
    this.tooltip.textContent = `d = ${d.toFixed(1)} m · muros = ${walls} · P ≈ ${power.toFixed(1)} dBm`;
  }

  inside(x, y, rect) {
    return (
      x >= rect.left &&
      x <= rect.left + rect.width &&
      y >= rect.top &&
      y <= rect.top + rect.height
    );
  }
}
