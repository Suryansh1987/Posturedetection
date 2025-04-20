'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { ExerciseEvaluator } from '@/components/ExerciseEvaluator';
import { Icons } from '@/components/Icons';

export type ExerciseType = 'squat' | 'pushup' | null;

export function ExerciseApp() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>(null);
  const [isStarted, setIsStarted] = useState(false);

  const handleExerciseSelect = (exercise: ExerciseType) => {
    setSelectedExercise(exercise);
  };

  const handleStartExercise = () => {
    setIsStarted(true);
  };

  const handleStopExercise = () => {
    setIsStarted(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">RealFy Fitness Evaluator</h1>
          </div>
          {isStarted && (
            <Button 
              variant="destructive" 
              onClick={handleStopExercise}
              className="transition-all"
            >
              <Icons.stop className="mr-2 h-4 w-4" />
              Stop Exercise
            </Button>
          )}
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        {!isStarted ? (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Choose an exercise</h2>
                    <p className="text-muted-foreground">
                      Select an exercise to get real-time AI feedback on your form
                    </p>
                  </div>
                  
                  <ExerciseSelector 
                    selectedExercise={selectedExercise} 
                    onSelectExercise={handleExerciseSelect} 
                  />
                  
                  <div className="flex justify-center">
                    <Button 
                      size="lg" 
                      disabled={!selectedExercise} 
                      onClick={handleStartExercise}
                      className="transition-all"
                    >
                      <Icons.play className="mr-2 h-4 w-4" />
                      Start Exercise
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <ExerciseEvaluator 
            exerciseType={selectedExercise as ExerciseType}
            onStopExercise={handleStopExercise}
          />
        )}
      </main>
      
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RealFy Fitness. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}