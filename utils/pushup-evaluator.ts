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

// Helper to check body straightness
function bodyLineDeviation(landmarks: PoseLandmark[]): number {
  // Calculate deviation from straight line from ankles through hips to shoulders
  const ankle = {
    x: (landmarks[27].x + landmarks[28].x) / 2,
    y: (landmarks[27].y + landmarks[28].y) / 2,
    z: (landmarks[27].z + landmarks[28].z) / 2
  };
  
  const hip = {
    x: (landmarks[23].x + landmarks[24].x) / 2,
    y: (landmarks[23].y + landmarks[24].y) / 2,
    z: (landmarks[23].z + landmarks[24].z) / 2
  };
  
  const shoulder = {
    x: (landmarks[11].x + landmarks[12].x) / 2,
    y: (landmarks[11].y + landmarks[12].y) / 2,
    z: (landmarks[11].z + landmarks[12].z) / 2
  };
  
  // Calculate the angle at the hips - should be close to 180 for a straight body
  return calculateAngle(ankle, hip, shoulder);
}

export function evaluatePushup(landmarks: PoseLandmark[]): EvaluationResult {
  const issues: IssueDetection[] = [];
  
  // Check if landmarks are valid
  if (!landmarks || landmarks.length < 33) {
    return { isCorrectForm: false, issues: [] };
  }
  
  // Define key landmark indices for evaluation
  const LEFT_SHOULDER = 11;
  const RIGHT_SHOULDER = 12;
  const LEFT_ELBOW = 13;
  const RIGHT_ELBOW = 14;
  const LEFT_WRIST = 15;
  const RIGHT_WRIST = 16;
  const LEFT_HIP = 23;
  const RIGHT_HIP = 24;
  const LEFT_KNEE = 25;
  const RIGHT_KNEE = 26;
  const LEFT_ANKLE = 27;
  const RIGHT_ANKLE = 28;
  
  // Calculate key angles for push-up form evaluation
  
  // 1. Elbow bend (to check depth of push-up)
  const leftElbowAngle = calculateAngle(
    landmarks[LEFT_SHOULDER],
    landmarks[LEFT_ELBOW],
    landmarks[LEFT_WRIST]
  );
  
  const rightElbowAngle = calculateAngle(
    landmarks[RIGHT_SHOULDER],
    landmarks[RIGHT_ELBOW],
    landmarks[RIGHT_WRIST]
  );
  
  // 2. Body line straightness (back shouldn't sag or pike)
  const bodyAngle = bodyLineDeviation(landmarks);
  
  // 3. Check chest to ground proximity
  const shoulderHeight = (landmarks[LEFT_SHOULDER].y + landmarks[RIGHT_SHOULDER].y) / 2;
  const wristHeight = (landmarks[LEFT_WRIST].y + landmarks[RIGHT_WRIST].y) / 2;
  
  // Evaluate push-up form
  
  // 1. Check elbow bend (push-up depth)
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
  
  if (avgElbowAngle < 90) {
    // Elbows are bent enough, this is good
  } else if (avgElbowAngle > 110) {
    // Not going deep enough
    issues.push({
      message: "Bend elbows more - go deeper",
      severity: "high",
      affectedJoints: [LEFT_ELBOW, RIGHT_ELBOW]
    });
  }
  
  // 2. Check body line (back should be straight)
  if (bodyAngle < 160) {
    // Body is not straight - likely sagging
    issues.push({
      message: "Keep your body in a straight line - your hips are sagging",
      severity: "high",
      affectedJoints: [LEFT_HIP, RIGHT_HIP]
    });
  } else if (bodyAngle > 195) {
    // Body is not straight - likely piking
    issues.push({
      message: "Keep your body in a straight line - your hips are too high",
      severity: "high",
      affectedJoints: [LEFT_HIP, RIGHT_HIP]
    });
  }
  
  // 3. Check chest to ground proximity (only when elbows are bent)
  if (avgElbowAngle < 120 && shoulderHeight - wristHeight > 0.15) {
    issues.push({
      message: "Lower your chest closer to the ground",
      severity: "medium",
      affectedJoints: [LEFT_SHOULDER, RIGHT_SHOULDER]
    });
  }
  
  // Additional check: ensure hands are approximately shoulder-width apart
  const shoulderDistance = Math.abs(landmarks[LEFT_SHOULDER].x - landmarks[RIGHT_SHOULDER].x);
  const handDistance = Math.abs(landmarks[LEFT_WRIST].x - landmarks[RIGHT_WRIST].x);
  
  if (handDistance < shoulderDistance * 0.7 || handDistance > shoulderDistance * 1.5) {
    issues.push({
      message: "Position hands approximately shoulder-width apart",
      severity: "medium",
      affectedJoints: [LEFT_WRIST, RIGHT_WRIST]
    });
  }
  
  // Determine if overall form is correct
  const isCorrectForm = issues.length === 0;
  
  return {
    isCorrectForm,
    issues
  };
}