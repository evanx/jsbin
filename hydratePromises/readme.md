
## Hydrating React component state from promises 

Consider a rather trivial component which fetches data from some endpoints, to render some content. 

Sure, there's Flux, Relay/GraphQL and what have you.

But perhaps this is for a prototype, and we want a "quick and dirty" opininated means of hydrating our state.

So we introduce a mixin for `hydrateFromPromises` which we can use as follows:

```javascript
var FrontPage = React.createClass({
   mixins: [ HydrateFromPromisesMixin ],
   getInitialState: function () {
      return {};
   },   
   componentDidMount: function () {
      log.info('componentDidMount');
      this.hydrateFromPromises({
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
         log.info('render initial');
         return false;
      } else {
         log.info('render hydrated', this.state.frontpageArticles.length, 
            this.state.popularArticles.length);
      }
      return ( // JSX 
         ... 
      );
   }
});
```
where `frontpageArticles` and `popularArticles` are to be properties of `state.` For these we specify a function which returns an ES6 `Promise` for the data to be loaded.

In this example, we use an ordinary `getPromise` utility function to perform a cacheable `XMLHttpRequest` and return a `Promise` as follows:
```javascript
export function getPromise(url) {
   if (cache[url]) {
      var data = cache[url];
      if (data._time)  {
         if (new Date().getTime() - data._time < config.cacheExpirySeconds*1000) {
            return Promise.resolve(data);
         }
      } else {
         return Promise.resolve(data);
      }
   }
   return new Promise((resolve, reject) => {
      var req = new XMLHttpRequest();
      req.onload = function () {
         if (req.status !== 200) {
            reject({message: 'status ' + req.status});
         } else {
            var data = JSON.parse(req.response);
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

Finally, our mixin utility hydrates our component state as follows:
```javascript
var HydrateFromPromisesMixin = {
   hydrateFromPromises: function(promises) {
      log.debug('hydrate', Object.keys(promises));
      let that = this;
      let count = 0;
      function set(key, data) {
         that.state[key] = data;
         count += 1;
         if (count === Object.keys(promises).length) {
            log.debug('hydrate resolved');
            that.setState(that.state);
         }
      }
      Object.keys(promises).forEach(key => {
         log.info('hydrate promise', key);
         promises[key]().then(data => {
            log.debug('hydrate promise resolved', key);
            set(key, data);
         }, function(error) {
            log.debug('hydrate promise rejected', key, error);
            set(key, null);
         });
      });
   }
};

module.exports = HydrateFromPromisesMixin;
```
where we invoke our promise producers, and only invoke `setState` when all the promises have been resolved.

https://twitter.com/evanxsummers

