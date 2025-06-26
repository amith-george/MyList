'use client';

import { useEffect, useState } from 'react';
import Loader from './Loader';

export default function StartupLoader({ children }: { children: React.ReactNode }) {
  const [pinged, setPinged] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timeoutTriggered = false;

    const timeout = setTimeout(() => {
      timeoutTriggered = true;
      setShowLoader(true); // Show loader if backend is slow
    }, 1000); // Grace period (tweak as needed)

    const pingBackend = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/status/ping`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.status === 'ok') {
          clearTimeout(timeout);
          setPinged(true);
          if (timeoutTriggered) {
            // Loader already showing, keep it up briefly to show final message
            setTimeout(() => setShowLoader(false), 4000);
          } else {
            // Fast ping, skip loader
            setShowLoader(false);
          }
        }
      } catch (error) {
        console.error('Failed to ping backend:', error);
        clearTimeout(timeout);
        setShowLoader(true);
        // Retry until up
        setTimeout(pingBackend, 2000);
      }
    };

    pingBackend();

    // Cleanup timeout on unmount
    return () => clearTimeout(timeout);
  }, []);

  if (showLoader) {
    return <Loader pinged={pinged} />;
  }

  return <>{children}</>;
}
