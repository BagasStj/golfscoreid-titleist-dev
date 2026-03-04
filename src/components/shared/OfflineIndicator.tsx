import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setShowOffline(false);
    };

    const handleOffline = () => {
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 text-center animate-slide-down">
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg">⚠</span>
        <p className="text-sm font-medium">
          You are offline. Some features may not be available.
        </p>
      </div>
    </div>
  );
}
