// src/hooks/useSessionStorage.js
import { useState, useEffect } from 'react';

export function useSessionStorage(key, initialValue) {
  // -----------------------------
  // initialize state from session storage or use default value
  // -----------------------------
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // attempt to get stored value from sessionStorage
      const item = sessionStorage.getItem(key);
      // return parsed stored value if exists, otherwise use initial value
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // if error occurs (e.g., invalid JSON), log and return initial value
      console.error(error);
      return initialValue;
    }
  });

  // -----------------------------
  // update session storage when storedValue changes
  // -----------------------------
  useEffect(() => {
    try {
      // stringify and store value in sessionStorage
      sessionStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      // log any errors that occur during storage
      console.error(error);
    }
  }, [key, storedValue]);

  // return state value and setter as array
  return [storedValue, setStoredValue];
}