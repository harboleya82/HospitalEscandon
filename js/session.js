// Hospital Escandón — Session Manager
// • Cierra sesión si el tab/navegador se cierra (sessionStorage centinela)
// • Cierra sesión si hay más de 6h sin actividad en la página
// • Renueva actividad con cualquier interacción del usuario
(function(){
  var K_TOKEN    = 'sb-gggwswbgwihlokrnvktl-auth-token';
  var K_ACTIVITY = 'he-last-activity';
  var K_ALIVE    = 'he-session-alive';
  var LIMIT_MS   = 6 * 60 * 60 * 1000; // 6 horas

  function loginUrl(){
    return window.location.pathname.indexOf('/admin/') !== -1
      ? '../login.html' : 'login.html';
  }

  function doSignOut(){
    localStorage.removeItem(K_TOKEN);
    localStorage.removeItem(K_ACTIVITY);
    sessionStorage.removeItem(K_ALIVE);
    location.replace(loginUrl());
  }
  window.heSignOut = doSignOut;

  // Renovar timestamp de actividad en cualquier interacción
  var throttle = false;
  function resetActivity(){
    if(throttle) return;
    throttle = true;
    setTimeout(function(){ throttle = false; }, 10000); // máx 1 update cada 10s
    localStorage.setItem(K_ACTIVITY, Date.now().toString());
  }

  ['mousemove','mousedown','keydown','scroll','touchstart','pointerdown','click']
    .forEach(function(ev){
      document.addEventListener(ev, resetActivity, { passive: true });
    });

  // Comprobar inactividad cada 2 minutos
  function checkInactivity(){
    var last = parseInt(localStorage.getItem(K_ACTIVITY) || '0');
    if(last && (Date.now() - last) > LIMIT_MS){
      doSignOut();
    }
  }
  setInterval(checkInactivity, 2 * 60 * 1000);

  // Comprobar al volver al tab (cambio de ventana o de app)
  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'visible') checkInactivity();
  });

  // Mantener sessionStorage vivo mientras la página está abierta
  // (se borra solo cuando el tab/navegador se cierra)
  sessionStorage.setItem(K_ALIVE, '1');
  localStorage.setItem(K_ACTIVITY, localStorage.getItem(K_ACTIVITY) || Date.now().toString());
})();
