import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useAuthStore } from '../store/useAuthStore';
import { useWasteStore } from '../store/useWasteStore';
import { QRScannerComponent } from '../components/ui/qr-scanner';
import { CameraComponent } from '../components/ui/camera';
import { WasteDetailsCard } from '../components/Collector/WasteDetailsCard';
import { DailyProgressCard } from '../components/Collector/DailyProgressCard';
import { QrCode, Camera, Truck, CheckCircle, MapPin, Clock, Package, Send } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { toast } from '../hooks/use-toast';

// ---------- JSON Parsing Helper ----------
const formatClassification = (classification: string | undefined) => {
  if (!classification) return "NA";
  try {
    const parsed: Record<string, number> = JSON.parse(classification);
    const filtered = Object.entries(parsed).filter(([_, count]) => count > 0);
    if (filtered.length === 0) return "No Waste";
    return filtered
      .map(([cat, count]) => `${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${count}`)
      .join(", ");
  } catch {
    return classification;
  }
};

export const CollectorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { tickets, getTicketByWasteId, updateTicketStatus } = useWasteStore();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [proofPhotoStep, setProofPhotoStep] = useState(false);
  const [manualWasteId, setManualWasteId] = useState('');
  const [dailyProgressValue, setDailyProgressValue] = useState([75]); // Demo progress at 75%
  const [submittingManual, setSubmittingManual] = useState(false);

  // Demo daily stats
  const dailyStats = {
    pickups: 12,
    totalWeight: 75,
    verificationRate: 98,
    completedToday: tickets.filter(t => 
      t.collectorId === user?.id && 
      t.timestamps.collected &&
      new Date(t.timestamps.collected).toDateString() === new Date().toDateString()
    ).length
  };

  const todaysTickets = tickets.filter(t => 
    t.collectorId === user?.id || t.status === 'pending'
  );

  const handleManualSubmit = async () => {
    if (!manualWasteId.trim()) {
      toast({
        title: "Please enter Waste ID",
        description: "Enter a valid waste ID to continue.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingManual(true);
    const ticket = getTicketByWasteId(manualWasteId.toUpperCase());
    
    if (ticket) {
      setSelectedTicket(ticket);
      setManualWasteId('');
      toast({
        title: "Waste found!",
        description: `Found waste item: ${ticket.wasteId}`,
      });
    } else {
      toast({
        title: "Waste not found",
        description: "This waste ID is not in the system.",
        variant: "destructive",
      });
    }
    setSubmittingManual(false);
  };

  const handleQRScan = (wasteId: string) => {
    const ticket = getTicketByWasteId(wasteId);
    if (ticket) {
      setSelectedTicket(ticket);
      setShowQRScanner(false);
      toast({
        title: "Waste found!",
        description: `Found waste item: ${ticket.wasteId}`,
      });
    } else {
      toast({
        title: "Waste not found",
        description: "This waste ID is not in the system.",
        variant: "destructive",
      });
    }
  };

  const handleCollectWaste = () => {
    if (!selectedTicket) return;
    setShowCamera(true);
  };

  const handleProofPhoto = (imageData: string) => {
    if (!selectedTicket) return;
    
    updateTicketStatus(selectedTicket.wasteId, 'collected', user?.id, imageData);
    setShowCamera(false);
    setSelectedTicket(null);
    
    toast({
      title: "Waste collected successfully!",
      description: "The waste status has been updated and proof photo uploaded.",
    });
  };

  const handleUpdateProgress = () => {
    if (dailyProgressValue[0] < 100) {
      toast({
        title: "Complete your progress first",
        description: "Move the slider to 100% to complete your daily progress.",
        variant: "destructive",
      });
      return;
    }
    setProofPhotoStep(true);
    setShowCamera(true);
  };

  const handleProgressPhoto = (imageData: string) => {
    // Update multiple tickets to recycled status
    todaysTickets
      .filter(t => t.status === 'collected' && t.collectorId === user?.id)
      .slice(0, 3) // Demo: update first 3 collected items
      .forEach(ticket => {
        updateTicketStatus(ticket.wasteId, 'recycled', user?.id, imageData);
      });

    setShowCamera(false);
    setProofPhotoStep(false);
    
    toast({
      title: "Daily progress updated!",
      description: "Waste items have been marked as recycled and citizens will receive their eco points.",
    });
  };

  if (showCamera) {
    return (
      <DashboardLayout 
        title={proofPhotoStep ? "Daily Progress Proof" : "Collection Proof"} 
        subtitle={proofPhotoStep ? "Take a photo as proof of daily progress" : "Take a photo to confirm waste collection"}
      >
        <div className="max-w-2xl mx-auto">
          <CameraComponent
            onCapture={proofPhotoStep ? handleProgressPhoto : handleProofPhoto}
            onClose={() => {
              setShowCamera(false);
              setProofPhotoStep(false);
            }}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (showQRScanner) {
    return (
      <DashboardLayout title="Scan Waste QR" subtitle="Point your camera at the QR code or enter Waste ID manually">
        <div className="max-w-2xl mx-auto">
          <QRScannerComponent
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Collector Dashboard" 
      subtitle="Manage waste collection and track your daily progress"
    >
      <div className="space-y-8">
        {/* Daily Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Pickups</p>
                  <p className="text-3xl font-bold text-primary">{dailyStats.pickups}</p>
                </div>
                <Truck className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verification Rate</p>
                  <p className="text-3xl font-bold text-warning">{dailyStats.verificationRate}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-muted-foreground">{dailyStats.completedToday}</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Scanner and Manual Entry Section */}
          <Card className="shadow-eco">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-primary" />
                <span>Waste Collection</span>
              </CardTitle>
              <CardDescription>
                Scan QR codes or enter Waste IDs manually to collect waste items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* QR Scanner Button */}
                <Button 
                  onClick={() => setShowQRScanner(true)}
                  className="w-full h-16 text-lg"
                >
                  <QrCode className="w-6 h-6 mr-3" />
                  Scan Waste QR Code
                </Button>
                
                {/* Manual Entry Section */}
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Or enter manually</div>
                    <div className="w-full h-px bg-border"></div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter Waste ID (e.g., WT7X9M2)"
                      value={manualWasteId}
                      onChange={(e) => setManualWasteId(e.target.value.toUpperCase())}
                      className="text-center font-mono text-lg"
                      maxLength={8}
                    />
                    <Button 
                      onClick={handleManualSubmit}
                      disabled={submittingManual || !manualWasteId.trim()}
                      className="px-6"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submittingManual ? 'Finding...' : 'Submit'}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Enter the 8-character waste ID from citizen's ticket
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Daily Progress with Slider */}
          <Card className="shadow-eco">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-success" />
                <span>Daily Progress</span>
              </CardTitle>
              <CardDescription>
                Track and complete your daily collection progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Stats Display */}
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center p-3 bg-eco-light rounded-lg">
                  <div className="text-2xl font-bold text-primary">{dailyStats.pickups}</div>
                  <div className="text-sm text-muted-foreground">Pickups Today</div>
                </div>
            
              </div>

              {/* Progress Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Progress</span>
                  <span className="text-sm text-muted-foreground">{dailyProgressValue[0]}%</span>
                </div>
                
                <Slider
                  value={dailyProgressValue}
                  onValueChange={setDailyProgressValue}
                  max={100}
                  step={5}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Start</span>
                  <span>50%</span>
                  <span>Complete</span>
                </div>
              </div>

              {/* Progress Status */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={dailyProgressValue[0] === 100 ? "default" : "secondary"}>
                    {dailyProgressValue[0] === 100 ? "Ready to Complete" : "In Progress"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {dailyProgressValue[0] === 100 
                    ? "Take a live photo to complete your daily progress"
                    : "Move slider to 100% when you finish all collections"
                  }
                </div>
              </div>

              {/* Complete Progress Button */}
              <Button 
                onClick={handleUpdateProgress}
                disabled={dailyProgressValue[0] < 100}
                className="w-full h-12"
              >
                <Camera className="w-5 h-5 mr-2" />
                {dailyProgressValue[0] === 100 ? "Take Live Photo to Complete" : "Complete Progress First"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Selected Waste Details */}
        {selectedTicket && (
          <WasteDetailsCard 
            ticket={selectedTicket}
            onCollect={handleCollectWaste}
            onClose={() => setSelectedTicket(null)}
          />
        )}

        {/* Today's Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Today's Collection Route</span>
            </CardTitle>
            <CardDescription>
              Waste items assigned for collection in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysTickets.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No assignments today</h3>
                <p className="text-muted-foreground">
                  Check back later for new waste collection assignments.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysTickets.slice(0, 5).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-primary">
                            {ticket.wasteId}
                          </span>
                          <Badge variant={
                            ticket.status === 'pending' ? 'secondary' :
                            ticket.status === 'collected' ? 'default' : 'outline'
                          }>
                            {ticket.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{formatClassification(ticket.classification)}</span>
                          {ticket.location && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{ticket.location.address}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(ticket);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
