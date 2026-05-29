import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import BuilderRevenue from './pages/BuilderRevenue';
import TrustEngine from './pages/TrustEngine';
import TestingSandbox from './pages/TestingSandbox';
import BuilderDashboard from './pages/BuilderDashboard';
import BuilderComponents from './pages/BuilderComponents';
import BuilderAnalytics from './pages/BuilderAnalytics';
import BuilderReviews from './pages/BuilderReviews';
import BuilderPublish from './pages/BuilderPublish';
import BuilderProfile from './pages/BuilderProfile';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route path="/builder/revenue" element={<BuilderRevenue />} />
      <Route path="/builder/trust" element={<TrustEngine />} />
      <Route path="/builder/sandbox" element={<TestingSandbox />} />
      <Route path="/builder" element={<BuilderDashboard />} />
      <Route path="/builder/components" element={<BuilderComponents />} />
      <Route path="/builder/analytics" element={<BuilderAnalytics />} />
      <Route path="/builder/reviews" element={<BuilderReviews />} />
      <Route path="/builder/publish" element={<BuilderPublish />} />
      <Route path="/builder/profile" element={<BuilderProfile />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App