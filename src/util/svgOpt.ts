import { cloneDeep } from "lodash-es"
import { rgbaToHex } from "./colorUtils"
import {
  optimizeWithSvgo,
  parseSvgString,
  sizeOnlyInViewbox
} from "./svgOptUtils"


const svgOpt = async (params: {
  svgtb: SvgTokenBundle,
  options: {
    multipass: boolean,
    prettify: boolean,
    defineLibraryColors: boolean
  },
}): Promise<SvgTokenBundle> => new Promise((resolve, reject) => {

  const {
    svgtb: originalSvgtb,
    options,
  } = params

  const svgtb = cloneDeep(originalSvgtb)

  svgtb.svgs.forEach(async _namedSvgTuple => {

    //
    // 1. Optimize with SVGO
    let _opt = await optimizeWithSvgo({
      svg: _namedSvgTuple.svg,
      multipass: options.multipass,
      prettify: options.prettify
    })

    //
    // 2. Parse optimized SVG to a SVGElement
    let _parsedSvg = parseSvgString({
      svg: _opt
    })

    //
    // 3. Remove SVG if empty
    if (_parsedSvg.getAttribute('fill') == "")
      _parsedSvg.removeAttribute('fill')

    //
    // 4. Ensure SVG size is only set with viewBox
    sizeOnlyInViewbox({
      svg: _parsedSvg
    })


    // if the user wants to store the library color variables
    // as a class in the svg...
    if (options.defineLibraryColors) {
      const _ns = 'http://www.w3.org/2000/svg'
      
      //
      // 5. Make sure the <defs> element isn't missing
      let _defs: SVGDefsElement|null = _parsedSvg.querySelector('defs')
      if (_defs == null) {
        _defs = document.createElementNS(_ns, 'defs') as SVGDefsElement
      } else {
        _parsedSvg.removeChild(_defs)
      }


      //
      // 6. Rearrange defs to top
      _parsedSvg.insertBefore(_defs, _parsedSvg.firstChild)
      _parsedSvg.insertBefore(document.createTextNode('\n  '), _parsedSvg.firstChild)


      //
      // 7. Make sure the <style> element isn't missing
      let _style: SVGStyleElement|null = _defs.querySelector('style') as unknown as SVGStyleElement|null
      if (_style == null) {
        _style = document.createElementNS(_ns, 'style') as SVGStyleElement
        _defs.append(_style)
      }
      _style.setAttribute('type', 'text/css')
      _style.setAttribute('id', 'current-color-scheme')
      _defs.insertBefore(document.createTextNode('\n    '), _defs.firstChild)
      _defs.append(document.createTextNode('\n  '))


      //
      // 8. Iterate through the svg childs and check if any fill matches that
      //    of a NamedColor
      let _stylesToAdd: string[] = []
      let _addedStyles: Set<string> = new Set()
      const recursiveStyleSearch = (_node: SVGElement) => {
        const _children = Array.from(_node.children)

        if (_children.length > 0) {
          _children.forEach(_ch => recursiveStyleSearch(_ch as unknown as SVGElement))
          return
        }


        // get fill color ([todo]: also stroke) and try to get match against the tokens
        const _nodeFill = _node.getAttribute('fill')
        let _match = svgtb.colors.find(_color => _nodeFill?.toLowerCase() == rgbaToHex(_color.color))
        if (_match == null) return

        let _matchColorInHex = rgbaToHex(_match.color)

        // remove fill
        _node.removeAttribute('fill')
        if (!_addedStyles.has(_match.name)) {
          _stylesToAdd.push(`      .${_match.name} { color: ${_matchColorInHex}; }`)
          _addedStyles.add(_match.name)
        }
        _node.setAttribute('style', 'fill:currentColor')
        _node.setAttribute('class', _match.name)
      }

      recursiveStyleSearch(_parsedSvg)

      _style.append(document.createTextNode('\n' + _stylesToAdd.join('\n') + '\n'))
      _style.append(document.createTextNode('    '))

    }

    _opt = new XMLSerializer().serializeToString(_parsedSvg)
    _namedSvgTuple.optSvg = _opt
  })

  resolve(svgtb)
})


export {
  svgOpt
}
