self.addEventListener('install', function(e) {
    self.skipWaiting(); //to do an immediate takeover of all pages within scope
});

self.addEventListener('activate', function(e) {
    caches.keys().then(function(cacheNames) {
        return Promise.all(cacheNames.map(function(cacheName) {
            return caches.delete(cacheName);
        }));
    }).then(function(res) {
        console.debug('deleted all caches', res);
    });
});

self.addEventListener('fetch', function(e) {
    e.respondWith( //to handle the request and prevent the default
        Promise.race([ //so that you can start working with the fastest and don't have to wait
            timeout(200).then(function(res) {
                return cacheResponse(e); //if you have slow connection you can get it out of the cache
            }),
            networkResponse(e).then(function(res) { //the main part of your fetch where you put everything in the cache
                return res;
            }).catch(function() {
                return cacheResponse(e); //load something out of the cache
            })
        ]).then(function(result) {
            if (result.response instanceof Response) {
                return result;
            }

            return networkResponse(e).then(function(res) {
                return res;
            });
        }).then(function(res) {

            return res.response;
        })
    );
});

function timeout(time) { //if your request takes to long you can load out of the cache
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}

function cacheResponse(e) { //if the request match with something out of the cache you'll get it
    return caches.match(e.request).then(function(cacheResult) {
        return {
            type: 'CACHE',
            response: cacheResult
        };
    });
}

function networkResponse(e) {
    return fetch(e.request).then(function(response) {

        if (e.request.method !== "GET") { //other methods need special fetch functions
            return;
        }
        caches.open('serviceWorker').then(function(cache) {
            cache.put(e.request, response); //puts the response in the cache
        });

        return {
            type: 'NETWORK',
            response: response.clone() //and a response.clone() back to the network
        };

    });
}