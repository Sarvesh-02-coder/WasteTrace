import React, { useRef, useEffect, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Card } from './card';
import { Button } from './button';
import { Input } from './input';
import { QrCode, Keyboard } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  className?: string;
}

export const QRScannerComponent: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [wasteId, setWasteId] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initScanner = async () => {
      if (!videoRef.current) return;

      try {
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            onScan(result.data);
            cleanup();
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment'
          }
        );

        await qrScanner.start();
        setScanner(qrScanner);
      } catch (err) {
        console.error('QR Scanner error:', err);
        setError('Unable to access camera. Please enter Waste ID manually.');
        setManualEntry(true);
      }
    };

    if (!manualEntry) {
      initScanner();
    }

    return () => {
      cleanup();
    };
  }, [manualEntry, onScan]);

  const cleanup = () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
    }
    onClose();
  };

  const handleManualSubmit = () => {
    if (wasteId.trim()) {
      onScan(wasteId.trim().toUpperCase());
      cleanup();
    }
  };

  if (manualEntry) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center mb-4">
          <Keyboard className="w-12 h-12 mx-auto mb-2 text-primary" />
          <h3 className="text-lg font-semibold">Enter Waste ID</h3>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
        
        <div className="space-y-4">
          <Input
            placeholder="Enter Waste ID (e.g., WT7X9M2)"
            value={wasteId}
            onChange={(e) => setWasteId(e.target.value.toUpperCase())}
            className="text-center text-lg font-mono"
          />
          
          <div className="flex space-x-2">
            <Button onClick={handleManualSubmit} className="flex-1">
              Submit
            </Button>
            <Button variant="outline" onClick={cleanup}>
              Cancel
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => setManualEntry(false)}
            className="w-full"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Try QR Scanner
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-auto max-h-96 object-cover"
        />
        
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black/70 text-white p-3 rounded-lg text-center">
            <QrCode className="w-6 h-6 mx-auto mb-1" />
            <p className="text-sm">Point camera at QR code</p>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
          <Button 
            variant="secondary" 
            onClick={() => setManualEntry(true)}
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Manual Entry
          </Button>
          
          <Button variant="outline" onClick={cleanup}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};