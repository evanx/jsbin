
## async map recipe

When you have an `array` of items which you want to "map" to tasks, to run in parallel, and finally process the results when all tasks are complete:

```javascript
async.parallel(lodash(array).map(function(item) { 
   return function(callback) { // create an async task for item
      ... // some processing on item
      something(..., function(err, result) { // some async call
         if (err) {
            callback(err);
         } else { // success
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

where `lodash` chaining is used, hence the final `value()`. This enables a `filter` on the array as follows: 

```javascript
async.parallel(lodash(array).filter(function(item) {
      return true; // or false to exclude
   }).map(function(item) ...
```

### Example 

For example, consider we have an `array` of URLs to fetch:


```javascript
// require async, lodash, request

async.parallel(lodash(urls).map(function(url) { 
   return function(callback) {
      request(url, function(err, response, content) {
         if (err) {
            callback(err);
         } else if (response.statusCode !== 200) {
            callback({message: 'HTTP code: ' + response.statusCode});
         } else {
            callback(null, content);
         }
      });
   }).value(), function(err, results) {
      if (err) {
         console.error('error fetching URLs', err);
      } else {
         console.error('fetched URLs', results.length);
      }
   }
);
```

This might be wrapped in a function as follows:

```javascript
var async = require('async');
var lodash = require('lodash');
var request = require('request');
var assert = require('assert');

function fetchURLs(urls, then) {
   async.parallel(lodash(urls).map(function(url) {
      return function (callback) {
         request(url, function (err, response, content) {
            if (err) {
               callback(err);
            } else if (response.statusCode !== 200) {
               callback({message: 'HTTP code: ' + response.statusCode});
            } else {
               callback(null, content);
            }
         });
      };
   }).value(), then);
}
```

We can test the above function as follows:

```javascript
function testFetchURLs() {
   var urls = ['http://google.co.za', 'http://bing.com'];
   fetchURLs(urls, function(err, results) {
      if (err) {
         throw new Error(err);
      } else {
         var titles = lodash.map(results, function(content) {
            return content.match(/<title>(.*)<\/title>.*/)[1];   
         });
         console.info('titles', titles);
         assert.equal(titles[0], 'Google');
         assert.equal(titles[1], 'Bing');
      }
   });
}
```

See: https://github.com/evanx/jsbin/blob/master/asyncParallelMap.js

### Test 

```shell
git clone https://github.com/evanx/jsbin.git
cd jsbin
npm install
nodejs asyncParallelMap.js
```

The output is:

```
titles [ 'Google', 'Bing' ]
```

### Further reading 

Wiki home: https://github.com/evanx/vellum/wiki

https://twitter.com/evanxsummers

