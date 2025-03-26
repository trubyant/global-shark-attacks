// src/components/MonthlyRadar/index.js
import React, { useState, useEffect, useRef } from 'react';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { DateRangePicker } from '../shared/DateRangePicker';
import { RegionSelector } from '../shared/RegionSelector';
import { RadarChart } from './RadarChart';
import { ZoomControls } from './ZoomControls';
import { ChartLegend } from './ChartLegend';
import sharkData from '../../data/clean_shark_attacks_data.json';

export function MonthlyRadarChart() {
  // -----------------------------
  // state management with session storage
  // -----------------------------
  // date range for filtering data
  const [dateRange, setDateRange] = useSessionStorage(
    'monthlyRadarDateRange',
    { start: 1900, end: 2023 }
  );
  
  // selected regions for comparison
  const [selectedRegions, setSelectedRegions] = useSessionStorage(
    'monthlyRadarSelectedRegions',
    []
  );
  
  // all available regions from the dataset
  const [allRegions, setAllRegions] = useState([]);
  
  // count of attacks by region
  const [regionCounts, setRegionCounts] = useState({});
  
  // sorting method for region display
  const [sortOrder, setSortOrder] = useSessionStorage(
    'monthlyRadarSortOrder',
    'alphabetical'
  );
  
  // zoom level for radar chart
  const [zoom, setZoom] = useSessionStorage(
    'monthlyRadarZoom',
    1
  );
  
  // position of radar chart (for panning)
  const [chartPosition, setChartPosition] = useSessionStorage(
    'monthlyRadarChartPosition',
    { x: 0, y: 0 }
  );
  
  // regions that are active (showing values)
  const [activeRegions, setActiveRegions] = useSessionStorage(
    'monthlyRadarActiveRegions',
    []
  );
  
  // ref to store the current chart position without triggering re-renders
  const chartPositionRef = useRef(chartPosition);
  
  // -----------------------------
  // data processing
  // -----------------------------
  // load regions and count attacks for each
  useEffect(() => {
    // parse dates and filter by date range
    const parsedData = sharkData.map(d => ({
      ...d,
      Date: d.Date ? new Date(d.Date) : null
    })).filter(d => {
      if (!d.Date) return false;
      const attackYear = d.Date.getFullYear();
      return attackYear >= dateRange.start && attackYear <= dateRange.end;
    });

    // count attacks by region
    const counts = {};
    parsedData.forEach(d => {
      if (!d.Country) return;
      counts[d.Country] = (counts[d.Country] || 0) + 1;
    });
    
    // calculate total for GLOBAL option
    const globalTotal = parsedData.length;
    counts["GLOBAL"] = globalTotal;
    
    setRegionCounts(counts);
    
    // sort regions based on selected order
    let regions = Object.keys(counts).filter(Boolean);
    regions = sortOrder === 'alphabetical' 
      ? regions.sort() 
      : regions.sort((a, b) => counts[b] - counts[a]);
    
    setAllRegions(regions);
  }, [dateRange, sortOrder]);
  
  // update ref when state changes
  useEffect(() => {
    chartPositionRef.current = chartPosition;
  }, [chartPosition]);
  
  // -----------------------------
  // event handlers
  // -----------------------------
  // reset zoom level and position
  const resetView = () => {
    setZoom(1);
    setChartPosition({ x: 0, y: 0 });
    chartPositionRef.current = { x: 0, y: 0 }; // also reset the ref
  };
  
  // toggle region in active regions list (for legend)
  const toggleActiveRegion = (region) => {
    setActiveRegions(prev => {
      if (prev.includes(region)) {
        return prev.filter(r => r !== region);
      } else {
        return [...prev, region];
      }
    });
  };
  
  return (
    <div className="radar-visualization-container">
      {/* -----------------------------
          main chart area
          ----------------------------- */}
      <div className="radar-chart-container">
        <div className="radar-chart-wrapper">
          <RadarChart 
            dateRange={dateRange}
            selectedRegions={selectedRegions}
            zoom={zoom}
            chartPosition={chartPosition}
            chartPositionRef={chartPositionRef}
            setChartPosition={setChartPosition}
            activeRegions={activeRegions}
          />
        </div>
        
        {/* legend for toggling value display, only shown if regions are selected */}
        {selectedRegions.length > 0 && (
          <ChartLegend 
            selectedRegions={selectedRegions}
            activeRegions={activeRegions}
            toggleActiveRegion={toggleActiveRegion}
          />
        )}
        
        {/* zoom controls for chart manipulation */}
        <ZoomControls 
          zoom={zoom}
          setZoom={setZoom}
          resetView={resetView}
        />
      </div>
      
      {/* -----------------------------
          options sidebar
          ----------------------------- */}
      <div className="radar-sidebar">
        <div className="radar-options-section">
          <h3>Chart Options</h3>
          
          {/* date range selector */}
          <DateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            className="radar-date-range-controls"
          />
          
          {/* region selector */}
          <RegionSelector 
            title="Locations (maximum of 3)"
            regions={allRegions}
            selectedRegions={selectedRegions}
            onSelectionChange={setSelectedRegions}
            maxSelections={3}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            regionCounts={regionCounts}
            className="radar-region-selector"
            searchPlaceholder="Search locations..."
          />
        </div>
      </div>
    </div>
  );
}