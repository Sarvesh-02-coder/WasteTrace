import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useWasteStore } from '../../store/useWasteStore';
import { History, Package, Calendar, MapPin, Award } from 'lucide-react';

export const WasteHistory: React.FC = () => {
  const tickets = useWasteStore((state) => state.tickets); // 👈 subscribe to store

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'collected':
        return 'bg-primary text-primary-foreground';
      case 'recycled':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const sortedTickets = [...tickets].sort(
    (a, b) => new Date(b.timestamps.created).getTime() - new Date(a.timestamps.created).getTime()
  );

  const formatClassification = (classification: string | undefined) => {
    if (!classification) return 'NA';
    let parsed: Record<string, number>;
    try {
      parsed = JSON.parse(classification);
    } catch {
      return 'NA';
    }
    const filtered = Object.entries(parsed).filter(([_, count]) => count > 0);
    if (filtered.length === 0) return 'NA';
    return filtered.map(([cat, count]) => `${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${count}`).join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="w-5 h-5" />
          <span>Waste History</span>
        </CardTitle>
        <CardDescription>Track all your submitted waste items and their current status</CardDescription>
      </CardHeader>

      <CardContent>
        {sortedTickets.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No waste submissions yet</h3>
            <p className="text-muted-foreground">
              Start by uploading your first waste item to begin tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTickets.map((ticket) => {
              const stages = [
                { label: 'Submitted', completed: true, timestamp: ticket.timestamps.created },
                { label: 'Collected', completed: ticket.status === 'collected' || ticket.status === 'recycled', timestamp: ticket.timestamps.collected },
                { label: 'Recycled', completed: ticket.status === 'recycled', timestamp: ticket.timestamps.recycled },
              ];

              return (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow flex items-start justify-between"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-primary">{ticket.wasteId}</span>
                      <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                      {ticket.ecoPointsAwarded && (
                        <div className="flex items-center space-x-1 text-sm text-success">
                          <Award className="w-4 h-4" />
                          <span>+{ticket.ecoPointsAwarded} points</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4" />
                        <span>{formatClassification(ticket.classification)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(ticket.timestamps.created).toLocaleDateString()}</span>
                      </div>
                      {ticket.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{ticket.location.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-xs mt-2">
                      {stages.map((stage, idx) => (
                        <div key={idx} className="flex items-center space-x-1">
                          <div
                            className={`w-2 h-2 rounded-full ${stage.completed ? 'bg-success' : 'bg-muted'}`}
                          ></div>
                          <span>{stage.label}</span>
                          <span className="text-muted-foreground">
                            {stage.completed && stage.timestamp ? new Date(stage.timestamp).toLocaleDateString() : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {ticket.imageUrl && (
                    <div className="ml-4">
                      <img
                        src={ticket.imageUrl}
                        alt="Waste item"
                        className="w-16 h-16 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
