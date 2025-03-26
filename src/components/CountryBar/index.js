// src/components/CountryBar/index.js
import React, { useState, useEffect } from 'react';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { DateRangePicker } from '../shared/DateRangePicker';
import { BarChart } from './BarChart';
import { YearSlider } from './YearSlider';
import { RegionSelector } from './RegionSelector';
import sharkData from '../../data/clean_shark_attacks_data.json';

export function CountryBarChart() {
  // -----------------------------
  // state management
  // -----------------------------
  // date range for filtering data
  const [dateRange, setDateRange] = useSessionStorage(
    'countryBarDateRange',
    { start: 1900, end: 2023 }
  );
  
  // current year for the time slider
  const [currentYear, setCurrentYear] = useSessionStorage(
    'countryBarCurrentYear',
    1900
  );
  
  // display mode for countries (top5, top10, top15, or custom)
  const [displayMode, setDisplayMode] = useSessionStorage(
    'countryBarDisplayMode',
    'top15'
  );
  
  // selected countries when in custom mode
  const [customCountries, setCustomCountries] = useSessionStorage(
    'countryBarCustomCountries',
    []
  );
  
  // all available countries from the dataset
  const [, setAllCountries] = useState([]);
  
  // countries that have data within the selected date range
  const [countriesInRange, setCountriesInRange] = useState([]);
  
  // sorting method for country display (alphabetical or by count)
  const [sortOrder, setSortOrder] = useSessionStorage(
    'countryBarSortOrder',
    'count'
  );
  
  // object containing count of attacks by country
  const [countryCounts, setCountryCounts] = useState({});
  
  // -----------------------------
  // process data when date range changes
  // -----------------------------
  useEffect(() => {
    // convert dates to javascript date objects
    const parsedData = sharkData.map(d => ({
      ...d,
      Date: d.Date ? new Date(d.Date) : null
    }));

    // get all countries from the dataset
    const countries = [...new Set(sharkData.map(d => d.Country))]
      .filter(Boolean)
      .sort();
    
    setAllCountries(countries);
    
    // filter data to only include attacks within the selected date range
    const dataInRange = parsedData.filter(d => {
      if (!d.Date) return false;
      const attackYear = d.Date.getFullYear();
      return attackYear >= dateRange.start && attackYear <= dateRange.end;
    });
    
    // count attacks by country for sorting purposes
    const countryCounts = {};
    dataInRange.forEach(d => {
      if (!d.Country) return;
      countryCounts[d.Country] = (countryCounts[d.Country] || 0) + 1;
    });
    
    setCountryCounts(countryCounts);
    
    // get countries that have data in the selected date range
    let countriesWithData = [...new Set(dataInRange.map(d => d.Country))]
      .filter(Boolean);
    
    // sort based on user selection
    if (sortOrder === 'count') {
      countriesWithData = countriesWithData.sort((a, b) => 
        (countryCounts[b] || 0) - (countryCounts[a] || 0)
      );
    } else {
      countriesWithData = countriesWithData.sort();
    }
    
    setCountriesInRange(countriesWithData);
    
    // reset custom countries if they're not in the new range
    setCustomCountries(prev => prev.filter(c => countriesWithData.includes(c)));
    
    // reset the year to the start of the range if it's outside the new range
    if (currentYear < dateRange.start || currentYear > dateRange.end) {
      setCurrentYear(dateRange.start);
    }
    
  }, [dateRange, sortOrder, currentYear, setCurrentYear, setCustomCountries]);

  return (
    <div className="visualization-container">
      {/* -----------------------------
          main chart area
          ----------------------------- */}
      <div className="chart-container">
        <h2>Cummulative Attacks by Location with Fatality Breakdown ({dateRange.start} - {currentYear})</h2>
        {/*<h2>Attacks by Location with Fatality Breakdown ({dateRange.start} - {dateRange.end}, through {currentYear})</h2> */}
        {/* bar chart showing attack counts by country */}
        <BarChart 
          dateRange={dateRange}
          currentYear={currentYear}
          displayMode={displayMode}
          customCountries={customCountries}
        />
        
        {/* year slider for time navigation */}
        <YearSlider 
          dateRange={dateRange}
          currentYear={currentYear}
          onYearChange={setCurrentYear}
        />
      </div>
      
      {/* -----------------------------
          chart options sidebar
          ----------------------------- */}
      <div className="sidebar">
        <div className="options-section">
          <h3>Chart Options</h3>
          
          {/* date range selector */}
          <DateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          
          {/* region/country selector */}
          <RegionSelector 
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            customCountries={customCountries}
            onCustomCountriesChange={setCustomCountries}
            countriesInRange={countriesInRange}
            countryCounts={countryCounts}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
        </div>
      </div>
    </div>
  );
}