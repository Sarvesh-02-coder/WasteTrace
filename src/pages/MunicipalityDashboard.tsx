import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useWasteStore } from '../store/useWasteStore';
import { HeatmapView } from '../components/Municipality/HeatmapView';
import { ComplianceReports } from '../components/Municipality/ComplianceReports';
import { CollectorMonitoring } from '../components/Municipality/CollectorMonitoring';
import { Map, BarChart3, Users, CheckCircle, AlertTriangle } from 'lucide-react';

export const MunicipalityDashboard: React.FC = () => {
  const { tickets } = useWasteStore();
  const [selectedView, setSelectedView] = useState<'heatmap' | 'reports' | 'monitoring'>('heatmap');

  // Calculate municipality stats
  const totalWaste = tickets.length;
  const recycledWaste = tickets.filter(t => t.status === 'recycled').length;
  const collectedWaste = tickets.filter(t => t.status === 'collected').length;
  const pendingWaste = tickets.filter(t => t.status === 'pending').length;

  const recyclingRate = Math.round((recycledWaste / Math.max(totalWaste, 1)) * 100);
  const citizenParticipation = 430; // Demo value

  const dashboardStats = {
    recyclingRate,
    citizenParticipation,
    totalWasteProcessed: totalWaste
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
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recycling Rate</p>
                  <p className="text-3xl font-bold text-success">{recyclingRate}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div className="mt-2">
                <Progress value={recyclingRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Citizen Participation</p>
                  <p className="text-3xl font-bold text-warning">{citizenParticipation}</p>
                </div>
                <Users className="w-8 h-8 text-warning" />
              </div>
              <div className="mt-2">
                <div className="text-xs text-muted-foreground">Active users</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Items</p>
                  <p className="text-3xl font-bold text-destructive">{pendingWaste}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="mt-2">
                <div className="text-xs text-muted-foreground">Requires attention</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Collected</span>
                  <span className="font-medium">{collectedWaste + recycledWaste}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="font-medium">{collectedWaste}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recycled</span>
                  <span className="font-medium text-success">{recycledWaste}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Status</span>
                  <Badge variant="default" className="bg-success">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Collectors Active</span>
                  <Badge variant="default">3/5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Update</span>
                  <span className="text-sm text-muted-foreground">2 min ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alerts & Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingWaste > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span>{pendingWaste} items pending collection</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>No system alerts</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>All collectors verified</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {viewTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={selectedView === tab.id ? "default" : "outline"}
                    onClick={() => setSelectedView(tab.id)}
                    className="flex items-center space-x-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardHeader>
        </Card>

        {/* Dynamic Content Based on Selected View */}
        {renderCurrentView()}
      </div>
    </DashboardLayout>
  );
};
