
var debug = function() {   
};

var HydrateFromPromisesMixin = {
   hydrateFromPromises: function(promises) {
      debug('hydrate', Object.keys(promises));
      let that = this;
      let count = 0;
      function set(key, data) {
         that.state[key] = data;
         count += 1;
         if (count === Object.keys(promises).length) {
            debug('hydrate resolved');
            that.setState(that.state);
         }
      }
      Object.keys(promises).forEach(key => {
         promises[key]().then(data => {
            debug('hydrate promise resolved', key);
            set(key, data);
         }, function(error) {
            debug('hydrate promise rejected', key, error);
            set(key, null);
         });
      });
   }
};

module.exports = HydrateFromPromisesMixin;
