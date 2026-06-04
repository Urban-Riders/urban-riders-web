// Motor PWA Transparente
self.addEventListener('install', (event) => {
    // Esto obliga al navegador a destruir el motor viejo y usar este nuevo
    self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim()); 
});

self.addEventListener('fetch', (event) => {
    // Al dejar esto vacío, cumplimos el requisito de PWA pero no interferimos.
    // Toda la conexión viaja directa y limpia hacia Vercel y Supabase.
});

