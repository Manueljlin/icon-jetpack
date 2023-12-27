export const emitter = (type: string, value?: any) => {
  parent
    .postMessage({
      pluginMessage: {
        type: type,
        value
      }
    }, '*')
}
