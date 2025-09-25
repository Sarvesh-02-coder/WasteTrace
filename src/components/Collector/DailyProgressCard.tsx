import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { TrendingUp, Camera, CheckCircle, Package, MapPin } from 'lucide-react';
import { WasteTicket } from '../../types';

interface DailyStats {
  pickups: number;
  verificationRate: number;
  completedToday: number;
}

interface DailyProgressCardProps {
  stats: DailyStats;
  tickets?: WasteTicket[]; // Optional list of today's collected tickets
  onUpdateProgress: () => void;
}

interface WasteClassification {
  cardboard: number;
  glass: number;
  metal: number;
  paper: number;
  plastic: number;
  trash: number;
}

export const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  stats,
  tickets = [],
  onUpdateProgress
}) => {
  const targetPickups = 15;
  const progressPercentage = Math.min((stats.pickups / targetPickups) * 100, 100);

  return (
    <Card className="shadow-eco">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-success" />
          <span>Daily Progress</span>
        </CardTitle>
        <CardDescription>
          Track your daily collection progress and update status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Metrics */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Pickups Progress</span>
              <span className="font-medium">{stats.pickups}/{targetPickups}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(progressPercentage)}% of daily target
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-eco-light rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">Verification</span>
            </div>
            <div className="text-lg font-bold text-success">{stats.verificationRate}%</div>
          </div>

          <div className="p-3 bg-primary/10 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="text-lg font-bold text-primary">{stats.completedToday}</div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Today's Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {stats.pickups >= 10 && (
              <Badge variant="default" className="bg-success">
                10+ Pickups
              </Badge>
            )}
            {stats.verificationRate >= 95 && (
              <Badge variant="default" className="bg-warning">
                High Accuracy
              </Badge>
            )}
          </div>
        </div>

        {/* Update Progress Button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={onUpdateProgress}
            className="w-full h-12"
            disabled={stats.pickups === 0}
          >
            <Camera className="w-5 h-5 mr-2" />
            Update Daily Progress
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Take a photo as proof to update progress to recycling ground
          </p>
        </div>

        {/* Progress Summary with Locations & Classification */}
        <div className="bg-muted p-3 rounded-lg text-sm">
          <div className="font-medium mb-1">Today's Summary</div>
          <div className="space-y-1 text-muted-foreground">
            <div>• {stats.pickups} waste items collected</div>
            <div>• {stats.verificationRate}% verification accuracy</div>
            <div>• All collections documented with photos</div>
            {tickets.length > 0 && (
              <>
                <div className="mt-2 font-medium">Collected Locations & Waste Types:</div>
                <ul className="list-disc list-inside text-xs text-muted-foreground">
                  {tickets.map((t) => {
                    // Parse classification JSON safely
                    let classification: WasteClassification | null = null;
                    try { classification = t.classification ? JSON.parse(t.classification) : null; } catch { classification = null; }

                    // Filter only non-zero categories
                    const filteredClassification = classification
                      ? Object.fromEntries(Object.entries(classification).filter(([_, count]) => count > 0))
                      : null;

                    return (
                      <li key={t.id} className="flex flex-col mb-1">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{t.location?.address || 'Unknown Location'}</span>
                        </div>
                        {filteredClassification && (
                          <div className="flex flex-wrap gap-1 ml-4 mt-1">
                            {Object.entries(filteredClassification).map(([cat, count]) => (
                              <Badge key={cat} className="bg-primary text-primary-foreground text-xs">
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}: {count}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
