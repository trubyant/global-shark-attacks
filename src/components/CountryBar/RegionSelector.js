// src/components/CountryBar/RegionSelector.js
import React, { useState } from 'react';

export function RegionSelector({ 
  displayMode, 
  onDisplayModeChange, 
  customCountries, 
  onCustomCountriesChange,
  countriesInRange,
  countryCounts,
  sortOrder,
  onSortOrderChange
}) {
  // search term for filtering countries
  const [searchTerm, setSearchTerm] = useState('');
  
  // -----------------------------
  // event handlers
  // -----------------------------
  // toggle a country selection in custom mode
  const toggleCountry = (country) => {
    if (customCountries.includes(country)) {
      onCustomCountriesChange(customCountries.filter(c => c !== country));
    } else if (customCountries.length < 10) {
      onCustomCountriesChange([...customCountries, country]);
    }
  };
  
  // filter countries for display in the selection list, applying the search filter
  const filteredCountries = countriesInRange
    .filter(country => country.toLowerCase().includes(searchTerm.toLowerCase()));
  
  return (
    <div className="option-group">
      <h4>Locations</h4>
      
      {/* -----------------------------
          display mode radio buttons
          ----------------------------- */}
      <div className="radio-options">
        <div className="radio-option">
          <input
            type="radio"
            id="top5"
            name="displayMode"
            value="top5"
            checked={displayMode === 'top5'}
            onChange={() => onDisplayModeChange('top5')}
          />
          <label htmlFor="top5">Top 5</label>
        </div>
        <div className="radio-option">
          <input
            type="radio"
            id="top10"
            name="displayMode"
            value="top10"
            checked={displayMode === 'top10'}
            onChange={() => onDisplayModeChange('top10')}
          />
          <label htmlFor="top10">Top 10</label>
        </div>
        <div className="radio-option">
          <input
            type="radio"
            id="top15"
            name="displayMode"
            value="top15"
            checked={displayMode === 'top15'}
            onChange={() => onDisplayModeChange('top15')}
          />
          <label htmlFor="top15">Top 15</label>
        </div>
        <div className="radio-option">
          <input
            type="radio"
            id="custom"
            name="displayMode"
            value="custom"
            checked={displayMode === 'custom'}
            onChange={() => onDisplayModeChange('custom')}
          />
          <label htmlFor="custom">Custom</label>
        </div>
      </div>
      
      {/* -----------------------------
          custom country selection UI, only shown in custom mode
          ----------------------------- */}
      {displayMode === 'custom' && (
        <div className="custom-selection">
          <div className="selection-header">
            <div className="selection-count">
              {customCountries.length} selected (max 10)
            </div>
            {customCountries.length > 0 && (
              <button 
                className="deselect-all-button" 
                onClick={() => onCustomCountriesChange([])}
                title="Deselect all countries"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* sort button */}
          <button 
            onClick={() => onSortOrderChange(sortOrder === 'alphabetical' ? 'count' : 'alphabetical')}
            className="sort-button"
          >
            Sort by: {sortOrder === 'alphabetical' ? 'Alphabetical' : 'Attack Count'}
          </button>
          
          {/* search input */}
          <div className="search-input">
            <input 
              type="text" 
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* country list */}
          <div className="countries-container">
            {filteredCountries.length > 0 ? (
              filteredCountries.map(country => (
                <div 
                  key={country} 
                  className={`country-item ${customCountries.includes(country) ? 'selected' : ''}`}
                  onClick={() => toggleCountry(country)}
                >
                  <div className="country-name">
                    {customCountries.includes(country) && (
                      <span className="checkmark">✓</span>
                    )}
                    <span>{country}</span>
                  </div>
                  <span className="country-count">{countryCounts[country] || 0}</span>
                </div>
              ))
            ) : (
              <div className="no-results">No matching countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}