<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let toggles: boolean
  export let withLabel: string
  export let withDescription: string|undefined = undefined
  $: label = withLabel
  $: desc  = withDescription

  const toggle = () => toggles = !toggles
  const dispatch = createEventDispatcher()
  const clickEvent = (e: MouseEvent) => {
    toggle()
    dispatch('click', e) // emit click event to parent as hook to update stuff
  }

  const statesBody = {
    checked:   'bg-blue-600 group-hover:bg-blue-700',
    unchecked: 'bg-slate-300 group-hover:bg-slate-400'
  }
  $: stateBodyClasses = statesBody[toggles ? 'checked' : 'unchecked']

  const statesHandle = {
    checked:   'translate-x-2.5',
    unchecked: '-translate-x-2.5'
  }
  $: stateHandleClasses = statesHandle[toggles ? 'checked' : 'unchecked']
</script>

<div
  role="checkbox"
  aria-checked="{toggles}"
  tabindex="0"
  on:click={clickEvent}
  on:keydown={toggle}
  class="flex flex-1 w-full gap-3 cursor-pointer group">

  <div
    class={`flex shrink-0 w-11 h-6 rounded-full transition-all justify-center ${stateBodyClasses}`}>
    <span class={`m-0.5 aspect-square rounded-full transition-all bg-white group-hover:ring-4 ${stateHandleClasses}`} />
  </div>

  <div class="flex flex-col">
    <p class="text-base select-none group-hover:underline">
      {label}
    </p>
    {#if desc}
      <p class="text-sm select-none opacity-75 group-hover:underline">
        {desc}
      </p>
    {/if}
  </div>

</div>
