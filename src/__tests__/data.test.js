// src/__tests__/data.test.js
import sharkData from '../data/clean_shark_attacks_data.json';

describe('Shark Attack Dataset', () => {
  test('data is an array with entries', () => {
    expect(Array.isArray(sharkData)).toBe(true);
    expect(sharkData.length).toBeGreaterThan(0);
  });

  test('data contains expected fields', () => {
    const sampleEntry = sharkData[0];
    expect(sampleEntry).toHaveProperty('Date');
    expect(sampleEntry).toHaveProperty('Country');
    expect(sampleEntry).toHaveProperty('Fatal');
  });

  test('contains data from expected date range', () => {
    const years = sharkData
      .filter(entry => entry.Date)
      .map(entry => new Date(entry.Date).getFullYear());
    
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    expect(minYear).toBeGreaterThanOrEqual(1900);
    expect(maxYear).toBeLessThanOrEqual(2023);
  });

  test('contains major countries in the dataset', () => {
    const countries = new Set(sharkData.map(entry => entry.Country));
    expect(countries.has('USA')).toBe(true);
    expect(countries.has('AUSTRALIA')).toBe(true);
  });
});