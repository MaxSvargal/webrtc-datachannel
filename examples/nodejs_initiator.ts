import WebRtcJsonp from '../src/webrtc'
import { askQuestion, wrtc } from './nodejs'

const rtc = new WebRtcJsonp({
  wrtc,
  connection: {
    iceServers: [
      { urls: [ 'stun:stun.l.google.com:19302' ] }
    ]
  }
})

const main = async () => {
  const request = await rtc.initiateConnect()
  console.log('Pass request to recipient:')
  console.log(request)

  const response = await askQuestion('Type answer: ')
  await rtc.setAnswer(response)

  console.log('Connection opened')

  rtc.on('message', async (message) => {
    console.log({ message })

    if (message.answer === 'I am fine.') {
      await rtc.send({ answer: 'Nice.' })
    }

    if (message.question === 'And you?') {
      await rtc.send({ answer: 'I am fine too.' })
    }
  })

  console.log('Send welcome message...')
  const question = 'How are you?'
  console.log({ question })
  const answer = await rtc.send({ question })
  console.log({ answer })
}

main()
