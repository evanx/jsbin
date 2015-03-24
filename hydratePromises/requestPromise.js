
var Promise = require('es6-promise').Promise;
var request = require('browser-request');

export function requestPromise(url) {
   if (cache[url]) {
      let data = cache[url];
      if (data._time)  {
         if (new Date().getTime() - data._time < config.cacheExpirySeconds*1000) {
            return Promise.resolve(data);
         }
      } else {
         return Promise.resolve(data);
      }
   }
   return new Promise((resolve, reject) => {
      request(url, function(err, response, content) {
         if (err) {
            reject(err);
         } else if (response.statusCode !== 200) {
            reject({statusCode: response.statusCode});
         } else {
            let data = JSON.parse(content);
            data._time = new Date().getTime();
            cache[url] = data;
            resolve(data);
         }
      });
   });
}
