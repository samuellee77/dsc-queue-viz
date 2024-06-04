<script>
  import { onMount } from 'svelte';
  import DataLoader from './DataLoader.js';
  import LineGraph from './LineGraph.svelte';
  import ChoroplethMap from './ChoroplethMap.svelte';
  import Loading from './Loading.svelte';
  import Intro from './Intro.svelte';
  import TwoLineGraphs from './TwoLineGraphs.svelte';
  import './style.css';

  let loading = true;
  let wageData, federalWageData, usData;

  onMount(async () => {
    ({ wageData, federalWageData, usData } = await DataLoader.loadAllData());
    loading = false;
  });
</script>

{#if loading}
  <Loading/>

{:else}
  <div class="container">
    <Intro />
    <LineGraph {federalWageData} {wageData} />
    <TwoLineGraphs {wageData} /> 
    <div>
      <h2>Alabama</h2>
      <p>Alabama doesn't have state-mandated minimum wage laws. Instead, they adhere to the federal minimum wage set by the Fair Labor Standards Act (FLSA). </p>
    </div>
    <div>
      <h2>California</h2>
      <p>California experienced the greatest increase in minimum wage over a three-year period due to a variety of factors including legislative initiatives, economic conditions, social and political pressure, and public support.</p>
    </div>
    <ChoroplethMap {usData} {wageData} />
    <p>The minimum wage continues to be a contentious issue in U.S. politics. Supporters claim that higher wages are necessary to reduce poverty and stimulate economic growth by increasing consumer spending. Opponents, however, argue that substantial increases could lead to job losses and higher prices for goods and services, potentially harming small businesses.

      In conclusion, the history of minimum wage legislation in the United States is a testament to the evolving understanding of fair labor standards and economic justice. From its early inception to contemporary debates, the minimum wage remains a crucial element of the nation's labor policy, reflecting broader social and economic challenges.</p>
    
  </div>
{/if}


<style>
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
</style>
