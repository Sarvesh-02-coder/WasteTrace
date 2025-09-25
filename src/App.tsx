import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CitizenDashboard } from "./pages/CitizenDashboard";
import { CollectorDashboard } from "./pages/CollectorDashboard";
import { MunicipalityDashboard } from "./pages/MunicipalityDashboard";
import { useAuthStore } from "./store/useAuthStore";
import NotFound from "./pages/NotFound";
import { useLocation } from "./hooks/useLocation"; // <-- import hook

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { loading: locationLoading, error: locationError } = useLocation(); // <-- call hook

  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) return "/login";
    switch (user.role) {
      case 'citizen': return "/citizen";
      case 'collector': return "/collector";
      case 'municipality': return "/municipality";
      default: return "/login";
    }
  };

  // You can show a loader while fetching location
  if (locationLoading) return <div>Fetching your location...</div>;
  if (locationError) return <div>{locationError}</div>;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultRoute()} />} />
            <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
            
            <Route path="/citizen" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/collector" element={
              <ProtectedRoute allowedRoles={['collector']}>
                <CollectorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/municipality" element={
              <ProtectedRoute allowedRoles={['municipality']}>
                <MunicipalityDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
