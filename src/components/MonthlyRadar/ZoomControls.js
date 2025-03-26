// src/components/MonthlyRadar/ZoomControls.js
import React from 'react';

export function ZoomControls({ zoom, setZoom, resetView }) {
  return (
    <div className="radar-zoom-controls">
      {/* reset button returns chart to original position and zoom */}
      <button 
        onClick={resetView} 
        className="radar-reset-button"
      >
        Reset View
      </button>
      
      <div className="radar-zoom-buttons">
        {/* zoom out button */}
        <button 
          onClick={() => {
            if (zoom > 0.5) setZoom(prev => Math.max(0.5, prev - 0.2));
          }} 
          className="radar-zoom-button"
        >
          −
        </button>
        
        {/* current zoom level display */}
        <div className="radar-zoom-info">
          Zoom: {Math.round(zoom * 100)}%
        </div>
        
        {/* zoom in button */}
        <button 
          onClick={() => {
            if (zoom < 5) setZoom(prev => Math.min(5, prev + 0.2));
          }} 
          className="radar-zoom-button"
        >
          +
        </button>
      </div>
    </div>
  );
}