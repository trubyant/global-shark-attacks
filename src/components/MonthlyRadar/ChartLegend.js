// src/components/MonthlyRadar/ChartLegend.js
import React from 'react';

export function ChartLegend({ selectedRegions, activeRegions, toggleActiveRegion }) {
  // colors for the regions, matching the CSS variables
  const regionColors = [
    "var(--region-color-0)",  // blue
    "var(--region-color-1)",  // orange
    "var(--region-color-2)"   // green
  ];
  
  return (
    <div className="radar-bottom-legend">
      <h4>Legend (Click to show values)</h4>
      <div className="radar-legend-items">
        {/* map over selected regions to create legend items */}
        {selectedRegions.map((region, index) => (
          <div 
            key={region} 
            className={`radar-legend-item ${activeRegions.includes(region) ? 'active' : ''}`}
            onClick={() => toggleActiveRegion(region)}
          >
            <span 
              className="radar-region-color-dot" 
              style={{backgroundColor: regionColors[index % regionColors.length]}}
            >
            </span>
            <span className="radar-region-name">{region}</span>
          </div>
        ))}
      </div>
    </div>
  );
}