export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseLandmarkerResult {
  landmarks: PoseLandmark[][];
  worldLandmarks?: PoseLandmark[][];
  segmentationMasks?: unknown[];
}