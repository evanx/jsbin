

var async = require('async');
var lodash = require('lodash');
var request = require('request');
var assert = require('assert');

function fetchURLs(urls, callback) {
   async.map(urls, function (url, cb) {
      request(url, function (err, response, content) {
         if (err) {
            cb(err);
         } else if (response.statusCode !== 200) {
            cb({message: 'HTTP code: ' + response.statusCode});
         } else {
            cb(null, content);
         }
      });
   }, callback);
}

function testFetchURLs(callback) {
   var urls = ['http://google.co.za', 'http://bing.com'];
   fetchURLs(urls, function (err, results) {
      if (err) {
         console.error('failed to fetch urls:', err);
         callback(err); // test failed
      } else {
         var titles = lodash.map(results, function (content) {
            return content.match(/<title>(.*)<\/title>/)[1];
         });
         console.info('titles', titles);
         assert.equal(titles[0], 'Google');
         assert.equal(titles[1], 'Bing');
         callback(null); // no error, test ok
      }
   });
}

testFetchURLs(); // output: titles [ 'Google', 'Bing' ]
