import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/useAuthStore';
import { Leaf, LogOut, User } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of WasteTrace.",
    });
    navigate('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'citizen': return 'text-primary';
      case 'collector': return 'text-success';
      case 'municipality': return 'text-warning';
      default: return 'text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-eco-light">
      {/* Header */}
      <header className="bg-white shadow-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/favicon.ico" alt="WasteTrace Logo" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-foreground">WasteTrace</h1>
                <p className="text-xs text-muted-foreground">Waste Tracking System</p>
              </div>
            </div>


            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <div className={`text-xs capitalize ${getRoleColor(user?.role || '')}`}>
                  {user?.role}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:ml-2 sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};