
## Hydrating React component state from promises 

Consider a rather trivial component which fetches data from some endpoints, to render some content. 

Perhaps this is for a prototype, and so we want a "quick and dirty" opininated means of hydrating our state.

We introduce a mixin for `hydratePromises` which we can use as follows:

```javascript
var FrontPage = React.createClass({
   mixins: [ HydrateFromPromisesMixin ],
   componentDidMount: function () {
      log.info('componentDidMount');
      this.hydrateFromPromises({
         frontpageArticles: function() {
            return httpFunctions.getPromise('/feed/Frontpage');
         },
         popularArticles: function() {
            return httpFunctions.getPromise('/feed/Popular');
         }
      });
   },
```
where `frontpageArticles` and `popularArticles` are to be properties of `state.` For these we specify a function which returns an ES6 `Promise` for the data to be loaded.

We hydrate our component state as follows:
```javascript
var HydrateFromPromisesMixin = {
   hydrateFromPromises: function(promises) {
      log.info('hydrate', Object.keys(promises));
      let that = this;
      let count = 0;
      function set(key, data) {
         that.state[key] = data;
         count += 1;
         if (count === Object.keys(promises).length) {
            log.info('hydrate resolved');
            that.setState(that.state);
         }
      }
      Object.keys(promises).forEach(key => {
         log.info('hydrate promise', key);
         promises[key]().then(data => {
            log.info('hydrate promise resolved', key);
            set(key, data);
         }, function(error) {
            log.error('hydrate promise rejected', key, error);
            set(key);
         });
      });
   }
};
```
where we invoke our promise producers, and only invoke `setState` when all the promises have been resolved.

https://twitter.com/evanxsummers

