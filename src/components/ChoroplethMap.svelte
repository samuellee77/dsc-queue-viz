<script>
    import * as d3 from 'd3';
    import { manualAdjustments } from './utils.js';
    import { onMount } from 'svelte';

    export let usData;
    export let wageData;
    const setYear = 2020;
    const path = d3.geoPath();

    function filterYear(year) {
    return wageData.filter((d) => d.year === year);
    }

    function colorScale(year) {
        return d3.scaleLinear()
        .domain([0, 7.25, 9, 10, 12, 14])
        .range(['#e0f3f8', '#e0f7ff', '#abd9e9', '#74add1', '#4575b4', '#313695']);
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

    //change text color to white when state background color is #166788 and #104e66
    function getTextColor(state) {
        const stateName = state.properties.name;
        const stateData = filterYear(setYear).find((d) => d.state === stateName);
        const stateMinimumWage = stateData.state_minimum_wage;
        if (stateMinimumWage >= 11 && !manualAdjustments[state.properties.name][2]) {
            return "white";
        }
        return "black";
    }

    //Show color scale
    let legend;

    function createLegend() {
        const legendData = [
        { range: "$0", color: '#e0f3f8' },
        { range: "Below $7.25", color: '#e0f7ff' },
        { range: "$7.25 - $8.99", color: '#abd9e9' },
        { range: "$9.00 - $9.99", color: '#74add1' },
        { range: "$10.00 - $11.99", color: '#4575b4' },
        { range: "$12.00 and above", color: '#313695' }
        ];

        const svg = d3.select(legend);
        const g = svg.append('g')
        .attr('transform', 'translate(20,20)');

        legendData.forEach((d, i) => {
        g.append('rect')
            .attr('x', 0)
            .attr('y', i * 25)
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', d.color);

        g.append('text')
            .attr('x', 30)
            .attr('y', i * 25 + 15)
            .text(d.range);
        });
    }

    onMount(createLegend);
</script>

<h2 class="body-header">US Minimum Wage by State as of 2020</h2>
<svg width="960" height="600">
    {#each usData as state (state.id)}
        <path d={path(state)} fill={getColor(state)}></path>
        {#if filterYear(setYear).find(d => d.state === state.properties.name)}
            <text 
                x={path.centroid(state)[0] + manualAdjustments[state.properties.name][0]} 
                y={path.centroid(state)[1] + manualAdjustments[state.properties.name][1]} 
                text-anchor="middle"
                fill={getTextColor(state)}
                font-size="14">
                ${filterYear(setYear).find(d => d.state === state.properties.name).state_minimum_wage}
            </text>
            {#if manualAdjustments[state.properties.name][2]}
                <path
                    d={`M ${path.centroid(state)[0]},${path.centroid(state)[1]} 
                    L ${path.centroid(state)[0] + manualAdjustments[state.properties.name][0] + manualAdjustments[state.properties.name][3]},
                    ${path.centroid(state)[1] + manualAdjustments[state.properties.name][1] + manualAdjustments[state.properties.name][4]}`}
                    stroke="black"
                    stroke-width="1"
                    fill="none"
                />
            {/if}
        {/if}
    {/each}
</svg>

<svg bind:this={legend} width="300" height="200"></svg>

<p class="body-text">The minimum wage continues to be a contentious issue in U.S. politics. Supporters claim that higher wages are necessary to reduce poverty and stimulate economic growth by increasing consumer spending. Opponents, however, argue that substantial increases could lead to job losses and higher prices for goods and services, potentially harming small businesses.

    In conclusion, the history of minimum wage legislation in the United States is a testament to the evolving understanding of fair labor standards and economic justice. From its early inception to contemporary debates, the minimum wage remains a crucial element of the nation's labor policy, reflecting broader social and economic challenges.
</p>

<style>
    path {
        stroke: #000;
        stroke-width: 1;
    }
    .body-text {
        font-size: 1.2rem;
        line-height: 1.5;
        margin-bottom: 20px;
        text-align: left;
    }
</style>
  