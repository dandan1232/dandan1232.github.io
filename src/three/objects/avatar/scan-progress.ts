import { MathUtils } from "three";

export const SCAN_MIN_Y = -0.2;
export const SCAN_MAX_Y = 4.5;

export const getScanY = (progress: number) => {
  return MathUtils.lerp(SCAN_MIN_Y, SCAN_MAX_Y, MathUtils.clamp(progress, 0, 1));
};
