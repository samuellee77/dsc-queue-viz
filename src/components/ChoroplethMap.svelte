<script>
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    export let usData;
    export let wageData;
    const setYear = 2020;
  
    const path = d3.geoPath();

    function filterYear(year) {
    return wageData.filter((d) => d.year === year);
    }

    function colorScale(year) {
        const minWageValues = filterYear(year).map((d) => d.state_minimum_wage);
        const minWageMin = d3.min(minWageValues);
        const minWageMax = d3.max(minWageValues);
        return d3.scaleLinear()
        .domain([minWageMin, minWageMax])
        .range(['#cdebf7', 'blue']);
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
</script>

<h2 class="body-header">US Minimum Wage by State</h2>
<svg width="960" height="600">
    {#each usData as state (state.id)}
        <path d={path(state)} fill={getColor(state)}></path>
    {/each}
</svg>
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
  