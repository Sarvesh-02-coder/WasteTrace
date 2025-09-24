import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { WasteTicket } from '../../types';
import { Download, Copy, MapPin, Calendar, Package, CheckCircle } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface WasteTicketDisplayProps {
  ticket: WasteTicket;
  onClose: () => void;
}

interface WasteClassification {
  cardboard: number;
  glass: number;
  metal: number;
  paper: number;
  plastic: number;
  trash: number;
}

export const WasteTicketDisplay: React.FC<WasteTicketDisplayProps> = ({ ticket, onClose }) => {
  const [qrDownloaded, setQrDownloaded] = useState(false);

  // Parse classification
  let classification: WasteClassification | null = null;
  try { classification = ticket.classification ? JSON.parse(ticket.classification) : null; } catch { classification = null; }

  // Filter classifications > 0
  const filteredClassification = classification
    ? Object.fromEntries(Object.entries(classification).filter(([_, count]) => count > 0))
    : null;

  const isAllZero = filteredClassification && Object.keys(filteredClassification).length === 0;

  // If all classification counts are zero, show "No Waste Detected"
  if (!classification || isAllZero) {
    return (
      <Card className="border-warning bg-eco-light p-6 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-warning" />
        <h3 className="text-xl font-bold text-warning mb-2">No Waste Detected</h3>
        <p className="text-muted-foreground">
          The uploaded image did not contain any recognizable waste. Please try again with a valid waste item.
        </p>
        <Button onClick={onClose} className="mt-4">Back to Dashboard</Button>
      </Card>
    );
  }

  const handleCopyWasteId = () => {
    navigator.clipboard.writeText(ticket.wasteId);
    toast({ title: "Waste ID copied!", description: "You can use this ID to track your waste." });
  };

  const handleDownloadQR = () => {
    if (!ticket.qrCode) return;
    const link = document.createElement('a');
    link.href = ticket.qrCode;
    link.download = `waste-qr-${ticket.wasteId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setQrDownloaded(true);
    toast({ title: "QR Code downloaded!", description: "Save this QR code for easy tracking." });
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-warning text-warning-foreground',
    collected: 'bg-primary text-primary-foreground',
    recycled: 'bg-success text-success-foreground',
  };

  const statusIcons: Record<string, JSX.Element> = {
    pending: <Package className="w-4 h-4" />,
    collected: <Package className="w-4 h-4" />,
    recycled: <CheckCircle className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6">
      <Card className="border-success bg-eco-light">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
          <h3 className="text-xl font-bold text-success mb-2">Waste Successfully Submitted!</h3>
          <p className="text-muted-foreground">Your waste has been registered in the tracking system. Use the details below to monitor its journey.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Waste Ticket</span>
            <Badge className={statusColors[ticket.status]}>
              {statusIcons[ticket.status]}
              <span className="ml-1 capitalize">{ticket.status}</span>
            </Badge>
          </CardTitle>
          <CardDescription>Track your waste through the recycling process</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Waste ID</label>
              <div className="text-2xl font-mono font-bold text-primary">{ticket.wasteId}</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyWasteId}>
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
          </div>

          {ticket.qrCode && (
            <div className="text-center space-y-4">
              <label className="text-sm font-medium text-muted-foreground">QR Code</label>
              <img src={ticket.qrCode} alt="Waste QR Code" className="mx-auto border rounded-lg" style={{ width: 200, height: 200 }} />
              <Button variant="outline" onClick={handleDownloadQR} className="w-full">
                <Download className="w-4 h-4 mr-2" /> {qrDownloaded ? 'Downloaded' : 'Download QR Code'}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {classification && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filteredClassification).map(([cat, count]) => (
                    <Badge key={cat} className="bg-primary text-primary-foreground">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}: {count}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">{new Date(ticket.timestamps.created).toLocaleDateString()}</span>
              </div>

              {ticket.location && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{ticket.location.address}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Progress</label>
              {['submitted', 'collected', 'recycled'].map((stage, idx) => {
                const completed =
                  stage === 'submitted' ||
                  (stage === 'collected' && ['collected', 'recycled'].includes(ticket.status)) ||
                  (stage === 'recycled' && ticket.status === 'recycled');
                return (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${completed ? 'bg-success' : 'bg-muted'}`}></div>
                    <span className="text-sm capitalize">{stage}</span>
                    <span className="text-xs text-muted-foreground">{completed ? '✓' : 'Pending'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button onClick={onClose} className="flex-1">Back to Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
