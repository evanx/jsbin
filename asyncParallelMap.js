

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

function getTitle(content) {
  return content.match(/<title>(.*)<\/title>.*/)[1];   
}

function testFetchURLs() {
   var urls = ['http://google.co.za', 'http://bing.com'];
   fetchURLs(urls, function(err, results) {
      if (err) {
         throw new Error(err);
      } else {
         results.forEach(function(content, index) {
            console.info('title', urls[index], getTitle(content));
         });
         assert.equal(getTitle(results[0]), 'Google');
         assert.equal(getTitle(results[1]), 'Bing');
      }
   });
}

testFetchURLs();
