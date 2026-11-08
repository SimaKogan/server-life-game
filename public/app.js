(() => {
  const $ = (id) => document.getElementById(id);
  const canvas = $('canvas');
  const ctx = canvas.getContext('2d');
  const el = {
    status: $('status'), empty: $('empty'), error: $('error'),
    gen: $('s-gen'), alive: $('s-alive'), density: $('s-density'),
    size: $('size'), sizeOut: $('size-out'), speed: $('speed'), speedOut: $('speed-out'),
    init: $('init'), play: $('play'), step: $('step'), reset: $('reset'),
  };

  const API = '/api';
  const nf = new Intl.NumberFormat('ru-RU');
  let areaSize = 0;
  let playing = false;
  let busy = false;
  let timer = null;

  // Цвет живой клетки берём из CSS-переменной, чтобы работали обе темы.
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  function rgb(color) {
    const probe = document.createElement('canvas').getContext('2d');
    probe.fillStyle = color;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  }

  async function api(path, method = 'GET') {
    const res = await fetch(API + path, { method, credentials: 'same-origin' });
    let data = {};
    try { data = await res.json(); } catch (_) { /* пустой ответ */ }
    if (!res.ok) throw new Error(data.message || `Ошибка ${res.status}`);
    return data;
  }

  function showError(msg) {
    el.error.textContent = msg;
    el.error.hidden = !msg;
  }

  function setStatus(text, kind) {
    el.status.textContent = text;
    el.status.className = 'status ' + (kind || '');
  }

  function setStats({ generation, alives }) {
    el.gen.textContent = nf.format(generation);
    el.alive.textContent = nf.format(alives);
    const total = areaSize * areaSize;
    el.density.textContent = total ? `${((alives / total) * 100).toFixed(1)}%` : '—';
  }

  function setControls(hasField) {
    el.play.disabled = !hasField;
    el.step.disabled = !hasField || playing;
    el.reset.disabled = !hasField;
    el.empty.hidden = hasField;
  }

  function draw(matrix) {
    const n = matrix.length;
    if (canvas.width !== n || canvas.height !== n) {
      canvas.width = n;
      canvas.height = n;
    }
    const [r, g, b] = rgb(css('--accent'));
    const [dr, dg, db] = rgb(css('--cell-dead'));
    const img = ctx.createImageData(n, n);
    const px = img.data;
    let p = 0;
    for (let i = 0; i < n; i++) {
      const row = matrix[i];
      for (let j = 0; j < n; j++, p += 4) {
        const on = row[j];
        px[p] = on ? r : dr;
        px[p + 1] = on ? g : dg;
        px[p + 2] = on ? b : db;
        px[p + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  async function refresh() {
    const state = await api('/state');
    areaSize = state.areaSize;
    draw(state.matrix);
    setStats(state);
  }

  async function run(action) {
    if (busy) return;
    busy = true;
    showError('');
    try {
      await action();
      setStatus('Подключено', 'ok');
    } catch (e) {
      stop();
      showError(e.message === 'Failed to fetch' ? 'Сервер недоступен' : e.message);
      setStatus(e.message === 'Failed to fetch' ? 'Нет соединения' : 'Ошибка', 'bad');
    } finally {
      busy = false;
    }
  }

  const doInit = () => run(async () => {
    stop();
    await api(`/init/${el.size.value}`, 'POST');
    await refresh();
    setControls(true);
  });

  const doStep = () => run(async () => {
    await api('/next', 'POST');
    await refresh();
  });

  function interval() { return Math.round(1000 / Number(el.speed.value)); }

  function loop() {
    if (!playing) return;
    const started = performance.now();
    doStep().finally(() => {
      if (!playing) return;
      const wait = Math.max(0, interval() - (performance.now() - started));
      timer = setTimeout(loop, wait);
    });
  }

  function start() {
    playing = true;
    el.play.textContent = '❚❚ Пауза';
    el.step.disabled = true;
    loop();
  }

  function stop() {
    playing = false;
    clearTimeout(timer);
    el.play.textContent = '▶ Запуск';
    el.step.disabled = el.play.disabled;
  }

  el.play.addEventListener('click', () => (playing ? stop() : start()));
  el.step.addEventListener('click', doStep);
  el.init.addEventListener('click', doInit);

  el.reset.addEventListener('click', () => run(async () => {
    stop();
    await api('/del', 'DELETE');
    areaSize = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.height = 1;
    el.gen.textContent = el.alive.textContent = el.density.textContent = '—';
    setControls(false);
  }));

  el.size.addEventListener('input', () => {
    el.sizeOut.textContent = `${el.size.value} × ${el.size.value}`;
  });
  el.speed.addEventListener('input', () => {
    el.speedOut.textContent = `${el.speed.value} шаг/с`;
  });

  // Если у пользователя уже есть живая сессия, показываем её поле.
  run(async () => {
    await api('/wakeup');
    try {
      await refresh();
      el.size.value = areaSize;
      el.sizeOut.textContent = `${areaSize} × ${areaSize}`;
      setControls(true);
    } catch (_) {
      setControls(false);
    }
  });

  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (areaSize) refresh().catch(() => {});
  });
})();
