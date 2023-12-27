// adapted from https://github.com/figma-plugin-helper-functions/figma-plugin-helpers/blob/master/src/helpers/convertColor.ts -- thanks!


const rgbaToHex = (color: RGBA): string => {
  let _hex = '#'

  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)

  _hex += ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)

  if (color.a != 1) {
    const a = Math.round((Math.round(color.a * 100) / 100) * 255).toString(16)

    if (a.length === 1)
      _hex += '0' + a

    else if (a !== 'ff') _hex += a
  }

  return _hex
}


export {
  rgbaToHex
}
