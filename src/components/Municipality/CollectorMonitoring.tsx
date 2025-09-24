import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { WasteTicket } from '../../types';
import { Users, MapPin, Camera, Clock, CheckCircle, TrendingUp, Eye } from 'lucide-react';

interface CollectorMonitoringProps {
  tickets: WasteTicket[];
}

interface CollectorProfile {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'busy';
  dailyStats: {
    pickups: number;
    weight: number;
    verificationRate: number;
    hoursWorked: number;
  };
  location: {
    area: string;
    lastUpdate: string;
  };
  proofPhotos: string[];
  performance: {
    weeklyPickups: number;
    accuracy: number;
    rating: number;
  };
}

export const CollectorMonitoring: React.FC<CollectorMonitoringProps> = ({ tickets }) => {
  const [selectedCollector, setSelectedCollector] = useState<string | null>(null);
  const [showProofPhotos, setShowProofPhotos] = useState<string | null>(null);

  // Demo collector data
  const collectors: CollectorProfile[] = [
    {
      id: 'collector-1',
      name: 'Eco Collector',
      email: 'collector@demo',
      status: 'active',
      dailyStats: {
        pickups: 12,
        weight: 75,
        verificationRate: 98,
        hoursWorked: 7.5,
      },
      location: {
        area: 'Central Delhi',
        lastUpdate: '5 minutes ago',
      },
      proofPhotos: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      performance: {
        weeklyPickups: 68,
        accuracy: 97,
        rating: 4.8,
      },
    },
    {
      id: 'collector-2',
      name: 'Green Guardian',
      email: 'guardian@demo',
      status: 'busy',
      dailyStats: {
        pickups: 8,
        weight: 45,
        verificationRate: 94,
        hoursWorked: 5.2,
      },
      location: {
        area: 'Noida Sector 18',
        lastUpdate: '12 minutes ago',
      },
      proofPhotos: ['/placeholder.svg', '/placeholder.svg'],
      performance: {
        weeklyPickups: 52,
        accuracy: 94,
        rating: 4.5,
      },
    },
    {
      id: 'collector-3',
      name: 'Waste Warrior',
      email: 'warrior@demo',
      status: 'inactive',
      dailyStats: {
        pickups: 0,
        weight: 0,
        verificationRate: 0,
        hoursWorked: 0,
      },
      location: {
        area: 'Gurgaon',
        lastUpdate: '2 hours ago',
      },
      proofPhotos: [],
      performance: {
        weeklyPickups: 35,
        accuracy: 89,
        rating: 4.2,
      },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'busy': return 'bg-warning text-warning-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'busy': return <Clock className="w-4 h-4" />;
      case 'inactive': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <div className="space-y-6">
      {/* Collector Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collectors.map((collector) => (
          <Card 
            key={collector.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCollector === collector.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedCollector(collector.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{collector.name}</CardTitle>
                <Badge className={getStatusColor(collector.status)}>
                  {getStatusIcon(collector.status)}
                  <span className="ml-1 capitalize">{collector.status}</span>
                </Badge>
              </div>
              <CardDescription className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{collector.location.area}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Daily Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Today's Pickups</div>
                  <div className="font-bold text-primary">{collector.dailyStats.pickups}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Weight</div>
                  <div className="font-bold">{collector.dailyStats.weight}kg</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Accuracy</div>
                  <div className="font-bold text-success">{collector.dailyStats.verificationRate}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Hours</div>
                  <div className="font-bold">{collector.dailyStats.hoursWorked}h</div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Daily Target Progress</span>
                  <span>{Math.round((collector.dailyStats.pickups / 15) * 100)}%</span>
                </div>
                <Progress value={(collector.dailyStats.pickups / 15) * 100} className="h-2" />
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProofPhotos(collector.id);
                  }}
                  disabled={collector.proofPhotos.length === 0}
                >
                  <Camera className="w-3 h-3 mr-1" />
                  Photos ({collector.proofPhotos.length})
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-3 h-3 mr-1" />
                  Track
                </Button>
              </div>

              {/* Last Update */}
              <div className="text-xs text-muted-foreground text-center">
                Last update: {collector.location.lastUpdate}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Collector View */}
      {selectedCollector && (
        <Card>
          <CardHeader>
            <CardTitle>
              {collectors.find(c => c.id === selectedCollector)?.name} - Detailed View
            </CardTitle>
            <CardDescription>
              Comprehensive performance and activity monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const collector = collectors.find(c => c.id === selectedCollector);
              if (!collector) return null;

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Metrics */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Performance Metrics</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Weekly Pickups</span>
                          <span>{collector.performance.weeklyPickups}/75</span>
                        </div>
                        <Progress value={(collector.performance.weeklyPickups / 75) * 100} />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Accuracy Rate</span>
                          <span>{collector.performance.accuracy}%</span>
                        </div>
                        <Progress value={collector.performance.accuracy} className="[&>div]:bg-success" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Rating</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-warning">{getRatingStars(collector.performance.rating)}</span>
                          <span className="text-sm font-medium">{collector.performance.rating}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Recent Activity</h4>
                    
                    <div className="space-y-3">
                      {tickets
                        .filter(t => t.collectorId === collector.id)
                        .slice(0, 5)
                        .map((ticket, index) => (
                          <div key={ticket.id} className="flex items-center space-x-3 p-2 bg-muted/30 rounded-lg">
                            <div className={`w-2 h-2 rounded-full ${
                              ticket.status === 'recycled' ? 'bg-success' :
                              ticket.status === 'collected' ? 'bg-warning' : 'bg-muted'
                            }`}></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{ticket.wasteId}</div>
                              <div className="text-xs text-muted-foreground">{ticket.classification}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(ticket.timestamps.created).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Proof Photos Modal */}
      {showProofPhotos && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Proof Photos</CardTitle>
              <Button variant="ghost" onClick={() => setShowProofPhotos(null)}>
                ×
              </Button>
            </div>
            <CardDescription>
              Collection verification photos from {collectors.find(c => c.id === showProofPhotos)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const collector = collectors.find(c => c.id === showProofPhotos);
              if (!collector || collector.proofPhotos.length === 0) {
                return (
                  <div className="text-center py-8">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No proof photos available</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {collector.proofPhotos.map((photo, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={photo}
                        alt={`Proof photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        Photo {index + 1} - {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{collectors.filter(c => c.status === 'active').length}</div>
            <div className="text-sm text-muted-foreground">Active Collectors</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">
              {collectors.reduce((sum, c) => sum + c.dailyStats.pickups, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Pickups Today</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-warning">
              {Math.round(collectors.reduce((sum, c) => sum + c.performance.accuracy, 0) / collectors.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Average Accuracy</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold">
              {collectors.reduce((sum, c) => sum + c.proofPhotos.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Proof Photos</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};