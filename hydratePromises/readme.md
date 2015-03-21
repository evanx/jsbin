
## TechNote: Hydrating React component state via promises 

Consider a rather trivial component which fetches data from various endpoints.

We introduce `hydratePromises` for our component's required `state` as follows:

```javascript
var FrontPage = React.createClass({
   componentDidMount: function () {
      log.info('componentDidMount');
      commonFunctions.hydratePromises(this, {
         frontpageArticles: function() {
            return resolver.getArticles('/feed/Frontpage');
         },
         popularArticles: function() {
            return resolver.getArticles('/feed/Popular');
         }
      });
   },
```
where `frontpageArticles` and `popularArticles` are properties of `state.` For these we specify a function which returns a ES6 `Promise` for the data to be fetched. This might be from HTTP endpoints, or perhaps directly from Redis if we are pre-rendering our component on the server. 

We hydrate our component state as follows:
```javascript
var commonFunctions = {
   hydratePromises: function(component, promises) {
      log.info('hydrate', Object.keys(promises));
      var state = {};
      function set(key, data) {
         state[key] = data;
         if (Object.keys(state).length === Object.keys(promises).length) {
            log.info('hydrate resolved');
            component.setState(state);
         }
      }
      Object.keys(promises).forEach(key => {
         log.info('hydrate promise', key);
         promises[key]().then(function(data) {
            log.info('hydrate promise resolved', key);
            set(key, data);
         }, function(error) {
            log.error('hydrate promise rejected', key, error);
            set(key, []);
         }));
      });
   },
```
where we invoke our promise producers, only invoke `setState` when all the promises have been resolved.

https://twitter.com/evanxsummers
