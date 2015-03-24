
var debug = function() {   
};

function CountDownLatch(counter, then) {
   this.signal = error => {
      if (counter > 0) {
         counter--;
      }
      if (error) {
         this.error = error;
      }
      if (counter === 0) {
         then(this.error);
      }
   }
}

var hydrateFromPromisesMixin = {
   hydrateFromPromises: function(promises, callback) {
      debug('hydrate', Object.keys(promises));
      let countDownLatch = new CountDownLatch(Object.keys(promises).length, error => {
         this.setState(this.state);
         if (callback) {
           callback(error); 
         }
      });
      Object.keys(promises).forEach(key => {
         try {
            promises[key]().then(data => {
               debug('hydrate promise resolved', key);
               this.state[key] = data;
               countDownLatch.signal();
            }, error => {
               debug('hydrate promise rejected', key, error);
               countDownLatch.signal(error);
            });
         } catch (error) {
            debug('hydrate promise exception', key, error);
            countDownLatch.signal(error);  
         }
      });
   }
};

module.exports = HydrateFromPromisesMixin;
