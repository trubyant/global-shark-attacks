// src/components/shared/DateRangePicker.js
import React, { useState } from 'react';

export function DateRangePicker({ 
  dateRange, 
  onDateRangeChange, 
  minYear = 1900, 
  maxYear = 2023,
  className = ""
}) {
  // -----------------------------
  // local state for input fields and validation
  // -----------------------------
  const [startYearInput, setStartYearInput] = useState(dateRange.start.toString());
  const [endYearInput, setEndYearInput] = useState(dateRange.end.toString());
  const [yearInputError, setYearInputError] = useState('');
  
  // handle applying date range with validation
  const applyDateRange = () => {
    const start = parseInt(startYearInput);
    const end = parseInt(endYearInput);
    
    // validate that inputs are valid numbers
    if (isNaN(start) || isNaN(end)) {
      setYearInputError('Please enter valid years');
      return;
    }
    
    // validate start year is within allowed range
    if (start < minYear || start > maxYear) {
      setYearInputError(`Start year must be between ${minYear} and ${maxYear}`);
      return;
    }
    
    // validate end year is within allowed range
    if (end < minYear || end > maxYear) {
      setYearInputError(`End year must be between ${minYear} and ${maxYear}`);
      return;
    }
    
    // validate end year is not before start year
    if (end < start) {
      setYearInputError('End year must be greater than or equal to start year');
      return;
    }
    
    // if all validations pass, apply the date range
    onDateRangeChange({ start, end });
    setYearInputError(''); // clear any previous errors
  };

  return (
    <div className={`date-range-controls ${className}`}>
      <div className="date-range-controls-inner">
        <h4>Date Range</h4>
        <div className="date-range-inputs">
          {/* start year input */}
          <div className="year-input">
            <label htmlFor="start-year">From:</label>
            <input
              type="number"
              id="start-year"
              min={minYear}
              max={maxYear}
              value={startYearInput}
              onChange={(e) => setStartYearInput(e.target.value)}
            />
          </div>
          
          {/* end year input */}
          <div className="year-input">
            <label htmlFor="end-year">To:</label>
            <input
              type="number"
              id="end-year"
              min={minYear}
              max={maxYear}
              value={endYearInput}
              onChange={(e) => setEndYearInput(e.target.value)}
            />
          </div>
          
          {/* apply button */}
          <button 
            onClick={applyDateRange}
            className="apply-button"
          >
            Apply
          </button>
        </div>
        
        {/* error message, only shown when there's an error */}
        {yearInputError && <div className="error-message">{yearInputError}</div>}
      </div>
    </div>
  );
}