import WebRTC from '../src/webrtc'
import { lz, askQuestion, wrtc } from './nodejs'

const rtc = new WebRTC({
  wrtc,
  connection: {
    iceServers: [
      { urls: [ 'stun:stun.l.google.com:19302' ] }
    ]
  }
})

rtc.on('open', () => console.log('Datachannel opened'))
rtc.on('message', async (message) => {
  console.log({ message })

  if (message.question === 'How are you?') {
    const question = 'I am fine. And you?'
    console.log({ question })
    const answer = await rtc.send({ question })
    console.log({ answer })
  }
})

const mainSimple = async () => {
  const request = await askQuestion('Type request: ')
  const response = await rtc.initByRequest(request)
  console.log('Pass answer to initiator:')
  console.log(response)

  await rtc.channelOpened()

  console.log('Connection opened')
}

const main = async () => {
  rtc.createChannel()

  const request = await askQuestion('Type request: ')
  const [ encodedOffer, decodedCandidates ] = JSON.parse(request)
  console.log({encodedOffer, decodedCandidates})

  const answer = await rtc.setOffer(decodeURI(encodedOffer))
  console.log({ answer })
  await rtc.addCandidates(decodedCandidates)
  // waitinf for candidates?
  const candidates = await rtc.getCandidates()
  console.log({ candidates })
  const response = JSON.stringify([ encodeURI(answer!), candidates ])

  const compressed = lz.compressToUTF16(encodeURI(response))
  console.log('original size: ', response!.length)
  console.log('compressed size: ', compressed.length)

  console.log('Pass answer to initiator:')
  console.log(response)
}

mainSimple()
console.log(main)
