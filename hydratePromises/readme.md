

<i>This repo is not a project - it's more of a wiki/weblog, with each entry pushed to a github directory :)</i>


### Tech Note: Hydrating ReactJS component state from promises 

Consider a rather trivial component which fetches data from some endpoints, to render some content. 

Sure, there's Flux, Relay/GraphQL and what have you.

But as an exercise, or for a quick demo, how about a concise opinionated means of hydrating our component's state?

So we introduce a mixin for a `hydrateFromPromises` utility function which we can use as follows:

```javascript
var FrontPage = React.createClass({
   mixins: [ HydrateFromPromisesMixin ],
   getInitialState: function () {
      return {};
   },   
   componentDidMount: function () {
      log.info('componentDidMount');
      this.hydrateFromPromises({ // for automatic state hydration
         frontpageArticles: function() {
            return getPromise('/feed/Frontpage');
         },
         popularArticles: function() {
            return getPromise('/feed/Popular');
         }
      }, () => { // called when all promises concluded
         if (!this.state.frontpageArticles) {
            log.error('missing critical data');
            // TODO
         }
      });
   },
   render: function () {
      if (!this.state.frontpageArticles) {
         log.debug('initial rendering, or its promise rejected');
         return false;
      } else if (!this.state.popularArticles) {
         log.warn('partially hydrated', this.state.frontpageArticles.length);
      } else {
         log.info('fully hydrated', this.state.frontpageArticles.length,
               this.state.popularArticles.length);
      }
      return ( // JSX 
         ... 
      );
   }
});
```
where `frontpageArticles` and `popularArticles` are to be properties of `state.` For these we specify a function which returns an ES6 `Promise` for the data to be loaded. 

Our `state` properties are then automatically hydrated with the JSON reply from the specified endpoints, e.g. `frontpageArticles` is an array returned by the `/feed/Frontpage` endpoint. 

Finally, our specified callback is invoked once all promises have concluded, and here we might do some special error handling.

Incidently, our `/feed/` endpoint might be a NodeJS Express service returning JSON data stored in Redis, as is the case for a prototype which renders the following:

<hr>
<img src="http://evanx.github.io/images/demo/news1.png"/>
<hr>


### Ordinary XMLHttpRequest

In this example, we use an ordinary `getPromise` utility function to perform a cacheable `XMLHttpRequest` and return a `Promise` as follows:
```javascript
var config = {
   cacheExpirySeconds: 180
};

var cache = {};

export function getPromise(url) {
   if (cache[url]) {
      let data = cache[url];
      if (data._time)  {
         if (new Date().getTime() - data._time < config.cacheExpirySeconds*1000) {
            return Promise.resolve(data);
         }
      } else {
         return Promise.resolve(data);
      }
   }
   return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest();
      req.onload = function () {
         if (req.status !== 200) {
            reject({message: 'status ' + req.status});
         } else {
            let data = JSON.parse(req.response);
            data._time = new Date().getTime();
            cache[url] = data;
            resolve(data);
         }
      };
      req.open('GET', url);
      req.send();
      log.debug('loadJSON', url);
   });
}
```
where we cache replies for 3 minutes to avoid refetching.


### Browser request package

Alternatively, we might use the `browser-request` `npm` package as follows:

```javascript 
var request = require('browser-request');

export function requestPromise(url) {
   if (cache[url]) {
      let data = cache[url];
      if (data._time)  {
         if (new Date().getTime() - data._time < config.cacheExpirySeconds*1000) {
            return Promise.resolve(data);
         }
      } else {
         return Promise.resolve(data);
      }
   }
   return new Promise((resolve, reject) => {
      request(url, function(err, response, content) {
         if (err) {
            reject(err);
         } else if (response.statusCode !== 200) {
            reject({statusCode: response.statusCode});
         } else {
            let data = JSON.parse(content);
            data._time = new Date().getTime();
            cache[url] = data;
            resolve(data);
         }
      });
   });
```
where our dependencies are resolved and bundled by <a href="https://github.com/webpack/react-starter">Webpack</a>, which also performs ES6/JSX transpilation (using <a href="http://babeljs.io/blog/2015/02/23/babel-loves-react">babel</a>) and minification, for delivery to the browser.


### Magic mixin sauce

