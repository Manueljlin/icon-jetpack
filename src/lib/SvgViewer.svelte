<script lang="ts">
  import uuid4 from "uuid4"

  export let renders: string|undefined
  export let withLabel: string

  let svg: string|undefined

  $: if (renders) {
    /*
      The "why":

        1. SVGs have multiple ways to define their size.
             - width, height
             - viewBox
             - a mix of both
           In order for it to not have a fixed size when rendering on the page,
           that is, to fill the preview container, we have to define the
           size using viewBox exclusively.

        2. SVGs tend to have <defs> where gradients, classes etc gets defined.
           Despite being defined inside the SVG, when added to a website, the
           defs have global scope. 
           With SVGO outputs having such thrilling names as "a", "b" etc, it clashes
           almost immediately. There's nothing wrong with the icons, but the preview
           looks broken. We really want to avoid that.
           Solution? Concat a UUID to the id, class, etc name
    */

    const _uuid = uuid4()

    const _parsedSvg: HTMLElement = new DOMParser()
      .parseFromString(renders, 'image/svg+xml')
      .documentElement


    //-------------------------------------------------------------------------
    // change from width, height to viewBox

    const _width  = _parsedSvg.getAttribute('width')
    const _height = _parsedSvg.getAttribute('height')

    _parsedSvg.removeAttribute('width')
    _parsedSvg.removeAttribute('height')

    if (_parsedSvg.getAttribute('viewBox') == null) {
      _parsedSvg.setAttribute('viewBox', `0 0 ${_width} ${_height}`)
    }


    //-------------------------------------------------------------------------
    // concat uuid to all ids

    //
    // ids defs from non style tag (linearGradient etc)
    const _defs: SVGDefsElement|null = _parsedSvg.querySelector('defs')
    if (_defs != null) {
      Array.from(_defs.children).forEach(_child => {
        if (_child.tagName == 'STYLE') return
        const _id = _child.getAttribute('id')

        if (_id == null) return

        _child.setAttribute('id', _uuid + _id)
      })
    }


    const _urlRgx = /url\(#([^)]+)\)/
    // ids from each child
    Array.from(_parsedSvg.children).forEach(_child => {
      if (_child.tagName == 'DEFS') return

      _child.getAttributeNames().forEach(_attr => {
        const _attrVal     = _child.getAttribute(_attr)
        const _attrMatches = _attrVal?.match(_urlRgx)
        const _attrUrl     = _attrMatches?.[1]

        if (_attrMatches != null)
          _child.setAttribute(_attr,  `url(#${_uuid}${_attrUrl})`)
      })
    })

    svg = new XMLSerializer().serializeToString(_parsedSvg)
  }
</script>

<div class="flex flex-1 flex-col border overflow-clip bg-clip-content rounded-xl">
  {#if svg}
    {@html svg}
  {/if}
  <div class="flex flex-col px-3 py-2">
    <h3 class="text-lg">{withLabel}</h3>
    <p class="text-slate-600 truncate">{new Blob([renders ?? '']).size} bytes</p>
  </div>
</div>
