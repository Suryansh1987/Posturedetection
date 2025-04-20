# RealFy Fitness Evaluator

A real-time AI-based exercise evaluation web application built with Next.js, MediaPipe, and Three.js.

## Features

- Real-time pose detection and evaluation using MediaPipe Pose Landmarker
- Visual feedback with Three.js 3D annotations
- Form analysis for squats and push-ups
- Rep counting with exercise state detection
- Mobile-responsive design

## Tech Stack

- **Next.js 14** with App Router for the framework
- **MediaPipe Pose Landmarker** for AI-powered pose detection
- **Three.js** for 3D annotations and visualization
- **Tailwind CSS** with shadcn/ui components for UI
- **TypeScript** for type safety

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

## Deployment

This project is configured for easy deployment on Vercel. Simply push to your repository and import the project in Vercel.

## How It Works

1. The application captures video from your device camera
2. MediaPipe Pose Landmarker detects key body points in real-time
3. Custom evaluation algorithms analyze the pose data for each exercise
4. Three.js overlays visual feedback on the detected pose
5. The UI updates with exercise rep counting and form feedback

## Browser Compatibility

For best results, use the application in:
- Chrome (desktop and mobile)
- Edge
- Safari (iOS 14.5+ and macOS)
- Firefox (may have reduced performance)

## Privacy Notice

This application processes all video data locally on your device. No video or image data is sent to any server.

## License

MIT