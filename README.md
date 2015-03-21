

## React hydrate recipe

See https://github.com/evanx/jsbin/blob/master/hydratePromises

### Abstract

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
where `frontpageArticles` and `popularArticles` are to be properties of `state.`


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

