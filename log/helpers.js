const
  // { join } = require('path'),
  // axios = require('axios')
  { Observable } = require('rxjs/Rx')
  ,isError = require('lodash/fp/isError')
  ,isObject = require('lodash/fp/isObject')
  ,isString = require('lodash/fp/isString')
  ,{ load } = require('cheerio')

module.exports = (function () {
  return {
    validateLogJson(x) {
      if (isError(x))
        return x
      else if (isString(x.data))
        return new Error(`Response is a string, not an object: ${x.data}`)
      return x
    },
    validateAndMineLogHtml(htmlStr) {
      const
        $ = load(htmlStr.data),
        h3 = $('.log-section > h3').html()

      if ( h3 === 'Something went wrong' )
        return new Error('logs.tf "Something went wrong" page.')

      // filter out only the necessary data
      const
        map  = $('#log-map').html() || '',
        time = $('.datefield').attr('data-timestamp')

      if (time === undefined)
        return new Error('Couldn\'t find data-timestamp.')

      return { map, time }
  },
    TakeNTimesWithDelay$(config) {
      const {
        promise,
        times = 10,
        delay = 10,
        validationFn = x => x
      } = config

      return Observable
        .interval(delay)
        .startWith(0)
        .take(times)
        // .do(x => console.log('emitting', x))
        .flatMap(promise)
        .map(validationFn)
        .first(x => !isError(x))
    },
    Combined$(one$, two$) {
      return Observable
        .combineLatest(one$, two$, (one, two) => {
          if (isError(one)) {
            return one
          }
          else if (isError(two)) {
            return two
          }
          /// maybe embed the html derived data
          /// in the log json? or return array?
          one.data.info.map = two.map
          one.data.info.timestamp = two.time
          return one.data
        })
    }
  }
}())
/*
Usage example:
const {
  validateLogJson
  validateAndMineLogHtml
  PromisedValidated$
  Combined$
} = require('./log.js')
const { join } = require('path')

const logId = '12345'

const
  jsonUrl = join('http://logs.tf/json/', logId),
  htmlUrl = join('http://logs.tf/', logId)

const json$ =
  PromisedValidated$(axios(jsonUrl), validateLogJson)
  // .subscribe() for testing individually

const html$ =
  PromisedValidated$(axios(htmlUrl), validateAndMineLogHtml)
  // .subscribe() for testing individually

const combined$ = Combined$(json$, html$)
  // .subscribe()

const combinedFromMArbles$ = Combined$('-a-b-c--|', 'x--y--z-|')
  // .subscribe()

 */