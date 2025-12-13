import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateExam from "./pages/CreateExam";
import TakeExam from "./pages/TakeExam";
import JoinExam from "./pages/JoinExam";
import TeacherOnboarding from "./pages/TeacherOnboarding";
import Profile from "./pages/Profile";
import ExamAnalytics from "./pages/ExamAnalytics";
import ExamResults from "./pages/ExamResults";
import HowItWorksPage from "./pages/HowItWorksPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/teacher-onboarding" element={<TeacherOnboarding />} />
          <Route path="/create-exam" element={<CreateExam />} />
          <Route path="/exam/:shareLink" element={<TakeExam />} />
          <Route path="/join" element={<JoinExam />} />
          <Route path="/exam-analytics/:examId" element={<ExamAnalytics />} />
          <Route path="/exam-results/:attemptId" element={<ExamResults />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;