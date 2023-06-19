//imports
importScripts('js/sw-utils.js');


const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE  = 'dynamic-v2';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    // '/',
    './index.html',
    './css/style.css',
    './img/favicon.ico',
    './img/avatars/hulk.jpg',
    './img/avatars/ironman.jpg',
    './img/avatars/spiderman.jpg',
    './img/avatars/thor.jpg',
    './img/avatars/wolverine.jpg',
    './js/app.js',
    './js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    './css/animate.css',
    './js/libs/jquery.js'
];

self.addEventListener('install', e => {
    
    let cache_static = caches.open(STATIC_CACHE)
                            .then(cache => {
                                cache.addAll(APP_SHELL);
                            }).catch(error => {
                                console.log(error);
                                console.log("Ha habido un error");
                            });

    let cache_inmutable = caches.open(INMUTABLE_CACHE)
                                .then(cache => {
                                    cache.addAll(APP_SHELL_INMUTABLE)
                                        .catch(error => {
                                            console.log("Error en la carga del cache inmutable: ");
                                            console.log(error);
                                        });
                                });

    
    e.waitUntil(Promise.all([cache_static, cache_inmutable]));
     
});


self.addEventListener('activate', e => {
 
    const respuesta = caches.keys().then( keys => {
 
        keys.forEach( key => {
 
            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }
 
            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
                return caches.delete(key);
            }
 
        });
 
    });
 
    e.waitUntil( respuesta );
 
});

self.addEventListener('fetch', e => {

    const respuesta = caches.match(e.request).then(res => {
        
        if (res){
            return res
        }else{
            //al utilizar recursos externos que no se cargan al no ser que se entre en el apartado de la página web,
            //tenemos que hacer que se carguen antes en el html (<i class="fa fa-user"></i>) y guardamos su respuesta
            //en el caché dinámico ('actualizaCacheDinamico' se encuentra en './js/sw.utils.js')
            return fetch(e.request).then( newRes => {

                return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);

            })
        }

    });

    e.respondWith(respuesta);
});
