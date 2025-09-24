import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { WasteTicket } from '../../types';
import { Download, Copy, QrCode, MapPin, Calendar, Package, CheckCircle } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface WasteTicketDisplayProps {
  ticket: WasteTicket;
  onClose: () => void;
}

export const WasteTicketDisplay: React.FC<WasteTicketDisplayProps> = ({
  ticket,
  onClose
}) => {
  const [qrDownloaded, setQrDownloaded] = useState(false);

  const handleCopyWasteId = () => {
    navigator.clipboard.writeText(ticket.wasteId);
    toast({
      title: "Waste ID copied!",
      description: "You can use this ID to track your waste.",
    });
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
    toast({
      title: "QR Code downloaded!",
      description: "Save this QR code for easy tracking.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'collected': return 'bg-primary text-primary-foreground';
      case 'recycled': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package className="w-4 h-4" />;
      case 'collected': return <Package className="w-4 h-4" />;
      case 'recycled': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="border-success bg-eco-light">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
          <h3 className="text-xl font-bold text-success mb-2">Waste Successfully Submitted!</h3>
          <p className="text-muted-foreground">
            Your waste has been registered in the tracking system. Use the details below to monitor its journey.
          </p>
        </CardContent>
      </Card>

      {/* Waste Ticket Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Waste Ticket</span>
            <Badge className={getStatusColor(ticket.status)}>
              {getStatusIcon(ticket.status)}
              <span className="ml-1 capitalize">{ticket.status}</span>
            </Badge>
          </CardTitle>
          <CardDescription>
            Track your waste through the recycling process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Waste ID Section */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Waste ID</label>
                <div className="text-2xl font-mono font-bold text-primary">
                  {ticket.wasteId}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyWasteId}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          {ticket.qrCode && (
            <div className="text-center space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">QR Code</label>
                <div className="mt-2">
                  <img
                    src={ticket.qrCode}
                    alt="Waste QR Code"
                    className="mx-auto border rounded-lg"
                    style={{ width: 200, height: 200 }}
                  />
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={handleDownloadQR}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {qrDownloaded ? 'Downloaded' : 'Download QR Code'}
              </Button>
            </div>
          )}

          {/* Ticket Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Classification:</span>
                <span className="font-medium">{ticket.classification}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">
                  {new Date(ticket.timestamps.created).toLocaleDateString()}
                </span>
              </div>
              
              {ticket.location && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{ticket.location.address}</span>
                </div>
              )}
            </div>

            {/* Progress Timeline */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Progress</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Submitted</span>
                  <span className="text-xs text-muted-foreground">✓</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    ['collected', 'recycled'].includes(ticket.status) ? 'bg-success' : 'bg-muted'
                  }`}></div>
                  <span className="text-sm">Collected</span>
                  {ticket.status === 'collected' || ticket.status === 'recycled' ? (
                    <span className="text-xs text-muted-foreground">✓</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    ticket.status === 'recycled' ? 'bg-success' : 'bg-muted'
                  }`}></div>
                  <span className="text-sm">Recycled</span>
                  {ticket.status === 'recycled' ? (
                    <span className="text-xs text-muted-foreground">✓</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button onClick={onClose} className="flex-1">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};