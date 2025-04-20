'use client';

import { useState, useEffect, useRef } from 'react';
import { WebcamComponent } from '@/components/WebcamComponent';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { usePoseDetection } from '@/hooks/use-pose-detection';
import { ThreeJsOverlay } from '@/components/ThreeJsOverlay';
import { usePoseEvaluation } from '@/hooks/use-pose-evaluation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/Icons';
import { ExerciseType } from '@/components/ExerciseApp';
import { ExerciseCounter } from '@/components/ExerciseCounter';

interface ExerciseEvaluatorProps {
  exerciseType: ExerciseType;
  onStopExercise: () => void;
}

export function ExerciseEvaluator({ exerciseType, onStopExercise }: ExerciseEvaluatorProps) {
  const { toast } = useToast();
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    landmarks, 
    isDetecting, 
    startDetection, 
    stopDetection 
  } = usePoseDetection();

  const {
    evalResult,
    repCount,
    exerciseState,
    evaluatePose,
  } = usePoseEvaluation(exerciseType);

  // Handle webcam ready
  const handleWebcamReady = (video: HTMLVideoElement) => {
    setVideoElement(video);
    
  
    if (canvasRef.current && containerRef.current) {
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
    }
  };


  useEffect(() => {
    if (videoElement && !isDetecting) {
      startDetection(videoElement)
        .then(() => {
          setIsModelLoading(false);
          toast({
            title: "Model loaded successfully",
            description: `Ready to evaluate your ${exerciseType === 'squat' ? 'squats' : 'push-ups'}!`,
          });
        })
        .catch(err => {
          console.error("Error starting detection:", err);
          setError("Failed to load pose detection model. Please refresh and try again.");
          setIsModelLoading(false);
        });
    }

    return () => {
      if (isDetecting) {
        stopDetection();
      }
    };
  }, [videoElement, isDetecting, startDetection, stopDetection, toast, exerciseType]);


  useEffect(() => {
    if (landmarks && landmarks.length > 0) {
      console.log('🔥 Detected landmarks:', landmarks);
      evaluatePose(landmarks);
    }
    if (landmarks && landmarks.length > 0 && canvasRef.current && videoElement) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      
      ctx.fillStyle = "lime";
      for (const point of landmarks) {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
  
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
  
   
      evaluatePose(landmarks);
    }
  }, [landmarks, evaluatePose, videoElement]);
  


  useEffect(() => {
    return () => {
      if (isDetecting) {
        stopDetection();
      }
    };
  }, [isDetecting, stopDetection]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div ref={containerRef} className="flex-1 relative">
        <WebcamComponent 
          onWebcamReady={handleWebcamReady}
          className="w-full h-auto"
        >
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full"
          />
          {landmarks && landmarks.length > 0 && videoElement && (
            <ThreeJsOverlay
              landmarks={landmarks}
              videoElement={videoElement}
              canvasElement={canvasRef.current}
              evalResult={evalResult}
            />
          )}
          {isModelLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 z-10">
              <Icons.spinner className="h-10 w-10 animate-spin text-primary mb-4" />
              <p>Loading AI model...</p>
              <Progress value={45} className="w-1/2 mt-4" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 z-10 p-4">
              <Icons.warning className="h-10 w-10 text-destructive mb-2" />
              <p className="text-center mb-4">{error}</p>
              <Button onClick={onStopExercise}>Go Back</Button>
            </div>
          )}
        </WebcamComponent>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Icons.dumbbell className="mr-2 h-5 w-5" />
              {exerciseType === 'squat' ? 'Squat' : 'Push-Up'} Evaluation
            </h2>
            
            <ExerciseCounter 
              repCount={repCount} 
              exerciseState={exerciseState}
              exerciseType={exerciseType}
            />

            <div className="space-y-3 mt-6">
              <h3 className="font-medium">Form Feedback:</h3>
              <ul className="space-y-2">
                {evalResult.issues.map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <Icons.warning className={cn(
                      "h-5 w-5 mr-2 flex-shrink-0 mt-0.5",
                      issue.severity === 'high' ? "text-destructive" : "text-yellow-500"
                    )} />
                    <span>{issue.message}</span>
                  </li>
                ))}
                
                {evalResult.issues.length === 0 && (
                  <li className="flex items-center">
                    <Icons.success className="h-5 w-5 mr-2 text-green-500" />
                    <span>Great form! Keep it up!</span>
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Exercise Tips:</h3>
            <ul className="space-y-2 text-sm">
              {exerciseType === 'squat' ? (
                <>
                  <li className="flex items-start">
                    <Icons.info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
                    <span>Keep your knees aligned with your toes</span>
                  </li>
                  <li className="flex items-start">
                    <Icons.info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
                    <span>Maintain a straight back throughout the movement</span>
                  </li>
                  <li className="flex items-start">
                    <Icons.info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
                    <span>Descend until your thighs are parallel to the ground</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start">
                    <Icons.info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
                    <span>Keep your body in a straight line from head to heels</span>
                  </li>
                  <li className="flex items-start">
                    <Icons.info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
                    <span>Lower your chest close to the ground</span>
                  </li>
                  <li className="flex items-start">
                    <Icons.info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
                    <span>Avoid letting your hips sag or pike up</span>
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>

        <Button onClick={onStopExercise} variant="outline" className="w-full">
          <Icons.stop className="mr-2 h-4 w-4" />
          End Session
        </Button>
      </div>
    </div>
  );
}