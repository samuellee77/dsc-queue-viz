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
        .range(['#e0f7ff', '#abd9e9', '#74add1', '#4575b4', '#313695', '#24286f']);
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
        { range: "$0", color: '#e0f7ff' },
        { range: "Below $7.25", color: '#abd9e9' },
        { range: "$7.25 - $8.99", color: '#74add1' },
        { range: "$9.00 - $9.99", color:  '#4575b4'},
        { range: "$10.00 - $11.99", color:  '#313695'},
        { range: "$12.00 and above", color: '#24286f'}
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

    const stateAbbreviations = {
        'Alabama': 'AL',
        'Alaska': 'AK',
        'Arizona': 'AZ',
        'Arkansas': 'AR',
        'California': 'CA',
        'Colorado': 'CO',
        'Connecticut': 'CT',
        'Delaware': 'DE',
        'Florida': 'FL',
        'Georgia': 'GA',
        'Hawaii': 'HI',
        'Idaho': 'ID',
        'Illinois': 'IL',
        'Indiana': 'IN',
        'Iowa': 'IA',
        'Kansas': 'KS',
        'Kentucky': 'KY',
        'Louisiana': 'LA',
        'Maine': 'ME',
        'Maryland': 'MD',
        'Massachusetts': 'MA',
        'Michigan': 'MI',
        'Minnesota': 'MN',
        'Mississippi': 'MS',
        'Missouri': 'MO',
        'Montana': 'MT',
        'Nebraska': 'NE',
        'Nevada': 'NV',
        'New Hampshire': 'NH',
        'New Jersey': 'NJ',
        'New Mexico': 'NM',
        'New York': 'NY',
        'North Carolina': 'NC',
        'North Dakota': 'ND',
        'Ohio': 'OH',
        'Oklahoma': 'OK',
        'Oregon': 'OR',
        'Pennsylvania': 'PA',
        'Rhode Island': 'RI',
        'South Carolina': 'SC',
        'South Dakota': 'SD',
        'Tennessee': 'TN',
        'Texas': 'TX',
        'Utah': 'UT',
        'Vermont': 'VT',
        'Virginia': 'VA',
        'Washington': 'WA',
        'West Virginia': 'WV',
        'Wisconsin': 'WI',
        'Wyoming': 'WY',
        'District of Columbia': 'DC',
        'Guam': 'GU',
        'Puerto Rico': 'PR',
        'U.S. Virgin Islands': 'VI'
    };


    onMount(createLegend);
</script>

<h2 class="body-header">Washington Leads with the Highest Minimum Wage as of 2020</h2>

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
                <tspan x={path.centroid(state)[0] + manualAdjustments[state.properties.name][0]} dy="0">
                    {stateAbbreviations[state.properties.name]}
                </tspan>
                <tspan x={path.centroid(state)[0] + manualAdjustments[state.properties.name][0]} dy="1.2em">
                    ${filterYear(setYear).find(d => d.state === state.properties.name).state_minimum_wage}
                </tspan>
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
  
