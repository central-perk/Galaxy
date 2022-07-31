# Easy Leaflet Statistics Server

###describe
- Collect stats when the title is running
- Provide data interface to Easy Leaflet service



### Startup project

- start mongoDB
- start redis
- sudo npm install
- gulp

### local test

Modify config/config-dev.js under echuandan.com service

````
module.exports = {
ANALYTICS: {
host: 'http://127.0.0.1:8005/',
_t: 'analytics',
API: {
CREATE_FLYER_AID: '/api/analytics/site'
}
}
};
````

### redis management

Use [kue](https://github.com/Automattic/kue) to manage the queue of processing tasks in redis