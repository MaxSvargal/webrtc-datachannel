
import { EventEmitter } from 'events'

interface IOptions {
  connection: RTCConfiguration
}

export default class WebRTC extends EventEmitter {
  private rpc: RTCPeerConnection

  constructor({ connection }: IOptions) {
    super()
    this.rpc = new RTCPeerConnection(connection)
    console.log(this.rpc)
    this.rpc.onicecandidate = candidate => this.emit('icecandidate', candidate)
    this.rpc.onnegotiationneeded = () => this.emit('negotiationneeded')
    this.rpc.ondatachannel = event => this.emit('datachannel', event)
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
}