<script>
  import { onMount } from 'svelte';
  import DataLoader from './DataLoader.js';
  import LineGraph from './LineGraph.svelte';
  import ChoroplethMap from './ChoroplethMap.svelte';
  import Loading from './Loading.svelte';
  import Intro from './Intro.svelte';
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
    <ChoroplethMap {usData} {wageData} />
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