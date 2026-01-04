import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CameraComponent } from '../ui/camera';
import { useWasteStore } from '../../store/useWasteStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationStore } from '../../store/useLocationStore';
import { Camera, Upload, Send, ArrowLeft } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface WasteUploadFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const WasteUploadFlow: React.FC<WasteUploadFlowProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'select' | 'camera' | 'preview'>('select');
  const [imageData, setImageData] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { createWasteTicket } = useWasteStore();
  const { user } = useAuthStore();
  const area = useLocationStore((state) => state.area);

  /* =========================
     📸 Camera capture
  ========================= */
  const handleCameraCapture = (data: string) => {
    setImageData(data);

    const byteString = atob(data.split(',')[1]);
    const mimeString = data.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });
    setImageFile(new File([blob], 'camera.jpg', { type: mimeString }));
    setStep('preview');
  };

  /* =========================
     📁 File upload
  ========================= */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
      setStep('preview');
    };
    reader.readAsDataURL(file);
  };

  /* =========================
     📍 Location
  ========================= */
  const getCurrentLocation = (): Promise<{ lat: number; lng: number; address: string }> =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: area || 'Unknown location',
          }),
        reject
      );
    });

  /* =========================
     🚀 Submit
  ========================= */
  const handleSubmit = async () => {
    if (!user || !imageFile) return;

    setUploading(true);

    try {
      // 1️⃣ Classify image
      const formData = new FormData();
      formData.append('file', imageFile);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/classify-image`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Classification failed');

      const result = await res.json();

      if (!result.detected) {
        toast({
          title: 'No waste detected',
          description: 'Please upload a clearer image with visible waste.',
          variant: 'destructive',
        });
        return;
      }

      // 2️⃣ Create ticket (IMPORTANT FIX)
      const location = await getCurrentLocation();

      await createWasteTicket(
        user.id,
        imageData,
        JSON.stringify(result.counts), // ✅ STORE COUNTS JSON
        location
      );

      toast({
        title: 'Waste submitted successfully',
        description: `Detected: ${result.category}`,
      });

      onComplete(); // ✅ shows WasteTicketDisplay
    } catch (err) {
      console.error(err);
      toast({
        title: 'Submission failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  /* =========================
     🎥 Camera
  ========================= */
  if (step === 'camera') {
    return (
      <>
        <Button variant="ghost" onClick={() => setStep('select')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <CameraComponent onCapture={handleCameraCapture} onClose={() => setStep('select')} />
      </>
    );
  }

  /* =========================
     🖼 Preview
  ========================= */
  if (step === 'preview') {
    return (
      <>
        <Button variant="ghost" onClick={() => setStep('select')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Review Your Waste Photo</CardTitle>
            <CardDescription>Ensure the waste is clearly visible</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <img src={imageData} alt="Waste" className="mx-auto max-h-64 rounded border" />

            <div className="flex space-x-4">
              <Button onClick={handleSubmit} disabled={uploading} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                {uploading ? 'Submitting...' : 'Submit Waste'}
              </Button>
              <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                Retake
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  /* =========================
     📤 Select
  ========================= */
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Waste Photo</CardTitle>
        <CardDescription>Take a photo or upload an image</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button onClick={() => setStep('camera')} className="h-32 flex-col space-y-2">
          <Camera className="w-8 h-8" />
          <span>Take Photo</span>
        </Button>

        <label className="h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer">
          <Upload className="w-8 h-8" />
          <span>Upload Image</span>
          <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
        </label>

        <div className="text-center">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};
