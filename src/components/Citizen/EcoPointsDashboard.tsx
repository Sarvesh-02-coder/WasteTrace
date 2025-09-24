import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useAuthStore } from '../../store/useAuthStore';
import { Gift, Award, ShoppingCart, Smartphone, Package } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface EcoPointsDashboardProps {
  totalPoints: number;
}

interface Voucher {
  id: string;
  title: string;
  description: string;
  cost: number;
  value: string;
  type: 'paytm' | 'amazon' | 'grocery';
  icon: React.ComponentType<any>;
  available: boolean;
}

export const EcoPointsDashboard: React.FC<EcoPointsDashboardProps> = ({ totalPoints }) => {
  const { updateUser } = useAuthStore();
  const [redeeming, setRedeeming] = useState<string>('');

  const vouchers: Voucher[] = [
    {
      id: 'paytm-50',
      title: '₹50 Paytm Cash',
      description: 'Instant cashback to your Paytm wallet',
      cost: 100,
      value: '₹50',
      type: 'paytm',
      icon: Smartphone,
      available: totalPoints >= 100,
    },
    {
      id: 'amazon-100',
      title: '₹100 Amazon Voucher',
      description: 'Amazon gift card for online shopping',
      cost: 200,
      value: '₹100',
      type: 'amazon',
      icon: Package,
      available: totalPoints >= 200,
    },
    {
      id: 'grocery-75',
      title: '₹75 Grocery Coupon',
      description: 'Discount on grocery shopping',
      cost: 150,
      value: '₹75',
      type: 'grocery',
      icon: ShoppingCart,
      available: totalPoints >= 150,
    },
  ];

  const handleRedeem = async (voucher: Voucher) => {
    if (!voucher.available || totalPoints < voucher.cost) {
      toast({
        title: "Insufficient points",
        description: `You need ${voucher.cost} points to redeem this voucher.`,
        variant: "destructive",
      });
      return;
    }

    setRedeeming(voucher.id);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Deduct points
    updateUser({ ecoPoints: totalPoints - voucher.cost });
    
    toast({
      title: "Voucher redeemed successfully!",
      description: `${voucher.title} has been sent to your account.`,
    });
    
    setRedeeming('');
  };

  const nextMilestone = [100, 150, 200, 250, 300].find(milestone => milestone > totalPoints) || 300;
  const progressToNext = Math.min((totalPoints / nextMilestone) * 100, 100);

  return (
    <Card className="shadow-eco">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className="w-5 h-5 text-primary" />
          <span>Eco Rewards</span>
        </CardTitle>
        <CardDescription>
          Redeem your eco points for exciting rewards and vouchers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Display */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-eco rounded-full mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <div className="text-3xl font-bold text-primary">{totalPoints}</div>
          <div className="text-sm text-muted-foreground">Eco Points Available</div>
        </div>

        {/* Progress to Next Milestone */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to {nextMilestone} points</span>
            <span className="font-medium">{totalPoints}/{nextMilestone}</span>
          </div>
          <Progress value={progressToNext} className="h-2" />
        </div>

        {/* Available Vouchers */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Available Rewards
          </h4>
          
          {vouchers.map((voucher) => {
            const IconComponent = voucher.icon;
            const canRedeem = voucher.available && totalPoints >= voucher.cost;
            
            return (
              <div
                key={voucher.id}
                className={`border rounded-lg p-4 ${
                  canRedeem ? 'border-primary bg-eco-light' : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      canRedeem ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    <div>
                      <div className="font-semibold">{voucher.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {voucher.description}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {voucher.cost} points
                        </Badge>
                        <span className="text-sm font-medium text-primary">
                          {voucher.value}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleRedeem(voucher)}
                    disabled={!canRedeem || redeeming === voucher.id}
                    variant={canRedeem ? "default" : "outline"}
                  >
                    {redeeming === voucher.id ? 'Redeeming...' : 'Redeem'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to Earn More */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Earn More Points
          </h4>
          <div className="text-sm space-y-1">
            <div>• Submit waste: +5 points</div>
            <div>• Complete recycling: +15 points</div>
            <div>• Daily submissions: +2 bonus points</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};