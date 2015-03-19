

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

function testFetchURLs() {
   var urls = ['http://google.co.za', 'http://bing.com'];
   fetchURLs(urls, function (err, results) {
      if (err) {
         throw new Error(err);
      } else {
         var titles = lodash.map(results, function (content) {
            return content.match(/<title>(.*)<\/title>/)[1];
         });
         console.info('titles', titles);
         assert.equal(titles[0], 'Google');
         assert.equal(titles[1], 'Bing');
      }
   });
}

testFetchURLs(); // output: titles [ 'Google', 'Bing' ]