Finally, the "magic sauce" is our mixin utility which hydrates our component state as follows:
```javascript
function CountDownLatch(counter, then) {
   this.signal = error => {
      if (counter > 0) {
         counter--;
      }
      if (error) {
         this.error = error;
      }
      if (counter === 0) {
         then(this.error);
      }
   }
}

var hydrateFromPromisesMixin = {
   hydrateFromPromises: function(promises, callback) {
      log.debug('hydrate', Object.keys(promises));
      let countDownLatch = new CountDownLatch(Object.keys(promises).length, error => {
         this.setState(this.state);
         if (callback) {
           callback(error); 
         }
      });
      Object.keys(promises).forEach(key => {
         try {
            promises[key]().then(data => {
               log.debug('hydrate promise resolved', key);
               this.state[key] = data;
               countDownLatch.signal();
            }, error => {
               log.debug('hydrate promise rejected', key, error);
               countDownLatch.signal(error);
            });
         } catch (error) {
            log.debug('hydrate promise exception', key, error);
            countDownLatch.signal(error);  
         }
      });
   }
};

module.exports = HydrateFromPromisesMixin;
```
where we invoke our promise producers, and only invoke `setState` when all the promises have been concluded.

We use a `CountDownLatch` utility to count down the replies we are awaiting and then invoke `setState` on our component. That triggers a `render` of our hydrated component. 

Finally, we invoke an optional callback, with the last error, or <tt>undefined</tt> if no error occurred.


### Error handling 

Some properties might have failed to load e.g. because of a network error. Those will not be set on `state.` 

We might use `getInitialState` to initialise `this.state.popularArticles` to an empty array as follows:

```javascript 
   getInitialState: function () {
      return { popularArticles: [] };
   },   
```

Having said that, `lodash.map` handles `undefined` collections "elegantly," returning an empty array (rather than throwing an exception), which is fine for JSX rendering as follows;

```javascript
   renderPopularArticles: function () {
      return lodash.map(this.state.popularArticles, article => {
          return (
             <ArticleCard article={article}/>
          );
      });
   },
```

Otherwise we must check for `undefined` state properties in our `render` function:

```javascript
   render: function () {
      if (!this.state.frontpageArticles) { // missing critical data
         log.debug('initial rendering, or its promise rejected');
         return false;
      } else if (!this.state.popularArticles) {
         log.warn('partially hydrated', this.state.frontpageArticles.length);
      } else {
         log.info('fully hydrated', this.state.frontpageArticles.length,
               this.state.popularArticles.length);
      }
      var featuredArticle = this.state.frontpageArticles[0];
      return (
         <div className="main">
            <LeadStory article={featuredArticle} sectionLabel="Front page"/>
            ...
            {this.renderPopularArticles()}
            ...
      );
   }
```
where we return `false` if our critical data has not been received, "to indicate that you don't want anything rendered," to quote the <a href="https://facebook.github.io/react/docs/component-specs.html">docs.</a> This is hopefully just the "initial render" of the component, which we abort. However it may that be our `hydrateFromPromises` has concluded with a network error for our critical data, which we can handle in its callback:

```javascript
      var promises = {
         frontpageArticles: function() {
            return getPromise('/feed/Frontpage');
         },
         popularArticles: function() {
            return getPromise('/feed/Popular');
         }
      };
      this.hydrateFromPromises(promises, err => {
         if (!this.state.frontpageArticles) {
            log.error('missing critical data');
            // TODO redirect
         } else if (!this.state.popularArticles) {
            setTimeout(() => {
               this.hydrateFromPromises({popularArticles: promises.popularArticles}, err => {
                  if (!err) {
                     log.info('retry ok', this.state.popularArticles.length);
                  } else {
                     // TODO: recursive retry
                  }
              });
            }, 5000);
         }
      });
```
where in the above example, we retry `popularArticles` after a 5 second delay. 

Incidently, we can invoke `this.hydrateFromPromises(promises)` again to retry all. Since previously successful responses are cached for 3 minutes by `getPromise,` they wouldn't be refetched.

```javascript
      let retryCount = 0;
      let retry = () => {
         log.debug('retry');
         this.hydrateFromPromises(promises, err => {
            if (err) {
               retryCount += 1;
               if (retryCount < 5) {
                  setTimeout(() => {
                     retry(); // recursively retry
                  }, 5000);
               }
            }
         });
      }
```

Finally bear in mind we can use our promises ordinarily as follows ;)
```javascript
            promises.popularArticles().then(data => {
               log.info('retry ok', data.length);
               this.state.popularArticles = data;
               this.setState(this.state);
            }, error => {
               log.warn('retry failed', error);
            });
```

which illustrates what `hydratePromises` does, but for a collection of promises.


### Demo

<hr>
<img src="http://evanx.github.io/images/demo/frontpage1.png"/>
<hr>
where as mentioned before, we are using Webpack to transpile and deliver our ES6/JSX (and CSS/Sass) resources to the browser, and `webpack-dev-server` to enjoy auto reloading thereof.

<hr>
Thanks for reading!

https://twitter.com/evanxsummers

