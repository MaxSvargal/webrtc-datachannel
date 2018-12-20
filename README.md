# webrtc-datachannel

It's a modern and simple library of webrtc data channels for comfortable use it in node js and browsers without dependencies.

This library doesn't include a signal server!

## Install

```
yarn add webrtc-datachannel
```
or
```
npm i webrtc-datachannel
```

## How to
The first, make an instance:
```javascript
import WebRtcDataChannel from 'webrtc-datachannel'

const rtc = new WebRtcDataChannel()
```

### Using simple API

Initiator:
```javascript
  const request = await rtc.initiateConnect()
  // Transfer the `request` to recipient via signaller (for example web-server or qr code)
  const answer = await getAnswer(request)
  // Then pass an `answer` here
  await rtc.setAnswer(answer)

  // Connection is opened!

  const response = await rtc.send({ question: 'How are you?' })
  console.log(response) // { answer: 'I am fine.' }
```

Recipient:
```javascript
  // Get `request` from initiator by signaller
  const answer = await rtc.initByRequest(request)
  // Then pass the `answer` back to initiator
  await sendAnswer(answer)

  // Just wait for open channel
  await rtc.channelOpened()

  // Connection is opened!

  // We can listen for messages or send messages here
  rtc.on('message', async (message) => {
    if (message.question === 'How are you?') {
      rtc.send({ answer: 'I am fine.' })
    }
  })
```

### Using extended API
Please, see [examples](#) folder