import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";

import { Background } from "./components/Background";
import { Terminal } from "./components/Terminal";
import { useKonamiCode } from "./hooks/use-konami-code";
import RequireAuth from "./components/RequireAuth";
import AdminLayout from "./components/layouts/AdminLayout";

// Lazy-loaded components
const Index = lazy(() => import("./pages/Index"));
const Article = lazy(() => import("./pages/Article"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const JourneyAdmin = lazy(() => import("./pages/admin/JourneyAdmin"));
const ProjectsAdmin = lazy(() => import("./pages/admin/ProjectsAdmin"));
const WritingsAdmin = lazy(() => import("./pages/admin/WritingsAdmin"));
const BookmarksAdmin = lazy(() => import("./pages/admin/BookmarksAdmin"));
const ProfileAdmin = lazy(() => import("./pages/admin/ProfileAdmin"));
const QuotesAdmin = lazy(() => import("./pages/admin/QuotesAdmin"));
const SettingsAdmin = lazy(() => import("./pages/admin/SettingsAdmin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => {
  useKonamiCode();

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Background />
            <BrowserRouter>
              <Terminal />
              <Toaster />
              <Sonner />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/writing/:slug" element={<Article />} />
                  <Route path="/admin/login" element={<Login />} />
                  <Route element={<RequireAuth />}>
                    <Route path="/admin" element={
                      <AdminLayout>
                        <Dashboard />
                      </AdminLayout>
                    } />
                    <Route path="/admin/journey" element={
                      <AdminLayout>
                        <JourneyAdmin />
                      </AdminLayout>
                    } />
                    <Route path="/admin/projects" element={
                      <AdminLayout>
                        <ProjectsAdmin />
                      </AdminLayout>
                    } />
                    <Route path="/admin/writings" element={
                      <AdminLayout>
                        <WritingsAdmin />
                      </AdminLayout>
                    } />
                    <Route path="/admin/bookmarks" element={
                      <AdminLayout>
                        <BookmarksAdmin />
                      </AdminLayout>
                    } />
                    <Route path="/admin/profile" element={
                      <AdminLayout>
                        <ProfileAdmin />
                      </AdminLayout>
                    } />
                    <Route path="/admin/quotes" element={
                      <AdminLayout>
                        <QuotesAdmin />
                      </AdminLayout>
                    } />
                    <Route path="/admin/settings" element={
                      <AdminLayout>
                        <SettingsAdmin />
                      </AdminLayout>
                    } />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Analytics />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
