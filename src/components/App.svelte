<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import Papa from 'papaparse';
  import * as topojson from 'topojson-client';

  let wageData;
  let loading = true;
  let svgElement;
  let us;
  let path = d3.geoPath();
  const setYear = 2000;

  onMount(async () => {
    // load minimum wage data
    const response = await fetch('data.csv');
    const csvData = await response.text();

    // change datatypes
    wageData = Papa.parse(csvData, { header: true }).data.map((d) => {
      return {
        year: +d.year,
        state: d.state,
        state_minimum_wage: +d.state_minimum_wage,
        state_minimum_wage_2020_dollars: +d.state_minimum_wage_2020_dollars,
        federal_minimum_wage: +d.federal_minimum_wage,
        federal_minimum_wage_2020_dollars: +d.federal_minimum_wage_2020_dollars,
        effective_minimum_wage: +d.effective_minimum_wage,
        effective_minimum_wage_2020_dollars: +d.effective_minimum_wage_2020_dollars,
        cpi_average: +d.cpi_average
      };
    });
    
    // load US map data
    const usResponse = await fetch('counties-albers-10m.json');
    const usData = await usResponse.json();
    us = topojson.feature(usData, usData.objects.states).features;
    loading = false;

  });

  function filterYear(year) {
    return wageData.filter((d) => d.year === year);
  }

  function getColor(state) {
    const stateName = state.properties.name;
    const stateData = filterYear(setYear).find((d) => d.state === stateName);
    if (stateData) {
      const stateMinimumWage = stateData.effective_minimum_wage;
      return colorScale(setYear)(stateMinimumWage);
    }
    return 'white';
  }

  function colorScale(year) {
    const minWageValues = filterYear(year).map((d) => d.effective_minimum_wage);
    const minWageMin = d3.min(minWageValues);
    const minWageMax = d3.max(minWageValues);
    return d3.scaleLinear()
      .domain([minWageMin, minWageMax])
      // colors to be determined
      .range(['#cdebf7', 'blue']);
  }
</script>

{#if loading}
  <h2>Loading...</h2>
{:else}
<main>
  <svg width="960" height="600">
    {#each us as state (state.id)}
      <path d={path(state)}></path>
      <path d={path(state)} fill={getColor(state)}></path>
    {/each}
  </svg>
</main>
{/if}

<style>
  path {
    stroke: #000;
    stroke-width: 1;
  }
</style>
