interface JRPCMessage {
  nonce: number
  message: string
}

interface IOptions {
  connection?: RTCConfiguration
  wrtc?: {
    RTCPeerConnection: typeof RTCPeerConnection
    RTCIceCandidate: typeof RTCIceCandidate
  }
}

export default class WebRtcDataChannel {
  private rpc: RTCPeerConnection
  private RTCIceCandidate: typeof RTCIceCandidate
  private candidates: RTCIceCandidate[] = []
  private alisteners: { [nonce: number]: Function } = {}
  private eventsListeners: { [event: string]: Function[] } = {}
  private dataChannel: RTCDataChannel | null = null
  private messageNonce = 0

  constructor({ connection, wrtc }: IOptions = {}) {
    const RTC = wrtc ? wrtc.RTCPeerConnection : RTCPeerConnection
    this.RTCIceCandidate = wrtc ? wrtc.RTCIceCandidate : RTCIceCandidate

    this.rpc = new RTC(connection)

    this.rpc.onicecandidate = ({ candidate }) =>
      candidate && (
        this.candidates.push(candidate),
        this.emit('icecandidate', candidate)
      )

    this.rpc.ondatachannel = event => {
      this.dataChannel = event.channel
      this.emit('datachannel', event)
    }
    
    this.rpc.onconnectionstatechange = event =>
      this.emit('connectionstatechange', event)
  }

  on = (event: string, subscriber: (event: any) => void) =>
    Array.isArray(this.eventsListeners[event])
      ? this.eventsListeners[event].push(subscriber)
      : this.eventsListeners[event] = [ subscriber ]

  emit = (event: string, data?: any) =>
    Array.isArray(this.eventsListeners[event]) &&
      this.eventsListeners[event].forEach(fn => fn(data))

  getCandidates = async (i = 0): Promise<string> => {
    if (i >= 20) return Promise.reject('No connection.')
    if (this.candidates.length > 0)
      return Promise.resolve(JSON.stringify(this.candidates))
    else {
      await new Promise(resolve => setTimeout(resolve, 100))
      return await this.getCandidates(++i)
    }
  }

  createOffer = async () => {
    const offer = await this.rpc.createOffer()
    await this.rpc.setLocalDescription(offer)
    return offer.sdp as string
  }

  createChannel = (name = 'chat') => {
    const channel = this.rpc.createDataChannel(name)
    channel.onopen = () => this.emit('open')
    channel.onclose = () => this.emit('close')
    channel.onerror = error => this.emit('error', error)
    channel.onmessage = ({ data }: { data: string }) => {
      try {
        const msg: JRPCMessage = JSON.parse(data)
        const { nonce, message } = msg
        this.emit('message', message)

        if (this.alisteners[nonce]) {
          this.alisteners[nonce](message)
          delete this.alisteners[nonce]
        }
      } catch (err) {
        console.error('Message couldn\'t be parsed. It has not a valid format.')
      }
    }
    return channel
  }

  setOffer = async (offer: string) => {
    await this.rpc.setRemoteDescription({ type: 'offer', sdp: offer })
    const answer = await this.rpc.createAnswer()
    await this.rpc.setLocalDescription(answer)
    return answer.sdp
  }

  setRemote = async (answer: string) => {
    await this.rpc.setRemoteDescription({ type: 'answer', sdp: answer })
    return this.rpc.currentRemoteDescription
  }

  addCandidates = async (candidates: string) => {
    const values = JSON.parse(candidates) as RTCIceCandidateInit[]
    const promises = values.map(candidate =>
      this.rpc.addIceCandidate(new this.RTCIceCandidate(candidate)))

    await Promise.all(promises)
    return this.candidates
  }

  channelOpened = async () =>
    new Promise(resolve => this.dataChannel ? resolve() : this.on('datachannel', resolve))

  send = (message: any): Promise<MessageEvent> =>
    new Promise((resolve, reject) => {
      if (!this.dataChannel)
        return reject(Error('dataChannel doesn\'t opened'))

      this.dataChannel.send(JSON.stringify({
        nonce: ++this.messageNonce,
        message
      } as JRPCMessage))

      this.alisteners[this.messageNonce] = resolve
    })

  initiateConnect = async () => {
    this.createChannel()
    const offer = await this.createOffer()
    const candidates = await this.getCandidates()
    const request = JSON.stringify([ encodeURI(offer!), candidates ])
    return request
  }

  setAnswer = async (response: string) => {
    try {
      const [ encodedAnswer, decodedCandidates ] = JSON.parse(response)
      await this.setRemote(decodeURI(encodedAnswer))
      await this.addCandidates(decodedCandidates)
      await this.channelOpened()
    } catch (err) {
      return err
    }
  }

  initByRequest = async (request: string) => {
    this.createChannel()
    const [ encodedOffer, decodedCandidates ] = JSON.parse(request)
    const answer = await this.setOffer(decodeURI(encodedOffer))
    await this.addCandidates(decodedCandidates)
    const candidates = await this.getCandidates()
    const response = JSON.stringify([ encodeURI(answer!), candidates ])
    return response
  }
}
