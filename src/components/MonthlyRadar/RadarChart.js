// src/components/MonthlyRadar/RadarChart.js
import React from 'react';
import { useD3Chart } from '../../hooks/useD3Chart';
import * as d3 from 'd3';
import sharkData from '../../data/clean_shark_attacks_data.json';

export function RadarChart({ 
  dateRange, 
  selectedRegions, 
  zoom, 
  chartPosition, 
  chartPositionRef,
  setChartPosition, 
  activeRegions 
}) {
  // -----------------------------
  // colors for the regions
  // -----------------------------
  const regionColors = [
    { fill: "var(--region-color-0)", stroke: "#2a5a8a" }, // blue
    { fill: "var(--region-color-1)", stroke: "#ff7f40" }, // orange
    { fill: "var(--region-color-2)", stroke: "#556b2f" }  // green
  ];
  
  const svgRef = useD3Chart((svg) => {
    // -----------------------------
    // chart setup
    // -----------------------------
    const width = 600;
    const height = 600;
    const margin = { top: 70, right: 70, bottom: 70, left: 70 };
    const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2;
    
    // configure svg
    svg.attr("width", width)
       .attr("height", height)
       .attr("viewBox", `0 0 ${width} ${height}`)
       .attr("preserveAspectRatio", "xMidYMid meet")
       .style("cursor", "grab");
    
    // add title at the top
    svg.append("text")
      .attr("class", "radar-chart-title")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text(`Seasonal Patterns: Monthly Attack Distribution (${dateRange.start}-${dateRange.end})`);
    
    // chart container (fixed position, will contain the chart)
    const chartContainer = svg.append("g")
      .attr("class", "radar-chart-container")
      .attr("transform", `translate(${width/2}, ${height/2})`);
    
    // main chart group (will be scaled and dragged)
    const chartGroup = chartContainer.append("g")
      .attr("class", "radar-chart-group")
      .attr("transform", `translate(${chartPosition.x}, ${chartPosition.y}) scale(${zoom})`);
    
    // -----------------------------
    // add drag behavior for panning
    // -----------------------------
    const drag = d3.drag()
      .on("start", function() {
        d3.select(this).style("cursor", "grabbing");
      })
      .on("drag", function(event) {
        // update the position directly in the ref for smooth updates
        chartPositionRef.current.x += event.dx;
        chartPositionRef.current.y += event.dy;
        
        // apply the transform directly without state update during drag
        chartGroup.attr("transform", 
          `translate(${chartPositionRef.current.x}, ${chartPositionRef.current.y}) scale(${zoom})`);
      })
      .on("end", function() {
        // only update state at drag end to avoid re-renders during dragging
        setChartPosition({ 
          x: chartPositionRef.current.x, 
          y: chartPositionRef.current.y 
        });
        d3.select(this).style("cursor", "grab");
      });
    
    svg.call(drag);
    
    // store all month data points for later reference
    const allDataPoints = {};
    
    // if no regions selected, show empty chart with instructions
    if (selectedRegions.length === 0) {
      drawEmptyChart(chartGroup, radius);
      return;
    }
    
    // -----------------------------
    // data processing
    // -----------------------------
    // process data for selected regions
    const monthlyData = processDataForChart(selectedRegions);
    const maxValue = getMaxValue(monthlyData);
    
    // draw chart components
    drawGridAndAxes(chartGroup, radius, maxValue);
    drawRadarPaths(chartGroup, monthlyData, radius, maxValue, allDataPoints);
    
    // show values for active regions
    activeRegions.forEach(region => {
      if (allDataPoints[region]) {
        const regionIndex = selectedRegions.indexOf(region);
        if (regionIndex !== -1) {
          showRegionValues(chartGroup, region, allDataPoints[region], 
            regionColors[regionIndex % regionColors.length]);
        }
      }
    });
    
    // add tooltip if it doesn't exist
    if (!d3.select("body").select(".radar-tooltip").size()) {
      d3.select("body").append("div")
        .attr("class", "radar-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "4px")
        .style("padding", "10px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("z-index", 100);
    }
    
    // -----------------------------
    // helper functions
    // -----------------------------
    // process data for the chart
    function processDataForChart(regions) {
      const monthlyCountsByRegion = {};
      
      // initialize with zeros
      regions.forEach(region => {
        monthlyCountsByRegion[region] = Array(12).fill(0);
      });
      
      // parse dates and filter by date range
      const parsedData = sharkData
        .map(d => ({
          ...d,
          Date: d.Date ? new Date(d.Date) : null
        }))
        .filter(d => {
          if (!d.Date) return false;
          const attackYear = d.Date.getFullYear();
          return attackYear >= dateRange.start && attackYear <= dateRange.end;
        });
      
      // count attacks by month for each selected region
      parsedData.forEach(d => {
        if (!d.Date) return;
        
        const month = d.Date.getMonth();
        
        // for country-specific data
        if (d.Country && regions.includes(d.Country)) {
          monthlyCountsByRegion[d.Country][month]++;
        }
        
        // if GLOBAL is selected, count all attacks by month
        if (regions.includes("GLOBAL")) {
          monthlyCountsByRegion["GLOBAL"][month]++;
        }
      });
      
      return monthlyCountsByRegion;
    }
    
    // get maximum value for scaling
    function getMaxValue(monthlyData) {
      let maxCount = 1;
      Object.values(monthlyData).forEach(monthValues => {
        const regionMax = Math.max(...monthValues);
        if (regionMax > maxCount) maxCount = regionMax;
      });
      
      // round up to next multiple of 5 or appropriate scale
      if (maxCount <= 10) return Math.ceil(maxCount / 2) * 2;
      if (maxCount <= 50) return Math.ceil(maxCount / 5) * 5;
      return Math.ceil(maxCount / 10) * 10;
    }
    
    // draw grid and axis lines
    function drawGridAndAxes(chartGroup, radius, maxValue) {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      
      const angleSlice = (Math.PI * 2) / months.length;
      
      // scale for radius
      const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, maxValue]);
      
      // draw concentric grid circles
      const gridGroup = chartGroup.append("g").attr("class", "radar-grid");
      
      // determine grid step based on max value
      const gridStep = maxValue <= 10 ? 2 :
                       maxValue <= 30 ? 5 : 
                       maxValue <= 60 ? 10 : 
                       maxValue <= 100 ? 20 : 50;
      
      for (let i = gridStep; i <= maxValue; i += gridStep) {
        gridGroup.append("circle")
          .attr("r", rScale(i))
          .style("fill", "none")
          .style("stroke", "#ccc")
          .style("stroke-dasharray", "4 4");
        
        gridGroup.append("text")
          .attr("x", 5)
          .attr("y", -rScale(i))
          .attr("dy", "0.35em")
          .style("font-size", "10px")
          .style("fill", "#666")
          .text(i);
      }
      
      // draw axes (one for each month)
      const axes = gridGroup.selectAll(".radar-axis")
        .data(months)
        .enter()
        .append("g")
        .attr("class", "radar-axis");
      
      // draw axis lines
      axes.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI/2))
        .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI/2))
        .style("stroke", "#ccc")
        .style("stroke-width", "1px");
      
      // add month labels
      axes.append("text")
        .attr("class", "radar-month-label")
        .attr("text-anchor", (d, i) => {
          if (i === 0 || i === 6) return "middle";
          return (i < 6) ? "start" : "end";
        })
        .attr("x", (d, i) => {
          const angle = angleSlice * i - Math.PI/2;
          const labelRadius = radius + 15;
          const x = labelRadius * Math.cos(angle);
          return (i > 0 && i < 6) ? x + 5 : (i > 6) ? x - 5 : x;
        })
        .attr("y", (d, i) => {
          const angle = angleSlice * i - Math.PI/2;
          const labelRadius = radius + 15;
          return labelRadius * Math.sin(angle);
        })
        .attr("dy", (d, i) => {
          if (i === 0) return "-0.7em"; 
          if (i === 6) return "1em";  
          return "0.35em";
        })
        .text(d => d)
        .style("font-size", "12px")
        .style("font-weight", "bold");
    }
    
    // draw the radar paths for selected regions
    function drawRadarPaths(chartGroup, monthlyData, radius, maxValue, allDataPoints) {
      const angleSlice = (Math.PI * 2) / 12;
      
      // scale for radius
      const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, maxValue]);
      
      // create line generator for radar
      const radarLine = d3.lineRadial()
        .angle((d, i) => i * angleSlice)
        .radius(d => rScale(d))
        .curve(d3.curveLinearClosed);
      
      // draw each region's path
      Object.entries(monthlyData).forEach(([region, monthValues], i) => {
        const color = regionColors[i % regionColors.length];
        
        // calculate coordinates for data points
        const dataPoints = monthValues.map((value, month) => ({
          region,
          value,
          month,
          x: rScale(value) * Math.cos(angleSlice * month - Math.PI/2),
          y: rScale(value) * Math.sin(angleSlice * month - Math.PI/2),
          angle: angleSlice * month - Math.PI/2
        }));
        
        // store data points for this region
        allDataPoints[region] = dataPoints;
        
        // draw the path
        chartGroup.append("path")
          .datum(monthValues)
          .attr("class", `radar-path-${i}`)
          .attr("d", radarLine)
          .style("stroke", color.stroke)
          .style("stroke-width", "2px")
          .style("fill", color.fill)
          .style("fill-opacity", 0.5)
          .style("pointer-events", "none");
        
        // add points for non-zero values
        chartGroup.selectAll(`.radar-point-${i}`)
          .data(dataPoints.filter(d => d.value > 0))
          .enter()
          .append("circle")
          .attr("class", `radar-point-${i}`)
          .attr("r", 4)
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .style("fill", color.stroke)
          .style("stroke", "white")
          .style("stroke-width", "1px")
          .style("pointer-events", "all")
          .on("mouseover", function(event, d) {
            const monthNames = [
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ];
            
            d3.select(".radar-tooltip")
              .style("opacity", 0.9)
              .html(`${region}<br>${monthNames[d.month]}: ${d.value} attacks`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            d3.select(".radar-tooltip").style("opacity", 0);
          });
      });
      
      return allDataPoints;
    }
    
    // show values for a specific region
    function showRegionValues(chartGroup, region, dataPoints, color) {
      // add a group for this region's labels
      const labelGroup = chartGroup.append("g")
        .attr("class", `radar-value-labels-${region.replace(/\s+/g, '-')}`);
        
      // get only non-zero data points
      const nonZeroPoints = dataPoints.filter(d => d.value > 0);
      
      // calculate positions for labels to avoid overlap
      const labelPositions = calculateLabelPositions(nonZeroPoints);
      
      // add value labels
      labelGroup.selectAll(".radar-value-label")
        .data(nonZeroPoints)
        .enter()
        .append("text")
        .attr("class", "radar-value-label")
        .attr("x", (d, i) => d.x + labelPositions[i].x)
        .attr("y", (d, i) => d.y + labelPositions[i].y)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("fill", color.stroke)
        .text(d => d.value);
    }
    
    // calculate non-overlapping positions for value labels
    function calculateLabelPositions(points) {
      const positions = [];
      const baseDist = 18;
      
      // first pass: assign initial positions based on angle
      for (let i = 0; i < points.length; i++) {
        const angle = points[i].angle;
        positions.push({ 
          x: baseDist * Math.cos(angle), 
          y: baseDist * Math.sin(angle) 
        });
      }
      
      // second pass: adjust for potential overlaps
      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points.length; j++) {
          if (i === j) continue;
          
          const p1 = {
            x: points[i].x + positions[i].x,
            y: points[i].y + positions[i].y
          };
          
          const p2 = {
            x: points[j].x + positions[j].x,
            y: points[j].y + positions[j].y
          };
          
          // calculate distance between labels
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // if labels are too close, adjust them
          if (distance < 25) {
            const angle = Math.atan2(dy, dx);
            const pushDistance = (25 - distance) / 2 + 5;
            
            positions[i].x += pushDistance * Math.cos(angle);
            positions[i].y += pushDistance * Math.sin(angle);
            positions[j].x -= pushDistance * Math.cos(angle);
            positions[j].y -= pushDistance * Math.sin(angle);
          }
        }
      }
      
      return positions;
    }
    
    // draw empty chart when no regions selected
    function drawEmptyChart(chartGroup, radius) {
      // draw a basic grid with axes
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      
      const angleSlice = (Math.PI * 2) / months.length;
      
      // scale for radius
      const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, 10]);
      
      // draw concentric grid circles
      const gridGroup = chartGroup.append("g").attr("class", "radar-grid");
      
      for (let i = 2; i <= 10; i += 2) {
        gridGroup.append("circle")
          .attr("r", rScale(i))
          .style("fill", "none")
          .style("stroke", "#ccc")
          .style("stroke-dasharray", "4 4");
        
        gridGroup.append("text")
          .attr("x", 5)
          .attr("y", -rScale(i))
          .attr("dy", "0.35em")
          .style("font-size", "10px")
          .style("fill", "#666")
          .text(i);
      }
      
      // draw axes (one for each month)
      const axes = gridGroup.selectAll(".radar-axis")
        .data(months)
        .enter()
        .append("g")
        .attr("class", "radar-axis");
      
      // draw axis lines
      axes.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI/2))
        .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI/2))
        .style("stroke", "#ccc")
        .style("stroke-width", "1px");
      
      // add month labels
      axes.append("text")
        .attr("text-anchor", (d, i) => {
          if (i === 0 || i === 6) return "middle";
          return (i < 6) ? "start" : "end";
        })
        .attr("x", (d, i) => {
          const angle = angleSlice * i - Math.PI/2;
          const labelRadius = radius + 15;
          const x = labelRadius * Math.cos(angle);
          return (i > 0 && i < 6) ? x + 5 : (i > 6) ? x - 5 : x;
        })
        .attr("y", (d, i) => {
          const angle = angleSlice * i - Math.PI/2;
          const labelRadius = radius + 15;
          return labelRadius * Math.sin(angle);
        })
        .attr("dy", (d, i) => {
          if (i === 0) return "-0.7em"; 
          if (i === 6) return "1em";  
          return "0.35em";
        })
        .text(d => d)
        .style("font-size", "12px")
        .style("font-weight", "bold");
      
      // add message to select regions
      chartGroup.append("text")
        .attr("class", "radar-empty-message")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#666")
        .text("Please select one or more locations to display data");
    }
  }, [dateRange, selectedRegions, zoom, chartPosition, activeRegions, setChartPosition, chartPositionRef]);

  return <svg ref={svgRef} className="radar-chart-svg"></svg>;
}