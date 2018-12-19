import WebRTC from '../src/webrtc'
import { askQuestion, wrtc } from './nodejs'

const rtc = new WebRTC({
  wrtc,
  connection: {
    iceServers: [
      { urls: [ 'stun:stun.l.google.com:19302' ] }
    ]
  }
})

const main = async () => {
  const request = await askQuestion('Type request: ')
  const response = await rtc.initByRequest(request)
  console.log('Pass answer to initiator:')
  console.log(response)

  await rtc.channelOpened()

  console.log('Connection opened')

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
}

main()