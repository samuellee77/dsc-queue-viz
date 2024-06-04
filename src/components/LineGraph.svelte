<script>
    import * as d3 from 'd3';
    export let federalWageData, wageData;
    let selectedEntity = 'Federal';
    let svg;
    let tooltip;
  
    // Reactive statement to update the graph when the data or selected entity changes
    $: {
      if (svg && wageData && federalWageData) {
        createLineGraph();
      }
    };
  
    function createLineGraph() {
      const svgElement = d3.select(svg);
      const width = 800;
      const height = 600;
      const margin = { top: 30, right: 35, bottom: 100, left: 40 };
  
      // Set up scales
      const xScale = d3.scaleTime()
        .domain(d3.extent(federalWageData, d => new Date(d.year, 0)))
        .range([margin.left, width - margin.right]);
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(wageData, d => d.effective_minimum_wage)])
        .range([height - margin.bottom, margin.top]);
  
      // Prepare data to plot
      let dataToPlot;
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
  
      // Clear previous contents
      svgElement.selectAll("*").remove();
  
      const line = d3.line()
        .x(d => xScale(new Date(d.year, 0)))
        .y(d => yScale(d.wage));
  
      // Draw line
      svgElement.append('path')
        .datum(dataToPlot)
        .attr('fill', 'none')
        .attr('stroke', '#dc143c')
        .attr('stroke-width', 2.5)
        .attr('d', line);
  
      // Draw axes
      svgElement.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
  
      svgElement.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
    
      svgElement
        .append('text')
        .attr('transform', `translate(${(width + margin.left) / 2}, ${height - 50})`) // Position at the middle of the x-axis
        .style('text-anchor', 'middle') // Center the text
        .text('Year');
      svgElement
        .append('text')
        .attr('transform', 'rotate(-90)') // Rotate the text
        .attr('y', -5) // Position at the start of the y-axis
        .attr('x', (margin.bottom - height) / 2) // Position at the middle of the y-axis
        .attr('dy', '1em') // Adjust the position
        .style('text-anchor', 'middle') // Center the text
        .text('US Minimum Wage (USD)');
      svgElement
        .append('text')
        .attr('transform', `translate(${(width - margin.left) / 2}, 20)`) // Position at the middle of the x-axis
        .style('text-anchor', 'middle') 
        .style('font-size', '20px') // Set the font size
        .style('font-weight', 'bold')// Center the text
        .text(`US Minimum Wage Over Time (${selectedEntity})`);

        svgElement.selectAll('circle')
            .data(dataToPlot)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(new Date(d.year, 0)))
            .attr('cy', d => yScale(d.wage))
            .attr('r', 4)
            .style('fill', '#4169e1')
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                tooltip.style.opacity = 1; // Show tooltip
                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY - 28}px`;
                tooltip.innerHTML = `Year: ${d.year}<br>Minimum Wage: $${d.wage}`;
            })
            .on('mouseout', function() {
                tooltip.style.opacity = 0;
            });
    }
</script>

<h2 class='body-header'>Our Visualizations</h2>
<p class='body-text'>
    The following line graph displays the minimum wage over time for the selected entity (Federal or State).
    <br>
    Hover over the data points to see the exact values.
</p>
<div class="tooltip" bind:this={tooltip}>Tooltip</div>
<div>
    <label for="entity-select">Select a State or Federal:</label>
    <select id="entity-select" bind:value={selectedEntity} on:change={createLineGraph}>
        <option value="Federal">Federal</option>
        {#each Array.from(new Set(wageData.map(d => d.state))) as state}
            <option value={state}>{state}</option>
        {/each}
    </select>
</div>

<svg bind:this={svg} width="800" height="600"></svg>