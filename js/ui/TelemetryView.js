import { formatDb, formatDbm, formatLength } from '../utils/format.js';

export default class TelemetryView {
  constructor(container) {
    this.container = container;
    this.build();
  }

  build() {
    this.container.innerHTML = `
      <div class="metric">
        <span class="metric-label">Tecnología</span>
        <span class="metric-value" data-field="tech"></span>
        <span class="metric-sub" data-field="band"></span>
      </div>
      <div class="metric">
        <span class="metric-label">Longitud de onda (λ)</span>
        <span class="metric-value" data-field="wavelength"></span>
      </div>
      <div class="metric">
        <span class="metric-label">FSPL (espacio libre)</span>
        <span class="metric-value" data-field="fspl"></span>
      </div>
      <div class="metric">
        <span class="metric-label">Atenuación por muros</span>
        <span class="metric-value" data-field="walls"></span>
        <span class="metric-sub" data-field="wallsSub"></span>
      </div>
      <div class="metric">
        <span class="metric-label">Pérdida total</span>
        <span class="metric-value" data-field="total"></span>
      </div>
      <div class="rx">
        <span class="metric-label">Potencia recibida (Rx)</span>
        <span class="metric-value rx-value" data-field="rx"></span>
      </div>
      <div class="status" data-field="status"></div>
      <div class="gauge">
        <div class="gauge-bar">
          <div class="gauge-zone gauge-bad" data-field="zoneBad"></div>
          <div class="gauge-zone gauge-ok" data-field="zoneOk"></div>
          <div class="gauge-marker" data-field="marker"></div>
        </div>
        <div class="gauge-labels">
          <span>+20 dBm</span><span>Umbral −95 dBm</span><span>−120 dBm</span>
        </div>
      </div>
    `;
    this.fields = {};
    this.container.querySelectorAll('[data-field]').forEach((el) => {
      this.fields[el.dataset.field] = el;
    });
  }

  render(state, result) {
    this.fields.tech.textContent = state.technology.name;
    this.fields.band.textContent = state.technology.band;
    this.fields.wavelength.textContent = formatLength(result.wavelengthM);
    this.fields.fspl.textContent = formatDb(result.fsplDb);
    this.fields.walls.textContent = formatDb(result.wallLossDb);
    this.fields.wallsSub.textContent = `${formatDb(result.perWallLossDb)} / muro`;
    this.fields.total.textContent = formatDb(result.totalLossDb);
    this.fields.rx.textContent = formatDbm(result.receivedPowerDbm);
    this.fields.rx.className = `metric-value rx-value ${result.isActive ? 'ok' : 'bad'}`;

    const status = this.fields.status;
    status.textContent = result.isActive ? 'SEÑAL ACTIVA' : 'SEÑAL BLOQUEADA';
    status.className = `status ${result.isActive ? 'ok' : 'bad'}`;

    const min = -120;
    const max = 20;
    const frac = (result.receivedPowerDbm - min) / (max - min);
    const thresholdFrac = (result.thresholdDbm - min) / (max - min);

    this.fields.zoneBad.style.width = `${thresholdFrac * 100}%`;
    this.fields.zoneOk.style.left = `${thresholdFrac * 100}%`;
    this.fields.zoneOk.style.width = `${(1 - thresholdFrac) * 100}%`;
    this.fields.marker.style.left = `${Math.min(100, Math.max(0, frac * 100))}%`;
  }
}
