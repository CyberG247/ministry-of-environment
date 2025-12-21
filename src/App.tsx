import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SubmitReport from "./pages/SubmitReport";
import AdminDashboard from "./pages/AdminDashboard";
import TrackReportPage from "./pages/TrackReportPage";
import FieldOfficerDashboard from "./pages/FieldOfficerDashboard";
import PublicStats from "./pages/PublicStats";
import CitizenDashboard from "./pages/CitizenDashboard";
import NotificationPreferences from "./pages/NotificationPreferences";
import NewsMedia from "./pages/NewsMedia";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/submit-report" element={<SubmitReport />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/track" element={<TrackReportPage />} />
            <Route path="/field-officer" element={<FieldOfficerDashboard />} />
            <Route path="/stats" element={<PublicStats />} />
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path="/notifications" element={<NotificationPreferences />} />
            <Route path="/news" element={<NewsMedia />} />
            <Route path="/profile" element={<UserProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
