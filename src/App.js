// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { GlobalSummaryChart } from './components/GlobalSummary';
import { CountryBarChart } from './components/CountryBar';
import { MonthlyRadarChart } from './components/MonthlyRadar';
import { AboutApp } from './components/AboutApp';

function App() {
  // -----------------------------
  // state management
  // -----------------------------
  // retrieves active tab from session storage or defaults to global summary
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('activeSharkTab') || 'global-summary';
  });
  
  // tracks whether each visualization has been rendered at least once
  const [hasRenderedGlobal, setHasRenderedGlobal] = useState(false);
  const [hasRenderedCountry, setHasRenderedCountry] = useState(false);
  const [hasRenderedMonthly, setHasRenderedMonthly] = useState(false);
  
  // state for about app modal visibility
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  // -----------------------------
  // effects
  // -----------------------------
  // save active tab to session storage and update render flags
  useEffect(() => {
    // store current tab in session storage
    sessionStorage.setItem('activeSharkTab', activeTab);
    
    // update render flags when their respective tabs are active
    if (activeTab === 'global-summary' && !hasRenderedGlobal) {
      setHasRenderedGlobal(true);
    } else if (activeTab === 'country' && !hasRenderedCountry) {
      setHasRenderedCountry(true);
    } else if (activeTab === 'monthly' && !hasRenderedMonthly) {
      setHasRenderedMonthly(true);
    }
  }, [activeTab, hasRenderedGlobal, hasRenderedCountry, hasRenderedMonthly]);
  
  return (
    <div className="App">
      {/* -----------------------------
          app header with navigation tabs
          ----------------------------- */}
      <header className="App-header">
        <h1>Interactive Explorer of Global Shark Attack Data</h1>
        <div className="header-content">
          <div className="chart-tabs">
            <button 
              className={`chart-tab ${activeTab === 'global-summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('global-summary')}
            >
              Global Summary
            </button>
            <button 
              className={`chart-tab ${activeTab === 'country' ? 'active' : ''}`}
              onClick={() => setActiveTab('country')}
            >
              Fatality by Location
            </button>
            <button 
              className={`chart-tab ${activeTab === 'monthly' ? 'active' : ''}`}
              onClick={() => setActiveTab('monthly')}
            >
              Monthly Patterns
            </button>
          </div>
          
          {/* about app link */}
          <span 
            className="about-app-link"
            onClick={() => setIsAboutOpen(true)}
          >
            About the App
          </span>
        </div>
      </header>
      
      {/* -----------------------------
          main content area with visualization components,
          only render if tabs are active or have been rendered before
          -----------------------------  */}
      <main>
        {/* eslint-disable-next-line no-unused-vars */}
        {/* global summary line chart visualization */}
        <div style={{ display: activeTab === 'global-summary' ? 'block' : 'none' }}>
          {(hasRenderedGlobal || activeTab === 'global-summary') && <GlobalSummaryChart />}
        </div>
        
        {/* country bar chart visualization */}
        <div style={{ display: activeTab === 'country' ? 'block' : 'none' }}>
          {(hasRenderedCountry || activeTab === 'country') && <CountryBarChart />}
        </div>
        
        {/* monthly patterns radar chart visualization */}
        <div style={{ display: activeTab === 'monthly' ? 'block' : 'none' }}>
          {(hasRenderedMonthly || activeTab === 'monthly') && <MonthlyRadarChart />}
        </div>
      </main>
      
      {/* about app modal, conditionally rendered based on isAboutOpen state */}
      <AboutApp 
        isOpen={isAboutOpen} 
        onClose={() => setIsAboutOpen(false)} 
      />
    </div>
  );
}

export default App;