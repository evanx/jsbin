
## React hydrate recipe

PS. These thoughts and efforts inspired by a great talk I attended this week: http://www.meetup.com/nodecpt/events/220703443

and then reading about Relay and GraphQL: https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html


### Promises

Let's take a cue from Relay and introduce static resolvers for our component's required `state.` 

```javascript
var FrontPage = React.createClass({
   statics: {
      hydratePromises: {
         frontpageArticles: function(resolver, params) {
            return resolver.loadSectionArticles('Frontpage', params);
         },
         popularArticles: function(resolver, params) {
            return resolver.loadSectionArticles('Popular', params);
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
Hopefuly the above `hydratePromises` can be reused isomorphically i.e. to prerender components server-side after hydrating their state.

Our resolvers invoke `loadSectionArticles` which returns an ES6 `Promise` for data being fetched asynchronously. This might be from HTTP endpoints, or perhaps directly from Redis if we are pre-rendering our component on the server. So our `handler` might have a different implementation on the server vs the client.

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
         promises[key](commonFunctions, params).then(function(data) {
            log.info('hydrate promise resolved', key);
            set(key, data);
         }, function(error) {
            log.error('hydrate promise rejected', key, error);
            set(key, []);
         }));
      });
   },
```


### Next steps

Incidently, we haven't addressed "overfetching," which is something that is solved elegantly by GraphQL. So that should be the next step. I guess we should filter our results in `hydratePromises` to extract only the data that is actually rendered. Then we should enable a generic query in the form of the set of dependent components required render a page, e.g. the page component and its children.

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
     frontpageArticles: [
        ...
     ],
     popularArticles: [
        ...
     ]
  }
}```

Or we should migrate to using Relay and GraphQL :)

https://twitter.com/evanxsummers