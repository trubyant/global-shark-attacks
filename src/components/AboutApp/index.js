// src/components/AboutApp/index.js
import React from 'react';

export function AboutApp({ isOpen, onClose }) {
 // if modal is not open, don't render anything
 if (!isOpen) return null;
 
 return (
   <div className="about-app-modal">
     <div className="about-app-content">
       {/* close button in the top right corner */}
       <button className="close-button" onClick={onClose}>×</button>
       
       <h2>About the App</h2>
       
       {/* -----------------------------
           app overview section
           ----------------------------- */}
       <section>
         <h3>Overview</h3>
         <p>
           This application visualizes global shark attack data from 1900 to 2023, allowing you to explore patterns
           and trends across different locations, time periods, and metrics. Locations can be countries (in most cases) 
           or broader regions (like North Pacific Ocean).
         </p>
       </section>
       
       {/* -----------------------------
           usage instructions section
           ----------------------------- */}
       <section>
         <h3>How to Use</h3>
         <h4>Global Summary Tab</h4>
         <p>
           Provides an overview of shark attacks with fatality statistics, geographic distribution, and historical trends.
           You can select up to 3 locations to compare attack trends over time. In the pie chart, locations 
           that contribute less than 5% of total attacks are grouped into the "Others" category.
         </p>
         
         <h4>Fatality by Location Tab</h4>
         <p>
           Displays detailed location-specific data with interactive bar charts showing fatality status.
           Use the year slider to see how attacks evolved through time, or select custom locations to compare.
         </p>
         
         <h4>Monthly Patterns Tab</h4>
         <p>
           Visualizes the seasonal distribution of shark attacks with an interactive radar chart.
           Select up to 3 locations to compare monthly attack patterns, and use zoom/pan controls to explore the data.
         </p>
       </section>
       
       {/* -----------------------------
           data sources section
           ----------------------------- */}
       <section>
         <h3>Data Sources</h3>
         <p>
           Data is sourced from the Global Shark Attack File (GSAF) via OpenDataSoft's Public Data Portal. 
           The dataset contains shark attack incidents from around the world, with location information that may refer
           to countries or broader geographic regions.
         </p>
         <p>
           The data was cleaned and processed to standardize location names, remove incomplete entries, 
           and formatted it for interactive visualization.
         </p>
       </section>
       
       {/* -----------------------------
           limitations section
           ----------------------------- */}
       <section>
         <h3>Limitations</h3>
         <p>
           When exploring this application, please note that the data presented stems from shark attack reports. While shark attacks are a rare occurrence, it is possible that some incidents were never reported. As such, this dataset should be interpreted with caution. Specifically, the following limitations apply:
         </p>
         <ul style={{textAlign: 'left'}}>
           <li><strong>Reporting disparities:</strong> Many locations lack robust reporting systems or internet access, leading to underreporting of attacks in developing regions.</li>
           <li><strong>Historical bias:</strong> Although the dataset originally contained records before 1900, these were excluded due to extreme incompleteness. Even records from 1900-1950 are less standardized than modern data.</li>
           <li><strong>Media attention bias:</strong> Attacks in tourist destinations or developed countries receive more coverage and are more likely to be recorded in the database.</li>
         </ul>
         <p>
           These visualization tools are intended for exploratory purposes, rather than as definitive accounts of global shark attack patterns.
         </p>
       </section>
       
       {/* developer contact information */}
       <footer>
         <p>
           Developed by Anton Trublin<br />
           contact: atrublin@gmail.com
         </p>
       </footer>
     </div>
   </div>
 );
}