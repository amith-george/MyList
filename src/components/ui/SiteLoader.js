import React, { useState } from 'react';
import '../../styles/components/SiteLoader.css';

const SiteLoader = () => {
  const messages = [
    "Fetching TMDb Database...",
    "Fetching User Details...",
    "Loading Personal Lists...",
    "Making the Final Changes..."
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const handleAnimationEnd = () => {
    // When the animation ends, switch to the next message.
    setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
  };

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
      {/* The text is now absolutely centered in the terminal */}
      <div 
        className="text" 
        key={currentMessageIndex}
        onAnimationEnd={handleAnimationEnd}
      >
        {messages[currentMessageIndex]}
      </div>
    </div>
  );
};

export default SiteLoader;
