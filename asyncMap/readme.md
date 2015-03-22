

## async map recipe

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

where `lodash` chaining is used, hence the final `value()`. This enables other methods to be added easily e.g. `filter` <i>et al</i> as follows: 

```javascript
async.parallel(lodash(array).filter(function(item) {
      return true; // or false to exclude
   }).slice(1).take(2).map(function(item) { 
      ...
```

Otherwise, using `async.map` is more concise:

```javascript
   async.map(items, function(item, callback) {
      ... // some processing on item
      someAsync(..., function(err, result) { // some async call for item
         if (err) {
            callback(err);
         } else { // success
            ... // some processing of result
            callback(null, result);
         }
      });
   }, function(err, results) {
      if (err) {
         // a task failed
      } else {
        // yay, all tasks executed ok
      }
   });
```

### Example 

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

This might be wrapped in a function as follows:

```javascript
var async = require('async');
var lodash = require('lodash');
var request = require('request');
var assert = require('assert');

function fetchURLs(urls, then) {
   async.map(urls, function (url, callback) {
      request(url, function (err, response, content) {
         if (err) {
            callback(err);
         } else if (response.statusCode !== 200) {
            callback({message: 'HTTP code: ' + response.statusCode});
         } else {
            callback(null, content);
         }
      });
   }, then);
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
            return content.match(/<title>(.*)<\/title>/)[1];   
         });
         console.info('titles', titles); // titles [ 'Google', 'Bing' ]
         assert.equal(titles[0], 'Google');
         assert.equal(titles[1], 'Bing');
      }
   });
}
```

See: https://github.com/evanx/jsbin/blob/master/asyncMap.js


### Test 

```shell
git clone https://github.com/evanx/jsbin.git
cd jsbin
npm install
nodejs asyncMap.js
```

The output is:

```
titles [ 'Google', 'Bing' ]
```

### Further reading 

Wiki home: https://github.com/evanx/vellum/wiki

https://twitter.com/evanxsummers

