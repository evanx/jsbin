
# Just Snippets ;)

This is not a useable project, just some notes, articles and code snippets related to my JavaScript adventures.

It's more of a wiki/weblog, with each entry pushed to a github directory.


# March 2015


### Reading: What is InfluxDB?

* InfluxDB is a scalable time-series database
* uses an underlying key-value store such as RocksDB or LevelDB
* HTTP API, and also SQL-like query language

http://influxdb.com/docs/v0.8/introduction/overview.html


### Announcing Chronica regenesis

Chronica is envisaged as a simple secure monitoring solution built using Node.js microservices, Redis, and having a ReactJS admin console.

https://github.com/evanx/chronica


### Announcing Certserver 

This is a Node.js microservice to enroll, revoke and verify certs, stored in Redis.

https://github.com/evanx/certserver


### React hydrate recipe

https://github.com/evanx/jsbin/blob/master/hydratePromises/readme.md

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
      }, () => {
         if (!this.state.frontpageArticles) {
            log.error('missing critical data');
            // TODO
         }
      });
   },
```


### Async map recipe

https://github.com/evanx/jsbin/blob/master/asyncMap/readme.md

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
