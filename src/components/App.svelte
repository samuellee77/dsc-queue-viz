<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import Papa from 'papaparse';
  import * as topojson from 'topojson-client';

  let wageData;
  let federalWageData;
  let loading = true;
  let svgLineGraph;
  let us;
  let path = d3.geoPath();
  let marginLeft = 50;
  let marginRight = 80;
  let marginTop = 20;
  let marginBottom = 100;
  const setYear = 2000; // change the year to see differences

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
    
    // load federal minimum wage data
    const federalResponseJson = await fetch('federal_minimum_wage.json').then((response) => response.json());
    federalWageData = federalResponseJson;

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

  function createLineGraph(desiredType) {
    /*const svg = d3.select('svg');*/
    const svg = d3.select(svgLineGraph);
    const width = 800;
    const height = 600;

    // Define the scales
    const xScale = d3
        .scaleTime()
        .domain(d3.extent(federalWageData, d => new Date(d.year, 0)))
        .range([marginLeft, width - marginRight]);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(federalWageData, d => +d.federal_minimum_wage)])
        .range([height - marginBottom, marginTop]);
    
    // Append the line to the SVG
    // Clear existing content
    svg.selectAll("*").remove();

    const graph = svg.append('g')
        .attr('transform', `translate(${marginLeft}, ${marginTop})`);
    graph
        .append('path')
        .datum(federalWageData)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 1)
        .attr('d', d3.line()
            .x(d => xScale(new Date(d.year, 0)))
            .y(d => yScale(+d.federal_minimum_wage))
        );
    // append x-axis and y-axis
    graph
        .append('g')
        .attr('transform', `translate(0, ${height - marginBottom})`)
        .call(d3.axisBottom(xScale));
    graph
        .append('g')
        .attr('transform', `translate(${marginLeft}, 0)`) 
        .call(d3.axisLeft(yScale));
    graph
        .append('text')
        .attr('transform', `translate(${width / 2}, ${height - 50})`) // Position at the middle of the x-axis
        .style('text-anchor', 'middle') // Center the text
        .text('Year');

    // Append y-axis title
    graph
        .append('text')
        .attr('transform', 'rotate(-90)') // Rotate the text
        .attr('y', -5) // Position at the start of the y-axis
        .attr('x', 0 - (height / 2)) // Position at the middle of the y-axis
        .attr('dy', '1em') // Adjust the position
        .style('text-anchor', 'middle') // Center the text
        .text('Price (USD)');

    // Append graph title
    graph
        .append('text')
        .attr('transform', `translate(${width / 2}, ${marginTop - 25})`) // Position at the top center
        .style('text-anchor', 'middle') // Center the text
        .style('font-size', '20px') // Set the font size
        .style('font-weight', 'bold') // Set the font weight
        .text('Federal Minimum Wage Over Time');
  }
</script>

{#if loading}
  <h2>Loading...</h2>
{:else}
<main>
  <h1>US Minimum Wage by State Visualization</h1>
  <h2> Federal Minimum Wage Over Time</h2>
  <div class="graph-container">
    <button on:click={() => createLineGraph('federal_minimum_wage')}>Federal Minimum Wage</button>
    <svg bind:this={svgLineGraph} width="1000" height="600"></svg>
  </div>
  <!-- the full size of this US map is 960 x 600. 
    If you want to change, you need to use transform (I guess?) -->
  <h2>US Minimum Wage by State</h2>
  <div class='graph-container'>
    <svg width="960" height="600">
      {#each us as state (state.id)}
        <path d={path(state)}></path>
        <path d={path(state)} fill={getColor(state)}></path>
      {/each}
    </svg>
  </div>
</main>
{/if}

<style>
  path {
    stroke: #000;
    stroke-width: 1;
  }
</style>
