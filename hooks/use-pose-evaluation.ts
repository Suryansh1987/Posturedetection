'use client';

import { useState, useCallback, useRef } from 'react';
import { PoseLandmark } from '@/types/mediapipe';
import { ExerciseType } from '@/components/ExerciseApp';
import { evaluateSquat } from '@/utils/squat-evaluator';
import { evaluatePushup } from '@/utils/pushup-evaluator';

export interface IssueDetection {
  message: string;
  severity: 'low' | 'medium' | 'high';
  affectedJoints: number[];
}

export interface EvaluationResult {
  isCorrectForm: boolean;
  issues: IssueDetection[];
}

export function usePoseEvaluation(exerciseType: ExerciseType) {
  const [repCount, setRepCount] = useState(0);
  const [exerciseState, setExerciseState] = useState<'up' | 'down' | 'hold' | 'initial'>('initial');
  const [evalResult, setEvalResult] = useState<EvaluationResult>({ isCorrectForm: true, issues: [] });
  
  // Reference values for tracking rep states
  const repStateRef = useRef<'up' | 'down' | 'transitioning'>('up');
  const lastEvalTimeRef = useRef<number>(0);
  const consecutiveCorrectFormFramesRef = useRef<number>(0);

  const evaluatePose = useCallback((landmarks: PoseLandmark[]) => {
    if (!landmarks || landmarks.length === 0 || !exerciseType) return;
    
    // Throttle evaluation to avoid too frequent updates
    const now = Date.now();
    if (now - lastEvalTimeRef.current < 100) return; // 100ms throttle
    lastEvalTimeRef.current = now;
    
    let result: EvaluationResult;
    
    // Evaluate based on exercise type
    if (exerciseType === 'squat') {
      result = evaluateSquat(landmarks);
      
      // Detect squat states (up/down)
      const hipY = landmarks[24].y; // Right hip landmark
      const kneeY = landmarks[26].y; // Right knee landmark
      
      if (hipY > kneeY - 0.05) { // In squat position
        if (repStateRef.current === 'up') {
          repStateRef.current = 'transitioning';
          setExerciseState('down');
          
          // Check if form is correct during squat
          if (result.isCorrectForm) {
            consecutiveCorrectFormFramesRef.current++;
            
            // Need consistent good form for a few frames to count rep
            if (consecutiveCorrectFormFramesRef.current >= 5) {
              repStateRef.current = 'down';
            }
          } else {
            consecutiveCorrectFormFramesRef.current = 0;
          }
        }
      } else { // Standing position
        if (repStateRef.current === 'down') {
          // Count rep when returning to standing position
          setRepCount(prev => prev + 1);
          repStateRef.current = 'up';
          consecutiveCorrectFormFramesRef.current = 0;
        }
        setExerciseState('up');
        repStateRef.current = 'up';
      }
      
    } else { // Push-up
      result = evaluatePushup(landmarks);
      
      // Detect push-up states (up/down)
      const shoulderY = landmarks[12].y; // Right shoulder landmark
      const wristY = landmarks[16].y; // Right wrist landmark
      const elbowY = landmarks[14].y; // Right elbow landmark
      
      // Check if in down position (elbows bent)
      const elbowAngle = calculateAngle(
        [landmarks[12].x, landmarks[12].y], // shoulder
        [landmarks[14].x, landmarks[14].y], // elbow
        [landmarks[16].x, landmarks[16].y]  // wrist
      );
      
      if (elbowAngle < 110) { // Down position when elbow is bent
        if (repStateRef.current === 'up') {
          repStateRef.current = 'transitioning';
          setExerciseState('down');
          
          // Check if form is correct during push-up
          if (result.isCorrectForm) {
            consecutiveCorrectFormFramesRef.current++;
            
            // Need consistent good form for a few frames to count rep
            if (consecutiveCorrectFormFramesRef.current >= 5) {
              repStateRef.current = 'down';
            }
          } else {
            consecutiveCorrectFormFramesRef.current = 0;
          }
        }
      } else { // Up position
        if (repStateRef.current === 'down') {
          // Count rep when returning to up position
          setRepCount(prev => prev + 1);
          repStateRef.current = 'up';
          consecutiveCorrectFormFramesRef.current = 0;
        }
        setExerciseState('up');
        repStateRef.current = 'up';
      }
    }
    
    // Update evaluation result
    setEvalResult(result);
    
  }, [exerciseType]);
  
  // Helper function to calculate angle between three points
  const calculateAngle = (a: number[], b: number[], c: number[]) => {
    const radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - 
                    Math.atan2(a[1] - b[1], a[0] - b[0]);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    
    return angle;
  };

  return {
    repCount,
    exerciseState,
    evalResult,
    evaluatePose,
  };
}