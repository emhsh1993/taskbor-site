/* TASK BOR — статистика сайта (правка 24.10.2026).
   Без cookies и без сторонних сервисов: только наш сервер. Считаем
   просмотры страниц, время на сайте, нажатия App Store / Google Play и
   откуда пришёл посетитель. Личные данные не собираются. */
(function () {
  var URL = 'https://taskbor-backend.onrender.com/public/site/event';
  function rnd() { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10); }
  var sid;
  try { sid = sessionStorage.getItem('tb_sid'); if (!sid) { sid = rnd(); sessionStorage.setItem('tb_sid', sid); } } catch (e) { sid = rnd(); }
  function lang() { var l = (document.documentElement.lang || '').slice(0, 2); return l === 'uz' || l === 'en' ? l : 'ru'; }
  function send(o) {
    o.s = sid; o.p = location.pathname; o.l = lang();
    var body = JSON.stringify(o);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(URL, new Blob([body], { type: 'text/plain' }))) return;
    } catch (e) {}
    try { fetch(URL, { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain' }, keepalive: true, mode: 'no-cors' }); } catch (e) {}
  }
  var utm = (location.search.match(/[?&]utm_source=([^&#]+)/) || [])[1];
  send({ t: 'view', r: document.referrer || '', u: utm ? decodeURIComponent(utm) : '' });

  // время на странице — только пока вкладка открыта на экране
  var active = 0, since = document.visibilityState === 'visible' ? Date.now() : 0;
  function flush() {
    if (since) { active += (Date.now() - since) / 1000; since = 0; }
    if (active >= 1) { send({ t: 'leave', d: Math.round(active) }); active = 0; }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush(); else since = Date.now();
  });
  window.addEventListener('pagehide', flush);

  // нажатия на кнопки App Store / Google Play (и «Скоро» — тоже интерес)
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-store]') : null;
    if (el) send({ t: 'store', st: el.getAttribute('data-store') });
  }, true);
})();
