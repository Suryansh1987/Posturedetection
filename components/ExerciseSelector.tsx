'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/Icons';
import { cn } from '@/lib/utils';
import { ExerciseType } from '@/components/ExerciseApp';
import Image from 'next/image';

interface ExerciseSelectorProps {
  selectedExercise: ExerciseType;
  onSelectExercise: (exercise: ExerciseType) => void;
}

const exercises = [
  {
    id: 'squat',
    name: 'Squats',
    description: 'Evaluates squat form including knee alignment and back posture',
    icon: <Icons.chevronDown className="h-10 w-10" />,
    image: 'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 'pushup',
    name: 'Push-Ups',
    description: 'Evaluates push-up form including elbow bend and back alignment',
    icon: <Icons.moveDown className="h-10 w-10" />,
    image: 'https://images.pexels.com/photos/4162488/pexels-photo-4162488.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
];

export function ExerciseSelector({ selectedExercise, onSelectExercise }: ExerciseSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {exercises.map((exercise) => (
        <Card
          key={exercise.id}
          className={cn(
            "cursor-pointer transition-all hover:border-primary",
            selectedExercise === exercise.id && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => onSelectExercise(exercise.id as ExerciseType)}
        >
          <CardContent className="p-4 flex flex-col items-center">
            <div className="relative h-32 w-full rounded-md overflow-hidden mb-4">
              <Image
                src={exercise.image}
                alt={exercise.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              {exercise.icon}
            </div>
            <h3 className="text-lg font-bold">{exercise.name}</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">{exercise.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}