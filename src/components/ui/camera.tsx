import React, { useRef, useState, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Camera, Square, RotateCcw } from 'lucide-react';

interface CameraComponentProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  className?: string;
}

export const CameraComponent: React.FC<CameraComponentProps> = ({
  onCapture,
  onClose,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to start camera
  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      // Stop old stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      }

      setStream(newStream);
      setIsInitialized(true);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Unable to access camera. Please check permissions and HTTPS.');
    }
  };

  // Start camera on mount
  useEffect(() => {
    startCamera(facingMode);
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flip camera when facingMode changes
  useEffect(() => {
    if (isInitialized) {
      startCamera(facingMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
    // cleanup(); // This line was removed
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isInitialized) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Initializing camera...</p>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto max-h-96 object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
          <Button variant="secondary" size="sm" onClick={toggleCamera}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Flip
          </Button>

          <Button onClick={capturePhoto} size="lg" className="bg-primary hover:bg-primary-hover">
            <Square className="w-6 h-6 mr-2" />
            Capture
          </Button>

          <Button variant="outline" size="sm" onClick={cleanup}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};