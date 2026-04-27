import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import LeaguesPage from "./pages/LeaguesPage";
import LeagueDetailPage from "./pages/LeagueDetailPage";
import ParticipantDetailPage from "./pages/ParticipantDetailPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import { RequireAuth } from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/leagues" element={<RequireAuth><LeaguesPage /></RequireAuth>} />
            <Route path="/leagues/:leagueId" element={<RequireAuth><LeagueDetailPage /></RequireAuth>} />
            <Route path="/leagues/:leagueId/participant/:participantId" element={<RequireAuth><ParticipantDetailPage /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
