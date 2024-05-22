<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let data;
  let loading = true;
  let svgElement
  onMount(async () => {
    const jsonData = await fetch('sample_data.json').then((response) => response.json());
    console.log(jsonData);
    data = jsonData;
    loading = false;
  });
  function generateQueue() {  
    const svg = d3.select(svgElement);
    const width = 800;
    const height = 400;
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'lightblue');
    const rects = [
      { x: 100, y: 50 },
      { x: 200, y: 50 },
      { x: 300, y: 50 },
      { x: 400, y: 50 },
      { x: 500, y: 50 }
    ];
    rects.forEach((rect) => {
      svg.append('rect')
        .attr('width', 100)
        .attr('height', 100)
        .attr('x', rect.x)
        .attr('y', rect.y)
        .attr('fill', 'white');
      svg.append('line')
        .attr('x1', rect.x)
        .attr('y1', rect.y)
        .attr('x2', rect.x)
        .attr('y2', rect.y + 100)
        .attr('stroke', 'black')
        .attr('stroke-width', 3);
      svg.append('line')
        .attr('x1', rect.x)
        .attr('y1', rect.y)
        .attr('x2', rect.x + 100)
        .attr('y2', rect.y)
        .attr('stroke', 'black')
        .attr('stroke-width', 3);
      svg.append('line')
        .attr('x1', rect.x)
        .attr('y1', rect.y + 100)
        .attr('x2', rect.x + 100)
        .attr('y2', rect.y + 100)
        .attr('stroke', 'black')
        .attr('stroke-width', 3);
    });
    svg.append('line')
      .attr('x1', rects[rects.length - 1].x + 100)
      .attr('y1', rects[rects.length - 1].y)
      .attr('x2', rects[rects.length - 1].x + 100)
      .attr('y2', rects[rects.length - 1].y + 100)
      .attr('stroke', 'black')
      .attr('stroke-width', 3);
  }
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
    <a href='https://www.geeksforgeeks.org/queue-data-structure/' target='_blank'> GeeksforGeeks</a>
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
  <div> 
    <button on:click={generateQueue}>Generate Blank Queue</button>
    <svg bind:this={svgElement} width="800" height="400"></svg>
    
</main>
{/if}

<style>
  /* Write your CSS here */
</style>
