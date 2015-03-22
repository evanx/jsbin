
var debug = function() {   
};

function CountDownLatch(counter, then) {
   this.signal = () => {
      if (counter > 0) {
         counter--;
      }
      if (counter === 0) {
         then();
      }
   };
}

var hydrateFromPromisesMixin = {
   hydrateFromPromises: function(promises, then) {
      log.debug('hydrate', Object.keys(promises));
      let countDownLatch = new CountDownLatch(Object.keys(promises).length, () => {
         this.setState(this.state);
         then();
      });
      Object.keys(promises).forEach(key => {
         promises[key]().then(data => {
            log.debug('hydrate promise resolved', key);
            this.state[key] = data;
            countDownLatch.signal();
         }, error => {
            log.debug('hydrate promise rejected', key, error);
            countDownLatch.signal();
         });
      });
   }
};

module.exports = HydrateFromPromisesMixin;
