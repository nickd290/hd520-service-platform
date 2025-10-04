import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import TrainingPage from './pages/TrainingPage'
import ModulesListPage from './pages/ModulesListPage'
import ModuleViewerPage from './pages/ModuleViewerPage'
import ProgressPage from './pages/ProgressPage'
import MaintenancePage from './pages/MaintenancePage'
import TrustDataPage from './pages/TrustDataPage'
import AdminDocumentsPage from './pages/AdminDocumentsPage'
import AdminKnowledgeReviewPage from './pages/AdminKnowledgeReviewPage'
import TicketsPage from './pages/TicketsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ShiftHandoffPage from './pages/ShiftHandoffPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Training Routes */}
      <Route path="/training" element={<TrainingPage />} />
      <Route path="/training/:path" element={<ModulesListPage />} />
      <Route path="/training/module/:id" element={<ModuleViewerPage />} />
      <Route path="/training/progress" element={<ProgressPage />} />

      {/* Other Routes */}
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/trust-data" element={<TrustDataPage />} />
      <Route path="/tickets" element={<TicketsPage />} />
      <Route path="/shift-handoff" element={<ShiftHandoffPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/documents" element={<AdminDocumentsPage />} />
      <Route path="/admin/knowledge-review" element={<AdminKnowledgeReviewPage />} />
    </Routes>
  )
}

export default App
