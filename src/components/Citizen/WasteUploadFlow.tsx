import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CameraComponent } from '../ui/camera';
import { useWasteStore } from '../../store/useWasteStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Camera, Upload, Send, ArrowLeft } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface WasteUploadFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface WasteClassification {
  cardboard: number;
  glass: number;
  metal: number;
  paper: number;
  plastic: number;
  trash: number;
}

export const WasteUploadFlow: React.FC<WasteUploadFlowProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'select' | 'camera' | 'preview'>('select');
  const [imageData, setImageData] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [classification, setClassification] = useState<WasteClassification | null>(null);

  const { createWasteTicket } = useWasteStore();
  const { user } = useAuthStore();

  const handleCameraCapture = (data: string) => {
    setImageData(data);
    const byteString = atob(data.split(",")[1]);
    const mimeString = data.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeString });
    setImageFile(new File([blob], "camera-capture.jpg", { type: mimeString }));
    setStep('preview');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageData(e.target?.result as string);
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user || !imageFile) return;
    setUploading(true);

    try {
      let detected: WasteClassification | null = null;

      // Call classify endpoint
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("http://127.0.0.1:8000/classify-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        detected = data.classification;
        setClassification(detected);
      }

      // Create ticket in store
      await createWasteTicket(user.id, imageData, detected ? JSON.stringify(detected) : undefined);

      toast({
        title: "Waste submitted successfully!",
        description: "Your waste has been registered and classified.",
      });

      onComplete();
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (step === 'camera') return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => setStep('select')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <CameraComponent onCapture={handleCameraCapture} onClose={() => setStep('select')} />
    </div>
  );

  if (step === 'preview') return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setStep('select')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Review Your Waste Photo</CardTitle>
          <CardDescription>Make sure the image is clear and shows your waste properly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={imageData} alt="Captured waste" className="max-w-full max-h-64 object-contain rounded-lg border" />
            </div>

            {classification && (
              <div className="space-y-1 text-center font-medium text-primary">
                {Object.entries(classification).map(([cat, count]) => (
                  <div key={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}: {count}</div>
                ))}
              </div>
            )}

            <div className="flex space-x-4">
              <Button onClick={handleSubmit} disabled={uploading} className="flex-1">
                <Send className="w-4 h-4 mr-2" />{uploading ? 'Submitting...' : 'Submit Waste'}
              </Button>
              <Button variant="outline" onClick={() => setStep('select')} className="flex-1">Retake Photo</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Waste Photo</CardTitle>
        <CardDescription>Take a photo or upload an image of your waste for tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={() => setStep('camera')} className="h-32 flex-col space-y-4 bg-primary hover:bg-primary-hover">
              <Camera className="w-8 h-8" />
              <div className="text-center"><div className="font-semibold">Take Photo</div><div className="text-sm opacity-90">Use camera</div></div>
            </Button>

            <div>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center space-y-4 hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div className="text-center"><div className="font-semibold text-foreground">Upload Image</div><div className="text-sm text-muted-foreground">Select from gallery</div></div>
                </div>
              </label>
            </div>
          </div>

          <div className="text-center"><Button variant="ghost" onClick={onCancel}>Cancel</Button></div>
        </div>
      </CardContent>
    </Card>
  );
};
