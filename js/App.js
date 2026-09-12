import { TECHNOLOGIES, MATERIALS, SYSTEM } from './config/constants.js';
import LinkBudgetCalculator from './domain/LinkBudgetCalculator.js';
import SimulationService from './services/SimulationService.js';
import ControlsView from './ui/ControlsView.js';
import TelemetryView from './ui/TelemetryView.js';
import PlanRenderer from './ui/PlanRenderer.js';
import SpectrumView from './ui/SpectrumView.js';

export default class App {
  constructor() {
    this.calculator = new LinkBudgetCalculator({
      txPowerDbm: SYSTEM.txPowerDbm,
      thresholdDbm: SYSTEM.thresholdDbm,
    });

    this.initialState = {
      technology: TECHNOLOGIES[0],
      material: MATERIALS[0],
      thicknessM: SYSTEM.defaultThicknessM,
      distanceM: SYSTEM.defaultDistanceM,
      wallCount: SYSTEM.wallCount,
    };

    this.simulation = new SimulationService(this.calculator, this.initialState);
  }

  start() {
    this.controls = new ControlsView(document.getElementById('controlsPanel'), this.initialState);
    this.telemetry = new TelemetryView(document.getElementById('telemetryPanel'));
    this.plan = new PlanRenderer(
      this.calculator,
      document.getElementById('planCanvas'),
      document.getElementById('planTooltip')
    );
    this.spectrum = new SpectrumView(document.getElementById('spectrumCanvas'));

    this.controls.onChange = (patch) => this.simulation.update(patch);
    this.simulation.on('update', ({ state, result }) => this.render(state, result));

    const { state, result } = this.simulation.evaluate();
    this.render(state, result);
  }

  render(state, result) {
    this.telemetry.render(state, result);
    this.plan.render(state, result);
    this.spectrum.render(state, result);
  }
}
