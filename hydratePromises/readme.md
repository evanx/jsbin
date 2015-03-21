
## TechNote: Hydrating React component state via promises 

Consider a rather trivial component which fetches data from various endpoints.

We introduce a `hydratePromises` utility function to hydrate our component's required state:

```javascript
var FrontPage = React.createClass({
   mixins: [ HydratePromisesMixin ],
   componentDidMount: function () {
      log.info('componentDidMount');
      this.hydratePromises({
         frontpageArticles: function() {
            return resolver.getArticles('/feed/Frontpage');
         },
         popularArticles: function() {
            return resolver.getArticles('/feed/Popular');
         }
      });
   },
```
where `frontpageArticles` and `popularArticles` are to be properties of `state.` For these we specify a function which returns an ES6 `Promise` for the data to be fetched.

We hydrate our component state as follows:
```javascript
var HydratePromisesMixin = {
   hydratePromises: function(promises) {
      log.info('hydrate', Object.keys(promises));
      var that = this;
      var state = {};
      function set(key, data) {
         state[key] = data;
         if (Object.keys(state).length === Object.keys(promises).length) {
            log.info('hydrate resolved');
            that.setState(state);
         }
      }
      Object.keys(promises).forEach(key => {
         log.info('hydrate promise', key);
         promises[key]().then(function(data) {
            log.info('hydrate promise resolved', key, data.length || Object.keys(data));
            set(key, data);
         }, function(error, data) {
            log.error('hydrate promise rejected', key, error);
            set(key);
         });
      });
   }
};
```
where we invoke our promise producers, only invoke `setState` when all the promises have been resolved.

https://twitter.com/evanxsummers

