// src/components/shared/RegionSelector.js
import React, { useState } from 'react';

export function RegionSelector({
  title = "Display Locations",
  regions = [],
  selectedRegions = [],
  onSelectionChange,
  maxSelections = 3,
  sortOrder = 'count',
  onSortOrderChange,
  regionCounts = {},
  className = "",
  searchPlaceholder = "Search locations..."
}) {
  // -----------------------------
  // local state
  // -----------------------------
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // filter regions based on search term and whether they're already selected
  const filteredRegions = regions
    .filter(region => !selectedRegions.includes(region))
    .filter(region => region.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // toggle a region selection, add or remove from selected list
  const toggleRegion = (region) => {
    if (selectedRegions.includes(region)) {
      onSelectionChange(selectedRegions.filter(r => r !== region));
    } else if (selectedRegions.length < maxSelections) {
      onSelectionChange([...selectedRegions, region]);
    }
  };

  return (
    <div className={`region-selector-container ${className}`}>
      <div className="selection-inner">
        <h4>{title}</h4>
        
        {/* sorting control button */}
        <div className="sort-control">
          <button 
            onClick={() => onSortOrderChange(sortOrder === 'alphabetical' ? 'count' : 'alphabetical')}
            className="sort-button"
          >
            Sort by: {sortOrder === 'alphabetical' ? 'Alphabetical' : 'Attack Count'}
          </button>
        </div>
        
        {/* display selected regions as tags */}
        <div className="selected-regions">
          {selectedRegions.map((region, index) => (
            <div key={region} className="selected-region-tag">
              <span 
                className="region-color-dot" 
                style={{backgroundColor: `var(--region-color-${index % 3})`}}
              ></span>
              <span className="region-name">{region}</span>
              <button 
                className="remove-region-button" 
                onClick={() => toggleRegion(region)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        {/* show search box if we haven't reached max selections */}
        {selectedRegions.length < maxSelections && (
          <div className="region-selector">
            <div className="search-box">
              <input 
                type="text" 
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              />
            </div>
            
            {/* dropdown list of available regions */}
            {showDropdown && (
              <div className="region-list">
                {filteredRegions.length > 0 ? (
                  filteredRegions.map(region => (
                    <div 
                      key={region} 
                      className="region-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        toggleRegion(region);
                        setSearchTerm('');
                      }}
                    >
                      <span>{region}</span>
                      <span className="region-count">
                        {regionCounts[region]?.total || regionCounts[region] || 0}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No matching regions found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}