import React, { useEffect, useState } from 'react';
import '../styles/LoadingScreen.css';

function LoadingScreen({ onLoadingComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onLoadingComplete();
    }, 3000); // Loading screen akan muncul selama 3 detik

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className="loading-screen">
      <img src="/image/motor.png" alt="Loading" className="loading-image" />
    </div>
  );
}

export default LoadingScreen;
