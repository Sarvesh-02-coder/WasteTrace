import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { WasteTicket } from '../../types';
import { Package, MapPin, Calendar, Camera, X } from 'lucide-react';

interface WasteDetailsCardProps {
  ticket: WasteTicket;
  onCollect: () => void;
  onClose: () => void;
}

export const WasteDetailsCard: React.FC<WasteDetailsCardProps> = ({
  ticket,
  onCollect,
  onClose
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'collected': return 'bg-primary text-primary-foreground';
      case 'recycled': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-primary shadow-eco">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Waste Details</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Review waste item details and take collection action
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Waste ID and Status */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Waste ID</label>
            <div className="text-2xl font-mono font-bold text-primary">
              {ticket.wasteId}
            </div>
          </div>
          <Badge className={getStatusColor(ticket.status)}>
            {ticket.status.toUpperCase()}
          </Badge>
        </div>

        {/* Waste Image */}
        {ticket.imageUrl && (
          <div className="text-center">
            <label className="text-sm font-medium text-muted-foreground">Waste Photo</label>
            <div className="mt-2">
              <img
                src={ticket.imageUrl}
                alt="Waste item"
                className="mx-auto max-w-full h-48 object-cover rounded-lg border"
              />
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Classification</label>
              <div className="font-medium">{ticket.classification}</div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Submitted</label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(ticket.timestamps.created).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {ticket.location && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.location.address}</span>
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Citizen ID</label>
              <div className="font-mono text-sm">{ticket.citizenId}</div>
            </div>
          </div>
        </div>

        {/* Collection Status */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Collection Status</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm">Waste submitted by citizen</span>
              <span className="text-xs text-success">✓</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                ['collected', 'recycled'].includes(ticket.status) ? 'bg-success' : 'bg-warning animate-pulse'
              }`}></div>
              <span className="text-sm">Collection by waste collector</span>
              {['collected', 'recycled'].includes(ticket.status) ? (
                <span className="text-xs text-success">✓</span>
              ) : (
                <span className="text-xs text-warning">Pending</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                ticket.status === 'recycled' ? 'bg-success' : 'bg-muted'
              }`}></div>
              <span className="text-sm">Processing and recycling</span>
              {ticket.status === 'recycled' ? (
                <span className="text-xs text-success">✓</span>
              ) : (
                <span className="text-xs text-muted-foreground">Pending</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          {ticket.status === 'pending' && (
            <Button onClick={onCollect} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Collect Waste
            </Button>
          )}
          
          {ticket.status === 'collected' && (
            <div className="flex-1 p-3 bg-eco-light rounded-lg text-center">
              <div className="text-sm font-medium text-success">Collected</div>
              <div className="text-xs text-muted-foreground">
                Collected on {ticket.timestamps.collected && new Date(ticket.timestamps.collected).toLocaleDateString()}
              </div>
            </div>
          )}
          
          {ticket.status === 'recycled' && (
            <div className="flex-1 p-3 bg-success/10 rounded-lg text-center">
              <div className="text-sm font-medium text-success">Recycled</div>
              <div className="text-xs text-muted-foreground">
                Process completed
              </div>
            </div>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};