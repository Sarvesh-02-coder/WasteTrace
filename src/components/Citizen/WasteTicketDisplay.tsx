import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { WasteTicket } from '../../types';
import { Download, Copy, MapPin, Calendar, Package, CheckCircle } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface WasteClassification {
  cardboard: number;
  glass: number;
  metal: number;
  paper: number;
  plastic: number;
  trash: number;
}

interface WasteTicketDisplayProps {
  ticket: WasteTicket;
  onClose: () => void;
}

export const WasteTicketDisplay: React.FC<WasteTicketDisplayProps> = ({ ticket, onClose }) => {
  const [qrDownloaded, setQrDownloaded] = useState(false);

  /* =========================
     🧠 SAFE DATE HANDLING
  ========================= */
  const createdDate =
    ticket.timestamps?.created ||
    (ticket as any).created_at ||
    (ticket as any).createdAt ||
    new Date().toISOString();

  /* =========================
     📦 Parse classification
  ========================= */
  let classification: WasteClassification | null = null;
  try {
    classification = ticket.classification
      ? JSON.parse(ticket.classification)
      : null;
  } catch {
    classification = null;
  }

  const filteredClassification = classification
    ? Object.fromEntries(
        Object.entries(classification).filter(([_, count]) => count > 0)
      )
    : null;

  const noWasteDetected =
    !filteredClassification ||
    Object.keys(filteredClassification).length === 0;

  /* =========================
     🚫 No waste UI
  ========================= */
  if (noWasteDetected) {
    return (
      <Card className="border-warning bg-eco-light p-6 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-warning" />
        <h3 className="text-xl font-bold text-warning mb-2">
          No Waste Detected
        </h3>
        <p className="text-muted-foreground">
          The uploaded image did not contain recognizable waste.
        </p>
        <Button onClick={onClose} className="mt-4">
          Back to Dashboard
        </Button>
      </Card>
    );
  }

  /* =========================
     📋 Actions
  ========================= */
  const handleCopyWasteId = () => {
    navigator.clipboard.writeText(ticket.wasteId);
    toast({
      title: 'Waste ID copied',
      description: 'Use this ID to track your waste',
    });
  };

  const handleDownloadQR = () => {
    if (!ticket.qrCode) return;
    const link = document.createElement('a');
    link.href = ticket.qrCode;
    link.download = `waste-${ticket.wasteId}.png`;
    link.click();
    setQrDownloaded(true);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-warning text-warning-foreground',
    collected: 'bg-primary text-primary-foreground',
    recycled: 'bg-success text-success-foreground',
  };

  /* =========================
     ✅ MAIN UI
  ========================= */
  return (
    <div className="space-y-6">
      <Card className="border-success bg-eco-light">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
          <h3 className="text-xl font-bold text-success mb-2">
            Waste Successfully Submitted!
          </h3>
          <p className="text-muted-foreground">
            Your waste has been registered successfully.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Waste Ticket
            <Badge className={statusColors[ticket.status]}>
              {ticket.status}
            </Badge>
          </CardTitle>
          <CardDescription>Track your waste lifecycle</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground">Waste ID</div>
              <div className="text-2xl font-mono font-bold text-primary">
                {ticket.wasteId}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyWasteId}>
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
          </div>

          {ticket.qrCode && (
            <div className="text-center space-y-2">
              <img
                src={ticket.qrCode}
                alt="QR Code"
                className="mx-auto w-40 h-40 border rounded"
              />
              <Button variant="outline" onClick={handleDownloadQR}>
                <Download className="w-4 h-4 mr-2" />
                {qrDownloaded ? 'Downloaded' : 'Download QR'}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {Object.entries(filteredClassification!).map(([cat, count]) => (
              <Badge key={cat} className="bg-primary text-primary-foreground">
                {cat}: {count}
              </Badge>
            ))}
          </div>

          <div className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              Submitted:{' '}
              {new Date(createdDate).toLocaleDateString()}
            </span>
          </div>

          {ticket.location && (
            <div className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{ticket.location.address}</span>
            </div>
          )}

          <Button onClick={onClose} className="w-full">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
