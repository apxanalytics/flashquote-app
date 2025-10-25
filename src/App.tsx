import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import PricingPage from './pages/PricingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import NewJobPage from './pages/NewJobPage';
import NewJobCapturePage from './pages/NewJobCapturePage';
import ProposalReviewPage from './pages/ProposalReviewPage';
import ProposalDetailPage from './pages/ProposalDetailPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import InvoicesPage from './pages/InvoicesPage';
import NewInvoicePage from './pages/NewInvoicePage';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import GettingStartedPage from './pages/GettingStartedPage';
import VideoTutorialsPage from './pages/VideoTutorialsPage';
import FAQsPage from './pages/FAQsPage';
import ContactSupportPage from './pages/ContactSupportPage';
import FeatureRequestsPage from './pages/FeatureRequestsPage';
import TemplatePreviewPage from './pages/TemplatePreviewPage';
import MobileTestPage from './pages/MobileTestPage';
import ComponentTestPage from './pages/ComponentTestPage';
import DebugPage from './pages/DebugPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <DataProvider>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requireOnboarding={true}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="new-job" element={<NewJobCapturePage />} />
                  <Route path="new-job-simple" element={<NewJobPage />} />
                  <Route path="proposal-review" element={<ProposalReviewPage />} />
                  <Route path="proposals/:proposalId" element={<ProposalDetailPage />} />
                  <Route path="jobs/:jobId/proposal/:proposalId" element={<ProposalDetailPage />} />
                  <Route path="jobs" element={<JobsPage />} />
                  <Route path="jobs/:id" element={<JobDetailPage />} />
                  <Route path="invoices" element={<InvoicesPage />} />
                  <Route path="invoices/new" element={<NewInvoicePage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="help" element={<HelpCenterPage />} />
                  <Route path="help/getting-started" element={<GettingStartedPage />} />
                  <Route path="help/tutorials" element={<VideoTutorialsPage />} />
                  <Route path="help/faqs" element={<FAQsPage />} />
                  <Route path="help/support" element={<ContactSupportPage />} />
                  <Route path="help/feature-requests" element={<FeatureRequestsPage />} />
                  <Route path="templates" element={<TemplatePreviewPage />} />
                </Route>

                <Route
                  path="/mobile-test"
                  element={
                    <ProtectedRoute requireOnboarding={true}>
                      <MobileTestPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/test"
                  element={
                    <ProtectedRoute requireOnboarding={true}>
                      <ComponentTestPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/debug"
                  element={
                    <ProtectedRoute requireOnboarding={true}>
                      <DebugPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </DataProvider>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
