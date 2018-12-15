import WebRTC from './src'

const rtc = new WebRTC({
  connection: {
    iceServers: [
      { urls: [ 'stun:stun.l.google.com:19302' ] }
    ]
  }
})

rtc.on('icecandidate', (candidate) => console.log(candidate))
rtc.on('open', () => console.log('open'))
rtc.on('message', (message) => console.log('message', message))
rtc.on('datachannel', (event) => console.log('datachannel', event))

rtc.createChannel()

rtc.on('negotiationneeded', async () => {
  console.log('negotiationneeded')
  const offer = await rtc.createOffer()
  console.log(offer.sdp)
})

const peerForm = document.getElementById('peer')
peerForm.addEventListener('submit', (e) => {
  e.preventDefault()
  console.log(e.target[0].value)
})
