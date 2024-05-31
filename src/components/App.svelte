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
  let selectedEntity = "Federal";
  const setYear = 2020;

  const marginLeft = 20;
  const marginRight = 35;
  const marginTop = 30;
  const marginBottom = 100;

  const path = d3.geoPath();

  onMount(async () => {
    await loadData();
    loading = false;
    createLineGraph();
  });

  async function loadData() {
    wageData = await loadCSVData('data.csv');
    federalWageData = await loadJSONData('federal_minimum_wage.json');
    us = await loadTopoJSONData('counties-albers-10m.json');
  }

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
    return response.json();
  }

  async function loadTopoJSONData(url) {
    const response = await fetch(url);
    const usData = await response.json();
    return topojson.feature(usData, usData.objects.states).features;
  }

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
    } else {
      dataToPlot = wageData
        .filter(d => d.state === selectedEntity)
        .map(d => ({
          year: d.year,
          wage: +d.state_minimum_wage
        }));
    }

    graph
        .append('path')
        .datum(dataToPlot)
        .attr('fill', 'none')
        .attr('stroke', 'black')
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
        .attr('transform', `translate(${(width - marginLeft) / 2}, ${height - 50})`) // Position at the middle of the x-axis
        .style('text-anchor', 'middle') // Center the text
        .text('Year');

    // Append y-axis title
    graph
        .append('text')
        .attr('transform', 'rotate(-90)') // Rotate the text
        .attr('y', -25) // Position at the start of the y-axis
        .attr('x', (marginBottom - height) / 2) // Position at the middle of the y-axis
        .attr('dy', '1em') // Adjust the position
        .style('text-anchor', 'middle') // Center the text
        .text('US Minimum Wage ($)');

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
        .style('opacity', 1);

     // Append circle to show points on the line
    graph.selectAll('circle')
    .data(dataToPlot)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(new Date(d.year, 0)))
        .attr('cy', d => yScale(d.wage))
        .attr('r', 5)
        .style('fill', 'blue')
        .style('cursor', 'pointer')
        .on('mouseover', function(d) {
          tooltip.transition()
              .duration(500)
              .style('opacity', 1);
          tooltip.html(`Year: ${d}<br>Minimum Wage: $${d}`)
            .style('left', (d.pageX + 10) + 'px')
            .style('top', (d.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          tooltip.transition()
              .duration(500)
              .style('opacity', 1);
        });
  };
</script>

{#if loading}
  <p>Loading...</p>
{:else}
  <div class='container'>
    <main>
      <h1 class="body-header">U.S. Minimum Wage by State</h1>

      <p class="body-text">The history of minimum wage legislation in the 
      United States is a journey marked by social advocacy, economic necessity, and political debate. The concept of a minimum wage was introduced to ensure that workers could earn a living wage, providing for their basic needs without falling into poverty. Over time, this idea evolved, leading to significant legislative milestones.
      </p>

      <h2 class="body-header"> Federal Minimum Wage (1968-2020)</h2>
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
      <h2 class="body-header">US Minimum Wage by State</h2>
      <div class='graph-container'>
        <svg width="960" height="600">
          {#each us as state (state.id)}
            <path d={path(state)}></path>
            <path d={path(state)} fill={getColor(state)}></path>
          {/each}
        </svg>
      </div>
      <p class="body-text">The minimum wage continues to be a contentious issue in U.S. politics. Supporters claim that higher wages are necessary to reduce poverty and stimulate economic growth by increasing consumer spending. Opponents, however, argue that substantial increases could lead to job losses and higher prices for goods and services, potentially harming small businesses.

        In conclusion, the history of minimum wage legislation in the United States is a testament to the evolving understanding of fair labor standards and economic justice. From its early inception to contemporary debates, the minimum wage remains a crucial element of the nation's labor policy, reflecting broader social and economic challenges.
        </p>
    </main>
  </div>
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
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    max-width: 1000px;
    margin: auto;
    text-align: center;
  }
  
  .body-text {
    font-size: 1.2rem;
    line-height: 1.5;
    margin-bottom: 20px;
    text-align: left;
  }
</style>