

## React hydrate recipe

See https://github.com/evanx/jsbin/blob/master/hydratePromises

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

