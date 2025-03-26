// src/components/GlobalSummary/CountryPieChart.js
import React from 'react';
import { useD3Chart } from '../../hooks/useD3Chart';
import * as d3 from 'd3';

export function CountryPieChart({ countryData, topRegionName, topRegionPercentage }) {
  const svgRef = useD3Chart((svg) => {
    // skip rendering if no data
    if (countryData.length === 0) return;
    
    // -----------------------------
    // chart setup
    // -----------------------------
    const width = 400;
    const height = 230;
    const radius = Math.min(width - 200, height - 50) / 2;
    
    // add title at the top
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 12)
      .attr("text-anchor", "middle")
      .style("font-size", "17px")
      .style("font-weight", "bold")
      .text("Attacks by Location (Top Contributors)");
    
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2 - 15})`);
    
    // -----------------------------
    // create pie chart
    // -----------------------------
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);
    
    // use the same inner and outer radius as fatality pie chart
    const arc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9);
    
    // calculate total for percentages
    const total = countryData.reduce((sum, d) => sum + d.value, 0);
    
    // draw pie segments
    chartGroup.selectAll("path")
      .data(pie(countryData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.9)
      .on("mouseover", function(event, d) {
        // show percentage on hover
        const percent = ((d.data.value / total) * 100).toFixed(1);
        d3.select(".summary-tooltip")
          .style("opacity", 0.9)
          .html(`${d.data.name}: ${d.data.value} (${percent}%)`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(".summary-tooltip").style("opacity", 0);
      });
    
    // -----------------------------
    // add center text with multiple lines
    // -----------------------------
    // "most in" text
    chartGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-1em")
      .style("font-size", "17px")
      .style("font-weight", "bold")
      .text("Most in");
    
    // country name
    chartGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.5em")
      .style("font-size", "17px")
      .style("font-weight", "bold")
      .text(topRegionName);
    
    // percentage
    chartGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "2em")
      .style("font-size", "17px")
      .style("font-weight", "bold")
      .text(`${topRegionPercentage}%`);
    
    // -----------------------------
    // add legend
    // -----------------------------
    // calculate legend layout
    const legendItems = countryData.map((country, i) => ({
      name: country.name === "OTHERS" ? "OTHERS (<5%)" : country.name,
      color: d3.schemeCategory10[i % 10],
      index: i
    }));
    
    // position items
    const itemsPerRow = 3;
    const itemHeight = 15;
    const itemWidth = Math.floor((width - 40) / itemsPerRow);
    
    const legendG = svg.append("g")
      .attr("transform", `translate(${width/2 - 160}, ${height - 40})`)
      .style("font-size", "12px");
    
    legendItems.forEach((item, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      
      // for longer country names, adjust display
      let displayName = item.name;
      if (displayName.length > 15 && displayName !== "Others (< 5%)") {
        displayName = item.name.substring(0, 13) + "...";
      }
      
      const legendItem = legendG.append("g")
        .attr("transform", `translate(${col * itemWidth}, ${row * itemHeight})`);
      
      legendItem.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", item.color);
      
      legendItem.append("text")
        .attr("x", 15)
        .attr("y", 9)
        .text(displayName);
    });
    
  }, [countryData, topRegionName, topRegionPercentage]);

  return (
    <div className="pie-chart-container wide-pie-chart">
      <svg ref={svgRef} className="pie-chart-svg" width="400" height="230"></svg>
    </div>
  );
}