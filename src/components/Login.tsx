import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useAuthStore } from '../store/useAuthStore';
import { Leaf, Users, Building2, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { email: 'citizen@demo', password: 'password123', role: 'Citizen', icon: Users, color: 'text-primary' },
    { email: 'collector@demo', password: 'password123', role: 'Collector', icon: Leaf, color: 'text-success' },
    { email: 'municipal@demo', password: 'password123', role: 'Municipality', icon: Building2, color: 'text-warning' }
  ];

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center text-white">
          <img src="/logo.png" alt="WasteTrace Logo" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">WasteTrace</h1>
          <p className="text-white/80 mt-2">End-to-End Waste Tracking System</p>
        </div>


        {/* Login Form */}
        <Card className="shadow-eco">
          <CardHeader className="text-center">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your role and access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground text-center mb-4">
                 Accounts (Click to autofill)
              </p>
              <div className="space-y-2">
                {demoLogins.map((demo) => {
                  const IconComponent = demo.icon;
                  return (
                    <Button
                      key={demo.email}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleDemoLogin(demo.email)}
                      type="button"
                    >
                      <IconComponent className={`w-4 h-4 mr-3 ${demo.color}`} />
                      <div className="text-left">
                        <div className="font-medium">{demo.role}</div>
                        <div className="text-xs text-muted-foreground">{demo.email}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-white/60 text-sm">
          <p>WasteTrace</p>
        </div>
      </div>
    </div>
  );
};