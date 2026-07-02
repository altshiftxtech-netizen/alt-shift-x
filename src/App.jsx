import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AnalyticsTracker from './components/AnalyticsTracker';
import AffiliateCapture from './components/AffiliateCapture';
import CookieConsentBanner from './components/cookies/CookieConsentBanner';
import ProtectedRoute from '@/components/ProtectedRoute';
// Add page imports here
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
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
import ExportControls from './pages/ExportControls';
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
import GamificationAdmin from './pages/GamificationAdmin';
import PayoutSettings from './pages/PayoutSettings';
import BuilderSocialDashboard from './pages/BuilderSocialDashboard';
import BuilderKitPairing from './pages/BuilderKitPairing';
import UserOnboarding from './pages/UserOnboarding';
import SecurityCenter from './pages/SecurityCenter';
import SystemHealth from './pages/SystemHealth';
import Speakeasy from './pages/Speakeasy';
import SpeakeasyProxyRoom from './pages/SpeakeasyProxyRoom';
import SpeakeasySocial from './pages/SpeakeasySocial';
import SpeakeasyGroups from './pages/SpeakeasyGroups';
import SpeakeasyGroup from './pages/SpeakeasyGroup';
import SpeakeasyMeet from './pages/SpeakeasyMeet';
import SpeakeasyHallway from './pages/SpeakeasyHallway';
import SpeakeasyHallwayEast from './pages/SpeakeasyHallwayEast';
import SpeakeasyBathroom from './pages/SpeakeasyBathroom';
import UpKeeper from './pages/UpKeeper';
import TaxCompliance from './pages/TaxCompliance';
import Pipelines from './pages/Pipelines';
import PipelineKeyReveal from './pages/PipelineKeyReveal';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import WhitePaper from './pages/WhitePaper';
import Unsubscribe from './pages/Unsubscribe';
import LegalTerms from './pages/legal/LegalTerms';
import LegalPrivacy from './pages/legal/LegalPrivacy';
import LegalCookies from './pages/legal/LegalCookies';
import LegalAcceptableUse from './pages/legal/LegalAcceptableUse';
import LegalBuilderAgreement from './pages/legal/LegalBuilderAgreement';
import LegalRefunds from './pages/legal/LegalRefunds';
import LegalDmca from './pages/legal/LegalDmca';
import LegalExportControls from './pages/legal/LegalExportControls';
import LegalAiDisclosure from './pages/legal/LegalAiDisclosure';
import LegalSecurityDisclosure from './pages/legal/LegalSecurityDisclosure';
import LegalReferralTerms from './pages/legal/LegalReferralTerms';
import LegalAccessibility from './pages/legal/LegalAccessibility';
import LegalDpa from './pages/legal/LegalDpa';
import LegalChildrensSafety from './pages/legal/LegalChildrensSafety';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

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
    }
    // For auth_required, don't globally redirect — let ProtectedRoute handle it per-route
  }

  // Render the main app
  return (
    <Routes>
      {/* ── Public routes — no login required ── */}
      <Route path="/" element={<Home />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/marketplace/:id" element={<ComponentDetail />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/pipelines" element={<Pipelines />} />
      <Route path="/builders/:id" element={<BuilderPublicProfile />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/export-controls" element={<ExportControls />} />
      <Route path="/sanctions-policy" element={<ExportControls />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/white-paper" element={<WhitePaper />} />
      <Route path="/about/white-paper" element={<WhitePaper />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />
      <Route path="/tutorials" element={<Tutorial />} />
      <Route path="/sensitive-intelligence-policy" element={<SensitiveIntelligencePolicy />} />
      {/* ── Legal library routes ── */}
      <Route path="/legal/terms" element={<LegalTerms />} />
      <Route path="/legal/privacy" element={<LegalPrivacy />} />
      <Route path="/legal/cookies" element={<LegalCookies />} />
      <Route path="/legal/acceptable-use" element={<LegalAcceptableUse />} />
      <Route path="/legal/builder-agreement" element={<LegalBuilderAgreement />} />
      <Route path="/legal/refunds" element={<LegalRefunds />} />
      <Route path="/legal/dmca" element={<LegalDmca />} />
      <Route path="/legal/export-controls" element={<LegalExportControls />} />
      <Route path="/legal/ai-disclosure" element={<LegalAiDisclosure />} />
      <Route path="/legal/security-disclosure" element={<LegalSecurityDisclosure />} />
      <Route path="/legal/referral-terms" element={<LegalReferralTerms />} />
      <Route path="/legal/accessibility" element={<LegalAccessibility />} />
      <Route path="/legal/dpa" element={<LegalDpa />} />
      <Route path="/legal/childrens-safety" element={<LegalChildrensSafety />} />
      <Route path="/rollout-procedures" element={<RolloutProcedures />} />
      <Route path="/mobile" element={<MobileApp />} />
      <Route path="/builder/agreement" element={<BuilderAgreement />} />
      <Route path="/success/install" element={<InstallSuccess />} />
      <Route path="/success/subscription" element={<SubscriptionSuccess />} />
      <Route path="/onboarding" element={<UserOnboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Speakeasy rooms enforce their own membership gate (ProxyRoomGate), so
          they live outside ProtectedRoute — this also lets them render in the
          builder preview instead of bouncing to /login as a 404. */}
      <Route path="/speakeasy/proxy-room" element={<SpeakeasyProxyRoom />} />
      <Route path="/speakeasy/social" element={<SpeakeasySocial />} />
      <Route path="/speakeasy/groups" element={<SpeakeasyGroups />} />
      <Route path="/speakeasy/groups/:slug" element={<SpeakeasyGroup />} />
      <Route path="/speakeasy/meet" element={<SpeakeasyMeet />} />
      <Route path="/speakeasy/hallway" element={<SpeakeasyHallway />} />
      <Route path="/speakeasy/hallway-east" element={<SpeakeasyHallwayEast />} />
      <Route path="/speakeasy/bathroom" element={<SpeakeasyBathroom />} />

      {/* ── Protected routes — login required ── */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/dashboard/installed" element={<InstalledComponents />} />
        <Route path="/dashboard/usage" element={<UsageAnalytics />} />
        <Route path="/dashboard/api-keys" element={<ApiKeys />} />
        <Route path="/dashboard/settings" element={<AccountSettings />} />
        <Route path="/dashboard/setup/:id" element={<ComponentSetup />} />
        <Route path="/dashboard/subscription" element={<SubscriptionDashboard />} />
        <Route path="/pipeline-key/:id" element={<PipelineKeyReveal />} />
        <Route path="/dashboard/testing" element={<TestingDashboard />} />
        <Route path="/dashboard/sandbox" element={<SandboxManagement />} />
        <Route path="/dashboard/webhooks" element={<WebhookManager />} />
        <Route path="/speakeasy" element={<Speakeasy />} />
        <Route path="/builder" element={<BuilderDashboard />} />
        <Route path="/builder/revenue" element={<BuilderRevenue />} />
        <Route path="/builder/trust" element={<TrustEngine />} />
        <Route path="/builder/sandbox" element={<TestingSandbox />} />
        <Route path="/builder/components" element={<BuilderComponents />} />
        <Route path="/builder/analytics" element={<BuilderAnalytics />} />
        <Route path="/builder/reviews" element={<BuilderReviews />} />
        <Route path="/builder/publish" element={<BuilderPublish />} />
        <Route path="/builder/profile" element={<BuilderProfile />} />
        <Route path="/builder/bob" element={<BobBuilder />} />
        <Route path="/builder/components/:id/versions" element={<ComponentVersionHistory />} />
        <Route path="/builder/governance" element={<GovernanceDashboard />} />
        <Route path="/builder/test-lab" element={<BuilderTestLab />} />
        <Route path="/builder/analytics-suite" element={<BuilderAnalyticsSuite />} />
        <Route path="/builder/leaderboard" element={<BuilderLeaderboard />} />
        <Route path="/builder/payout-settings" element={<PayoutSettings />} />
        <Route path="/builder/tax-compliance" element={<TaxCompliance />} />
        <Route path="/builder/social" element={<BuilderSocialDashboard />} />
        <Route path="/builder/kit-pairing" element={<BuilderKitPairing />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/upkeeper" element={<UpKeeper />} />
        <Route path="/admin/intelligence" element={<PlatformIntelligence />} />
        <Route path="/admin/security" element={<SecurityCenter />} />
        <Route path="/admin/health" element={<SystemHealth />} />
        <Route path="/admin/gamification" element={<GamificationAdmin />} />
        <Route path="/vendor-portal" element={<VendorPortalPage />} />
        <Route path="/finance" element={<FinancePortal />} />
        <Route path="/api-partners" element={<ApiPartnerDashboard />} />
        <Route path="/spend-intelligence" element={<SpendIntelligenceDashboard />} />
        <Route path="/vendor-scores" element={<VendorScorecardDashboard />} />
      </Route>

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
            <AnalyticsTracker />
            <AffiliateCapture />
            <AuthenticatedApp />
            <CookieConsentBanner />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App