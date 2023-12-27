const dirname = (path: string) => path.substring(0, path.lastIndexOf('/'))

const join = (... parts) => parts.join('/')

const path = {
  dirname,
  join
}

export default path

export {
  dirname,
  join
}
