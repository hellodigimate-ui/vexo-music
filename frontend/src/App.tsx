import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar, Footer } from './components/layout';
import { ScrollToTop } from './components/common/ScrollToTop';

import { HomePage } from './pages/HomePage';
import { MusicPage } from './pages/MusicPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { ServicesPage } from './pages/ServicesPage';
import { EventsPage } from './pages/EventsPage';
import { VideosPage } from './pages/VideosPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

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
import { AdminActivityLogsPage } from './admin/pages/AdminActivityLogsPage';
import { AdminUsersPage } from './admin/pages/AdminUsersPage';

// Theme Experience System
import { ThemeProvider, ThemeTransition } from './components/theme';

function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-vexo-red selection:text-white flex flex-col transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Outlet />
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
              <Route path="/events" element={<EventsPage />} />
              <Route path="/videos" element={<VideosPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
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
              <Route path="site-settings" element={<AdminSiteSettingsPage />} />
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
