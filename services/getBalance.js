const fetch = require('node-fetch')
const cheerio = require('cheerio')
const getNewSession = require('./getNewSession')
const getHeaders = require('./getHeaders')

const MAX_BALANCE_RETRY = process.env.MAX_BALANCE_RETRY || 5

const getBalance = async () => {
  const summary = await fetch(
    'https://mabanque.fortuneo.fr/fr/prive/mes-comptes/synthese-globale/synthese-mes-comptes.jsp',
    {
      headers: getHeaders({
        cookieJar: await getNewSession(),
        referer: 'https://mabanque.fortuneo.fr/fr/prive/default.jsp?ANav=1'
      }),
    }
  )

  const summaryHTML = await summary.text()
  const $ = cheerio.load(summaryHTML)
  const balanceStr = $('span.synthese_solde_compte').text()
  return +balanceStr.replace(/[+|EUR]/g, '').trim().replace(',', '.')
}

// with retry
module.exports = async () => {
  let balance = 0
  let retry = -1
  while (balance === 0 && retry < MAX_BALANCE_RETRY) {
    retry += 1
    balance = await getBalance()
  }

  if (retry >= MAX_BALANCE_RETRY) {
    const error = new Error('retry_exceed')
    error.payload = { max: MAX_BALANCE_RETRY }
    console.trace(error)
    throw error
  }

  return { data: balance, metadata: { retry } }
}
