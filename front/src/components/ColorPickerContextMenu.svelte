<script lang='ts'>
  import ColorPicker from './ColorPicker.svelte';
  import ContextMenu from './ContextMenu.svelte';

  let show = false;
  let color = '#ff00bb';
  let position = {x: 0, y: 0};

  function onColorChange(rgba) {
    const hex = (byte: number) => (byte < 16) ? `0${byte.toString(16)}` : `${byte.toString(16)}`;

    color = `#${hex(rgba.detail.r)}${hex(rgba.detail.g)}${hex(rgba.detail.b)}`;
  }

  async function open(event) {
    if (show) {
      show = false;
      await new Promise((resolve, reject) => setTimeout(resolve, 80));
    }

    position.x = event.clientX;
    position.y = event.clientY;
    show = true;
  }

  function close() {
    show = false;
  }
</script>

<svelte:body on:contextmenu|preventDefault={open}/>

{#if show}
  <ContextMenu on:outsideClick={close} {...position}>
    <ColorPicker startColor={color} on:colorChange={onColorChange}/>
  </ContextMenu>
{/if}
