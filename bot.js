const Router = require('koa-router')

const router = new Router()

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
router.post('/webhook', ctx => {
  let body = ctx.request.body

  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0]
      console.log(webhook_event)
    })

    // Returns a '200 OK' response to all requests
    ctx.status = 200
    ctx.body = 'EVENT_RECEIVED'
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    ctx.status = 404
  }
})

module.exports = router
