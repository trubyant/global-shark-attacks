// src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// mock the visualization components
jest.mock('./components/GlobalSummary', () => ({
  GlobalSummaryChart: () => <div data-testid="global-summary">Global Summary Mock</div>
}));

jest.mock('./components/CountryBar', () => ({
  CountryBarChart: () => <div data-testid="country-bar">Country Bar Mock</div>
}));

jest.mock('./components/MonthlyRadar', () => ({
  MonthlyRadarChart: () => <div data-testid="monthly-radar">Monthly Radar Mock</div>
}));

// import App
import App from './App';

test('App renders with tab navigation', () => {
  render(<App />);
  expect(screen.getByText('Interactive Explorer of Global Shark Attack Data')).toBeInTheDocument();
  
  // verify that we have tab buttons
  expect(screen.getByText('Global Summary')).toBeInTheDocument();
  expect(screen.getByText('Fatality by Location')).toBeInTheDocument();
  expect(screen.getByText('Monthly Patterns')).toBeInTheDocument();
});