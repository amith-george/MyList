import React, { useState, useEffect } from 'react';
import '../../styles/components/SiteLoader.css';

const SiteLoader = () => {
  const messages = [
    "Loading...",
    "Fetching TMDb Database...",
    "Fetching User Details...",
    "Loading your Personal Lists...",
    "Making the Final Changes..."
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 4000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="terminal-loader">
      <div className="terminal-header">
        <div className="terminal-title">Status</div>
        <div className="terminal-controls">
          <div className="control close"></div>
          <div className="control minimize"></div>
          <div className="control maximize"></div>
        </div>
      </div>
      <div className="text">{messages[currentMessageIndex]}</div>
    </div>
  );
};

export default SiteLoader;
