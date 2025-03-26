// src/components/GlobalSummary/FatalityPieChart.js
import React from 'react';
import { useD3Chart } from '../../hooks/useD3Chart';
import * as d3 from 'd3';

export function FatalityPieChart({ fatalData, fatalPercentage }) {
  // -----------------------------
  // colors for the chart
  // -----------------------------
  const fatalityColors = {
    "FATAL": "#e41a1c",    // red for fatal attacks, changed from #e15759
    "NON-FATAL": "#4e79a7", // blue for non-fatal attacks
    "UNKNOWN": "#b3b3b3"    // gray for unknown outcome, changed from #d3d3d3
  };
  
  const svgRef = useD3Chart((svg) => {
    // skip rendering if no data
    if (fatalData.length === 0) return;
    
    // -----------------------------
    // chart setup
    // -----------------------------
    const width = 180;
    const height = 230;
    const radius = Math.min(width, height - 60) / 2;
    
    // add title at the top
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 12)
      .attr("text-anchor", "middle")
      .style("font-size", "17px")
      .style("font-weight", "bold")
      .text("Attacks by Fatality");
    
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2 - 20})`);
    
    // -----------------------------
    // create pie chart
    // -----------------------------
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null); // preserve original order
    
    const arc = d3.arc()
      .innerRadius(radius * 0.6) // create donut chart with inner radius
      .outerRadius(radius * 0.9);
    
    // draw pie segments with appropriate colors
    chartGroup.selectAll("path")
      .data(pie(fatalData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => {
        // assign colors based on segment name
        if (d.data.name === "FATAL") return fatalityColors["FATAL"];
        if (d.data.name === "NON-FATAL") return fatalityColors["NON-FATAL"];
        return fatalityColors["UNKNOWN"];
      })
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.9)
      .on("mouseover", function(event, d) {
        // show percentage on hover
        const total = fatalData.reduce((sum, item) => sum + item.value, 0);
        const percent = ((d.data.value / total) * 100).toFixed(1);
        d3.select(".summary-tooltip")
          .style("opacity", 0.9)
          .html(`${d.data.name}: ${d.data.value} (${percent}%)`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        // hide tooltip when not hovering
        d3.select(".summary-tooltip").style("opacity", 0);
      });
    
    // -----------------------------
    // add center text
    // -----------------------------
    // add big percentage number
    chartGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.8em")
      .style("font-size", "17px")
      .style("font-weight", "bold")
      .text(`${fatalPercentage}%`);
    
    // add description text below percentage
    chartGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.5em")
      .style("font-size", "17px")
      .style("font-weight", "bold")
      .text("FATAL");

    // add description text below percentage
    chartGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "1.8em")
    .style("font-size", "17px")
    .style("font-weight", "bold")
    .text("Attacks");
    
    // -----------------------------
    // add legend
    // -----------------------------
    const legendG = svg.append("g")
      .attr("transform", `translate(${width/2 - 35}, ${height - 45})`)
      .style("font-size", "12px");
    
    // fatal legend item
    const legend1 = legendG.append("g").attr("transform", "translate(0, 0)");
    legend1.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", fatalityColors["FATAL"]);
    
    legend1.append("text")
      .attr("x", 15)
      .attr("y", 9)
      .text("FATAL");
    
    // non-fatal legend item
    const legend2 = legendG.append("g").attr("transform", "translate(0, 15)");
    legend2.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", fatalityColors["NON-FATAL"]);
    
    legend2.append("text")
      .attr("x", 15)
      .attr("y", 9)
      .text("NON-FATAL");
    
    // unknown legend item
    const legend3 = legendG.append("g").attr("transform", "translate(0, 30)");
    legend3.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", fatalityColors["UNKNOWN"]);
    
    legend3.append("text")
      .attr("x", 15)
      .attr("y", 9)
      .text("UNKNOWN");
  }, [fatalData, fatalPercentage]);

  return (
    <div className="pie-chart-container">
      <svg ref={svgRef} className="pie-chart-svg" width="180" height="230"></svg>
    </div>
  );
}