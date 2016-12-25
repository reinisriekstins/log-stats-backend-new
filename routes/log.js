const
  express = require('express'),
  router = express.Router(),
  { join } = require('path'),
  axios = require('axios'),
  { Observable } = require('rxjs/Rx'),
  { isError,
    isObject,
    isString } = require('lodash'),
  { load } = require('cheerio')

/* /api/12345 */
router.get('/:logId', (req, res, next) => {
  const { logId } = req.params

  // validate logId
  const pathRegex = /^\/?\d+$/g
  if (!pathRegex.test(logId)) res.status(400).end()
  else {
    ///// needs debugging
    const
      htmlUrl = join('http://logs.tf/', logId),
      jsonUrl = join('http://logs.tf/json/', logId)

    const json$ = Observable
      .fromPromise(axios(jsonUrl))
      //.map(x => x.data)
      .map(validateLogJson)
      .retryWhen(tenTimesWithDelay)

    const html$ = Observable
      .fromPromise(axios(htmlUrl))
      //.do(console.log, console.warn, console.info)
      //.map(x => x.data)
      .map(validateAndMineLogHtml)
      .retryWhen(tenTimesWithDelay)

    // combined lastest from html$ and json$
    Observable
      .combineLatest(json$, html$, () => {
        if (isError(json$))
          return new Error('JSON is error:' + json$)
        else if (isError(html$))
          return new Error('HTML is error:' + html$)
        /// maybe embed the html derived data
        /// in the log json?
        return { json: json$, html: html$ }
      })
      .subscribe(
        next => {
          console.log(next)
          res.send(JSON.stringify(next))
        },
        err => {
          console.log(err)
          res.send(JSON.stringify(err))
        }
      )

    /// does this even do anything?
    function validateLogJson(x) {
      if (isError(x)) return x
      try {
        return x
      } catch(e) {
        return new Error(`{Error: ${e}, Json: ${x}}`)
      }
    }

    function validateAndMineLogHtml(x) {
      const
        $ = load(x),
        h3 = $('.log-section > h3').html()

      if ( h3 === 'Something went wrong' )
        return new Error('logs.tf "Something went wrong" page.')

      // filter out only the necessary data
      const
        map  = $('#log-map').html() || '',
        time = $('.datefield').attr('data-timestamp')

      if (time === undefined)
        return new Error('Couldn\'t find data-timestamp.')

      return { logId, map, time }
    }

    function tenTimesWithDelay(error$) {
      const delay = 10 // ms
      return error$
        .scan((count, err) => {
          ++count
          return (count >= 10) ? err : count
        }, 0)
        .takeWhile(count => count < 10)
        // .do(count =>
        //    console.log(`Retry #${count} in ${delay}ms...`))
        .delay(delay)
    }

    /// temporary
    // res.send(JSON.stringify({
    //   json: `http://logs.tf/json/${ logId }`,
    //   log: `http://logs.tf/${ logId }`
    // }))
  }
})

module.exports = router
