import React from 'react';
import { ReactComponent as RightArrow } from '../../assets/arrow-right.svg';
import { ReactComponent as LeftArrow } from '../../assets/arrow-left.svg';
import '../../styles/components/ScrollArrow.css';

const ScrollArrow = ({ direction, onClick, visible = true }) => {
    return (
      <button 
        className={`scroll-arrow ${direction} ${!visible ? 'hidden' : ''}`}
        onClick={onClick}
        aria-label={`Scroll ${direction}`}
      >
        {direction === 'right' ? (
          <RightArrow className="arrow-icon" />
        ) : (
          <LeftArrow className="arrow-icon" />
        )}
      </button>
    );
  };

export default ScrollArrow;