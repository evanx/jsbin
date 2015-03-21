
## Hydrating React component state via promises 

Consider a rather trivial component which fetches data from a couple of endpoints, to render some content. 

Perhaps this is for a prototype, and so we want a "quick and dirty" means of hydrating our state.

So we introduce a mixin and invoke its `hydratePromises` utility function as follows:

```javascript
var FrontPage = React.createClass({
   mixins: [ HydratePromisesMixin ],
   componentDidMount: function () {
      log.info('componentDidMount');
      this.hydratePromises({
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
var HydratePromisesMixin = {
   hydratePromises: function(promises) {
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
            log.info('hydrate promise resolved', key, data.length || Object.keys(data));
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

