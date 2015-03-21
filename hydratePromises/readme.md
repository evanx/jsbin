
## TechNote: Hydrating React component state via promises 

Consider a rather trivial component which fetches data from various endpoints.

We introduce `hydratePromises` for our component's required `state` as follows:

```javascript
var FrontPage = React.createClass({
```
where `frontpageArticles` and `popularArticles` are properies of `state.`

We invoke a resolver which returns an ES6 `Promise` for data being fetched asynchronously. This might be from HTTP endpoints, or perhaps directly from Redis if we are pre-rendering our component on the server. So `resolver` might have a different implementation on the server vs the client.

We hydrate our component state as follows:
```javascript
var commonFunctions = {
   hydratePromises: function(instance, params) {
      var promises = instance.hydratePromises;
      log.info('hydrate', Object.keys(promises));
      var state = {};
      function set(key, data) {
         state[key] = data;
         if (Object.keys(state).length === Object.keys(promises).length) {
            log.info('hydrate resolved');
            instance.setState(state);
         }
      }
      Object.keys(promises).forEach(key => {
         log.info('hydrate promise', key);
         promises[key](commonFunctions, params).then(function(data) {
            log.info('hydrate promise resolved', key);
            set(key, data);
         }, function(error) {
            log.error('hydrate promise rejected', key, error);
            set(key, []);
         }));
      });
   },
```
where we only invoke `setState` when all promises have been resolved.

https://twitter.com/evanxsummers
