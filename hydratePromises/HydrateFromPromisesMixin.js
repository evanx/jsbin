
var debug = function() {   
};

function CountDownLatch(counter, then) {
   this.signal = err => {
      if (counter > 0) {
         counter--;
      }
      if (err) {
         this.err = err;
      }
      if (counter === 0) {
         then(this.err);
      }
   }
}

var hydrateFromPromisesMixin = {
   hydrateFromPromises: function(promises, callback) {
      log.debug('hydrate', Object.keys(promises));
      let countDownLatch = new CountDownLatch(Object.keys(promises).length, err => {
         this.setState(this.state);
         if (callback) {
           callback(err); 
         }
      });
      Object.keys(promises).forEach(key => {
         try {
            promises[key]().then(data => {
               log.debug('hydrate promise resolved', key);
               this.state[key] = data;
               countDownLatch.signal();
            }, error => {
               log.debug('hydrate promise rejected', key, error);
               countDownLatch.signal(error);
            });
         } catch (error) {
            log.debug('hydrate promise exception', key, error);
            countDownLatch.signal(error);  
         }
      });
   }
};

module.exports = HydrateFromPromisesMixin;
