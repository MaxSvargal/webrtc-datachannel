import WebRTC from '../src/webrtc'
import { lz, askQuestion, wrtc } from './nodejs'

const rtc = new WebRTC({
  wrtc,
  compressor: {
    compress: lz.compressToUTF16,
    decompress: lz.decompressFromUTF16
  },
  connection: {
    iceServers: [
      { urls: [ 'stun:stun.l.google.com:19302' ] }
    ]
  }
})

rtc.on('open', () => console.log('Channel opened'))
rtc.on('message', (message) => {
  if (message.question === 'I am fine. And you?') {
    rtc.send({ answer: 'I am fine too.' })
  }
})

const mainSimple = async () => {
  const request = await rtc.initiateConnect()
  console.log('Pass request to recipient:')
  console.log(request)

  const response = await askQuestion('Type answer: ')
  await rtc.setAnswer(response)

  console.log('Connection opened')
}

const main = async () => {
  rtc.createChannel()

  const offer = await rtc.createOffer()
  const candidates = await rtc.getCandidates()

  const request = JSON.stringify([ encodeURI(offer!), candidates ])
  console.log('Pass request to recipient:')
  console.log(request)

  const response = await askQuestion('Type answer: ')
  const [ encodedAnswer, decodedCandidates ] = JSON.parse(response)

  await rtc.setRemote(decodeURI(encodedAnswer))
  await rtc.addCandidates(decodedCandidates)
  await rtc.channelOpened()

  console.log('opened')

  console.log('Send welcome message...')
  const question = 'How are you?'
  console.log({ question })
  const answer = await rtc.send({ question })
  console.log({ answer })
}

mainSimple()
console.log(main)