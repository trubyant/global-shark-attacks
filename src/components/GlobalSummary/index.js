// src/components/GlobalSummary/index.js
import React, { useState, useEffect } from 'react';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { DateRangePicker } from '../shared/DateRangePicker';
import { RegionSelector } from '../shared/RegionSelector';
import { SummaryBoxes } from './SummaryBoxes';
import { FatalityPieChart } from './FatalityPieChart';
import { CountryPieChart } from './CountryPieChart';
import { TimeSeriesChart } from './TimeSeriesChart';
import sharkData from '../../data/clean_shark_attacks_data.json';

export function GlobalSummaryChart() {
  // -----------------------------
  // state management with session storage
  // -----------------------------
  // date range for filtering data
  const [dateRange, setDateRange] = useSessionStorage(
    'globalSummaryDateRange', 
    { start: 1900, end: 2023 }
  );
  
  // selected countries for comparison
  const [selectedCountries, setSelectedCountries] = useSessionStorage(
    'globalSummaryCountries',
    []
  );
  
  // sorting method for country display
  const [sortOrder, setSortOrder] = useSessionStorage(
    'globalSummarySortOrder',
    'count'
  );
  
  // -----------------------------
  // derived state from processed data
  // -----------------------------
  // list of all available countries
  const [allCountries, setAllCountries] = useState([]);
  
  // object containing count data for each country
  const [countryCounts, setCountryCounts] = useState({});
  
  // summary statistics
  const [totalReports, setTotalReports] = useState(0);
  const [fatalPercentage, setFatalPercentage] = useState(0);
  const [topRegionPercentage, setTopRegionPercentage] = useState(0);
  const [topRegionName, setTopRegionName] = useState("USA");
  
  // chart data
  const [fatalData, setFatalData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  
  // -----------------------------
  // data processing based on date range
  // -----------------------------
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

    // calculate total reports
    setTotalReports(parsedData.length);
    
    // -----------------------------
    // process fatality data for pie chart
    // -----------------------------
    const fatalCount = parsedData.filter(d => d.Fatal === true).length;
    const nonFatalCount = parsedData.filter(d => d.Fatal === false).length;
    const unknownCount = parsedData.length - fatalCount - nonFatalCount;
    
    setFatalData([
      { name: "FATAL", value: fatalCount },
      { name: "NON-FATAL", value: nonFatalCount },
      { name: "UNKNOWN", value: unknownCount }
    ]);
    
    setFatalPercentage(((fatalCount / parsedData.length) * 100).toFixed(1));
    
    // -----------------------------
    // process country data for charts
    // -----------------------------
    const counts = {};
    
    parsedData.forEach(d => {
      if (!d.Country) return;
      
      // initialize country data if it doesn't exist
      if (!counts[d.Country]) {
        counts[d.Country] = {
          total: 0,
          yearlyData: {},
          fatal: 0,
          nonFatal: 0,
          unknown: 0
        };
      }
      
      counts[d.Country].total += 1;
      
      // track fatality status
      if (d.Fatal === true) {
        counts[d.Country].fatal += 1;
      } else if (d.Fatal === false) {
        counts[d.Country].nonFatal += 1;
      } else {
        counts[d.Country].unknown += 1;
      }
      
      // track yearly data for line chart
      if (d.Date) {
        const year = d.Date.getFullYear();
        if (!counts[d.Country].yearlyData[year]) {
          counts[d.Country].yearlyData[year] = 0;
        }
        counts[d.Country].yearlyData[year] += 1;
      }
    });
    
    // -----------------------------
    // add global option
    // -----------------------------
    const globalYearlyData = {};
    parsedData.forEach(d => {
      if (d.Date) {
        const year = d.Date.getFullYear();
        if (!globalYearlyData[year]) {
          globalYearlyData[year] = 0;
        }
        globalYearlyData[year] += 1;
      }
    });
    
    counts["GLOBAL"] = {
      total: parsedData.length,
      yearlyData: globalYearlyData,
      fatal: fatalCount,
      nonFatal: nonFatalCount,
      unknown: unknownCount
    };
    
    setCountryCounts(counts);
    
    // -----------------------------
    // prepare top country data for country pie chart
    // -----------------------------
    const allCountriesData = Object.entries(counts)
      .filter(([country]) => country !== "GLOBAL")
      .map(([country, data]) => ({ name: country, value: data.total }))
      .sort((a, b) => b.value - a.value);
    
    const totalAttacks = parsedData.length;
    // filter for countries with at least 5% of attacks
    const significantCountries = allCountriesData.filter(
      country => (country.value / totalAttacks) * 100 >= 5
    );
    // sum the values of countries with less than 5% for "Others" category
    const otherCountriesSum = allCountriesData
      .filter(country => (country.value / totalAttacks) * 100 < 5)
      .reduce((sum, item) => sum + item.value, 0);

    const finalCountryData = [...significantCountries];
    // add "Others" category if there are countries with less than 5%
    if (otherCountriesSum > 0) {
      finalCountryData.push({ 
        name: "OTHERS", 
        value: otherCountriesSum
      });
    }
    
    setCountryData(finalCountryData);
    
    // -----------------------------
    // find the top region and its percentage
    // -----------------------------
    if (allCountriesData.length > 0) {
      const topRegion = allCountriesData[0];
      const topRegPercent = ((topRegion.value / parsedData.length) * 100).toFixed(1);
      setTopRegionPercentage(topRegPercent);
      setTopRegionName(topRegion.name);
    }
    
    // -----------------------------
    // sort countries by selected order
    // -----------------------------
    let countries = Object.keys(counts).filter(Boolean);
    countries = sortOrder === 'alphabetical' 
      ? countries.sort() 
      : countries.sort((a, b) => counts[b].total - counts[a].total);
    
    setAllCountries(countries);
    
  }, [dateRange, sortOrder]);
  
  return (
    <div className="summary-visualization-container">
      {/* date range picker at the top */}
      <DateRangePicker 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        className="top-date-range-controls"
      />
      
      {/* -----------------------------
          summary statistics and pie charts
          ----------------------------- */}
      <div className="summary-boxes">
        <SummaryBoxes 
          totalReports={totalReports}
          dateRange={dateRange}
        />

        <CountryPieChart 
          countryData={countryData}
          topRegionName={topRegionName}
          topRegionPercentage={topRegionPercentage}
        />
        
        <FatalityPieChart 
          fatalData={fatalData}
          fatalPercentage={fatalPercentage}
        />
      </div>
      
      {/* -----------------------------
          countries selection for time series chart
          ----------------------------- */}
      <RegionSelector 
        title="Display Locations"
        regions={allCountries}
        selectedRegions={selectedCountries}
        onSelectionChange={setSelectedCountries}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        regionCounts={countryCounts}
        className="countries-selection-bar"
      />
      
      {/* -----------------------------
          time series chart
          ----------------------------- */}
      <TimeSeriesChart 
        dateRange={dateRange}
        selectedCountries={selectedCountries}
        countryCounts={countryCounts}
      />
    </div>
  );
}