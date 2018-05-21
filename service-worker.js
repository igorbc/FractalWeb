// function log(message) {
//   // return;
//   document.getElementById("debug-info").innerHTML = message + '<br>' + document.getElementById("debug-info").innerHTML;
// }
var cacheName = 'web-fractal-cache';
var filesToCache = [
  "./",
  "./index.html",
  "./favicon.ico",
  "./stylesheets/fractalFont.css",
  "./stylesheets/index.css",
  "https://cdn.jsdelivr.net/pixi.js/3.0.7/pixi.js",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "./js/fractalPixi.js",
  "./js/glslUniformManager.js",
  "./js/canvasToPng.js",
  "./js/handleTouches.js",
  "./js/keyHandlerPixi.js",
  "./js/keyHandler.js",
  "./js/log.js",
  "./js/main.js",
  "./js/touchManager.js",
  "./js/urlParamManager.js",
  "./glsl/shader.glsl.js",
  "./fonts/icomoon.eot",
  "./fonts/icomoon.svg",
  "./fonts/icomoon.ttf",
  "./fonts/icomoon.woff"
]


// Listen for install event, set callback
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Install');
  // log('[Service Worker] Install');
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[Service Worker] caching app shell');
      // log('[Service Worker] caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  // console.log('fetching...');
  // log('fetching...');
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if(response) {
          // console.log('hit cache!');
          // log('hit cache!');
          // console.log(response);
          return response;
        }
        // console.log('did not hit cache');
        // log('did not hit cache');
        // console.log(event.request);
        return fetch(event.request);
      }
    )
  );
});
