

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

function testFetchURLs() {
   fetchURLs(['http://google.co.za'], function(err, results) {
      if (err) {
         throw new Error(err);
      } else {
         assert.equal(results[0].match(/<title>(.*)<\/title>.*/)[1], 'Goggles');
      }
   });
}

testFetchURLs();
