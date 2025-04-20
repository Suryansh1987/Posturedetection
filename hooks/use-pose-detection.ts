'use client';

import { useState, useCallback, useRef } from 'react';
import { 
  PoseLandmarker,
  FilesetResolver,
  PoseLandmarkerResult
} from '@mediapipe/tasks-vision';
import { PoseLandmark } from '@/types/mediapipe';

export function usePoseDetection() {
  const [landmarks, setLandmarks] = useState<PoseLandmark[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  const createPoseLandmarker = useCallback(async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    
    return PoseLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputSegmentationMasks: false
      }
    );
  }, []);

  const startDetection = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      // Create pose landmarker if not already created
      if (!poseLandmarkerRef.current) {
        poseLandmarkerRef.current = await createPoseLandmarker();
      }

      if (!poseLandmarkerRef.current) {
        throw new Error("Failed to create pose landmarker");
      }

      setIsDetecting(true);
      lastVideoTimeRef.current = -1;

      // Start detection loop
      const predictWebcam = async () => {
        if (!poseLandmarkerRef.current || !videoElement || !isDetecting) return;

        // If video has loaded enough to play
        if (videoElement.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = videoElement.currentTime;
          
          // Detect poses
          const result: PoseLandmarkerResult = poseLandmarkerRef.current.detectForVideo(
            videoElement, 
            performance.now()
          );

          // If poses detected, update state
          if (result.landmarks && result.landmarks.length > 0) {
            setLandmarks(result.landmarks[0]);
          } else {
            setLandmarks([]);
          }
        }

        // Continue loop
        if (isDetecting) {
          animationFrameRef.current = requestAnimationFrame(predictWebcam);
        }
      };

      // Start the detection loop
      predictWebcam();
    } catch (error) {
      console.error("Error starting pose detection:", error);
      setIsDetecting(false);
      throw error;
    }
  }, [createPoseLandmarker, isDetecting]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clean up landmarker
    if (poseLandmarkerRef.current) {
      poseLandmarkerRef.current.close();
      poseLandmarkerRef.current = null;
    }
  }, []);

  return {
    landmarks,
    isDetecting,
    startDetection,
    stopDetection
  };
}