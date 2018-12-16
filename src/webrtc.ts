import { EventEmitter } from 'events'

const wrtc = require('wrtc') // nodejs

interface IOptions {
  connection: RTCConfiguration
}

export default class WebRTC extends EventEmitter {
  private rpc: RTCPeerConnection
  private candidates: RTCIceCandidate[]
  private dataChannel: RTCDataChannel | null

  constructor({ connection }: IOptions) {
    super()
    this.candidates = []
    this.dataChannel = null
    this.rpc = new wrtc.RTCPeerConnection(connection)
    this.rpc.onicecandidate = ({ candidate }) => (console.log({ candidate }), candidate && this.candidates.push(candidate))
    this.rpc.onnegotiationneeded = () => this.emit('negotiationneeded')
    this.rpc.ondatachannel = event => {
      this.dataChannel = event.channel
      this.dataChannel.onmessage = (msg) => this.emit('msg', msg)
      this.emit('datachannel', event)
    }
    this.rpc.onconnectionstatechange = event => console.log('connectionstatechange', event)
  }

  getCandidates = async (i = 0): Promise<string | null> => {
    if (i >= 10) return null
    if (this.candidates.length >= 3)
      return Promise.resolve(JSON.stringify(this.candidates))
    else {
      await new Promise(resolve => setTimeout(resolve, 300))
      return await this.getCandidates(++i)
    }
  }

  createOffer = async () => {
    const offer = await this.rpc.createOffer()
    await this.rpc.setLocalDescription(offer)
    return offer
  }

  createChannel = (name = 'chat') => {
    const channel = this.rpc.createDataChannel(name)
    channel.onopen = () => this.emit('channelopen')
    channel.onmessage = ({ data }) => this.emit('message', data)
    return channel
  }

  setOffer = async (offer: string) => {
    await this.rpc.setRemoteDescription({ type: 'offer', sdp: offer })
    const answer = await this.rpc.createAnswer()
    await this.rpc.setLocalDescription(answer)
    return answer
  }

  setRemote = async (answer: string) => {
    await this.rpc.setRemoteDescription({ type: 'answer', sdp: answer })
    return this.rpc.currentRemoteDescription
  }

  addCandidates = async (candidates: string) => {
    const values = JSON.parse(candidates) as RTCIceCandidateInit[]
    const promises = values.map((candidate) => this.rpc.addIceCandidate(new wrtc.RTCIceCandidate(candidate)))
    await Promise.all(promises)
    return this.candidates
  }

  sendMessage = (message: object) =>
    this.dataChannel!.send(JSON.stringify(message))
}