import { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar, Footer } from './components/layout';
import { ScrollToTop } from './components/common/ScrollToTop';
import { VexoLogoLoader } from './components/ui/VexoLogoLoader';

import { HomePage } from './pages/HomePage';
import { MusicPage } from './pages/MusicPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { EventsPage } from './pages/EventsPage';
import { VideosPage } from './pages/VideosPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PreWeddingPage } from './pages/PreWeddingPage';
import { WeddingPage } from './pages/WeddingPage';

// Admin System Imports
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { AdminToastProvider } from './admin/context/AdminToastContext';
import { AdminProtectedRoute } from './admin/components/AdminProtectedRoute';
import { AdminLayout } from './admin/components/AdminLayout';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminArtistsPage } from './admin/pages/AdminArtistsPage';
import { AdminArtistFormPage } from './admin/pages/AdminArtistFormPage';
import { AdminMusicPage } from './admin/pages/AdminMusicPage';
import { AdminVideosPage } from './admin/pages/AdminVideosPage';
import { AdminVideoFormPage } from './admin/pages/AdminVideoFormPage';
import { AdminEventsPage } from './admin/pages/AdminEventsPage';
import { AdminEventFormPage } from './admin/pages/AdminEventFormPage';
import { AdminServicesPage } from './admin/pages/AdminServicesPage';
import { AdminMediaPage } from './admin/pages/AdminMediaPage';
import { AdminInquiriesPage } from './admin/pages/AdminInquiriesPage';
import { AdminHomepagePage } from './admin/pages/AdminHomepagePage';
import { AdminSiteSettingsPage } from './admin/pages/AdminSiteSettingsPage';
import { AdminPreWeddingPage } from './admin/pages/AdminPreWeddingPage';
import { AdminWeddingPage } from './admin/pages/AdminWeddingPage';
import { AdminActivityLogsPage } from './admin/pages/AdminActivityLogsPage';
import { AdminUsersPage } from './admin/pages/AdminUsersPage';
import { AdminFooterPage } from './admin/pages/AdminFooterPage';

// Theme Experience System
import { ThemeProvider, ThemeTransition } from './components/theme';

function PublicLayout() {
  const location = useLocation();
  const [hasInitialBooted, setHasInitialBooted] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-vexo-red selection:text-white flex flex-col transition-colors duration-300">
      {!hasInitialBooted && (
        <VexoLogoLoader
          currentPath={location.pathname}
          onComplete={() => setHasInitialBooted(true)}
        />
      )}
      <Navbar />
      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ThemeTransition />
      <AdminAuthProvider>
        <AdminToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Website Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/music" element={<MusicPage />} />
                <Route path="/artists" element={<ArtistsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:slug" element={<ServiceDetailPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/pre-wedding" element={<PreWeddingPage />} />
                <Route path="/wedding" element={<WeddingPage />} />
                <Route path="/packages" element={<PreWeddingPage />} />
              </Route>

              {/* Admin Authentication Route */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Authenticated Admin CMS Route Namespace */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="artists" element={<AdminArtistsPage />} />
                <Route path="artists/new" element={<AdminArtistFormPage />} />
                <Route path="artists/:id/edit" element={<AdminArtistFormPage />} />
                <Route path="music" element={<AdminMusicPage />} />
                <Route path="albums/:id" element={<AdminMusicPage />} />
                <Route path="videos" element={<AdminVideosPage />} />
                <Route path="videos/new" element={<AdminVideoFormPage />} />
                <Route path="videos/:id/edit" element={<AdminVideoFormPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="events/new" element={<AdminEventFormPage />} />
                <Route path="events/:id/edit" element={<AdminEventFormPage />} />
                <Route path="services" element={<AdminServicesPage />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="enquiries" element={<AdminInquiriesPage />} />
                <Route path="inquiries" element={<AdminInquiriesPage />} />
                <Route path="homepage" element={<AdminHomepagePage />} />
                <Route path="pre-wedding" element={<AdminPreWeddingPage />} />
                <Route path="wedding" element={<AdminWeddingPage />} />
                <Route path="site-settings" element={<AdminSiteSettingsPage />} />
                <Route path="footer" element={<AdminFooterPage />} />
                <Route path="activity-logs" element={<AdminActivityLogsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AdminToastProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

export default App;
