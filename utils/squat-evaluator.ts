import { PoseLandmark } from '@/types/mediapipe';
import { EvaluationResult, IssueDetection } from '@/hooks/use-pose-evaluation';

// Helper function to calculate angle between three points
function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - 
                  Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  
  return angle;
}

// Helper to calculate the angle of the back relative to vertical
function calculateBackAngle(shoulders: PoseLandmark, hips: PoseLandmark): number {
  // Calculate the angle between a vertical line and the line from hips to shoulders
  const vertical = { x: shoulders.x, y: 0, z: 0 };
  return calculateAngle(vertical, shoulders, hips);
}

export function evaluateSquat(landmarks: PoseLandmark[]): EvaluationResult {
  const issues: IssueDetection[] = [];
  
  // Check if landmarks are valid
  if (!landmarks || landmarks.length < 33) {
    return { isCorrectForm: false, issues: [] };
  }
  
  // Define key landmark indices for evaluation
  const LEFT_HIP = 23;
  const RIGHT_HIP = 24;
  const LEFT_KNEE = 25;
  const RIGHT_KNEE = 26;
  const LEFT_ANKLE = 27;
  const RIGHT_ANKLE = 28;
  const LEFT_SHOULDER = 11;
  const RIGHT_SHOULDER = 12;
  
  // Calculate key angles for squat form evaluation
  
  // 1. Knee alignment (knees should be aligned with toes, not caving in)
  const leftKneeAngle = calculateAngle(
    landmarks[LEFT_HIP], 
    landmarks[LEFT_KNEE], 
    landmarks[LEFT_ANKLE]
  );
  
  const rightKneeAngle = calculateAngle(
    landmarks[RIGHT_HIP], 
    landmarks[RIGHT_KNEE], 
    landmarks[RIGHT_ANKLE]
  );
  
  // 2. Hip depth (how deep the squat is)
  const hipY = (landmarks[LEFT_HIP].y + landmarks[RIGHT_HIP].y) / 2;
  const kneeY = (landmarks[LEFT_KNEE].y + landmarks[RIGHT_KNEE].y) / 2;
  
  // 3. Back angle (should be relatively upright)
  const shouldersCenter = {
    x: (landmarks[LEFT_SHOULDER].x + landmarks[RIGHT_SHOULDER].x) / 2,
    y: (landmarks[LEFT_SHOULDER].y + landmarks[RIGHT_SHOULDER].y) / 2,
    z: (landmarks[LEFT_SHOULDER].z + landmarks[RIGHT_SHOULDER].z) / 2
  };
  
  const hipsCenter = {
    x: (landmarks[LEFT_HIP].x + landmarks[RIGHT_HIP].x) / 2,
    y: (landmarks[LEFT_HIP].y + landmarks[RIGHT_HIP].y) / 2,
    z: (landmarks[LEFT_HIP].z + landmarks[RIGHT_HIP].z) / 2
  };
  
  const backAngle = calculateBackAngle(shouldersCenter, hipsCenter);
  
  // Evaluate squat form
  
  // 1. Check knee alignment
  if (leftKneeAngle < 150 || rightKneeAngle < 150) {
    // Hip depth check: only evaluate knees when person is actually squatting
    if (hipY > kneeY - 0.1) {
      if (leftKneeAngle < 165 || rightKneeAngle < 165) {
        issues.push({
          message: "Knees are caving inward",
          severity: "high",
          affectedJoints: [LEFT_KNEE, RIGHT_KNEE]
        });
      }
    }
  }
  
  // 2. Check hip depth (squat depth)
  if (hipY <= kneeY - 0.15) {
    // Not squatting deep enough
    issues.push({
      message: "Squat deeper - hips should go below knee level",
      severity: "medium",
      affectedJoints: [LEFT_HIP, RIGHT_HIP]
    });
  }
  
  // 3. Check back angle (should be relatively upright)
  if (backAngle > 45) {
    issues.push({
      message: "Keep your back more upright",
      severity: "high",
      affectedJoints: [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP]
    });
  }
  
  // Determine if overall form is correct
  const isCorrectForm = issues.length === 0;
  
  return {
    isCorrectForm,
    issues
  };
}