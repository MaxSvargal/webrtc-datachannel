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
rtc.on('close', () => console.log('Datachannel closed'))
rtc.on('error', (error) => console.log('Datachannel error:', error))

rtc.on('message', async (message) => {
  console.log({ message })

  if (message.question === 'How are you?') {
    const answer = 'I am fine.'
    console.log({ answer })
    rtc.send({ answer })
    
    const question = 'And you?'
    const answer2 = await rtc.send({ question })
    console.log({ answer2 })
  }
})

const main = async () => {
  rtc.createChannel()

  const request = await askQuestion('Type request: ')
  const [ encodedOffer, decodedCandidates ] = JSON.parse(request)

  const answer = await rtc.setOffer(decodeURI(encodedOffer))

  await rtc.addCandidates(decodedCandidates)
  const candidates = await rtc.getCandidates()

  const response = JSON.stringify([ encodeURI(answer!), candidates ])

  const compressed = lz.compressToUTF16(encodeURI(response))
  console.log('original size: ', response!.length)
  console.log('compressed size: ', compressed.length)

  console.log('Pass answer to initiator:')
  console.log(response)
}

main()
