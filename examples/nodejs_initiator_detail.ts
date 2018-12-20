import WebRtcDataChannel from '../src'
import { askQuestion, wrtc } from './nodejs'

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
  if (message.question === 'I am fine.') {
    const answer2 = await rtc.send({ answer: 'And you?' })
    console.log({ answer2 })
  }
})

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

  console.log('Send welcome message...')
  const question = 'How are you?'
  console.log({ question })
  const answer = await rtc.send({ question })
  console.log({ answer })
}

main()
