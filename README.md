

## React hydrate recipe

See https://github.com/evanx/jsbin/blob/master/hydratePromises

### Abstract

```javascript
var FrontPage = React.createClass({
   statics: {
      hydratePomises: {
         frontpageArticles: function(handler, params) {
            return handler.loadSectionArticles('Frontpage', params);
         },
         sportArticles: function(handler, params) {
            return handler.loadSectionArticles('Sport', params);
         },
         popularArticles: function(handler, params) {
            return handler.loadSectionArticles('Popular', params);
         }
      }
   },
   componentDidMount: function () {
      var params = { frontpageArticleCount: 30 };
      commonFunctions.hydratePromises(FrontPage, this, params);
   },
```
where our `loadSectionArticles` returns an ES6 `Promise` for an HTTP JSON endpoint, and we hydrate our state as follows:
```javascript
var commonFunctions = {
   getSectionArticles: function(sectionLabel) {
      var url = config.publisherBaseUrl + 'section/' + sectionLabel;
      return netFunctions.getJSON(url);
   },
   hydratePromises: function(Component, instance, params) {
      var promises = Component.hydratePromises;
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
         log.info('hydrate promise', key, promises[key](commonFunctions, params).then(function(data) {
            log.info('hydrate promise resolved', key, data.length || Object.keys(data));
            set(key, data);
         }, function(error) {
            log.error('hydrate promise rejected', key, error);
            set(key, []);
         }));
      });
   }
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

