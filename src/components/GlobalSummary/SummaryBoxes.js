// src/components/GlobalSummary/SummaryBoxes.js
import React from 'react';

export function SummaryBoxes({ totalReports, dateRange }) {
  return (
    <div className="total-reports-box">
      <div className="reports-number">{totalReports}</div>
      <div className="reports-label">
        Attacks reported
        <br />
        {dateRange.start} - {dateRange.end}
      </div>
    </div>
  );
}