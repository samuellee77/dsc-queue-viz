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
  let selectedEntity = "Federal"; // default selected entity
  let path = d3.geoPath();
  let marginLeft = 50;
  let marginRight = 80;
  let marginTop = 20;
  let marginBottom = 100;
  const setYear = 2020; // change the year to see differences

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

    // Create the initial line graph with the default selected entity
    createLineGraph();
  });

  function filterYear(year) {
    return wageData.filter((d) => d.year === year);
  }

  function getColor(state) {
    const stateName = state.properties.name;
    const stateData = filterYear(setYear).find((d) => d.state === stateName);
    if (stateData) {
      const stateMinimumWage = stateData.state_minimum_wage;
      return colorScale(setYear)(stateMinimumWage);
    }
    return 'white';
  }

  function colorScale(year) {
    const minWageValues = filterYear(year).map((d) => d.state_minimum_wage);
    const minWageMin = d3.min(minWageValues);
    const minWageMax = d3.max(minWageValues);
    return d3.scaleLinear()
      .domain([minWageMin, minWageMax])
      .range(['#cdebf7', 'blue']);
  }

  function createLineGraph() {
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
        .domain([0, d3.max(wageData, d => +d.effective_minimum_wage)])
        .range([height - marginBottom, marginTop]);
    
    // Append the line to the SVG
    // Clear existing content
    svg.selectAll("*").remove();

    const graph = svg.append('g')
        .attr('transform', `translate(${marginLeft}, ${marginTop})`);

    let dataToPlot;
    let color;

    if (selectedEntity === "Federal") {
      dataToPlot = federalWageData.map(d => ({
        year: d.year,
        wage: +d.federal_minimum_wage
      }));
      color = 'blue';
    } else {
      dataToPlot = wageData
        .filter(d => d.state === selectedEntity)
        .map(d => ({
          year: d.year,
          wage: +d.state_minimum_wage
        }));
      color = 'blue';
    }

    graph
        .append('path')
        .datum(dataToPlot)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1)
        .attr('d', d3.line()
            .x(d => xScale(new Date(d.year, 0)))
            .y(d => yScale(d.wage))
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
        .text(`${selectedEntity} Minimum Wage Over Time`);
  
        const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

     // Append circle to show points on the line
    graph.selectAll('circle')
    .data(dataToPlot)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(new Date(d.year, 0)))
        .attr('cy', d => yScale(d.wage))
        .attr('r', 5)
        .style('fill', color)
        .style('cursor', 'pointer')
        .on('mouseover', function(d) {
          tooltip.transition()
              .duration(500)
              .style('opacity', 1);
          tooltip.html(`Year: ${d.year}<br>Minimum Wage: $${d.wage}`)
              .style('left', (d3.event.pageX + 10) + 'px')
              .style('top', (d3.event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          tooltip.transition()
              .duration(500)
              .style('opacity', 1);
        });
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else}
<main>
  <h1>U.S. Minimum Wage by State </h1>

  <p>The history of minimum wage legislation in the 
  United States is a journey marked by social advocacy, economic necessity, and political debate. The concept of a minimum wage was introduced to ensure that workers could earn a living wage, providing for their basic needs without falling into poverty. Over time, this idea evolved, leading to significant legislative milestones.
  </p>

  <h2> Federal Minimum Wage(1968-2020)</h2>
  <div>
    <label for="entity-select">Select a State or Federal:</label>
    <select id="entity-select" bind:value={selectedEntity} on:change={createLineGraph}>
      <option value="Federal">Federal</option>
      {#each Array.from(new Set(wageData.map(d => d.state))) as state}
        <option value={state}>{state}</option>
      {/each}
    </select>
  </div>
  <svg bind:this={svgLineGraph} width="800" height="600"></svg>
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
  <p>The minimum wage continues to be a contentious issue in U.S. politics. Supporters claim that higher wages are necessary to reduce poverty and stimulate economic growth by increasing consumer spending. Opponents, however, argue that substantial increases could lead to job losses and higher prices for goods and services, potentially harming small businesses.

    In conclusion, the history of minimum wage legislation in the United States is a testament to the evolving understanding of fair labor standards and economic justice. From its early inception to contemporary debates, the minimum wage remains a crucial element of the nation's labor policy, reflecting broader social and economic challenges.
    </p>
</main>
{/if}

<style>
  .tooltip {
    position: absolute;
    text-align: center;
    padding: 5px;
    font: 12px sans-serif;
    background: lightsteelblue;
    border: 0px;
    border-radius: 8px;
    pointer-events: none;
  }

  path {
    stroke: #000;
    stroke-width: 1;
  }
</style>