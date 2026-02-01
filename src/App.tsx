import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Admin Routes */}
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
              {/* Add other protected admin routes here */}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
