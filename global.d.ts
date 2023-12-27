declare module 'svgo/dist/svgo.browser'
declare module 'uuid4'




interface sRGB {
  r: number
  g: number
  b: number
  a?: number
}




interface SvgTokenBundle {
  svgs: NamedSvg[],
  colors: NamedColor[]
}

type NamedSvg = {
  name: string,
  svg: string,
  optSvg?: string
}




type NamedColor = {
  name: string,
  color: RGBA
}

type MessageResult<T = undefined> = {
  sender: string
  message?: string
  data?: T
}
