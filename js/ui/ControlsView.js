import { TECHNOLOGIES, MATERIALS, SYSTEM } from '../config/constants.js';

export default class ControlsView {
  constructor(container, initial) {
    this.container = container;
    this.initial = initial;
    this.onChange = () => {};
    this.build();
  }

  build() {
    this.container.innerHTML = '';

    this.technology = this.addSelect('Tecnología', TECHNOLOGIES, this.initial.technology.id);
    this.material = this.addSelect('Material de muros', MATERIALS, this.initial.material.id);
    this.thickness = this.addSlider(
      'Grosor de muros',
      SYSTEM.minThicknessM,
      SYSTEM.maxThicknessM,
      0.01,
      this.initial.thicknessM,
      (v) => `${v.toFixed(2)} m`
    );
    this.distance = this.addSlider(
      'Distancia torre-celda',
      SYSTEM.minDistanceM,
      SYSTEM.maxDistanceM,
      1,
      this.initial.distanceM,
      (v) => `${v.toFixed(0)} m`
    );

    const emit = () => this.onChange({
      technology: TECHNOLOGIES.find((t) => t.id === this.technology.value),
      material: MATERIALS.find((m) => m.id === this.material.value),
      thicknessM: parseFloat(this.thickness.input.value),
      distanceM: parseFloat(this.distance.input.value),
    });

    this.technology.addEventListener('change', emit);
    this.material.addEventListener('change', emit);
    this.thickness.input.addEventListener('input', () => {
      this.thickness.update();
      emit();
    });
    this.distance.input.addEventListener('input', () => {
      this.distance.update();
      emit();
    });
  }

  addSelect(label, options, selectedId) {
    const wrap = document.createElement('div');
    wrap.className = 'control';
    const lab = document.createElement('label');
    lab.textContent = label;
    const select = document.createElement('select');
    options.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = o.name;
      select.appendChild(opt);
    });
    select.value = selectedId;
    wrap.append(lab, select);
    this.container.appendChild(wrap);
    return select;
  }

  addSlider(label, min, max, step, value, format) {
    const wrap = document.createElement('div');
    wrap.className = 'control';
    const head = document.createElement('div');
    head.className = 'control-head';
    const lab = document.createElement('label');
    lab.textContent = label;
    const valueEl = document.createElement('span');
    valueEl.className = 'value';
    const input = document.createElement('input');
    input.type = 'range';
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = value;
    head.append(lab, valueEl);
    wrap.append(head, input);
    this.container.appendChild(wrap);

    const update = () => {
      valueEl.textContent = format(parseFloat(input.value));
    };
    update();

    return { input, update };
  }
}
