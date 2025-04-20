'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PoseLandmark } from '@/types/mediapipe';
import { EvaluationResult } from '@/hooks/use-pose-evaluation';

interface ThreeJsOverlayProps {
  landmarks: PoseLandmark[];
  videoElement: HTMLVideoElement;
  canvasElement: HTMLCanvasElement | null;
  evalResult: EvaluationResult;
}

export function ThreeJsOverlay({ 
  landmarks, 
  videoElement, 
  canvasElement,
  evalResult 
}: ThreeJsOverlayProps) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  const annotationsRef = useRef<THREE.Group>(new THREE.Group());

  useEffect(() => {
    if (!canvasElement) return;

    
    const scene = new THREE.Scene();
    sceneRef.current = scene;

 
    const camera = new THREE.PerspectiveCamera(
      75, 
      videoElement.videoWidth / videoElement.videoHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasElement,
      alpha: true,
    });
    renderer.setSize(videoElement.videoWidth, videoElement.videoHeight);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    
    scene.add(annotationsRef.current);

   
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      rendererRef.current?.dispose();
      
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          }
        }
      });
    };
  }, [canvasElement, videoElement]);

  
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !landmarks) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const annotationsGroup = annotationsRef.current;

   
    while (annotationsGroup.children.length > 0) {
      const child = annotationsGroup.children[0];
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
      annotationsGroup.remove(child);
    }

   
    const convertCoordinates = (landmark: PoseLandmark) => {
     
      const x = (landmark.x * 2) - 1;
      const y = -((landmark.y * 2) - 1);
      const z = landmark.z * 2;
      return new THREE.Vector3(x, y, z);
    };


    const defaultMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const errorMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
   
    landmarks.forEach((landmark, index) => {
      const position = convertCoordinates(landmark);
      const geometry = new THREE.SphereGeometry(0.02, 16, 16);
      
   
      const hasIssue = evalResult.issues.some(issue => 
        issue.affectedJoints.includes(index)
      );
      
      const material = hasIssue ? errorMaterial : defaultMaterial;
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(position);
      annotationsGroup.add(sphere);
    });

  
    const connections = [

      [11, 12], [12, 24], [24, 23], [23, 11],
   
      [11, 13], [13, 15],
   
      [12, 14], [14, 16],

      [23, 25], [25, 27], [27, 31],
 
      [24, 26], [26, 28], [28, 32],
    ];

    connections.forEach(([i, j]) => {
      if (landmarks[i] && landmarks[j]) {
        const start = convertCoordinates(landmarks[i]);
        const end = convertCoordinates(landmarks[j]);
        
     
        const hasIssue = evalResult.issues.some(issue => 
          issue.affectedJoints.includes(i) || issue.affectedJoints.includes(j)
        );
        
        const material = hasIssue ? 
          new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 }) : 
          new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
          
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const line = new THREE.Line(geometry, material);
        annotationsGroup.add(line);
      }
    });

    
    evalResult.issues.forEach(issue => {
      if (issue.affectedJoints.length > 0) {
      
        const jointIndex = issue.affectedJoints[0];
        if (landmarks[jointIndex]) {
          const position = convertCoordinates(landmarks[jointIndex]);
    
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            canvas.width = 256;
            canvas.height = 128;
            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.font = '24px Arial';
            context.fillStyle = issue.severity === 'high' ? 'red' : 'yellow';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
        
            const maxWidth = 240;
            const words = issue.message.split(' ');
            let line = '';
            let y = 64;
            let lineHeight = 28;
            
            for (let i = 0; i < words.length; i++) {
              const testLine = line + words[i] + ' ';
              const metrics = context.measureText(testLine);
              const testWidth = metrics.width;
              
              if (testWidth > maxWidth && i > 0) {
                context.fillText(line, canvas.width / 2, y);
                line = words[i] + ' ';
                y += lineHeight;
              } else {
                line = testLine;
              }
            }
            context.fillText(line, canvas.width / 2, y);
            
       
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            
          
            sprite.position.copy(position);
            sprite.position.y += 0.2; 
            sprite.scale.set(0.5, 0.25, 1);
            
            annotationsGroup.add(sprite);
          }
        }
      }
    });

  
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    
    animate();

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [landmarks, evalResult]);

  return null; 
}