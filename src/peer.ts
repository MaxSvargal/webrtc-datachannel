import WebRTC from './webrtc'
import lz from 'lz-string'

const readline = require('readline')
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, (ans: string) => {
      rl.close();
      resolve(ans);
  }))
}

const rtc = new WebRTC({
  connection: {
    iceServers: [
      { urls: [ 'stun:stun.l.google.com:19302' ] }
    ]
  }
})

rtc.on('icecandidate', (candidate) => console.log(candidate.candidate))
rtc.on('open', () => console.log('open'))
rtc.on('message', (message) => (console.log('message', message), rtc.sendMessage({ type: 'response', message: 'Bar' })))
rtc.on('msg', (msg) => console.log('msg', msg))
rtc.on('datachannel', (event) => console.log('datachannel', event))

const main = async () => {
  rtc.createChannel()

  const request = await askQuestion('Type request: ')
  const [ encodedOffer, decodedCandidates ] = JSON.parse(request)

  const { sdp: answer } = await rtc.setOffer(decodeURI(encodedOffer))
  await rtc.addCandidates(decodedCandidates)
  // waitinf for candidates?
  const candidates = await rtc.getCandidates()
  const response = JSON.stringify([ encodeURI(answer!), candidates ])

  const compressed = lz.compressToUTF16(encodeURI(response))
  console.log('original size: ', response!.length)
  console.log('compressed size: ', compressed.length)

  console.log('Pass answer to initiator:')
  console.log(response)
}

main()
