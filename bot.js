const Router = require('koa-router')
const request = require('request')
const getBalance = require('./services/getBalance')

const router = new Router()

const MESSAGES = {
  BALANCE: 'solde',
}

router.get('/', ctx => {
  ctx.body = `
    <html>
      <head><title>Messenger bot</title></head>
      <body><h1>Hello Messenger!</h1></body>
    </html>
  `
})

// Accepts GET requests at the /webhook endpoint
router.get('/webhook', async ctx => {
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = 'myToken'

  // // Parse params from the webhook verification request
  let mode = ctx.query['hub.mode']
  let token = ctx.query['hub.verify_token']
  let challenge = ctx.query['hub.challenge']

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request

      ctx.status = 200
      ctx.body = challenge
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      ctx.status = 403
    }
  }
})

// Creates the endpoint for our webhook
router.post('/webhook', async (ctx) => {
  let body = ctx.request.body

  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0]
      console.log(webhook_event)

      if (webhook_event.message.contains(MESSAGES.BALANCE) ) {
        const balance = (await getBalance()).data
        await handleMessage(webhook_event.sender.id, balance)
      } else {
        handleMessage(webhook_event.sender.id, webhook_event.message)
      }
    })

    // Returns a '200 OK' response to all requests
    ctx.status = 200
    ctx.body = 'EVENT_RECEIVED'
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    ctx.status = 404
  }
})

function handleMessage(sender_psid, received_message) {
  let response

  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    response = {
      text: `You sent the message: "${received_message.text}"`
    }
  }

  // Sends the response message
  callSendAPI(sender_psid, response)
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid
    },
    message: response
  }

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token:
          'EAAePmQOffSMBAFeT1zPJL1FZAioSiZBW60e1LGhW3WTbeznyVHYhYe0zPrzAWLRsYZCK3YAuMgBQPALOYPrmS8rwf9VbudWPLKQsOErSZApb0gveDlpe9m2n6QsdCdYXeeFQ1qeXY7lb8qKy7Xg2Ip0AVDpAm0gsYb6EntZAIeQZDZD'
      },
      method: 'POST',
      json: request_body
    },
    (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error('Unable to send message:' + err)
      }
    }
  )
}

module.exports = router
