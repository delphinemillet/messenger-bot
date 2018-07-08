const Koa = require('koa')
const bodyParser = require('koa-body')
const bot = require('./bot')

const PORT = process.env.PORT || 3000
const LISTEN_HOST = process.env.LISTEN_HOST || '0.0.0.0'

process.on('unhandledRejection', error => {
  console.trace(error)
})

const app = new Koa()

app.use(bodyParser({ multipart: true, urlencoded: true, strict: false }))

app.use(bot.routes())

const server = app.listen(PORT, LISTEN_HOST, () => {
  console.log(`Listening to ${LISTEN_HOST}:${PORT}`)
})

const interrupt = sigName => () => {
  console.info(`caught interrupt signal -${sigName}-`)

  console.info('closing HTTP socket...')
  server.close(() => {
    process.exit(0)
  })
}
;[
  'SIGUSR1',
  'SIGINT',
  'SIGTERM',
  'SIGPIPE',
  'SIGHUP',
  'SIGBREAK',
  'SIGWINCH'
].forEach(sigName => {
  process.on(sigName, interrupt(sigName))
})
