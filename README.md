# Interactive Explorer of Global Shark Attack Data

An interactive data visualization dashboard that explores global shark attack patterns from 1900-2023. This project uses D3.js to create compelling visualizations that help users understand historical trends, geographic distributions, and seasonal patterns of shark attacks worldwide.

## Live Demo
Check out the live app: [Shark Attack Visualization](https://trubyant.github.io/global-shark-attacks/)

## Technologies Used
- React.js
- D3.js for visualizations
- CSS for styling
- Jest for testing

## Data Processing
The `/processed_data` folder contains the raw and processed data files used in this application. The original dataset was cleaned and transformed using Jupyter Notebook to standardize location names, remove incomplete entries, and prepare it for visualization.

The main data file used by the application is `clean_shark_attacks_data.json`.

## Features
- **Global Summary**: View attack statistics, fatality rates, and historical trends
- **Fatality by Location**: Explore attack details by country with interactive bar charts
- **Monthly Patterns**: Analyze seasonal attack patterns with radar charts

## Installation
1. Clone the repository
```bash
git clone https://github.com/trubyant/global-shark-attacks.git
cd shark-attacks-viz-app
```
2. Install dependencies
```bash 
npm install
```
3. Start the development server
```
npm start
```
4. Run Jest 
```
npm test
```
## Data Source
Data is sourced from the Global Shark Attack File (GSAF) via OpenDataSoft's Public Data Portal. The dataset contains shark attack incidents worldwide, processed and cleaned for visualization purposes.

## Limitations
When exploring this application, please note that the data presented stems from shark attack reports. While shark attacks are a rare occurrence, it is possible that some incidents were never reported. The visualization tools are intended for exploratory purposes rather than as definitive accounts of global shark attack patterns.

## License
MIT License
