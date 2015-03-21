

## React hydrate recipe

See https://github.com/evanx/jsbin/blob/master/hydratePromises

Consider a rather trivial component which fetches data from various endpoints.

We introduce a mixin and invoke its `hydratePromises` utility function as follows:

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

### Abstract

```javascript
   componentDidMount: function () {
      log.info('componentDidMount');
      commonFunctions.hydratePromises(this, {
         frontpageArticles: function() {
            return commonFunctions.loadSectionArticles('Frontpage');
         },
         sportArticles: function() {
            return commonFunctions.loadSectionArticles('Sport');
         },
         popularArticles: function() {
            return commonFunctions.loadSectionArticles('Popular');
         }
      });
   },
```
where our app's `loadSectionArticles` returns an ES6 `Promise` for data, and we hydrate our state as follows:
```javascript
var commonFunctions = {
}
```

## async map recipe

See: https://github.com/evanx/jsbin/blob/master/asyncMap

### Abstract

When you have an `array` of items which you want to "map" to tasks, to run in parallel, and finally process the results when all tasks are complete:

```javascript
async.parallel(lodash(array).map(function(item) { 
   return function(callback) { // create an async task for item
      ... // some processing on item
      someAsync(..., function(err, result) { // some async call for item
         if (err) {
            callback(err);
         } else { // success
            ... // some processing of result
            callback(null, result);
         }
      });
   }).value(), function(err, results) {
      if (err) {
         // a task failed
      } else {
         // yay, all tasks executed ok
      }
   }
);
```

where `lodash` chaining is used, hence the final `value()`. This enables other methods to be added easily e.g. `filter` <i>et al.</i>

