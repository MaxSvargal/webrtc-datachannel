import WebRTC from '../src/webrtc'
import lz from 'lz-string'
import qrcode from 'qrcode'

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

const offerForm = document.getElementById('offer')

offerForm!.addEventListener('submit', async (e) => {
  e.preventDefault()
  const value = e.target![0].value
  const { sdp: answer } = await rtc.setOffer(value)
  console.log('Pass answer to initiator:')
  console.log(answer)

  const compressed = lz.compressToUTF16(encodeURI(answer!))
  console.log(compressed)
  console.log('original size: ', answer!.length)
  console.log('compressed size: ', compressed.length)

  qrcode.toCanvas(document.getElementById('qrcode'), compressed)
})

const answerForm = document.getElementById('answer')

answerForm!.addEventListener('submit', async (e) => {
  e.preventDefault()
  const value = e.target![0].value
  const remote = await rtc.setRemote(value)
  console.log({ remote })
})

const candidatesForm = document.getElementById('candidates')

candidatesForm!.addEventListener('submit', async (e) => {
  e.preventDefault()
  const candidates = e.target![0].value
  console.log({ candidates })
  rtc.addCandidates(candidates)
})

const createOfferEl = document.getElementById('createOffer')
createOfferEl!.addEventListener('click', async () => {
  const { sdp: offer } = await rtc.createOffer()
  const candidates = await rtc.getCandidates()

  const request = JSON.stringify([ encodeURI(offer!), candidates ])
  const compressed = lz.compressToUTF16(request)
  console.log(compressed)
  console.log('original size: ', request.length)
  console.log('compressed size: ', compressed.length)

  qrcode.toCanvas(document.getElementById('qrcode'), compressed)

  const decompressed = lz.decompressFromUTF16(compressed)
  const [ encodedOffer, decodedCandidates ] = JSON.parse(decompressed)

  console.log('Pass it to recipient:')
  console.log(decodeURI(encodedOffer))
  console.log('Candidates:')
  console.log(decodedCandidates)
})