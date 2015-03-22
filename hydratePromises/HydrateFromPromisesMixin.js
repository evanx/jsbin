
var debug = function() {   
};

var HydrateFromPromisesMixin = {
   hydrateFromPromises: function(promises) {
      debug('hydrate', Object.keys(promises));
      let countDownLatch = new CountDownLatch(Object.keys(promises).length, () => {
         this.setState(this.state);
      });
      Object.keys(promises).forEach(key => {
         promises[key]().then(data => {
            debug('hydrate promise resolved', key);
            this.state[key] = data;
            countDownLatch.signal();
         }, error => {
            debug('hydrate promise rejected', key, error);
            countDownLatch.signal();
         });
      });
   }
};

module.exports = HydrateFromPromisesMixin;
