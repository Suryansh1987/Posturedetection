'use client';

import { cn } from '@/lib/utils';
import { ExerciseType } from '@/components/ExerciseApp';
import { Icons } from '@/components/Icons';

interface ExerciseCounterProps {
  repCount: number;
  exerciseState: 'up' | 'down' | 'hold' | 'initial';
  exerciseType: ExerciseType;
}

export function ExerciseCounter({ 
  repCount, 
  exerciseState,
  exerciseType 
}: ExerciseCounterProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl font-bold mb-2">{repCount}</div>
      <div className="text-sm text-muted-foreground mb-4">Reps Completed</div>
      
      <div className="relative w-full h-8 flex items-center justify-center mb-2">
        {exerciseType === 'squat' ? (
          <>
            <div className={cn(
              "absolute top-0 transition-all duration-300 transform",
              exerciseState === 'down' ? "translate-y-2 scale-110" : "translate-y-0"
            )}>
              <Icons.chevronDown className={cn(
                "h-6 w-6 transition-colors",
                exerciseState === 'down' ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className={cn(
              "absolute bottom-0 transition-all duration-300 transform",
              exerciseState === 'up' ? "-translate-y-2 scale-110" : "translate-y-0"
            )}>
              <Icons.chevronUp className={cn(
                "h-6 w-6 transition-colors",
                exerciseState === 'up' ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
          </>
        ) : (
          <>
            <div className={cn(
              "absolute top-0 transition-all duration-300 transform",
              exerciseState === 'down' ? "translate-y-2 scale-110" : "translate-y-0"
            )}>
              <Icons.arrowDown className={cn(
                "h-6 w-6 transition-colors",
                exerciseState === 'down' ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className={cn(
              "absolute bottom-0 transition-all duration-300 transform",
              exerciseState === 'up' ? "-translate-y-2 scale-110" : "translate-y-0"
            )}>
              <Icons.arrowUp className={cn(
                "h-6 w-6 transition-colors",
                exerciseState === 'up' ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
          </>
        )}
      </div>
      
      <div className="text-sm text-center">
        {exerciseState === 'initial' && "Get ready to start"}
        {exerciseState === 'up' && (exerciseType === 'squat' ? "Standing position" : "Up position")}
        {exerciseState === 'down' && (exerciseType === 'squat' ? "Squat position" : "Down position")}
        {exerciseState === 'hold' && "Hold this position"}
      </div>
    </div>
  );
}