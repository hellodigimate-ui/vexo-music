import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = React.useState(false);

  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setTimedOut(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading && !timedOut) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#08080a] flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-vexo-red border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(224,0,0,0.3)]" />
          <span className="text-xs font-mono font-bold tracking-widest text-slate-500 dark:text-zinc-400 uppercase">
            VERIFYING VEXO CREDENTIALS...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || timedOut) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
