<script>
  import { onMount } from 'svelte';
  import DataLoader from './DataLoader.js';
  import LineGraph from './LineGraph.svelte';
  import ChoroplethMap from './ChoroplethMap.svelte';
  import Loading from './Loading.svelte';
  import Intro from './Intro.svelte';
  import TwoLineGraphs from './TwoLineGraphs.svelte';
  import Resources from './Resources.svelte';
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
<body>
  <div class="container">
    <Intro />
    <LineGraph {federalWageData} {wageData} />
    <TwoLineGraphs {wageData} /> 
    <ChoroplethMap {usData} {wageData} />
    <Resources />
  </div>
</body>
{/if}