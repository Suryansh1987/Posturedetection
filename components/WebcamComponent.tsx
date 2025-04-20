'use client';

import { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/Icons';
import { cn } from '@/lib/utils';

interface WebcamComponentProps {
  onWebcamReady: (videoElement: HTMLVideoElement) => void;
  children?: React.ReactNode;
  className?: string;
}

export function WebcamComponent({ onWebcamReady, children, className }: WebcamComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function setupCamera() {
      try {
        setIsLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              onWebcamReady(videoRef.current);
              setIsLoading(false);
            }
          };
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('Unable to access webcam. Please ensure you have given permission and that your camera is working.');
        setIsLoading(false);
      }
    }

    setupCamera();

    return () => {
      
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [onWebcamReady]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
  
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
 
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
    }).then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            onWebcamReady(videoRef.current);
            setIsLoading(false);
          }
        };
      }
    }).catch(err => {
      console.error('Error accessing webcam on retry:', err);
      setError('Unable to access webcam. Please ensure you have given permission and that your camera is working.');
      setIsLoading(false);
    });
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading camera...</span>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-10 p-4">
          <Icons.warning className="h-10 w-10 text-destructive mb-2" />
          <p className="text-center mb-4">{error}</p>
          <Button onClick={handleRetry}>
            <Icons.refresh className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}
      
      <div className="relative">
        <video 
          ref={videoRef} 
          className="w-full h-auto" 
          playsInline
        />
        {children}
      </div>
    </Card>
  );
}