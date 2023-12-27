import { optimize } from "svgo"


// TODO: handle error properly lol
const optimizeWithSvgo = async (params: {
  svg: string
  multipass: boolean
  prettify: boolean
}): Promise<string> => {
  const { svg, multipass, prettify } = params
  
  return await optimize(svg, { // it actually returns a promise since v1
      multipass: multipass,
      js2svg: {
        indent: 2,
        pretty: prettify
      },
    }).data
}


const parseSvgString = (params: {
  svg: string
}): SVGElement => {
  const { svg } = params

  return new DOMParser()
    .parseFromString(svg, 'image/svg+xml')
    .documentElement as unknown as SVGElement
}


const sizeOnlyInViewbox = (params: {
  svg: SVGElement
}) => {
  const { svg } = params

  const width  = svg.getAttribute('width')
  const height = svg.getAttribute('height')

  svg.removeAttribute('width')
  svg.removeAttribute('height')

  if (svg.getAttribute('viewBox') == null) {
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  }
}


export {
  optimizeWithSvgo,
  parseSvgString,
  sizeOnlyInViewbox
}
