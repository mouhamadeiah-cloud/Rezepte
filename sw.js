const CACHE_NAME = 'die-primel-cache-v2';
const urlsToCache = [
    './',
    './index.html',
    './admin-groups.html',
    './admin-dishes.html',
    './style.css',
    './script.js',
    './admin-groups.js',
    './admin-dishes.js',
    './manifest.json'
];

self.addEventListener('install', event => {
    console.log('Service Worker: Installation läuft...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache geöffnet');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Alle Dateien gecacht');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Cache-Fehler:', error);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Aktivierung...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Alten Cache löschen:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker aktiviert');
            return self.clients.claim();
        }).catch(error => {
            console.error('Service Worker Aktivierungsfehler:', error);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            if (event.request.url.indexOf(self.location.origin) === 0) {
                                cache.put(event.request, responseToCache);
                            }
                        });
                    
                    return response;
                }).catch(error => {
                    console.error('Fetch Fehler:', error);
                    
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                    
                    return new Response('Offline - Keine Verbindung', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});