<script lang="ts">
  import { onMount } from "svelte"
  import { emitter } from "./emitter"

  import Button from "./lib/Button.svelte"
  import Toggle from "./lib/Toggle.svelte"
  import SvgViewer from "./lib/SvgViewer.svelte"

  import JSZip from 'jszip'
  import { isMessageResult } from "./isMessageResult"
  import { svgOpt } from "./util/svgOpt"


  let svgtb: SvgTokenBundle = {
    svgs: [],
    colors: []
  }

  let prettify: boolean         = true
  let multipass: boolean        = true
  let defLibraryColors: boolean = true


  onMount(() => {

    // `code.js`/figma communication
    onmessage = async (e: MessageEvent) => {
      if (
        typeof e.data !== "object"
        || !('pluginMessage' in e.data)
        || !isMessageResult(e.data.pluginMessage)
      ) return

      switch (e.data.pluginMessage.sender) {
        case 'figma-selected-frames':
          let _svgtb = e.data.pluginMessage.data as unknown as SvgTokenBundle
          svgtb = await svgOpt({
            svgtb: _svgtb,
            options: {
              multipass: multipass,
              prettify: prettify,
              defineLibraryColors: defLibraryColors
            },
          })
          break

        default:
          console.log(`Unimplemented ${e.data.pluginMessage}`)
          break
      }
    }
  })

  const downloadSvgs = async () => {
    const svgs = svgtb.svgs

    if (svgs.length == 0) return

    if (svgs.length == 1) {
      // TODO: don't assume item will be at 0 index pos
      const blob = new Blob([svgs[0].optSvg ?? ''], { type: 'image/svg+xml' })
      _downloader(blob, svgs[0].name, 'svg')
      return
    }

    const zip = new JSZip()

    // avoid overwriting svgs with the same name
    let usedNames: string[] = []
    svgs.forEach(_svg => {
      let _num = 0

      let name = ""
      do {
        name = _svg.name + (_num == 0 ? '': `__${_num}`)
        _num++
      } while (usedNames.includes(name))

      zip.file(name + '.svg', _svg.optSvg ?? '')
      usedNames.push(_svg.name)
    })

    const blob = await zip.generateAsync({
      type: 'blob'
    })
    _downloader(blob, 'icons', 'zip')
  }

  const _downloader = (
    blob: Blob,
    filename: string,
    extension: string
  ) => {
      const a = document.createElement('a')
      document.body.appendChild(a)
      a.setAttribute('style', 'display: none')

      a.href = URL.createObjectURL(blob)
      a.download = filename + '.' + extension
      a.href = URL.createObjectURL(blob)
      a.click()

      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
  }


  //---------------------------------------------------------------------------
  // Window resizing

  let resizeHandle: HTMLSpanElement|undefined

  const resizeWindow = (e: PointerEvent) => {
    const windowSize = {
      width:  Math.floor(e.clientX + 5),
      height: Math.floor(e.clientY + 5),
    }

    parent
      .postMessage({
        pluginMessage: {
          type: 'window-resize',
          size: windowSize
        }
      }, '*')
  }

  const pointerDown = (e: PointerEvent) => {
    if (resizeHandle == null) return

    resizeHandle.onpointermove = resizeWindow
    resizeHandle.setPointerCapture(e.pointerId)
  }

  const pointerUp = (e: PointerEvent) => {
    if (resizeHandle == null) return

    resizeHandle.onpointermove = null
    resizeHandle.releasePointerCapture(e.pointerId)
  }
</script>

<main class="flex flex-col h-screen overflow-hidden">

  <!-- content container -->
  <div class="flex flex-1 flex-col overflow-auto bg-slate-100 @container">

    <!-- navbar -->
    <nav class="
      flex flex-1 sticky z-10
      top-0 left-0 right-0
      px-4 py-3 gap-3 
      bg-white/70
      drop-shadow-lg
      filter backdrop-blur-lg
      ring-1 ring-black/5
      align-baseline
    ">
      <h1 class="text-xl flex-1">Icon Jetpack</h1>
      <h2 class="text-sm opacity-75">{svgtb.svgs.length} icons optimized</h2>
    </nav>

    <!-- content -->
    <div class="
      grid grid-cols-1 auto-rows-max @lg:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4
      flex-[9999] flex-col h-screen 
      px-4 py-3 @lg:px-8 @lg:py-7
      gap-y-7 gap-x-8
    ">
      {#if svgtb.svgs.length == 0}
        select icons and click optimize.
      {:else}
        {#each svgtb.svgs as _svg}
          <div class="flex flex-col gap-1">
            <h3 class="text-lg truncate">{_svg.name}</h3>
            <div class="flex flex-1 gap-1">
              <SvgViewer renders={_svg.svg} withLabel="Before" />
              <SvgViewer renders={_svg.optSvg} withLabel="After" />
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- actions container -->
  <div class="flex flex-col border-t border-slate-300 px-4 py-3 gap-3">
    <Toggle
      bind:toggles={prettify}
      on:click={() => emitter('get-selected-frames')}
      withLabel="Prettify"
      withDescription="Use pretty human readable indentation, which makes it a bit larger" />

    <Toggle
      bind:toggles={multipass}
      on:click={() => emitter('get-selected-frames')}
      withLabel="Multipass"
      withDescription="Do multiple passes, get smaller size. Respects the Prettify option." />

    <Toggle
      bind:toggles={defLibraryColors}
      on:click={() => emitter('get-selected-frames')}
      withLabel="Define library colors"
      withDescription="Embed the used Figma library colors inside the SVG's CSS stylesheet." />

    <div class="flex gap-2">
      <Button
        fullWidth
        variant="primary"
        on:click={downloadSvgs}
        disabled={svgtb.svgs.length == 0}
        withLabel={svgtb.svgs.length < 2 ? 'Export .svg' : 'Export .zip'} />
      <Button
        fullWidth
        on:click={() => emitter('close-plugin')}
        withLabel="Close" />
    </div>
  </div>

  <span
    class="h-5 w-5 bg-slate-300 fixed bottom-0 right-0 cursor-se-resize rounded-tl-full"
    bind:this={resizeHandle}
    on:pointerdown={pointerDown}
    on:pointerup={pointerUp} />
</main>
