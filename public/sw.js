// Service Worker for advanced caching and offline support
const CACHE_NAME = 'app-cache-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg'
];

// Routes to cache for offline access
const CACHED_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register'
];

// Cache strategies
let cacheStrategy = 'adaptive';
let networkType = 'unknown';

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE
            )
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_STRATEGY') {
    cacheStrategy = event.data.strategy;
    networkType = event.data.networkType;
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external URLs
  if (url.origin !== location.origin) return;

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (isStaticAsset(url.pathname)) {
    return handleStaticAsset(request);
  } else if (isRoute(url.pathname)) {
    return handleRoute(request);
  } else if (isAPI(url.pathname)) {
    return handleAPI(request);
  }
  
  return fetch(request);
}

function isStaticAsset(pathname) {
  return pathname.includes('.') && 
    (pathname.endsWith('.js') || 
     pathname.endsWith('.css') || 
     pathname.endsWith('.png') || 
     pathname.endsWith('.jpg') || 
     pathname.endsWith('.svg') || 
     pathname.endsWith('.ico'));
}

function isRoute(pathname) {
  return CACHED_ROUTES.some(route => pathname.startsWith(route));
}

function isAPI(pathname) {
  return pathname.startsWith('/api/');
}

async function handleStaticAsset(request) {
  // Cache first strategy for static assets
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return cached || new Response('Asset not available offline', { status: 404 });
  }
}

async function handleRoute(request) {
  // Network first strategy for routes, with cache fallback
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/');
      return offlinePage || new Response('Offline', { status: 503 });
    }
    
    return new Response('Content not available offline', { status: 503 });
  }
}

async function handleAPI(request) {
  // Network only for API requests (with potential background sync)
  try {
    const response = await fetch(request);
    
    // Cache successful GET requests based on strategy
    if (response.ok && request.method === 'GET' && shouldCacheAPI()) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return cached API response if available
    if (request.method === 'GET') {
      const cached = await caches.match(request);
      if (cached) return cached;
    }
    
    return new Response(JSON.stringify({ 
      error: 'API not available offline',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function shouldCacheAPI() {
  return cacheStrategy === 'aggressive' || 
    (cacheStrategy === 'adaptive' && networkType === 'slow');
}