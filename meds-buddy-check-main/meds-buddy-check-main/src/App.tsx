import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Profile } from "@/components/auth/Profile";
import { Navigation } from "@/components/Navigation";
import Medications from "./pages/Medications";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  const publicRoutes = [
    { path: "/login", element: <LoginForm /> },
    { path: "/signup", element: <SignupForm /> },
    { path: "/", element: <Index /> },
  ];

  const protectedRoutes = [
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/profile", element: <Profile /> },
    { path: "/medications", element: <Medications /> },
  ];

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Root route - redirect based on auth status */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <Index />} 
        />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={!!user}
              redirectPath="/login"
            >
              <Outlet />
            </ProtectedRoute>
          }
        >
          {protectedRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* 404 - Must be last */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
