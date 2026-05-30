import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ComponentDetail from './pages/ComponentDetail';
import UserDashboard from './pages/UserDashboard';
import InstalledComponents from './pages/InstalledComponents';
import UsageAnalytics from './pages/UsageAnalytics';
import BuilderRevenue from './pages/BuilderRevenue';
import TrustEngine from './pages/TrustEngine';
import TestingSandbox from './pages/TestingSandbox';
import BuilderDashboard from './pages/BuilderDashboard';
import BuilderComponents from './pages/BuilderComponents';
import BuilderAnalytics from './pages/BuilderAnalytics';
import BuilderReviews from './pages/BuilderReviews';
import BuilderPublish from './pages/BuilderPublish';
import BuilderProfile from './pages/BuilderProfile';
import BuilderPublicProfile from './pages/BuilderPublicProfile';
import ApiKeys from './pages/ApiKeys';
import AccountSettings from './pages/AccountSettings';
import ComponentSetup from './pages/ComponentSetup';
import AdminPanel from './pages/AdminPanel';
import Pricing from './pages/Pricing';
import SubscriptionDashboard from './pages/SubscriptionDashboard';
import MobileApp from './pages/MobileApp';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import BuilderAgreement from './pages/BuilderAgreement';
import InstallSuccess from './pages/InstallSuccess';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import TestingDashboard from './pages/TestingDashboard';
import SandboxManagement from './pages/SandboxManagement';
import RolloutProcedures from './pages/RolloutProcedures';
import VendorPortalPage from './pages/VendorPortalPage';
import FinancePortal from './pages/FinancePortal';
import ApiPartnerDashboard from './pages/ApiPartnerDashboard';
import SpendIntelligenceDashboard from './pages/SpendIntelligenceDashboard';
import VendorScorecardDashboard from './pages/VendorScorecardDashboard';
import Tutorial from './pages/Tutorial';
import Contact from './pages/Contact';
import SensitiveIntelligencePolicy from './pages/SensitiveIntelligencePolicy';
import BobBuilder from './pages/BobBuilder';
import ComponentVersionHistory from './pages/ComponentVersionHistory';
import WebhookManager from './pages/WebhookManager';
import GovernanceDashboard from './pages/GovernanceDashboard';
import PlatformIntelligence from './pages/PlatformIntelligence';
import BuilderTestLab from './pages/BuilderTestLab';
import BuilderAnalyticsSuite from './pages/BuilderAnalyticsSuite';
import BuilderLeaderboard from './pages/BuilderLeaderboard';

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
      <Route path="/" element={<Home />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/marketplace/:id" element={<ComponentDetail />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/dashboard/installed" element={<InstalledComponents />} />
      <Route path="/dashboard/usage" element={<UsageAnalytics />} />
      <Route path="/builder/revenue" element={<BuilderRevenue />} />
      <Route path="/builder/trust" element={<TrustEngine />} />
      <Route path="/builder/sandbox" element={<TestingSandbox />} />
      <Route path="/builder" element={<BuilderDashboard />} />
      <Route path="/builder/components" element={<BuilderComponents />} />
      <Route path="/builder/analytics" element={<BuilderAnalytics />} />
      <Route path="/builder/reviews" element={<BuilderReviews />} />
      <Route path="/builder/publish" element={<BuilderPublish />} />
      <Route path="/builder/profile" element={<BuilderProfile />} />
      <Route path="/builders/:id" element={<BuilderPublicProfile />} />
      <Route path="/dashboard/api-keys" element={<ApiKeys />} />
      <Route path="/dashboard/settings" element={<AccountSettings />} />
      <Route path="/dashboard/setup/:id" element={<ComponentSetup />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/dashboard/subscription" element={<SubscriptionDashboard />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/mobile" element={<MobileApp />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/builder/agreement" element={<BuilderAgreement />} />
      <Route path="/success/install" element={<InstallSuccess />} />
      <Route path="/success/subscription" element={<SubscriptionSuccess />} />
      <Route path="/dashboard/testing" element={<TestingDashboard />} />
      <Route path="/dashboard/sandbox" element={<SandboxManagement />} />
      <Route path="/rollout-procedures" element={<RolloutProcedures />} />
      <Route path="/vendor-portal" element={<VendorPortalPage />} />
      <Route path="/finance" element={<FinancePortal />} />
      <Route path="/api-partners" element={<ApiPartnerDashboard />} />
      <Route path="/spend-intelligence" element={<SpendIntelligenceDashboard />} />
      <Route path="/vendor-scores" element={<VendorScorecardDashboard />} />
      <Route path="/tutorials" element={<Tutorial />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/sensitive-intelligence-policy" element={<SensitiveIntelligencePolicy />} />
      <Route path="/builder/bob" element={<BobBuilder />} />
      <Route path="/builder/components/:id/versions" element={<ComponentVersionHistory />} />
      <Route path="/dashboard/webhooks" element={<WebhookManager />} />
      <Route path="/builder/governance" element={<GovernanceDashboard />} />
      <Route path="/admin/intelligence" element={<PlatformIntelligence />} />
      <Route path="/builder/test-lab" element={<BuilderTestLab />} />
      <Route path="/builder/analytics-suite" element={<BuilderAnalyticsSuite />} />
      <Route path="/builder/leaderboard" element={<BuilderLeaderboard />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App