const
  // { join } = require('path'),
  // axios = require('axios')
  { Observable } = require('rxjs/Rx'),
  { isError,
    isObject } = require('lodash'),
  { load } = require('cheerio')

/*
function (logId) {

  ///// needs debugging
  const
    htmlUrl = join('http://logs.tf/', logId),
    jsonUrl = join('http://logs.tf/json/', logId)

  const json$ = Observable
    .fromPromise(axios(jsonUrl))
    //.map(x => x.data)
    .map(validateLogJson)
    .retryWhen(tenTimesWithDelay$)

  const html$ = Observable
    .fromPromise(axios(htmlUrl))
    //.do(console.log, console.warn, console.info)
    //.map(x => x.data)
    .map(validateAndMineLogHtml)
    .retryWhen(tenTimesWithDelay$)

  // combined lastest from html$ and json$
  const combined$ = Observable
    .combineLatest(json$, html$, () => {
      if (isError(json$))
        return new Error('JSON is error:' + json$)
      else if (isError(html$))
        return new Error('HTML is error:' + html$)
      /// maybe embed the html derived data
      /// in the log json?
      return { json: json$, html: html$ }
    })

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

  function tenTimesWithDelay$(error$) {
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

  return {
    json$,
    html$,
    combined$,
    validateLogJson,
    validateAndMineLogHtml,
    tenTimesWithDelay$
  }
}
*/
/*
module.exports = function (logId = null) {
  //// does this even do anything useful?
  function validateLogJson(x) {
    if (isError(x)) return x
    try {
      return x
    } catch(e) {
      return new Error(`{Error: ${e}, Json: ${x}}`)
    }
  }

  function validateAndMineLogHtml(htmlStr) {
    const
      $ = load(htmlStr),
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

  function TenTimesWithDelay$(error$) {
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

  //// combine createJson$ and createHtml$
  //// into a single factory functino, in which
  //// you pass in the promise and validation function?
  function PromisedValidated$(promise, validationFn) {
    return Observable
      .fromPromise(promise)
      //.map(x => x.data)
      .map(validationFn)
      .retryWhen(tenTimesWithDelay$)
  }

  let json$, html$, combined$

  function Combined$(first$ = json$, second$ = html$) {
    return Observable
      .combineLatest(first$, second$, () => {
        if (isError(first$))
          return new Error('JSON is error:' + first$)
        else if (isError(second$))
          return new Error('HTML is error:' + second$)
        /// maybe embed the html derived data
        /// in the log json?
        return { json: first$, html: second$ }
      })
  }

  function Subscribe$(obs$, ...subscribeArgs) {
    if ( isObject(subscribeArgs[0]) )
      return obs$.subscribe(subscribeArgs[0])
    else
      return obs$.subscribe(...subscribeArgs)
  }


  const API = {
    logId,
    validateLogJson,
    validateAndMineLogHtml,
    tenTimesWithDelay,
    PromisedValidated$,
    Combined$,
    Subscribe$,
    json(promise, ...subscribeArgs) {
      API.json$(promise, ...subscribeArgs)
      return API
    },
    html(promise, ...subscribeArgs) {
      API.html$(promise, ...subscribeArgs)
      return API
    },
    json$(promise, validationFn, ...subscribeArgs) {
      json$ =
        PromisedValidated$(promise, validateLogJson)

      if (subscribeArgs.length)
        return Subscribe$(json$, ...subscribeArgs)
      return json$
    },
    html$(promise, validationFn, ...subscribeArgs) {
      html$ =
        PromisedValidated$(promise, validateAndMineLogHtml)

      if (subscribeArgs.length)
        return Subscribe$(html$, ...subscribeArgs)
      return html$
    },
    combined$(first$, second$, ...subscribeArgs) {
      combined$ =
        Combined$(first$ || json$, second$ || html$)

      if (subscribeArgs.length)
        return Subscribe$(combined$, ...subscribeArgs)
      return combined$
    }
  }
  return API
}
*/

module.exports = function () {
  // private:
  function TenTimesWithDelay$(error$) {
    const delay = 10 // ms
    return error$
      .scan((count, err) => {
        ++count
        return (count >= 10) ? err : count
      }, 0)
      .takeWhile(count => count < 10)
      // .do(count =>
      //   console.log(`Retry #${count} in ${delay}ms...`))
      .delay(delay)
  }

  // public:
  return {
    // does this one even do something useful?
    validateLogJson(x) {
      if (isError(x)) return x
      try {
        return x
      } catch(e) {
        return new Error(`{Error: ${e}, Json: ${x}}`)
      }
    },
    validateAndMineLogHtml(htmlStr) {
      const
        $ = load(htmlStr),
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
    PromisedValidated$(promise, validationFn = x => x) {
      return Observable
        .fromPromise(promise)
        //.map(x => x.data)
        .map(validationFn)
        .retryWhen(tenTimesWithDelay$)
    },
    Combined$(first$, second$) {
    return Observable
      .combineLatest(first$, second$, () => {
        if (isError(first$))
          return new Error('JSON is error:' + first$)
        else if (isError(second$))
          return new Error('HTML is error:' + second$)
        /// maybe embed the html derived data
        /// in the log json? or return array?
        return { json: first$, html: second$ }
      })
    }
  }
}
/**
Usage axmple:
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