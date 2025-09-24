import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuthStore } from '../store/useAuthStore';
import { useWasteStore } from '../store/useWasteStore';
import { WasteUploadFlow } from '../components/Citizen/WasteUploadFlow';
import { WasteTicketDisplay } from '../components/Citizen/WasteTicketDisplay';
import { WasteHistory } from '../components/Citizen/WasteHistory';
import { EcoPointsDashboard } from '../components/Citizen/EcoPointsDashboard';
import { Camera, Upload, Award, Recycle, TreePine } from 'lucide-react';
import { WasteTicket } from '../types'; // 👈 import WasteTicket type

const EcoBadge: React.FC<{ name: string; description: string; icon: string; unlocked: boolean }> = ({ name, description, icon, unlocked }) => (
  <div className={`p-4 rounded-lg border-2 ${unlocked ? 'border-primary bg-eco-light' : 'border-border bg-muted/30'}`}>
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className={`font-semibold ${unlocked ? 'text-primary' : 'text-muted-foreground'}`}>{name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      {unlocked && <Badge variant="default" className="mt-2">Unlocked</Badge>}
    </div>
  </div>
);

export const CitizenDashboard: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { currentTicket, getTicketsByUser } = useWasteStore();
  const [showUploadFlow, setShowUploadFlow] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  const userTickets: WasteTicket[] = useMemo(() => getTicketsByUser(user?.id || '') || [], [getTicketsByUser, user?.id]);
  const totalEcoPoints = user?.ecoPoints || 0;

  const recycledCount = useMemo(() => userTickets.filter(t => t.status === 'recycled').length, [userTickets]);
  const pendingCount = useMemo(() => userTickets.filter(t => t.status === 'pending').length, [userTickets]);
  const collectedCount = useMemo(() => userTickets.filter(t => t.status === 'collected').length, [userTickets]);

  const handleUploadComplete = () => {
    setShowUploadFlow(false);
    setShowTicket(true);
    updateUser({ ecoPoints: totalEcoPoints + 5 });
  };

  const ecoBadges = [
    { name: 'Green Hero', description: 'Uploaded 10+ waste items', icon: '🌟', unlocked: recycledCount >= 10 },
    { name: 'Recycling Champion', description: 'Completed recycling process 5+ times', icon: '♻️', unlocked: recycledCount >= 5 },
    { name: 'Eco Warrior', description: 'Earned 100+ eco points', icon: '🏆', unlocked: totalEcoPoints >= 100 },
  ];

  if (showUploadFlow) {
    return (
      <DashboardLayout title="Upload Waste" subtitle="Capture and submit your waste for tracking">
        <div className="max-w-2xl mx-auto">
          <WasteUploadFlow 
            onComplete={handleUploadComplete}
            onCancel={() => setShowUploadFlow(false)}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (showTicket && currentTicket) {
    return (
      <DashboardLayout title="Waste Ticket" subtitle="Your waste has been successfully submitted">
        <div className="max-w-2xl mx-auto">
          <WasteTicketDisplay 
            ticket={currentTicket}
            onClose={() => setShowTicket(false)}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Citizen Dashboard" subtitle="Track your environmental impact and earn rewards">
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eco Points</p>
                <p className="text-3xl font-bold text-primary">{totalEcoPoints}</p>
              </div>
              <Award className="w-8 h-8 text-primary" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recycled</p>
                <p className="text-3xl font-bold text-success">{recycledCount}</p>
              </div>
              <Recycle className="w-8 h-8 text-success" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collected</p>
                <p className="text-3xl font-bold text-warning">{collectedCount}</p>
              </div>
              <TreePine className="w-8 h-8 text-warning" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-muted-foreground">{pendingCount}</p>
              </div>
              <Upload className="w-8 h-8 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-eco">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-primary" />
                <span>Upload Waste</span>
              </CardTitle>
              <CardDescription>Take a photo of your waste and get it tracked through the recycling process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['Take Photo', 'Upload Image'].map((label, idx) => (
                  <Button 
                    key={idx} 
                    onClick={() => setShowUploadFlow(true)} 
                    variant={idx === 1 ? 'outline' : 'default'} 
                    className="h-20 flex-col space-y-2"
                  >
                    {idx === 0 ? <Camera className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                    <span>{label}</span>
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Earn 5 eco points for each waste submission
              </p>
            </CardContent>
          </Card>

          <EcoPointsDashboard totalPoints={totalEcoPoints} />
        </div>

        {/* Gamification Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-warning" />
              <span>Eco Badges</span>
            </CardTitle>
            <CardDescription>Unlock achievements by participating in waste recycling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ecoBadges.map((badge, idx) => <EcoBadge key={idx} {...badge} />)}
            </div>
          </CardContent>
        </Card>

        <WasteHistory tickets={userTickets} /> 
      </div>
    </DashboardLayout>
  );
};
