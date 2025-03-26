// src/components/CountryBar/YearSlider.js
import React from 'react';

export function YearSlider({ dateRange, currentYear, onYearChange }) {
  // handle the year slider change
  const handleYearChange = (e) => {
    onYearChange(parseInt(e.target.value));
  };
  
  return (
    <div className="time-controls">
      <div className="slider-container">
        {/* year display and step buttons */}
        <div className="time-display">
          <span className="time-label">Year: {currentYear}</span>
          <div className="step-buttons">
            {/* previous year button */}
            <button 
              onClick={() => onYearChange(Math.max(dateRange.start, currentYear - 1))} 
              className="step-button"
            >
              &lt;
            </button>
            {/* next year button */}
            <button 
              onClick={() => onYearChange(Math.min(dateRange.end, currentYear + 1))} 
              className="step-button"
            >
              &gt;
            </button>
          </div>
        </div>
        
        {/* year slider input */}
        <input
          type="range"
          min={dateRange.start}
          max={dateRange.end}
          value={currentYear}
          onChange={handleYearChange}
          className="slider"
        />
      </div>
    </div>
  );
}