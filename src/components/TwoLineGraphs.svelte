<script>
    import * as d3 from 'd3';
    export let wageData;
    let svgAlabama;
    let svgCA;
    let tooltip;

    // Function to create a line graph for a specific state
    function createLineGraph(svgElement, state) {
        const stateData = wageData.filter(d => d.state === state);

        const width = 400;
        const height = 300;
        const margin = { top: 30, right: 35, bottom: 50, left: 40 };

        const xScale = d3.scaleTime()
            .domain(d3.extent(stateData, d => new Date(d.year, 0)))
            .range([margin.left, width - margin.right]);
        const yScale = d3.scaleLinear()
            .domain([0, 14]) // Set the domain to be consistent for both charts
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x(d => xScale(new Date(d.year, 0)))
            .y(d => yScale(d.state_minimum_wage));

        svgElement.selectAll("*").remove();

        svgElement.append('path')
            .datum(stateData)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 2.5)
            .attr('d', line);

        svgElement.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

        svgElement.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale));

        svgElement.append('text')
            .attr('transform', `translate(${(width + margin.left) / 2}, ${height - 15})`)
            .style('text-anchor', 'middle')
            .text('Year');

        svgElement
            .append('text')
            .attr('transform', 'rotate(-90)') // Rotate the text
            .attr('y', -5) // Position at the start of the y-axis
            .attr('x', (margin.bottom - height) / 2) // Position at the middle of the y-axis
            .attr('dy', '1em') // Adjust the position
            .style('text-anchor', 'middle') // Center the text
            .text('US Minimum Wage (USD)');

        svgElement.append('text')
            .attr('transform', `translate(${(width + margin.left) / 2}, 20)`)
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(state === 'Alabama' ? 'Alabama Minimum Wages Stays at $0' : 
  state === 'California' ? "California's Greatest Wage Increase between 2017 and 2020": 
  `${state} Minimum Wage Over Time`);

        svgElement.selectAll('rect')
            .data(stateData)
            .enter()
            .append('rect')
            .attr('x', d => xScale(new Date(d.year, 0)) - 2) // Adjust width and position as needed
            .attr('y', d => yScale(d.state_minimum_wage) - 10) // Adjust height and position as needed
            .attr('width', 4) // Adjust width as needed
            .attr('height', 20) // Adjust height as needed
            .style('fill', 'none') // Make them invisible
            .style('pointer-events', 'all') // Enable mouse events
            .on('mouseover', function(event, d) {
                tooltip.style.opacity = 1; // Show tooltip
                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY - 28}px`;
                tooltip.innerHTML = `Year: ${d.year}<br>Minimum Wage: $${d.state_minimum_wage}`;
            })
            .on('mouseout', function() {
                tooltip.style.opacity = 0;
            });
    }

    $: {
        if (svgAlabama && wageData) {
            createLineGraph(d3.select(svgAlabama), 'Alabama');
        }
        if (svgCA && wageData) {
            createLineGraph(d3.select(svgCA), 'California');
        }
    }
</script>

<p class="body-text">
    Below are two line charts for the minimum wage changes over time for Alabama and California that we found interesting.
</p>
<div class="tooltip" bind:this={tooltip}>Tooltip</div>
<div class="line-graphs-container">
    <svg bind:this={svgAlabama} width="400" height="300"></svg>
    <svg bind:this={svgCA} width="400" height="300"></svg>
</div>
<div class="line-graphs-container">
    <div class="left">
      <h2 style="text-align: center;">Alabama</h2>
      <p class='body-text'>
        Alabama doesn't have state-mandated minimum wage laws.
        Instead, they adhere to the federal minimum wage set by the Fair Labor Standards Act (FLSA).
    </p>
    </div>
    <div class="right">
      <h2 style="text-align: center;">California</h2>
      <p class='body-text'>
        California experienced the greatest increase in the state minimum wage over a three-year period 
        due to a variety of factors including legislative initiatives, economic conditions, 
        social and political pressure, and public support.
      </p>
    </div>
</div>
