const
  express = require('express')
  ,router = express.Router()
  ,{ join } = require('path')
  ,axios = require('axios')
  // ,{ Observable } = require('rxjs/Rx')
  ,isError = require('lodash/fp/isError')
  ,isObject = require('lodash/fp/isObject')
  ,isString = require('lodash/fp/isString')
  ,{ load } = require('cheerio')
  ,{ validateLogJson
    ,validateAndMineLogHtml
    ,TakeNTimesWithDelay$
    ,Combined$ } = require('../log/helpers')

/* /api/12345 */
router.get('/:logId', (req, res, next) => {
  const { logId } = req.params

  // validate logId
  const pathRegex = /^\/?\d+$/g
  if (!pathRegex.test(logId)) res.status(400).end()
  else {
    const
      htmlUrl = 'http://' + join('logs.tf/', logId),
      jsonUrl = 'http://' + join('logs.tf/json/', logId)

    const json$ = TakeNTimesWithDelay$({
      promise: () => axios(jsonUrl),
      validationFn: validateLogJson
    })

    const html$ = TakeNTimesWithDelay$({
      promise: () => axios(htmlUrl),
      validationFn: validateAndMineLogHtml
    })

    // combined latest from html$ and json$
    const combined$ = Combined$(json$, html$)
      .subscribe(
        next => {
          //console.log(next)
          res.send(next).end()
        },
        err => {
          console.error(err)
          res.status(500).end()
        }
      )

    // temporary
    // res.send(JSON.stringify({
    //   json: `http://logs.tf/json/${ logId }`,
    //   log: `http://logs.tf/${ logId }`
    // }))
  }
})

module.exports = router
