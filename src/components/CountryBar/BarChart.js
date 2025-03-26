// src/components/CountryBar/BarChart.js
import React from 'react';
import { useD3Chart } from '../../hooks/useD3Chart';
import * as d3 from 'd3';
import sharkData from '../../data/clean_shark_attacks_data.json';

export function BarChart({ dateRange, currentYear, displayMode, customCountries }) {
  const svgRef = useD3Chart((svg) => {
    // -----------------------------
    // data preparation
    // -----------------------------
    // convert dates to javascript date objects
    const parsedData = sharkData.map(d => ({
      ...d,
      Date: d.Date ? new Date(d.Date) : null
    }));

    // filter data by the selected time range and date range
    const filteredData = parsedData.filter(d => {
      if (!d.Date) return false;
      
      const attackYear = d.Date.getFullYear();
      
      // only include data within the date range and up to current year
      return attackYear >= dateRange.start && 
             attackYear <= dateRange.end && 
             attackYear <= currentYear;
    });

    // -----------------------------
    // data aggregation by country and fatality
    // -----------------------------
    const countByCountryAndFatality = {};
    
    filteredData.forEach(d => {
      if (!d.Country) return;
      
      // initialize country data if it doesn't exist
      if (!countByCountryAndFatality[d.Country]) {
        countByCountryAndFatality[d.Country] = {
          fatal: 0,
          nonFatal: 0,
          unknown: 0,
          total: 0
        };
      }
      
      // categorize by fatality status
      if (d.Fatal === true) {
        countByCountryAndFatality[d.Country].fatal += 1;
      } else if (d.Fatal === false) {
        countByCountryAndFatality[d.Country].nonFatal += 1;
      } else {
        countByCountryAndFatality[d.Country].unknown += 1;
      }
      
      countByCountryAndFatality[d.Country].total += 1;
    });

    // convert to array and sort by total attacks
    let countryCounts = Object.entries(countByCountryAndFatality)
      .map(([country, counts]) => ({ 
        country, 
        fatal: counts.fatal,
        nonFatal: counts.nonFatal,
        unknown: counts.unknown,
        total: counts.total
      }))
      .sort((a, b) => b.total - a.total);
    
    // -----------------------------
    // apply display mode filter
    // -----------------------------
    if (displayMode === 'top5') {
      countryCounts = countryCounts.slice(0, 5);
    } else if (displayMode === 'top10') {
      countryCounts = countryCounts.slice(0, 10);
    } else if (displayMode === 'top15') {
      countryCounts = countryCounts.slice(0, 15);
    } else if (displayMode === 'custom') {
      // only show countries if they're selected
      if (customCountries.length > 0) {
        countryCounts = countryCounts.filter(d => customCountries.includes(d.country));
      } else {
        // if no countries selected in custom mode, show empty chart
        countryCounts = [];
      }
    }

    // -----------------------------
    // chart setup
    // -----------------------------
    const margin = { top: 20, right: 180, bottom: 50, left: 180 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // configure svg
    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`);

    // calculate max count for dynamic scaling, with some padding
    const maxCount = d3.max(countryCounts, d => d.total) || 0;
    const xMax = Math.max(Math.ceil(maxCount * 1.1), 10); // at least 10 for empty/low data
    
    // round to a nice value (next multiple of 50)
    const roundedMax = Math.ceil(xMax / 50) * 50;

    // -----------------------------
    // create scales
    // -----------------------------
    const x = d3.scaleLinear()
      .domain([0, roundedMax])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(countryCounts.map(d => d.country))
      .range([0, height])
      .padding(0.2);

    // determine tick intervals based on max value
    let tickValues = [];
    if (roundedMax <= 50) {
      // for smaller values, use 10 as interval
      tickValues = d3.range(0, roundedMax + 1, 10);
    } else if (roundedMax <= 600){
      // between 50 and 600, use 50 as interval
      tickValues = d3.range(0, roundedMax + 1, 50);
    } else if (roundedMax <= 1600) {
      // between 600 and 1600, use 200 as interval
      tickValues = d3.range(0, roundedMax + 1, 200);
    } else {
      // above 1600, use 400 as interval
      tickValues = d3.range(0, roundedMax + 1, 400);
    }

    // -----------------------------
    // add axes
    // -----------------------------
    // add x axis with appropriate ticks
    svg.select("g").append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickValues(tickValues)
      )
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", "14px");

    // add x axis label
    svg.select("g").append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text("Number of Shark Attacks")
      .style("font-size", "16px");

    // add y axis with text wrapping
    const yAxis = svg.select("g").append("g")
      .call(d3.axisLeft(y));
      
    // apply text wrapping to y-axis labels
    yAxis.selectAll(".tick text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .call(wrapText, margin.left - 10);

    // -----------------------------
    // add grid lines
    // -----------------------------
    svg.select("g").append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(d3.range(0, roundedMax + 1, 50))
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("y1", 0)
      .attr("x2", d => x(d))
      .attr("y2", height)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1);

    // -----------------------------
    // define colors and create tooltip
    // -----------------------------
    // define colors for different fatality status
    const colors = {
      unknown: "#b3b3b3",   // gray
      nonFatal: "#4e79a7",  // blue, changed from #6baed6
      fatal: "#e41a1c"      // red
    };

    // create tooltip
    const tooltip = d3.select("body").select(".summary-tooltip");
    if (!tooltip.size()) {
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

    // -----------------------------
    // create stacked bar charts
    // -----------------------------
    // create a group for each country's stacked bar
    svg.select("g").selectAll(".bar-group")
      .data(countryCounts)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(0,${y(d.country)})`)
      .on("mouseover", function(event, d) {
        // format percentages
        const fatalPercent = (d.fatal / d.total * 100).toFixed(1);
        const nonFatalPercent = (d.nonFatal / d.total * 100).toFixed(1);
        const unknownPercent = (d.unknown / d.total * 100).toFixed(1);
        
        // build tooltip content
        let tooltipContent = `<strong>${d.country}</strong><br/><br/>`;
        
        tooltipContent += `<div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div style="width: 12px; height: 12px; background-color: ${colors.fatal}; margin-right: 5px;"></div>
          <span>Fatal: ${d.fatal} (${fatalPercent}%)</span>
        </div>`;
        
        tooltipContent += `<div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div style="width: 12px; height: 12px; background-color: ${colors.nonFatal}; margin-right: 5px;"></div>
          <span>Non-Fatal: ${d.nonFatal} (${nonFatalPercent}%)</span>
        </div>`;
        
        tooltipContent += `<div style="display: flex; align-items: center;">
          <div style="width: 12px; height: 12px; background-color: ${colors.unknown}; margin-right: 5px;"></div>
          <span>Unknown: ${d.unknown} (${unknownPercent}%)</span>
        </div>`;
        
        // show tooltip
        d3.select(".summary-tooltip")
          .html(tooltipContent)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 28) + "px")
          .style("opacity", 0.95);
      })
      .on("mouseout", function() {
        d3.select(".summary-tooltip").style("opacity", 0);
      });
    
    // add the stacked bar segments to each group
    countryCounts.forEach(d => {
      const y0 = y(d.country);
      const height = y.bandwidth();
      
      // create a parent group for the entire bar
      const barGroup = svg.select("g").select(`g[transform="translate(0,${y0})"]`);
      
      // add an invisible overlay for the entire bar for better tooltip interaction
      barGroup.append("rect")
        .attr("class", "bar-overlay")
        .attr("y", 0)
        .attr("height", height)
        .attr("x", 0)
        .attr("width", x(d.total))
        .attr("fill", "transparent"); // invisible but captures mouse events
      
      // unknown cases (left)
      if (d.unknown > 0) {
        barGroup.append("rect")
          .attr("class", "bar-unknown")
          .attr("y", 0)
          .attr("height", height)
          .attr("x", 0)
          .attr("width", x(d.unknown))
          .attr("fill", colors.unknown);
      }
      
      // non-fatal cases (middle)
      if (d.nonFatal > 0) {
        barGroup.append("rect")
          .attr("class", "bar-non-fatal")
          .attr("y", 0)
          .attr("height", height)
          .attr("x", x(d.unknown))
          .attr("width", x(d.nonFatal))
          .attr("fill", colors.nonFatal);
      }
      
      // fatal cases (right)
      if (d.fatal > 0) {
        barGroup.append("rect")
          .attr("class", "bar-fatal")
          .attr("y", 0)
          .attr("height", height)
          .attr("x", x(d.unknown + d.nonFatal))
          .attr("width", x(d.fatal))
          .attr("fill", colors.fatal);
      }
    });

    // -----------------------------
    // add labels and legend
    // -----------------------------
    // add count labels at the end of each bar
    svg.select("g").selectAll(".label")
      .data(countryCounts)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.total) + 5)
      .attr("y", d => y(d.country) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .text(d => d.total)
      .style("font-size", "14px");

    // add legend
    const legendX = width + 20;
    const legendY = 20;
    const legendSpacing = 25;
    
    // legend title
    svg.select("g").append("text")
      .attr("x", legendX)
      .attr("y", legendY - 10)
      .attr("font-weight", "bold")
      .text("Fatality Status");
    
    // fatal legend
    svg.select("g").append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", colors.fatal);
    
    svg.select("g").append("text")
      .attr("x", legendX + 25)
      .attr("y", legendY + 9)
      .attr("dy", ".35em")
      .text("FATAL");
    
    // non-fatal legend
    svg.select("g").append("rect")
      .attr("x", legendX)
      .attr("y", legendY + legendSpacing)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", colors.nonFatal);
    
    svg.select("g").append("text")
      .attr("x", legendX + 25)
      .attr("y", legendY + legendSpacing + 9)
      .attr("dy", ".35em")
      .text("NON-FATAL");
    
    // unknown legend
    svg.select("g").append("rect")
      .attr("x", legendX)
      .attr("y", legendY + legendSpacing * 2)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", colors.unknown);
    
    svg.select("g").append("text")
      .attr("x", legendX + 25)
      .attr("y", legendY + legendSpacing * 2 + 9)
      .attr("dy", ".35em")
      .text("UNKNOWN");

    // if no data in custom mode, show a message
    if (displayMode === 'custom' && customCountries.length === 0) {
      svg.select("g").append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#666")
        .text("Please select one or more locations to display");
    }
    
    // -----------------------------
    // helper functions
    // -----------------------------
    // helper function to wrap text
    function wrapText(text, width) {
      text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        const lineHeight = 1.1; // ems
        const y = text.attr("y");
        const dy = parseFloat(text.attr("dy") || 0);
        
        let word;
        let line = [];
        let lineNumber = 0;
        let tspan = text.text(null).append("tspan").attr("x", -10).attr("y", y).attr("dy", dy + "em");
        
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", -10).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
    }
  }, [dateRange, currentYear, displayMode, customCountries]);

  return <svg ref={svgRef}></svg>;
}