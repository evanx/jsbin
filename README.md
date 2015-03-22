
# Just Snippets ;)

This is not a useable project, just some technical articles and snippets on my JavaScript adventures.

It's more of a weblog, with each entry pushed to a github directory.


## React hydrate recipe

See https://github.com/evanx/jsbin/blob/master/hydratePromises

#### Abstract

We introduce a mixin and invoke its `hydrateFromPromises` utility function as follows:

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


## Async map recipe

See: https://github.com/evanx/jsbin/blob/master/asyncMap

#### Abstract

For example, consider we have an `array` of URLs to fetch:

```javascript
async.map(urls, function(url, callback) { 
   request(url, function(err, response, content) {
      if (err) {
         callback(err);
      } else if (response.statusCode !== 200) {
         callback({message: 'HTTP code: ' + response.statusCode});
      } else {
         callback(null, content);
      }
   });
 }, function(err, results) {
   if (err) {
      console.error('error fetching URLs', err);
   } else {
      console.info('fetched URLs', results.length);
   }
});
```
