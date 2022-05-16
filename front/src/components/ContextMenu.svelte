<script lang='ts'>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  export let x: number;
	export let y: number;

  let element;

  const dispatch = createEventDispatcher();

  function onBodyClick(event) {
    if (event.target === element && element.contains(event.target)) return;

    dispatch('outsideClick');
  }
</script>

<svelte:body on:click={onBodyClick}/>

<div
  bind:this={element}
  style="left: {x}px; top: {y}px;"
  transition:fade={{ duration: 80 }}>
  <slot/>
</div>

<style>
	div {
    display: inline-block;
    margin: 0;
    padding: 0;
		position: absolute;
	}
</style>
