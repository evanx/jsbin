
## React hydrate recipe

PS. These thoughts and efforts inspired by a great talk I attended this week: http://www.meetup.com/nodecpt/events/220703443

and then reading about Relay and GraphQL: https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html


### State queries

Let's take a cue from Relay and introduce a static `hydratePromises` for our required `state.` 

```javascript
var FrontPage = React.createClass({
   statics: {
      hydratePomises: {
         frontpageArticles: function(handler, params) {
            return handler.loadSectionArticles('Frontpage', params);
         },
         sportArticles: function(handler, params) {
            return handler.loadSectionArticles('Sport', params);
         },
         popularArticles: function(handler, params) {
            return handler.loadSectionArticles('Popular', params);
         }
      }
   },
   componentDidMount: function () {
      var params = { frontpageArticleCount: 30 };
      commonFunctions.hydratePromises(FrontPage, this, params);
   },
   ...
}
```
We have invoked `commonFunctions.loadSectionArticles` which returns an ES6 `Promise` for data being fetched asynchronously. This migh be from server endpoints, or perhaps directly from Redis if on the server. So `commonFunctions` might have a different implementation on the server vs the client.

Hopefuly the above can be used isomorphically i.e. to prerender components server-side after hydrating their state.

where our `commonFunctions` are shared utilities e.g. to fetch data:
```javascript
var commonFunctions = {
   getSectionArticles: function(sectionLabel) {
      var url = config.publisherBaseUrl + 'section/' + sectionLabel;
      return netFunctions.getJSON(url);
   },
   ...
}
```

We hydrate our component state as follows:
```javascript
   hydratePromises: function(Component, instance, params) {
      var promises = Component.hydratePromises;
      log.info('hydrate', Object.keys(promises));
      var state = {};
      function set(key, data) {
         state[key] = data;
         if (Object.keys(state).length === Object.keys(promises).length) {
            log.info('hydrate resolved');
            instance.setState(state);
         }
      }
      Object.keys(promises).forEach(key => {
         log.info('hydrate promise', key);
         log.info('hydrate promise', key, promises[key](commonFunctions, params).then(function(data) {
            log.info('hydrate promise resolved', key, data.length || Object.keys(data));
            set(key, data);
         }, function(error) {
            log.error('hydrate promise rejected', key, error);
            set(key, []);
         }));
      });
   },
```

Incidently, we haven't addressed "overfetching," which is something that is solved elegantly by GraphQL. So that should be a next step. I guess we should filter our results in `hydratePromises` to extract only the data that is actually rendered. Then we should enable a generic query in the form of a collection of components requiring hydration in order to render a page, e.g. the page component and its children). Also we should support their parameters e.g. the number of articles (to enable pagination). 

```javascript
var FrontPage = React.createClass({
   statics: {
     requires: [
        NewsSection, SportSection, PopularSection
     ]
   }
```

Then on the server, we could use `hydratePromises` to dynamically assemble the resultant `state` for each component, to deliver that to the client, for example:

```json
{ 
  Header: {
     ...
  },
  FrontPage: {
     ...
  }
}```

