import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useWasteStore } from '../store/useWasteStore';
import { HeatmapView } from '../components/Municipality/HeatmapView';
import { ComplianceReports } from '../components/Municipality/ComplianceReports';
import { CollectorMonitoring } from '../components/Municipality/CollectorMonitoring';
import { Map, BarChart3, Users, CheckCircle, AlertTriangle, Truck } from 'lucide-react';

export const MunicipalityDashboard: React.FC = () => {
  const {
    tickets,
    fetchTickets,
    fetchTruckAssignments
  } = useWasteStore();

  const [selectedView, setSelectedView] =
    useState<'heatmap' | 'reports' | 'monitoring'>('heatmap');

  // 🚛 NEW STATE
  const [truckAssignments, setTruckAssignments] = useState<any>({});

  // ==============================
  // Fetch data on mount
  // ==============================
  useEffect(() => {
    fetchTickets();

    const loadTrucks = async () => {
      try {
        const data = await fetchTruckAssignments();
        setTruckAssignments(data);
      } catch (err) {
        console.error('Failed to load truck assignments', err);
      }
    };

    loadTrucks();
  }, [fetchTickets, fetchTruckAssignments]);

  // ==============================
  // Municipality stats
  // ==============================
  const totalWaste = tickets.length;
  const recycledWaste = tickets.filter(t => t.status === 'recycled').length;
  const collectedWaste = tickets.filter(t => t.status === 'collected').length;
  const pendingWaste = tickets.filter(t => t.status === 'pending').length;

  const recyclingRate = Math.round(
    (recycledWaste / Math.max(totalWaste, 1)) * 100
  );

  const citizenParticipation = 430; // demo

  const dashboardStats = {
    recyclingRate,
    citizenParticipation,
    totalWasteProcessed: totalWaste,
  };

  const viewTabs = [
    { id: 'heatmap', label: 'Heatmap Dashboard', icon: Map },
    { id: 'reports', label: 'Compliance Reports', icon: BarChart3 },
    { id: 'monitoring', label: 'Collector Monitoring', icon: Users },
  ] as const;

  const renderCurrentView = () => {
    switch (selectedView) {
      case 'heatmap':
        return <HeatmapView tickets={tickets} />;
      case 'reports':
        return <ComplianceReports stats={dashboardStats} tickets={tickets} />;
      case 'monitoring':
        return <CollectorMonitoring tickets={tickets} />;
      default:
        return <HeatmapView tickets={tickets} />;
    }
  };

  return (
    <DashboardLayout
      title="Municipality Dashboard"
      subtitle="Monitor citywide waste management and compliance"
    >
      <div className="space-y-8">

        {/* ==============================
            KEY METRICS
        ============================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recycling Rate</p>
                  <p className="text-3xl font-bold text-success">
                    {recyclingRate}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <Progress value={recyclingRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Citizen Participation
                  </p>
                  <p className="text-3xl font-bold text-warning">
                    {citizenParticipation}
                  </p>
                </div>
                <Users className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Items
                  </p>
                  <p className="text-3xl font-bold text-destructive">
                    {pendingWaste}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ==============================
            🚛 DYNAMIC TRUCK ASSIGNMENT CARD
        ============================== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Dynamic Truck Allocation
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {Object.keys(truckAssignments).length === 0 && (
              <p className="text-sm text-muted-foreground">
                No truck data available
              </p>
            )}

            {Object.entries(truckAssignments).map(
              ([areaId, data]: any) => (
                <div
                  key={areaId}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">Area: {areaId}</p>
                    <p className="text-sm text-muted-foreground">
                      Pending waste: {data.pendingWaste}
                    </p>
                  </div>

                  <Badge variant="outline">
                    🚛 {data.trucksAssigned} Trucks
                  </Badge>
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* ==============================
            NAVIGATION TABS
        ============================== */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {viewTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={
                      selectedView === tab.id ? 'default' : 'outline'
                    }
                    onClick={() => setSelectedView(tab.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </CardHeader>
        </Card>

        {/* ==============================
            DYNAMIC CONTENT
        ============================== */}
        {renderCurrentView()}
      </div>
    </DashboardLayout>
  );
};
