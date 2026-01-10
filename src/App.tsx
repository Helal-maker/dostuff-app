import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootRoute from "./pages/RootRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateExam from "./pages/CreateExam";
import TakeExam from "./pages/TakeExam";
import JoinExam from "./pages/JoinExam";
import TeacherOnboarding from "./pages/TeacherOnboarding";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SettingsFeedback from "./pages/SettingsFeedback";
import SettingsLanguage from "./pages/SettingsLanguage";
import SettingsAbout from "./pages/SettingsAbout";
import SettingsDrafts from "./pages/SettingsDrafts";
import ExamAnalytics from "./pages/ExamAnalytics";
import ExamResults from "./pages/ExamResults";
import Results from "./pages/Results";
import Exams from "./pages/Exams";
import HowItWorksPage from "./pages/HowItWorksPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import AuthGuard from "./components/AuthGuard";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import OfflineIndicator from "./components/OfflineIndicator";
import ResponsiveNavbar from "./components/ResponsiveNavbar";
import { initializePwaDetection } from "./lib/pwa-detection";
import { registerServiceWorker, setupPWAInstallPrompt } from "./lib/service-worker-registration";
import { initializePushNotifications, notifyConnectivityEvent } from "./lib/push-notifications";
import { initializePerformanceOptimizations, optimizeForOffline } from "./lib/performance-optimization";

const queryClient = new QueryClient();

// Create router configuration with createBrowserRouter API
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        {/* PWA Components */}
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <RootRoute />
      </>
    ),
  },
  {
    path: "/how-it-works",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <HowItWorksPage />
      </>
    ),
  },
  {
    path: "/auth",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <Auth />
      </>
    ),
  },
  {
    path: "/join",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <JoinExam />
      </>
    ),
  },
  {
    path: "/privacy-policy",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <PrivacyPolicy />
      </>
    ),
  },
  {
    path: "/terms-of-service",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <TermsOfService />
      </>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/profile",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <Profile />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/settings",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <Settings />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/settings/feedback",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <SettingsFeedback />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/settings/language",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <SettingsLanguage />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/settings/about",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <SettingsAbout />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/settings/drafts",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <SettingsDrafts />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/teacher-onboarding",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <TeacherOnboarding />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/create-exam",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <CreateExam />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/exams",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <Exams />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/exam-analytics/:examId",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <ExamAnalytics />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/exam-results/:attemptId",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <ExamResults />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/results",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <AuthGuard>
          <Results />
        </AuthGuard>
      </>
    ),
  },
  {
    path: "/exam/:shareLink",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <TakeExam />
      </>
    ),
  },
  {
    path: "*",
    element: (
      <>
        <PWAInstallPrompt delay={3000} showAdvanced={true} />
        <OfflineIndicator />
        <ResponsiveNavbar />
        <NotFound />
      </>
    ),
  },
]);

const App = () => {
  useEffect(() => {
    // Initialize PWA detection
    initializePwaDetection();

    // Register service worker
    registerServiceWorker({
      onSuccess: (registration) => {
        console.log('Service Worker registered:', registration);
      },
      onUpdate: (registration) => {
        console.log('New Service Worker available');
        // Could show update notification here
      },
      onOffline: () => {
        console.log('App is offline');
        notifyConnectivityEvent(false);
      },
      onOnline: () => {
        console.log('App is online');
        notifyConnectivityEvent(true);
      }
    });

    // Setup PWA install prompt handling
    setupPWAInstallPrompt({
      onPromptAvailable: (event) => {
        console.log('PWA install prompt available');
      },
      onInstallSuccess: () => {
        console.log('PWA installed successfully');
      },
      onInstallDismissed: () => {
        console.log('PWA install dismissed');
      }
    });

    // Initialize push notifications
    initializePushNotifications();

    // Initialize performance optimizations
    initializePerformanceOptimizations();
    
    // Optimize for offline use
    optimizeForOffline();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
