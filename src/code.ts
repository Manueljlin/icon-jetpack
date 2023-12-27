//-----------------------------------------------------------------------------
// Icon Jetpack
//-----------------------------------------------------------------------------
// Due to Figma's Plugin API limitations, everything on the final `code.js`
// has to be self contained. We can't really use imports at all.
// 
// We could use Rollup or similar, but that adds a new layer of complexity and
// moving bits and bobs. I don't feel like doing, sorry.
// Feel free to MR/PR it in though, if it isn't too complex I'll merge it.
//-----------------------------------------------------------------------------




//-----------------------------------------------------------------------------
// Constants

const defaultWidth  = 400
const defaultHeight = 700




//-----------------------------------------------------------------------------
// Figma - Plugin UI bridge logic / glue


//
// Communication between Plugin UI and Figma object
figma.ui.onmessage = msg => {

  switch (msg.type) {
    case 'get-selected-frames':
      sendSelectedFrames()
      break
  
    case 'close-plugin':
      figma.closePlugin()
      break

    case 'window-resize':
      // from https://gist.github.com/sonnylazuardi/e55300f28fbe109db052f6568fee5a04 -- thanks!
      figma.ui.resize(
        Math.max(defaultWidth, msg.size.width),
        Math.max(defaultHeight, msg.size.height),
      )
      break
    
    default:
      console.log(msg.type + ' is not implemented yet')
      break
  }
}


const sendSelectedFrames = () => {
  const colorLibrary: NamedColor[] = figma.getLocalPaintStyles()
    .filter(_ps => _ps.paints.length == 1 
      && _ps.paints[0].type == 'SOLID')
    .map(_ps => {
      return <NamedColor>{
        name: _ps.name,
        color: <RGBA>{
          ...(_ps.paints[0] as SolidPaint).color,
          a: _ps.paints[0].opacity
        }
    }})
  

  const exportPromises: Array<Promise<NamedSvg>> = figma
    .currentPage
    .selection
    .map(_node => _node
      .exportAsync({ format: 'SVG_STRING' })
      .then(_svg => {
        return {
          name: _node.name,
          svg: _svg
        }}))


  let bundle: SvgTokenBundle = {
    svgs: [],
    colors: colorLibrary
  }
  Promise
    .all(exportPromises)
    .then(_res => {
      // console.log(_res)
      bundle.svgs = _res

      figma.ui.postMessage(<MessageResult<SvgTokenBundle>>{
        sender: 'figma-selected-frames',
        data: bundle
      })
    })
}

figma.on('selectionchange', sendSelectedFrames)
figma.showUI(
  __html__,
  {
    width: 400, // duplicated because figma doesn't see the constants on launch :(
    height: 700,
    title: 'Icon Jetpack'
  }
)
sendSelectedFrames()
