
## React hydrate recipe

```javascript
var FrontPage = React.createClass({
   statics: {
      hydratePromises: {
         frontpageArticles: function() {
            return commonFunctions.loadSectionArticles('Frontpage');
         },
         sportArticles: function() {
            return commonFunctions.loadSectionArticles('Sport');
         },
         popularArticles: function() {
            return commonFunctions.loadSectionArticles('Popular');
         }
      }
   },
   componentDidMount: function () {
      commonFunctions.hydrateComponentState(this);
   },

```
where our `loadSectionArticles` returns an ES6 `Promise.`

Hopefuly the above can be used isomorphically i.e. to prerender components server-side after hydrating their state e.g. from REST endpoints.

where our `commonFunctions` are shared utilities e.g. to fetch data:
```javascript
var commonFunctions = {
   loadSectionArticles: function(sectionLabel) {
      var url = config.publisherBaseUrl + 'section/' + sectionLabel;
      return new Promise((resolve, reject) => {
         netFunctions.loadJSON(url).then(function(data) {
            resolve(data);
         },
         function(err) {
            reject(err);
         });
      });
   },
   ...
}
```
and then hydrate our component state:
```javascript
   hydrateComponentState: function(component) {
      var promise = component.statics.hydratePromises;
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
         log.info('hydrate promise', key, promises[key]().then(function(data) {
            log.info('hydrate promise resolved', key, data.length || Object.keys(data));
            set(key, data);
         }, function(error) {
            log.error('hydrate promise rejected', key, error);
            set(key, []);
         }));
      });
   },   
```
