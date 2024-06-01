// DataLoader.js
import * as d3 from 'd3';
import Papa from 'papaparse';
import * as topojson from 'topojson-client';

async function loadCSVData(url) {
  const response = await fetch(url);
  const csvData = await response.text();
  return Papa.parse(csvData, { header: true }).data.map(d => ({
    year: +d.year,
    state: d.state,
    state_minimum_wage: +d.state_minimum_wage,
    state_minimum_wage_2020_dollars: +d.state_minimum_wage_2020_dollars,
    federal_minimum_wage: +d.federal_minimum_wage,
    federal_minimum_wage_2020_dollars: +d.federal_minimum_wage_2020_dollars,
    effective_minimum_wage: +d.effective_minimum_wage,
    effective_minimum_wage_2020_dollars: +d.effective_minimum_wage_2020_dollars,
    cpi_average: +d.cpi_average,
  }));
}

async function loadJSONData(url) {
  const response = await fetch(url);
  return await response.json();
}

async function loadTopoJSONData(url) {
  const response = await fetch(url);
  const usData = await response.json();
  return topojson.feature(usData, usData.objects.states).features;
}

export default {
  async loadAllData() {
    const wageData = await loadCSVData('data.csv');
    const federalWageData = await loadJSONData('federal_minimum_wage.json');
    const usData = await loadTopoJSONData('counties-albers-10m.json');
    return { wageData, federalWageData, usData };
  }
};
