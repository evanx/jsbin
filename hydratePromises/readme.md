

<i>This repo is not a project - it's more of a wiki/weblog, with each entry pushed to a github directory :)</i>


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
      this.hydrateFromPromises({ // for automatic state hydration
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

Our `state` properties are then automatically hydrated with the JSON reply from the specified endpoints, e.g. `frontpageArticles` is an array returned by the `/feed/Frontpage` NodeJS Express service.

<img src="http://evanx.github.io/images/demo/news.png" border="1"/>

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


### Magic mixin sauce

Finally, the "magic sauce" is our mixin utility which hydrates our component state as follows:
```javascript
var debug = function() {   
};

function CountDownLatch(counter, then) {
   this.signal = () => {
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
         this.setState(this.state);
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

We use a `CountDownLatch` utility to count down the replies we are awaiting and then invoke `setState` on our component. That triggers a `render` of our hydrated component. 


### Error handling 

However some properties might failed to load e.g. because of a network error. Those will not be set on `state` and so will be `undefined` i.e. if not set via `getInitialState` e.g. to an empty array as follows:

```javascript 
   getInitialState: function () {
      return { popularArticles: [] };
   },   
```

We must be cognisant of that in our `render` function, e.g. perform a partial render of at least what data we do have. 

```javascript
   render: function () {
      let popularArticles = [];
      if (!this.state.frontpageArticles) {
         log.debug('render initial');
         return false;
      } else if (!this.state.popularArticles) {
         log.warn('render popularArticles');
      } else {
         popularArticles = this.state.frontpageArticles;
         log.info('render', this.state.frontpageArticles.length, popularArticles.length);
      }
      return ( // JSX 
         ... // 
      );
   }
```
where we have assumed `popularArticles` is not initialised to an empty array by `getInitialState.`

<img src="http://evanx.github.io/images/demo/popular.png" style="border: solid 1px black"/>

https://twitter.com/evanxsummers

