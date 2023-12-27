const isMessageResult = <T>(object: any): object is MessageResult<T> => {
  if (object == null) {
    console.log('[IconJetpack:isMessageResult] failed null')
    return false
  }

  if (!('sender' in object)) {
    console.log('[IconJetpack:isMessageResult] failed sender: none')
    return false
  }

  if (
    'sender' in object
    && typeof object?.sender !== 'string'
  ) {
    console.log('[IconJetpack:isMessageResult] failed sender: non string')
    return false
  }

  if (
    'data' in object
    && typeof object.data === 'undefined'
  ) {
    console.log('[IconJetpack:isMessageResult] failed data: defined but no payload')
    return false
  }

  return true
}


export {
  isMessageResult
}
