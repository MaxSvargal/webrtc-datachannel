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
rtc.on('message', (message) => console.log('message', message))
rtc.on('datachannel', (event) => console.log('datachannel', event))

rtc.createChannel()

rtc.on('negotiationneeded', async () => {
  console.log('negotiationneeded')
})

const main = async () => {
  const { sdp: offer } = await rtc.createOffer()
  const candidates = await rtc.getCandidates()

  const request = JSON.stringify([ encodeURI(offer!), candidates ])
  const compressed = lz.compressToUTF16(request)
  console.log('original size: ', request.length)
  console.log('compressed size: ', compressed.length)
  const decompressed = lz.decompressFromUTF16(compressed)

  console.log('Pass request it to recipient:')
  console.log(decompressed)

  const answer = await askQuestion('Type answer: ')
  const remote = await rtc.setRemote(decodeURI(answer))
  console.log(remote)
}

main()
