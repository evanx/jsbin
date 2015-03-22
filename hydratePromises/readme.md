

This repo is not a useable project - it's more of a wiki/weblog, with each entry pushed to a github directory.

So without further ado...


## Tech Note: Hydrating React component state from promises 

Consider a rather trivial component which fetches data from some endpoints, to render some content. 

Sure, there's Flux, Relay/GraphQL and what have you.

But as an exercise, or for a quick demo, how about a concise opininated means of hydrating our component's state?

So we introduce a mixin for a `hydrateFromPromises` utility function which we can use as follows:

```javascript
var FrontPage = React.createClass({
   mixins: [ HydrateFromPromisesMixin ],
   getInitialState: function () {
      return {};
   },   
   componentDidMount: function () {
      log.info('componentDidMount');
      this.hydrateFromPromises({ // the automation happens here
         frontpageArticles: function() {
            return getPromise('/feed/Frontpage');
         },
         popularArticles: function() {
            return getPromise('/feed/Popular');
         }
      });
   },
   render: function () {
      if (!this.state.frontpageArticles) {
         log.debug('render initial');
         return false;
      } else if (!this.state.popularArticles) {
         log.warn('render partial', this.state.frontpageArticles.length);
      } else {
         log.info('render', this.state.frontpageArticles.length,
               this.state.popularArticles.length);
      }
      return ( // JSX 
         ... 
      );
   }
});
```
where `frontpageArticles` and `popularArticles` are to be properties of `state.` For these we specify a function which returns an ES6 `Promise` for the data to be loaded.


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


### Magic mixin sauce

Finally, the "magic sauce" is our mixin utility which hydrates our component state as follows:
```javascript
var debug = function() {   
};

function CountDownLatch(counter, then) {
   this.signal = function () {
      if (counter > 0) {
         counter--;
      }
      if (counter === 0) {
         then();
      }
   };
}

var HydrateFromPromisesMixin = {
   hydrateFromPromises: function(promises) {
      debug('hydrate', Object.keys(promises));
      let countDownLatch = new CountDownLatch(Object.keys(promises).length, () => {
         this.setState(that.state);
      });
      Object.keys(promises).forEach(key => {
         promises[key]().then(data => {
            debug('hydrate promise resolved', key);
            this.state[key] = data;
            countDownLatch.signal();
         }, error => {
            debug('hydrate promise rejected', key, error);
            countDownLatch.signal();
         });
      });
   }
};

module.exports = HydrateFromPromisesMixin;
```
where we invoke our promise producers, and only invoke `setState` when all the promises have been concluded.

https://twitter.com/evanxsummers

