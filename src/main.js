import './style.css';
import { api, session, login } from './api.js';
const app = document.querySelector('#app');
let games = [], search = '', filter = 'Todos', notice = '';
let viewVersion = 0;
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const options = values => values.map(v => `<option>${v}</option>`).join('');
function loginView(message = '') {
  ++viewVersion;
  app.innerHTML = `<main class="login-layout"><section class="login-story"><a class="brand" href="#">▣ <span>checkpoint</span></a><div><p class="eyebrow">UN ESPACIO PARA TUS FAVORITOS</p><h1>Tu próxima<br>aventura empieza<br><em>aquí.</em></h1><p>Guarda los juegos que te gustan.<br>Y los mundos que te quedan por descubrir.</p></div><footer>GUARDA · JUEGA · REPITE <span>© 2026 CHECKPOINT</span></footer></section><section class="login-panel"><form id="login"><span class="pill">PLAYER ACCESS</span><h2>Qué bueno verte.</h2><p class="muted">Inicia sesión para entrar a tu colección.</p><label>Usuario<input name="username" autocomplete="username" placeholder="Tu usuario LDAP" required maxlength="100"></label><label>Contraseña<input name="password" type="password" autocomplete="current-password" placeholder="Tu contraseña" required></label><p class="error" role="alert">${escape(message)}</p><button class="primary" type="submit">Entrar a mi colección <span>↗</span></button><p class="login-note">Acceso con tu cuenta de la clase · LDAP</p></form></section></main>`;
  document.querySelector('#login').onsubmit = async event => {
    event.preventDefault(); const form = event.currentTarget, button = form.querySelector('button');
    button.disabled = true; button.textContent = 'Conectando…'; form.querySelector('.error').textContent = '';
    try { await login(form.username.value.trim(), form.password.value); if (location.hash === '#dashboard') await dashboard(); else location.hash = '#dashboard'; }
    catch (error) { form.querySelector('.error').textContent = error.response?.status === 401 || error.response?.status === 400 ? 'Usuario o contraseña incorrectos.' : 'No pudimos conectar con LDAP/Keycloak. Revisa que esté disponible.'; button.disabled = false; button.textContent = 'Entrar a mi colección ↗'; }
  };
}
function shell(content, active = 'collection') {
  app.innerHTML = `<div class="workspace"><aside><a class="brand" href="#dashboard">▣ <span>checkpoint</span></a><p class="nav-label">TU ESPACIO</p><a class="nav ${active === 'collection' ? 'active' : ''}" href="#dashboard">▦ <span>Mi colección</span></a><a class="nav ${active === 'new' ? 'active' : ''}" href="#new">＋ <span>Agregar juego</span></a><div class="sidebar-bottom"><div class="user"><span class="avatar">${escape((sessionStorage.getItem('username') || 'P')[0].toUpperCase())}</span><div><strong>${escape(sessionStorage.getItem('username') || 'Player')}</strong><small>Cuenta LDAP</small></div></div><button id="logout" class="logout">Cerrar sesión ↗</button></div></aside><main class="content"><header><span>Mi espacio <b>/ ${active === 'new' ? 'Nuevo juego' : 'Colección'}</b></span><span class="session"><i></i> Sesión activa</span></header>${content}</main></div>`;
  document.querySelector('#logout').onclick = () => { session.clear(); location.hash = '#login'; loginView(); };
}
async function dashboard() {
  const version = ++viewVersion;
  shell('<p class="muted" role="status">Cargando tu colección…</p>');
  try { games = (await api.get('/api/games')).data; if (version === viewVersion) renderDashboard(); }
  catch (error) { if (error.response?.status !== 401 && version === viewVersion) { shell('<h1>No pudimos cargar tus juegos.</h1><p class="error" role="alert">Comprueba que el backend esté disponible.</p><button class="primary" id="retry">Volver a intentar</button>'); document.querySelector('#retry').onclick = dashboard; } }
}
function renderDashboard() {
  shell(`<div class="page-title"><div><p class="eyebrow">TU INVENTARIO PERSONAL</p><h1>Mi colección<span class="dot">.</span></h1><p class="muted">Grandes historias. Nuevos retos. Todos tus juegos en un lugar.</p></div><a class="primary" href="#new">＋ Agregar juego</a></div>${notice ? `<p class="success" role="status">${escape(notice)}</p>` : ''}<section class="stats"><div><span>En tu colección</span><strong>${String(games.length).padStart(2, '0')}</strong><small>Juegos guardados ↗</small></div><div><span>En progreso</span><strong>${String(games.filter(g => g.status === 'Jugando').length).padStart(2, '0')}</strong><small>La aventura continúa</small></div><div><span>Completados</span><strong>${String(games.filter(g => g.status === 'Completado').length).padStart(2, '0')}</strong><small>Un logro más desbloqueado</small></div></section><div class="collection-header"><h2>Tu biblioteca <span>${games.length}</span></h2><p class="muted">Hecha por ti, para ti.</p></div><div class="toolbar"><label class="search">⌕ <input id="search" type="search" placeholder="Buscar en tu colección…" value="${escape(search)}" aria-label="Buscar juegos"></label><select id="filter" aria-label="Filtrar por estado">${options(['Todos', 'Por jugar', 'Jugando', 'Completado'])}</select></div><section id="games" class="game-grid" aria-live="polite"></section>`);
  document.querySelector('#filter').value = filter;
  document.querySelector('#search').oninput = e => { search = e.target.value; renderGames(); };
  document.querySelector('#filter').onchange = e => { filter = e.target.value; renderGames(); };
  renderGames(); notice = '';
}
function renderGames() {
  const visible = games.filter(g => g.title.toLowerCase().includes(search.toLowerCase()) && (filter === 'Todos' || g.status === filter));
  document.querySelector('#games').innerHTML = visible.length ? visible.map(g => `<article class="game-card"><div class="game-art art-${['Aventura', 'RPG', 'Acción', 'Estrategia', 'Deportes', 'Indie', 'Otro'].indexOf(g.genre) % 4}"><span>${escape(g.platform)}</span><div class="art-symbol">${escape(g.title.slice(0, 2).toUpperCase())}</div><small>${escape(g.genre)} / CHECKPOINT</small></div><div class="game-info"><div class="game-meta">${escape(g.genre)} <span class="status">${escape(g.status)}</span></div><h3>${escape(g.title)}</h3><p>${escape(g.notes || 'Una nueva aventura en tu colección.')}</p></div></article>`).join('') : `<div class="empty"><span>▣</span><h2>${games.length ? 'Sin coincidencias' : 'Cada colección empieza con un juego.'}</h2><p class="muted">${games.length ? 'Prueba otro nombre o cambia el filtro.' : 'Agrega tu primer favorito y empieza tu próxima aventura.'}</p>${games.length ? '' : '<a class="primary" href="#new">＋ Agregar mi primer juego</a>'}</div>`;
}
function newView() {
  ++viewVersion;
  shell(`<a class="back" href="#dashboard">← Volver a mi colección</a><div class="page-title"><div><p class="eyebrow">EL SIGUIENTE NIVEL</p><h1>Un nuevo favorito<span class="dot">.</span></h1><p class="muted">Dale un lugar a tu próxima aventura.</p></div></div><div class="new-layout"><form id="new-game" class="form-card"><h2>Detalles del juego</h2><label>Nombre del juego <input name="title" placeholder="Ej. The Legend of Zelda" required maxlength="100"></label><div class="form-row"><label>Plataforma<select name="platform">${options(['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Móvil'])}</select></label><label>Género<select name="genre">${options(['Aventura', 'RPG', 'Acción', 'Estrategia', 'Deportes', 'Indie', 'Otro'])}</select></label></div><label>Estado<select name="status">${options(['Por jugar', 'Jugando', 'Completado'])}</select></label><label>Notas <span class="muted">· opcional</span><textarea name="notes" rows="4" maxlength="500" placeholder="¿Qué te gusta de este juego?"></textarea></label><p class="error" role="alert"></p><div class="form-actions"><a class="back" href="#dashboard">Cancelar</a><button class="primary" type="submit">Guardar juego ↗</button></div></form><div class="tip"><span>✳</span><h2>Tu colección,<br>tus reglas.</h2><p>No importa si ya lo terminaste o apenas estás por comenzar. Aquí hay espacio para todos tus favoritos.</p><small>EL PRÓXIMO GRAN JUEGO TE ESPERA.</small></div></div>`, 'new');
  document.querySelector('#new-game').onsubmit = async event => {
    event.preventDefault(); const form = event.currentTarget, button = form.querySelector('button');
    const body = Object.fromEntries(new FormData(form));
    if (!body.title.trim()) { form.querySelector('.error').textContent = 'Escribe un nombre para el juego.'; return; }
    button.disabled = true; button.textContent = 'Guardando…';
    try { await api.post('/api/games', body); search = ''; filter = 'Todos'; notice = 'Juego agregado a tu colección.'; location.hash = '#dashboard'; }
    catch (error) { if (error.response?.status !== 401) { form.querySelector('.error').textContent = error.response?.data?.message || 'No fue posible guardar. Inténtalo de nuevo.'; button.disabled = false; button.textContent = 'Guardar juego ↗'; } }
  };
}
function route() { if (!session.token) return loginView(); if (location.hash === '#new') return newView(); dashboard(); }
window.addEventListener('hashchange', route);
window.addEventListener('session-expired', () => loginView('Tu sesión expiró. Inicia sesión de nuevo.'));
route();
