import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import Article from "./pages/Article";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import JourneyAdmin from "./pages/admin/JourneyAdmin";
import ProjectsAdmin from "./pages/admin/ProjectsAdmin";
import WritingsAdmin from "./pages/admin/WritingsAdmin";
import BookmarksAdmin from "./pages/admin/BookmarksAdmin";
import ProfileAdmin from "./pages/admin/ProfileAdmin";
import QuotesAdmin from "./pages/admin/QuotesAdmin";
import RequireAuth from "./components/RequireAuth";
import AdminLayout from "./components/layouts/AdminLayout";

import { Background } from "./components/Background";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Background />
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Analytics />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
