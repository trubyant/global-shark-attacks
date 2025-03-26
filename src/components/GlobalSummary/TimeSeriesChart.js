// src/components/GlobalSummary/TimeSeriesChart.js
import React from 'react';
import { useD3Chart } from '../../hooks/useD3Chart';
import * as d3 from 'd3';

export function TimeSeriesChart({ dateRange, selectedCountries, countryCounts }) {
  const lineChartRef = useD3Chart((svg) => {
    // -----------------------------
    // chart setup
    // -----------------------------
    const margin = { top: 20, right: 30, bottom: 80, left: 60 }; 
    const width = 920 - margin.left - margin.right;
    const height = 480 - margin.top - margin.bottom;
    
    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .attr("overflow", "visible")
       .append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // -----------------------------
    // prepare data for line chart
    // -----------------------------
    const lineData = [];
    
    // add selected countries
    for (const country of selectedCountries) {
      if (!countryCounts[country]) continue;
      
      const yearlyData = countryCounts[country].yearlyData;
      const points = [];
      
      // create data points for each year in range
      for (let year = dateRange.start; year <= dateRange.end; year++) {
        points.push({
          year,
          value: yearlyData[year] || 0,
          country
        });
      }
      
      lineData.push({
        country,
        values: points
      });
    }
    
    // -----------------------------
    // create scales
    // -----------------------------
    const x = d3.scaleLinear()
      .domain([dateRange.start, dateRange.end])
      .range([0, width]);
    
    // calculate max value for y-axis
    let maxValue = 10; // default minimum scale
    
    if (lineData.length > 0) {
      lineData.forEach(countryData => {
        const countryMax = d3.max(countryData.values, d => d.value);
        if (countryMax > maxValue) maxValue = countryMax;
      });
      
      maxValue = Math.ceil(maxValue * 1.1);
    }
    
    const y = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height, 0]);
    
    // -----------------------------
    // calculate x-axis ticks
    // -----------------------------
    // determine year tick interval based on date range
    const yearRange = dateRange.end - dateRange.start;
    let tickStep = 1;
    
    if (yearRange <= 1) {
      tickStep = 1;
    } else if (yearRange <= 20) {
      tickStep = 2;
    } else if (yearRange <= 50) {
      tickStep = 5;
    } else if (yearRange <= 100) {
      tickStep = 10;
    } else {
      tickStep = 20;
    }
    
    // start at a nice round year
    const startTick = Math.ceil(dateRange.start / tickStep) * tickStep;
    const ticks = [];
    for (let year = startTick; year <= dateRange.end; year += tickStep) {
      ticks.push(year);
    }
    
    // include start and end years if they're multiples of tickStep
    if (dateRange.start % tickStep === 0 && !ticks.includes(dateRange.start)) {
      ticks.unshift(dateRange.start);
    }
    
    if (dateRange.end % tickStep === 0 && !ticks.includes(dateRange.end)) {
      ticks.push(dateRange.end);
    }
    
    ticks.sort((a, b) => a - b);
    
    // -----------------------------
    // add axes
    // -----------------------------
    svg.select("g").append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickValues(ticks)
        .tickFormat(d3.format("d")))
      .selectAll("text")
      .style("font-size", "12px");
    
    svg.select("g").append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "12px");
    
    // add axes labels
    svg.select("g").append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .text("Year")
      .style("font-size", "14px");
    
    svg.select("g").append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -(height / 2))
      .text("Number of Attacks")
      .style("font-size", "14px");

    // -----------------------------
    // add grid lines
    // -----------------------------
    svg.select("g").append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(y.ticks())
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", d => y(d))
      .attr("x2", width)
      .attr("y2", d => y(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");
    
    // -----------------------------
    // handle empty state
    // -----------------------------
    // if no countries selected, show message
    if (lineData.length === 0) {
      svg.select("g").append("text")
        .attr("class", "empty-chart-message")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#666")
        .text("Please select one or more locations to display");
    } else {
      // -----------------------------
      // draw lines for each country
      // -----------------------------
      // color scale for countries
      const countryColors = d3.scaleOrdinal()
        .range(["#4e79a7", "#f28e2c", "#59a14f", "#e15759", "#76b7b2"]);
        
      // create line generator
      const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);
        
      // add lines for each country
      const lines = svg.select("g").selectAll(".line-group")
        .data(lineData)
        .enter()
        .append("g")
        .attr("class", "line-group");
      
      lines.append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .style("stroke", (d, i) => countryColors(i))
        .style("stroke-width", 3)
        .style("fill", "none");
      
      // -----------------------------
      // add interactive elements
      // -----------------------------
      // create vertical hover line
      const hoverLine = svg.select("g").append("line")
        .attr("class", "hover-line")
        .style("stroke", "#999")
        .style("stroke-width", "1px")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0)
        .attr("y1", 0)
        .attr("y2", height);
      
      // add hover circles for each data point
      lineData.forEach((countryData, i) => {
        const points = svg.select("g").selectAll(`.point-group-${i}`)
          .data(countryData.values)
          .enter()
          .append("circle")
          .attr("class", `point-group-${i}`)
          .attr("cx", d => x(d.year))
          .attr("cy", d => y(d.value))
          .attr("r", 0) // initially invisible
          .attr("fill", countryColors(i));
        
        // store reference to points for hover tracking
        countryData.points = points;
      });
      
      // create hover area for mouse interaction
      svg.select("g").append("rect")
        .attr("class", "hover-area")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", function(event) {
          const [mouseX] = d3.pointer(event, this);
          const year = Math.round(x.invert(mouseX));
          
          if (year >= dateRange.start && year <= dateRange.end) {
            // update hover line
            hoverLine
              .attr("x1", x(year))
              .attr("x2", x(year))
              .style("opacity", 1);
            
            // show data points for this year
            let tooltipContent = `<strong>Year: ${year}</strong><br>`;
            
            lineData.forEach((countryData, i) => {
              const yearData = countryData.values.find(d => d.year === year);
              
              if (yearData) {
                // update tooltip content
                tooltipContent += `<div style="display: flex; align-items: center; margin-top: 5px;">
                  <div style="width: 12px; height: 12px; background-color: ${countryColors(i)}; margin-right: 5px;"></div>
                  <span>${countryData.country}: ${yearData.value} attacks</span>
                </div>`;
                
                // highlight points
                countryData.points
                  .attr("r", d => d.year === year ? 6 : 0)
                  .attr("stroke", d => d.year === year ? "white" : "none")
                  .attr("stroke-width", d => d.year === year ? 2 : 0);
              }
            });
            
            // show tooltip
            d3.select(".summary-tooltip")
              .html(tooltipContent)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 28) + "px")
              .style("opacity", 0.95);
          }
        })
        .on("mouseout", function() {
          // hide hover elements
          hoverLine.style("opacity", 0);
          
          lineData.forEach((countryData) => {
            countryData.points.attr("r", 0);
          });
          
          d3.select(".summary-tooltip").style("opacity", 0);
        });
      
      // -----------------------------
      // create legend
      // -----------------------------
      const legendY = height + 70;
      const legendItems = lineData.map(d => d.country);
      
      // center the legend items
      const itemWidth = Math.min(width / legendItems.length, 250);
      const totalLegendWidth = itemWidth * legendItems.length;
      const startX = (width - totalLegendWidth) / 2;
      
      // add background for legend
      svg.select("g").append("rect")
        .attr("x", -20)
        .attr("y", height + 50)
        .attr("width", width)
        .attr("height", 50)
        .attr("fill", "#f8f8f8")
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("stroke", "#eaeaea")
        .attr("stroke-width", 1);
      
      legendItems.forEach((country, i) => {
        // calculate position
        const x = startX + (i * itemWidth);
        
        // create legend item group
        const legendItem = svg.select("g").append("g")
          .attr("transform", `translate(${x}, ${legendY})`);
        
        // add color box
        legendItem.append("rect")
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", countryColors(i));
        
        // add country name, truncate with ellipsis if needed
        const displayName = country.length > 25 ? country.substring(0, 22) + "..." : country;
        
        legendItem.append("text")
          .attr("x", 25)
          .attr("y", 12)
          .text(displayName)
          .style("font-size", "14px");
      });
    }
    
    // -----------------------------
    // create tooltip if needed
    // -----------------------------
    if (!d3.select("body").select(".summary-tooltip").size()) {
      d3.select("body").append("div")
        .attr("class", "summary-tooltip")
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
  }, [dateRange, selectedCountries, countryCounts]);

  return (
    <div className="line-chart-container">
      <h3>Attack Trends by Location Over Time ({dateRange.start} - {dateRange.end})</h3>
      <svg ref={lineChartRef} className="line-chart-svg"></svg>
    </div>
  );
}