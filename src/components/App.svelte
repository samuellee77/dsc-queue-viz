<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let data;
  let loading = true;
  onMount(async () => {
    const jsonData = await fetch('sample_data.json').then((response) => response.json());
    console.log(jsonData);
    data = jsonData;
    loading = false;
  });

</script>

{#if loading}
  <h2>Loading...</h2>
{:else}
<main>
  <h1>Queue Visualization</h1>
  <h2> Introduction </h2>
  <p> 
    Queue is a fundamental concept in computer science used for storing and managing data in a specific order. It follows the principle of <b>“First in, First out” (FIFO)</b>, where the first element added to the queue is the first one to be removed. Queues are commonly used in various algorithms and applications for their simplicity and efficiency in managing data flow.
  </p>
  <p> Source: 
    <a href='https://www.geeksforgeeks.org/queue-data-structure/'> GeeksforGeeks</a>
  </p>
  <h2> Sample Data </h2>
  <p> Below is a list of sample data that is used for a office hour system for students. Each data entry has:
    <li> PID </li>
    <li> name </li>
    <li> timestamp </li>
  </p>
  <ul>
    {#each data as item}
      <li>
        PID: {item.pid} <br>
        Name: {item.name} <br>
        Timestamp: {item.timestamp}
      </li>
    {/each}
  </ul>
  <h2> Visualization </h2>
</main>
{/if}

<style>
  /* Write your CSS here */
</style>
