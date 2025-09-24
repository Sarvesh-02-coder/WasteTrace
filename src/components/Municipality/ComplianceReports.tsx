import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { DashboardStats, WasteTicket } from '../../types';
import { BarChart3, TrendingUp, FileText, Calendar, Download, Users, Recycle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface ComplianceReportsProps {
  stats: DashboardStats;
  tickets: WasteTicket[];
}

export const ComplianceReports: React.FC<ComplianceReportsProps> = ({ stats, tickets }) => {
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const monthlyData = [
    { month: 'Jan', segregation: 72, recycling: 58, participation: 380 },
    { month: 'Feb', segregation: 75, recycling: 61, participation: 395 },
    { month: 'Mar', segregation: 78, recycling: 65, participation: 430 },
  ];

  const complianceMetrics = [
    {
      title: 'Waste Segregation Compliance',
      current: stats.segregatedWaste,
      target: 80,
      status: stats.segregatedWaste >= 80 ? 'success' : stats.segregatedWaste >= 70 ? 'warning' : 'danger',
      description: 'Percentage of properly segregated waste'
    },
    {
      title: 'Recycling Rate Achievement',
      current: stats.recyclingRate,
      target: 70,
      status: stats.recyclingRate >= 70 ? 'success' : stats.recyclingRate >= 60 ? 'warning' : 'danger',
      description: 'Waste successfully recycled'
    },
    {
      title: 'Citizen Participation Rate',
      current: Math.round((stats.citizenParticipation / 500) * 100),
      target: 85,
      status: stats.citizenParticipation >= 425 ? 'success' : stats.citizenParticipation >= 350 ? 'warning' : 'danger',
      description: 'Active citizen participation in the program'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success text-success-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'danger': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {complianceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{metric.title}</span>
                <Badge className={getStatusBadge(metric.status)}>
                  {metric.status === 'success' ? '✓' : metric.status === 'warning' ? '⚠' : '!'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline space-x-2">
                <span className={`text-3xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.current}%
                </span>
                <span className="text-sm text-muted-foreground">
                  Target: {metric.target}%
                </span>
              </div>
              
              <Progress 
                value={metric.current} 
                className={`h-2 ${
                  metric.status === 'success' ? '[&>div]:bg-success' :
                  metric.status === 'warning' ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'
                }`}
              />
              
              <p className="text-sm text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Monthly Performance Trends</span>
          </CardTitle>
          <CardDescription>
            Track compliance metrics over the past 3 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {monthlyData.map((month, index) => (
              <div key={month.month} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{month.month} {thisYear}</h4>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-primary">Segregation: {month.segregation}%</span>
                    <span className="text-success">Recycling: {month.recycling}%</span>
                    <span className="text-warning">Participation: {month.participation}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Segregation</div>
                    <Progress value={month.segregation} className="h-2" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Recycling</div>
                    <Progress value={month.recycling} className="h-2 [&>div]:bg-success" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Participation</div>
                    <Progress value={(month.participation / 500) * 100} className="h-2 [&>div]:bg-warning" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Processing Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Recycle className="w-5 h-5" />
              <span>Waste Processing Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Waste Items</span>
                <span className="font-semibold">{tickets.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Collection</span>
                <span className="font-semibold text-destructive">
                  {tickets.filter(t => t.status === 'pending').length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">In Progress</span>
                <span className="font-semibold text-warning">
                  {tickets.filter(t => t.status === 'collected').length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Successfully Recycled</span>
                <span className="font-semibold text-success">
                  {tickets.filter(t => t.status === 'recycled').length}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">Processing Timeline</div>
              <div className="space-y-2 text-xs">
                <div>• Average collection time: 2.3 hours</div>
                <div>• Average processing time: 1.8 days</div>
                <div>• Fastest completion: 4 hours</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Environmental Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-success">2.4 tons</div>
              <div className="text-sm text-muted-foreground">CO₂ Emissions Prevented</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-primary">156kg</div>
                <div className="text-xs text-muted-foreground">Plastic Recycled</div>
              </div>
              <div>
                <div className="text-xl font-bold text-success">89kg</div>
                <div className="text-xs text-muted-foreground">Organic Composted</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Energy Saved:</span>
                <span className="font-medium">1,240 kWh</span>
              </div>
              <div className="flex justify-between">
                <span>Water Conserved:</span>
                <span className="font-medium">3,200 L</span>
              </div>
              <div className="flex justify-between">
                <span>Landfill Diverted:</span>
                <span className="font-medium">245kg</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Export Reports</span>
          </CardTitle>
          <CardDescription>
            Generate detailed compliance and performance reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="w-6 h-6" />
              <span>Monthly Report</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="w-6 h-6" />
              <span>Compliance Audit</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="w-6 h-6" />
              <span>Environmental Impact</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};