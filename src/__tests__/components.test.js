// src/__tests__/components.test.js
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { SummaryBoxes } from '../components/GlobalSummary/SummaryBoxes';
import { AboutApp } from '../components/AboutApp';

describe('Component Rendering', () => {
  test('SummaryBoxes displays correct count and date range', () => {
    render(<SummaryBoxes totalReports={100} dateRange={{start: 2000, end: 2010}} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/2000 - 2010/)).toBeInTheDocument();
  });

  test('AboutApp modal renders correctly when open', () => {
    render(<AboutApp isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('About the App')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('How to Use')).toBeInTheDocument();
  });

  test('AboutApp modal does not render when closed', () => {
    render(<AboutApp isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('About the App')).not.toBeInTheDocument();
  });
});