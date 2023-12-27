<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let variant: 'regular' | 'primary' = 'regular'
  export let fullWidth: boolean = false
  export let disabled: boolean = false
  export let withLabel: string

  const dispatch = createEventDispatcher()
  const clickEvent = (e: MouseEvent) => {
    if (disabled) {
      e.stopPropagation()
      return
    }

    dispatch('click', e)
  }

  const variants = {
    regular: 'bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-black',
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white',
  }

  $: variantClasses   = variants[variant]
  $: fullWidthClasses = fullWidth ? 'w-full' : ''
  $: disabledClasses  = disabled ? 'opacity-50' : ''
</script>

<div
  role="button"
  tabindex="0"
  class={`flex flex-1 shrink-0 rounded-full px-4 py-2 items-center justify-center align-middle ${variantClasses} ${fullWidthClasses} ${disabledClasses}`}
  on:click={clickEvent}
  on:keydown>
  <p class="truncate">{withLabel}</p>
</div>
