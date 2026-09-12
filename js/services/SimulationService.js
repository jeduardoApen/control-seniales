import EventEmitter from '../core/EventEmitter.js';

export default class SimulationService extends EventEmitter {
  constructor(calculator, initialState) {
    super();
    this.calculator = calculator;
    this.state = { ...initialState };
  }

  update(patch) {
    this.state = { ...this.state, ...patch };
    this.emit('update', this.evaluate());
  }

  evaluate() {
    const { technology, material, distanceM, thicknessM, wallCount } = this.state;
    const result = this.calculator.calculate({
      technology,
      material,
      distanceM,
      thicknessM,
      wallCount,
    });
    return { state: this.state, result };
  }
}
