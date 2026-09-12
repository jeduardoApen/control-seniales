import { PHYSICS } from '../config/constants.js';

export default class LinkBudgetCalculator {
  constructor({ speedOfLight = PHYSICS.speedOfLight, txPowerDbm, thresholdDbm } = {}) {
    this.speedOfLight = speedOfLight;
    this.txPowerDbm = txPowerDbm;
    this.thresholdDbm = thresholdDbm;
    this.fsplOffsetDb = 20 * Math.log10((4 * Math.PI) / speedOfLight);
  }

  wavelength(frequencyHz) {
    return this.speedOfLight / frequencyHz;
  }

  freeSpacePathLoss(distanceM, frequencyHz) {
    return 20 * Math.log10(distanceM) + 20 * Math.log10(frequencyHz) + this.fsplOffsetDb;
  }

  attenuationPerMeter(material, frequencyHz) {
    const gHz = frequencyHz / 1e9;
    return material.attenuationDbPerMeterAt1GHz * Math.pow(gHz, material.exponent);
  }

  wallLoss(material, frequencyHz, thicknessM) {
    return this.attenuationPerMeter(material, frequencyHz) * thicknessM;
  }

  totalWallLoss(material, frequencyHz, thicknessM, wallCount) {
    return this.wallLoss(material, frequencyHz, thicknessM) * wallCount;
  }

  receivedPower({ distanceM, frequencyHz, material, thicknessM, wallCount }) {
    const fsplDb = this.freeSpacePathLoss(distanceM, frequencyHz);
    const wallLossDb = this.totalWallLoss(material, frequencyHz, thicknessM, wallCount);
    return this.txPowerDbm - fsplDb - wallLossDb;
  }

  calculate({ technology, material, distanceM, thicknessM, wallCount }) {
    const frequencyHz = technology.frequencyHz;
    const wavelengthM = this.wavelength(frequencyHz);
    const fsplDb = this.freeSpacePathLoss(distanceM, frequencyHz);
    const perWallLossDb = this.wallLoss(material, frequencyHz, thicknessM);
    const wallLossDb = perWallLossDb * wallCount;
    const totalLossDb = fsplDb + wallLossDb;
    const receivedPowerDbm = this.txPowerDbm - totalLossDb;

    return {
      frequencyHz,
      wavelengthM,
      fsplDb,
      perWallLossDb,
      wallLossDb,
      totalLossDb,
      receivedPowerDbm,
      thresholdDbm: this.thresholdDbm,
      marginDb: receivedPowerDbm - this.thresholdDbm,
      isActive: receivedPowerDbm >= this.thresholdDbm,
    };
  }
}
