// src/hooks/useD3Chart.js
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export function useD3Chart(renderFunction, dependencies = []) {
  // create a reference to hold the DOM element
  const ref = useRef();

  // -----------------------------
  // handle d3 rendering and cleanup
  // -----------------------------
  useEffect(() => {
    // only proceed if the ref has been attached to a DOM element
    if (!ref.current) return;
    
    // clear any existing chart elements before redrawing
    d3.select(ref.current).selectAll("*").remove();
    
    // store ref.current to avoid closure issues during cleanup
    const currentRef = ref.current;
    
    // call the provided render function with the d3-selected element
    renderFunction(d3.select(currentRef));
    
    // cleanup function to remove chart when component unmounts or dependencies change
    return () => {
      if (currentRef) {
        d3.select(currentRef).selectAll("*").remove();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]); // spread dependencies to ensure it's an array literal

  // return the ref to be attached to an SVG element
  return ref;
}