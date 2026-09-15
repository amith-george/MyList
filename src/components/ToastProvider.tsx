'use client';

import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function ToastProvider() {
  const [position, setPosition] = useState<'top-center' | 'top-right'>('top-center');

  useEffect(() => {
    const updatePosition = () => {
      setPosition(window.innerWidth >= 768 ? 'top-right' : 'top-center');
    };
    
    // Set initial position
    updatePosition();
    
    // Listen for window resize
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  return (
    <Toaster 
      position={position} 
      toastOptions={{
        style: { 
          background: '#18181b', // zinc-900
          color: '#fff',
          border: '1px solid #27272a', // zinc-800
        },
        success: {
          iconTheme: {
            primary: '#16a34a', // green-600
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#dc2626', // red-600
            secondary: '#fff',
          },
        },
      }} 
    />
  );
}
