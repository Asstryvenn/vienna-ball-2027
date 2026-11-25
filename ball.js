// Бальный слой: приглашение-конверт, люстра, пара из шкатулки, занавес, песочные часы,
// бокал шампанского, отрывной билет, рассвет при прокрутке, перо, вальс.

// Дата бала. Когда станет известна, впишите её так: "2027-01-23T18:00:00+05:00".
// Пока пусто, песочные часы показывают «Дату объявим скоро».
var BALL_DATE = "";

// Своя мелодия для кнопки музыки. Если файла нет, играет вальс из музыкальной шкатулки.
var MUSIC_FILE = "music/theme.mp3";

(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var isMain = !!document.querySelector(".hero .title");
  var hero = document.querySelector(".hero");
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function replayIntro() {
    if (reduce) return;
    root.classList.remove("play"); void root.offsetWidth; root.classList.add("play");
    setTimeout(function () { root.classList.remove("play"); }, 4200);
  }

  /* ---------- 1. конверт-приглашение (главная, один раз за визит) ---------- */
  var seenInvite = false;
  try { seenInvite = sessionStorage.getItem("vb-invite") === "1"; } catch (e) {}
  if (isMain && !seenInvite && !reduce) {
    var inv = el("div", "invite",
      '<div class="inv-stage">' +
        '<p class="inv-top">Студсовет НИШ ЕМН Астана-Нура<br>приглашает вас</p>' +
        '<button class="envelope" type="button" aria-label="Открыть приглашение">' +
          '<span class="env-back"></span>' +
          '<span class="env-card"><b>Vienna Ball</b><i>Зима 2027, Астана</i></span>' +
          '<span class="env-front"></span>' +
          '<span class="env-flap"></span>' +
          '<span class="seal"><span>VB</span></span>' +
        '</button>' +
        '<p class="inv-hint">Нажмите на печать</p>' +
      '</div>' +
      '<button class="inv-skip" type="button">Пропустить</button>');
    inv.setAttribute("role", "dialog"); inv.setAttribute("aria-label", "Приглашение на бал");
    document.body.appendChild(inv);
    root.classList.add("inv-lock");
    var done = function () {
      try { sessionStorage.setItem("vb-invite", "1"); } catch (e) {}
      inv.classList.add("gone");
      root.classList.remove("inv-lock");
      replayIntro();
      setTimeout(function () { inv.remove(); }, 1300);
    };
    inv.querySelector(".envelope").addEventListener("click", function () {
      if (inv.classList.contains("opening")) return;
      inv.classList.add("opening");
      setTimeout(done, 2300);
    });
    inv.querySelector(".inv-skip").addEventListener("click", done);
    document.addEventListener("keydown", function k(e) { if (e.key === "Escape" && document.body.contains(inv)) { done(); document.removeEventListener("keydown", k); } });
    setTimeout(function () { inv.querySelector(".envelope").focus({ preventScroll: true }); }, 300);
  }

  /* ---------- 4. хрустальная люстра ---------- */
  if (hero) {
    var crystals = "";
    var drops = [[34, 100], [50, 112], [66, 104], [82, 118], [118, 118], [134, 104], [150, 112], [166, 100], [100, 132], [74, 132], [126, 132]];
    drops.forEach(function (d, i) {
      crystals += '<line x1="' + d[0] + '" y1="' + (d[1] - 14) + '" x2="' + d[0] + '" y2="' + (d[1] - 4) + '"/>' +
        '<path class="cr" style="--d:' + (i * 0.37).toFixed(2) + 's" d="M' + d[0] + " " + (d[1] - 4) + " l5 7 -5 11 -5 -11 z" + '"/>';
    });
    var candles = "";
    [30, 64, 136, 170].forEach(function (x, i) {
      candles += '<rect x="' + (x - 3) + '" y="66" width="6" height="16" rx="1"/><ellipse class="fl" style="--d:' + (i * 0.23) + 's" cx="' + x + '" cy="60" rx="3.2" ry="6"/>';
    });
    var ch = el("div", "chand",
      '<svg viewBox="0 -260 200 420" aria-hidden="true">' +
        '<defs><radialGradient id="glow"><stop offset="0" stop-color="#fff4d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></radialGradient></defs>' +
        '<circle class="halo" cx="100" cy="80" r="95" fill="url(#glow)"/>' +
        '<line class="chain" x1="100" y1="-260" x2="100" y2="22"/>' +
        '<path class="gold" d="M86 22 h28 l-6 10 h-16 z"/>' +
        '<circle class="gold" cx="100" cy="44" r="6"/><circle class="gold" cx="100" cy="62" r="8"/>' +
        '<path class="arm" d="M100 84 C 80 92, 50 96, 30 82 M100 84 C 85 86, 70 88, 64 82 M100 84 C 120 92, 150 96, 170 82 M100 84 C 115 86, 130 88, 136 82"/>' +
        '<path class="arm" d="M100 70 V 110"/>' +
        '<g class="cands">' + candles + "</g>" +
        '<g class="crys">' + crystals + "</g>" +
        '<path class="cr big" d="M100 112 l9 14 -9 22 -9 -22 z"/>' +
      "</svg>");
    ch.setAttribute("role", "button"); ch.setAttribute("tabindex", "0"); ch.setAttribute("aria-label", "Люстра: нажмите, чтобы она зазвенела");
    hero.appendChild(ch);
    var ang = 0, vel = 0, lastY = scrollY;
    addEventListener("scroll", function () { var dy = scrollY - lastY; lastY = scrollY; vel += Math.max(-3, Math.min(3, dy * 0.02)); }, { passive: true });
    var ring = function (e) {
      vel += (Math.random() < 0.5 ? -1 : 1) * 2.2;
      var r = ch.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      var cx = r.left + r.width / 2 - hr.left, cy = r.top + r.height * 0.75 - hr.top;
      for (var i = 0; i < 26; i++) {
        var s = el("i", "chime");
        var a = Math.random() * 6.283, d = 60 + Math.random() * 130;
        s.style.left = cx + "px"; s.style.top = cy + "px";
        s.style.setProperty("--x", (Math.cos(a) * d).toFixed(0) + "px");
        s.style.setProperty("--y", (Math.sin(a) * d * 0.8 + 40).toFixed(0) + "px");
        s.style.animationDelay = (Math.random() * 0.15).toFixed(2) + "s";
        hero.appendChild(s);
        setTimeout(function (n) { return function () { n.remove(); }; }(s), 1600);
      }
      if (window.__waltzChime) window.__waltzChime();
    };
    ch.addEventListener("click", ring);
    ch.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ring(); } });
    if (!reduce) (function swing() {
      vel += -ang * 0.012; vel *= 0.965; ang += vel;
      ang = Math.max(-14, Math.min(14, ang));
      ch.style.transform = "rotate(" + ang.toFixed(2) + "deg)";
      requestAnimationFrame(swing);
    })();
  }

  /* ---------- 2. пара из музыкальной шкатулки ---------- */
  var copy = document.querySelector(".hero-copy, .hero-text");
  if (copy) {
    var box = el("div", "musicbox",
      '<div class="mb-spin"><svg viewBox="0 0 200 300" aria-hidden="true">' +
        '<defs><linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe9bf"/><stop offset=".55" stop-color="#d3ac63"/><stop offset="1" stop-color="#9c722b"/></linearGradient></defs>' +
        '<g fill="url(#gd)" stroke="url(#gd)" stroke-linecap="round" stroke-linejoin="round">' +
          // кавалер
          '<circle cx="80" cy="46" r="13" stroke="none"/>' +
          '<path stroke="none" d="M64 64 Q80 58 96 64 L98 120 L104 168 L90 168 L86 132 L80 132 L76 168 L60 168 L64 120 Z"/>' +
          '<path stroke="none" d="M68 166 L66 262 L76 262 L80 170 Z M82 170 L88 262 L98 262 L92 166 Z"/>' +
          '<path fill="none" stroke-width="7" d="M66 70 Q46 64 36 46"/>' +
          '<path fill="none" stroke-width="7" d="M94 74 Q108 88 116 108"/>' +
          // дама
          '<circle cx="118" cy="54" r="12" stroke="none"/>' +
          '<circle cx="128" cy="44" r="7" stroke="none"/>' +
          '<path stroke="none" d="M108 70 Q118 64 130 70 L126 116 L112 116 Z"/>' +
          '<path stroke="none" d="M112 112 C 96 150, 70 210, 56 268 Q 118 292 188 266 C 172 214, 144 156, 126 112 Z"/>' +
          '<path fill="none" stroke-width="5" d="M110 74 Q72 66 38 46"/>' +
          '<path fill="none" stroke-width="5" d="M128 76 Q118 64 98 66"/>' +
          '<circle cx="36" cy="45" r="5" stroke="none"/>' +
        "</g>" +
        '<g class="sway" fill="none" stroke="#f3dfae" stroke-width="1" opacity=".55"><path d="M60 250 Q120 270 184 248"/><path d="M72 220 Q120 236 170 218"/></g>' +
      "</svg></div>" +
      '<div class="mb-base"></div>');
    box.setAttribute("aria-hidden", "true");
    copy.appendChild(box);
    if (!reduce) {
      var mt = false;
      addEventListener("scroll", function () {
        if (mt) return; mt = true;
        requestAnimationFrame(function () {
          mt = false;
          var y = Math.min(scrollY, 900);
          box.style.setProperty("--up", (-y * 0.45).toFixed(1) + "px");
          box.style.setProperty("--fade", Math.max(0, 1 - y / 600).toFixed(3));
        });
      }, { passive: true });
    }
  }

  /* ---------- 3. занавес у сцены артистов ---------- */
  var stars = document.querySelector(".stars");
  if (stars) {
    var cur = el("div", "curtain", '<span class="c-l"></span><span class="c-r"></span><span class="c-top"></span>');
    cur.setAttribute("aria-hidden", "true");
    stars.appendChild(cur);
    if (reduce || !("IntersectionObserver" in window)) cur.classList.add("open");
    else {
      var co = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { setTimeout(function () { cur.classList.add("open"); }, 250); co.disconnect(); }
      }, { rootMargin: "0px 0px -35% 0px" });
      co.observe(stars);
    }
  }

  /* фото артистов показываем после полной загрузки, чтобы не было кусков */
  Array.prototype.forEach.call(document.querySelectorAll(".cutout"), function (im) {
    var ok = function () { im.classList.add("ready"); };
    if (im.complete && im.naturalWidth) ok(); else { im.addEventListener("load", ok); im.addEventListener("error", ok); }
  });

  /* добрые дела раскрываются по очереди */
  var wl = document.querySelector(".wish-list");
  if (wl) {
    if (reduce || !("IntersectionObserver" in window)) wl.classList.add("shown");
    else { var wo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { wl.classList.add("shown"); wo.disconnect(); } }, { rootMargin: "0px 0px -15% 0px" }); wo.observe(wl); }
  }

  /* вопросы появляются по очереди, открыт может быть один */
  var fl = document.querySelector(".faq-list");
  if (fl) {
    if (reduce || !("IntersectionObserver" in window)) fl.classList.add("shown");
    else { var fo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { fl.classList.add("shown"); fo.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" }); fo.observe(fl); }
    fl.addEventListener("toggle", function (e) {
      if (!e.target.open) return;
      Array.prototype.forEach.call(fl.querySelectorAll("details[open]"), function (d) { if (d !== e.target) d.open = false; });
    }, true);
  }

  /* ---------- 5. песочные часы и обратный отсчёт ---------- */
  var soon = document.querySelector(".soon-line");
  var glass = '<svg class="hg" viewBox="0 0 24 36" aria-hidden="true"><path class="hg-frame" d="M3 2h18M3 34h18M5 2c0 9 6 11 6 16S5 25 5 34M19 2c0 9-6 11-6 16s6 7 6 16"/>' +
    '<path class="hg-top" d="M7 7h10c-1 5-4 7-5 9-1-2-4-4-5-9z"/><path class="hg-bot" d="M6 32c1-4 4-6 6-6s5 2 6 6z"/><line class="hg-fall" x1="12" y1="16" x2="12" y2="30"/></svg>';
  if (soon) {
    var date = BALL_DATE ? new Date(BALL_DATE) : null;
    if (date && !isNaN(date)) {
      soon.innerHTML = glass + '<span class="cd" aria-live="off"></span>';
      var cdEl = soon.querySelector(".cd");
      var tick = function () {
        var ms = date - new Date();
        if (ms <= 0) { cdEl.textContent = "Бал начался!"; return; }
        var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
        cdEl.textContent = "До бала " + d + " д " + String(h).padStart(2, "0") + " ч " + String(m).padStart(2, "0") + " мин " + String(s).padStart(2, "0") + " с";
        setTimeout(tick, 1000);
      };
      tick();
    } else {
      soon.innerHTML = glass + "<span>" + soon.textContent + "</span>";
    }
    soon.classList.add("with-glass");
  }

  /* ---------- 6. бокал шампанского у сбора ---------- */
  var meter = document.getElementById("fund-meter");
  if (meter) {
    var bub = "";
    for (var b = 0; b < 12; b++) bub += '<circle class="bb" cx="' + (34 + Math.random() * 32).toFixed(1) + '" cy="196" r="' + (1 + Math.random() * 1.8).toFixed(1) + '" style="--d:' + (-Math.random() * 3).toFixed(2) + "s;--t:" + (2 + Math.random() * 2).toFixed(2) + 's"/>';
    var gl = el("div", "flute",
      '<svg viewBox="0 0 100 260" aria-hidden="true">' +
        '<defs><clipPath id="bowl"><path d="M30 10 H70 C 72 70, 68 150, 56 196 H44 C 32 150, 28 70, 30 10 Z"/></clipPath>' +
        '<linearGradient id="champ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1c4"/><stop offset="1" stop-color="#d9a94a"/></linearGradient></defs>' +
        '<g clip-path="url(#bowl)"><rect class="liquid" x="20" y="196" width="60" height="190" fill="url(#champ)"/><g class="bubbles">' + bub + "</g></g>" +
        '<path class="glass" d="M30 10 H70 C 72 70, 68 150, 56 196 H44 C 32 150, 28 70, 30 10 Z M50 196 V 244 M32 250 Q50 240 68 250"/>' +
        '<path class="shine" d="M36 24 C 35 70, 38 130, 45 180"/>' +
      "</svg>" +
      '<p class="flute-cap">Бокал наполнится, когда откроется сбор</p>');
    meter.parentNode.insertBefore(gl, meter);
    fetch("fund.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (f) {
      if (typeof f.raised !== "number" || !f.goal) return;
      var pct = Math.max(0, Math.min(1, f.raised / f.goal));
      gl.querySelector(".flute-cap").textContent = "Наполнено на " + Math.round(pct * 100) + "%";
      gl.style.setProperty("--fill", (pct * 186).toFixed(1));
      gl.classList.add("pouring");
    }).catch(function () {});
  }

  /* ---------- 7. отрывной билет ---------- */
  var stub = document.querySelector(".t-stub");
  if (stub) {
    var ticket = stub.closest(".ticket");
    stub.removeAttribute("aria-hidden");
    stub.setAttribute("role", "button"); stub.setAttribute("tabindex", "0");
    stub.setAttribute("aria-label", "Оторвать корешок билета");
    var note = el("p", "tear-note", "Корешок ваш. Сохраните до бала!");
    ticket.appendChild(note);
    var tear = function () {
      var torn = ticket.classList.toggle("torn");
      stub.setAttribute("aria-label", torn ? "Вернуть корешок на место" : "Оторвать корешок билета");
    };
    stub.addEventListener("click", tear);
    stub.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tear(); } });
  }

  /* ---------- 8. от зимней ночи к рассвету ---------- */
  if (!reduce) {
    var dawn = el("div", "dawn"); dawn.setAttribute("aria-hidden", "true");
    document.body.appendChild(dawn);
    var dt = false;
    var setDawn = function () {
      dt = false;
      var max = document.documentElement.scrollHeight - innerHeight;
      dawn.style.setProperty("--t", max > 0 ? (scrollY / max).toFixed(4) : 0);
    };
    addEventListener("scroll", function () { if (!dt) { dt = true; requestAnimationFrame(setDawn); } }, { passive: true });
    setDawn();
  }

  /* ---------- 9. сказка пишется пером ---------- */
  var tale = document.querySelector(".intro .tale");
  if (tale && !reduce && "IntersectionObserver" in window) {
    var words = tale.textContent.trim().split(/\s+/);
    tale.setAttribute("aria-label", tale.textContent.trim());
    tale.innerHTML = words.map(function (w, i) { return '<span class="wd" aria-hidden="true">' + w + "</span>"; }).join(" ");
    tale.classList.add("quill-wait");
    var pen = el("span", "pen", '<svg viewBox="0 0 40 40"><path d="M36 2 C 22 6, 12 16, 6 30 L4 38 L10 32 C 22 28, 32 16, 36 2 Z" fill="#d3ac63"/><path d="M36 2 L8 32" stroke="#7a5520" stroke-width="1" fill="none"/></svg>');
    pen.setAttribute("aria-hidden", "true");
    tale.parentNode.style.position = "relative";
    tale.parentNode.appendChild(pen);
    var spans = tale.querySelectorAll(".wd");
    var to = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      to.disconnect();
      tale.classList.remove("quill-wait");
      var i = 0, pr = tale.parentNode.getBoundingClientRect();
      pen.classList.add("on");
      (function write() {
        if (i >= spans.length) { pen.classList.remove("on"); return; }
        var sp = spans[i]; sp.classList.add("inked");
        var r = sp.getBoundingClientRect(); pr = tale.parentNode.getBoundingClientRect();
        pen.style.transform = "translate(" + (r.right - pr.left - 4).toFixed(0) + "px," + (r.top - pr.top - 26).toFixed(0) + "px)";
        i++; setTimeout(write, 55);
      })();
    }, { rootMargin: "0px 0px -20% 0px" });
    to.observe(tale);
  }

  /* ---------- 10. вальс из музыкальной шкатулки ---------- */
  var AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
    var btn = el("button", "waltz-btn", '<span class="note" aria-hidden="true">♪</span><span class="lbl">Включить вальс</span>');
    btn.type = "button"; btn.setAttribute("aria-pressed", "false");
    document.body.appendChild(btn);
    var ctx = null, master = null, timer = null, playing = false, nextT = 0, step = 0;
    var BEAT = 0.42; // темп вальса
    // своя простая мелодия в 3/4: по 3 ноты на такт (0 = пауза), и аккорды гармонии
    var N = { G3: 196, A3: 220, B3: 246.9, C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784 };
    var mel = ["E5", "D5", "C5", "B4", 0, "G4", "A4", "C5", "E5", "D5", 0, 0,
               "F5", "E5", "D5", "C5", 0, "A4", "B4", "D5", "F5", "E5", 0, 0,
               "E5", "G5", "E5", "D5", "C5", "B4", "A4", "C5", "A4", "G4", 0, 0,
               "A4", "B4", "C5", "D5", "B4", "G4", "C5", 0, 0, "C5", 0, 0];
    var bass = ["C4", "G3", "A3", "E4", "F4", "G3", "D4", "G3", "C4", "E4", "A3", "C4", "F4", "G3", "C4", "C4"];
    var chord = [["E4", "G4"], ["D4", "F4"], ["C4", "E4"], ["B3", "E4"], ["A3", "C4"], ["B3", "D4"], ["A3", "F4"], ["B3", "D4"],
                 ["E4", "G4"], ["G4", "B4"], ["C4", "E4"], ["E4", "A4"], ["A3", "C4"], ["B3", "F4"], ["E4", "G4"], ["E4", "G4"]];
    var bell = function (f, t, vol, len) {
      var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f; o2.type = "triangle"; o2.frequency.value = f * 2;
      var g2 = ctx.createGain(); g2.gain.value = 0.18;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.start(t); o2.start(t); o.stop(t + len + 0.05); o2.stop(t + len + 0.05);
    };
    var schedule = function () {
      while (nextT < ctx.currentTime + 0.25) {
        var bar = Math.floor(step / 3) % 16, beat = step % 3, m = mel[step % mel.length];
        if (beat === 0) bell(N[bass[bar]] / 2, nextT, 0.16, 1.1);
        else chord[bar].forEach(function (n) { bell(N[n], nextT, 0.045, 0.5); });
        if (m) bell(N[m], nextT, 0.12, 1.4);
        (function (t, strong) { setTimeout(function () { window.__beat = { t: performance.now(), s: strong ? 1 : 0.45 }; }, Math.max(0, (t - ctx.currentTime) * 1000)); })(nextT, beat === 0);
        nextT += BEAT; step++;
      }
    };
    window.__waltzChime = function () {
      if (!ctx) return;
      var t = ctx.currentTime;
      ["E5", "G5", "C5", "E5"].forEach(function (n, i) { bell(N[n] * 2, t + i * 0.07, 0.06, 0.9); });
    };
    var ensureCtx = function () { if (!ctx) { ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination); } };
    // своя мелодия: если на сайте лежит файл MUSIC_FILE, кнопка играет его, иначе вальс из шкатулки
    var audio = null, analyser = null, fileOk = false, beatRaf = 0;
    fetch(MUSIC_FILE, { method: "HEAD", cache: "no-store" }).then(function (r) {
      if (!r.ok) return;
      fileOk = true;
      btn.querySelector(".lbl").textContent = "Включить музыку";
    }).catch(function () {});
    var listen = function () {
      var data = new Uint8Array(analyser.frequencyBinCount), avg = 0, last = 0;
      (function tick() {
        if (!playing) return;
        analyser.getByteFrequencyData(data);
        var e = 0; for (var i = 0; i < 12; i++) e += data[i];
        e /= 12; avg = avg * 0.94 + e * 0.06;
        var now = performance.now();
        if (e > avg * 1.18 && e > 60 && now - last > 260) { last = now; window.__beat = { t: now, s: Math.min(1, e / 200) }; }
        beatRaf = requestAnimationFrame(tick);
      })();
    };
    btn.addEventListener("click", function () {
      ensureCtx();
      playing = !playing;
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      btn.querySelector(".lbl").textContent = fileOk ? (playing ? "Выключить музыку" : "Включить музыку") : (playing ? "Выключить вальс" : "Включить вальс");
      btn.classList.toggle("on", playing);
      ctx.resume();
      if (fileOk) {
        if (!audio) {
          audio = new Audio(MUSIC_FILE); audio.loop = true; audio.crossOrigin = "anonymous";
          var src = ctx.createMediaElementSource(audio);
          analyser = ctx.createAnalyser(); analyser.fftSize = 512;
          src.connect(analyser); analyser.connect(ctx.destination);
        }
        if (playing) { audio.play().catch(function () {}); listen(); }
        else { audio.pause(); cancelAnimationFrame(beatRaf); window.__beat = null; }
        return;
      }
      if (playing) {
        master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(0.55, ctx.currentTime);
        nextT = ctx.currentTime + 0.1; timer = setInterval(schedule, 60); schedule();
      } else {
        clearInterval(timer); master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
        window.__beat = null;
      }
    });
  }

  /* ---------- первый экран живой: слои двигаются за мышкой и при прокрутке колёсиком ---------- */
  if (hero && !reduce) {
    var fineP = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    var Q = function (sel) { return hero.querySelector(sel); };
    // [элемент, сдвиг за мышкой x, y, сдвиг при прокрутке по y, поворот, рост, исчезание]
    var layers = [
      [Q(".title") || Q("h1"), -56, -32, 170, 0, 0.1, 1.3],
      [Q(".beat") || Q(".date"), -30, -16, 120, 0, 0, 1.6],
      [Q(".lede"), -24, -14, 90, 0, 0, 1.5],
      [Q(".soon-line"), -18, -10, 70, 0, 0, 1.5],
      [Q(".hero-photo"), 48, 34, -90, 5, 0.08, 0],
      [Q(".chand"), 30, 12, 150, 0, 0, 0],
      [Q(".musicbox"), -70, -40, 0, 0, 0, 0],
      [Q(".glints"), 80, 50, -60, 0, 0, 0]
    ].filter(function (l) { return l[0]; });
    var rays = Q(".rays");
    var tx = 0, ty = 0, cx = 0, cy = 0, sp = 0, cp = 0, live = true;
    if (fineP) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
      });
      hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; });
    }
    addEventListener("scroll", function () { sp = Math.max(0, Math.min(1, scrollY / Math.max(1, hero.offsetHeight))); }, { passive: true });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { live = es[0].isIntersecting; }).observe(hero);
    (function heroLoop() {
      if (live) {
        cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07; cp += (sp - cp) * 0.12;
        layers.forEach(function (l) {
          var e = l[0];
          e.style.translate = (cx * l[1]).toFixed(1) + "px " + (cy * l[2] + cp * l[3]).toFixed(1) + "px";
          if (l[4]) e.style.rotate = (cp * l[4] + cx * 3).toFixed(2) + "deg";
          if (l[5]) e.style.scale = (1 + cp * l[5]).toFixed(3);
          if (l[6]) e.style.opacity = Math.max(0, 1 - cp * l[6]).toFixed(3);
        });
        if (rays) rays.style.scale = (1 + cp * 0.6 + Math.abs(cx) * 0.06).toFixed(3);
      }
      requestAnimationFrame(heroLoop);
    })();
  }

  /* ---------- фото бала в заднем фоне разделов ---------- */
  var bgMap = [
    ["main > .history", "waltz-night.jpg", "dark"],
    ["main > .stars", "concert.jpg", "dark"],
    ["main > .fund", "violin.jpg", "dark"],
    ["main > .wishes", "performance.jpg", "light"],
    ["main > .partners", "waltz-hero.jpg", "dark"],
    ["main > .tickets", "king-queen.jpg", "dark"],
    ["main > .faq", "waltz-night.jpg", "dark"],
    ["main > .alumni", "vocal.jpg", "light"],
    ["main > #about", "vocal.jpg", "light"],
    ["main > #card", "performance.jpg", "dark"],
    ["main > #donate", "waltz-night.jpg", "dark"]
  ];
  var bgs = [];
  bgMap.forEach(function (m) {
    var sec = document.querySelector(m[0]);
    if (!sec) return;
    var b = el("div", "bgphoto bg-" + m[2], '<img src="img/' + m[1] + '" alt="" loading="lazy" decoding="async">');
    b.setAttribute("aria-hidden", "true");
    sec.insertBefore(b, sec.firstChild);
    sec.classList.add("has-bgphoto");
    bgs.push(b);
  });
  if (bgs.length && !reduce) {
    var bt = false;
    var moveBg = function () {
      bt = false;
      bgs.forEach(function (b) {
        var r = b.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        b.firstChild.style.translate = "0 " + (k * -70).toFixed(1) + "px";
      });
    };
    addEventListener("scroll", function () { if (!bt) { bt = true; requestAnimationFrame(moveBg); } }, { passive: true });
    moveBg();
  }
  if ("IntersectionObserver" in window) {
    var bo = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); bo.unobserve(e.target); } }); }, { rootMargin: "0px 0px -10% 0px" });
    bgs.forEach(function (b) { bo.observe(b); });
  } else bgs.forEach(function (b) { b.classList.add("in"); });

  /* ---------- история: по линии бежит золотая комета ---------- */
  var tline = document.querySelector(".timeline");
  if (tline && !reduce) { var cm = el("span", "comet"); cm.setAttribute("aria-hidden", "true"); tline.appendChild(cm); }

  /* ---------- сцена артистов: вспышки фотокамер ---------- */
  var starsSec = document.querySelector(".stars");
  if (starsSec && !reduce) {
    var starsOn = false;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { starsOn = es[0].isIntersecting; }).observe(starsSec);
    (function flash() {
      if (starsOn && !document.hidden) {
        var f = el("i", "flash");
        f.style.left = (8 + Math.random() * 84).toFixed(1) + "%";
        f.style.top = (25 + Math.random() * 60).toFixed(1) + "%";
        starsSec.appendChild(f);
        setTimeout(function () { f.remove(); }, 700);
      }
      setTimeout(flash, 500 + Math.random() * 1400);
    })();
  }

  /* ---------- партнёры: бегущая строка с именами ---------- */
  var past = document.querySelector(".past");
  if (past && past.textContent.indexOf(":") > 0) {
    var parts = past.textContent.split(":"), label = parts[0].trim();
    var names = parts.slice(1).join(":").replace(/\.\s*$/, "").split(",").map(function (n) { return n.trim(); });
    var row = names.map(function (n) { return "<span>" + n + "</span><b>✦</b>"; }).join("");
    past.innerHTML = '<span class="past-label">' + label + '</span><span class="sr-only">' + names.join(", ") + "</span>" +
      '<span class="marq" aria-hidden="true"><span class="marq-track">' + row + row + "</span></span>";
    past.classList.add("marquee");
  }

  /* ---------- билет: печать «Скоро» падает на билет ---------- */
  var tmain = document.querySelector(".t-main");
  if (tmain) {
    var stamp = el("span", "stamp", "<b>Скоро</b><i>Vienna Ball</i>");
    stamp.setAttribute("aria-hidden", "true");
    tmain.appendChild(stamp);
    if (reduce || !("IntersectionObserver" in window)) stamp.classList.add("down");
    else { var so = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { setTimeout(function () { stamp.classList.add("down"); }, 500); so.disconnect(); } }, { rootMargin: "0px 0px -25% 0px" }); so.observe(tmain); }
  }

  /* ---------- выпускникам и пожертвования: небесные фонарики-желания ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("main > .alumni, main > #donate, main > #about"), function (sec) {
    if (reduce) return;
    var box = el("div", "lanterns"); box.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 9; i++) {
      var l = el("i");
      l.style.left = (4 + Math.random() * 92).toFixed(1) + "%";
      l.style.animationDuration = (14 + Math.random() * 12).toFixed(1) + "s";
      l.style.animationDelay = (-Math.random() * 24).toFixed(1) + "s";
      l.style.setProperty("--s", (0.6 + Math.random() * 0.8).toFixed(2));
      box.appendChild(l);
    }
    sec.insertBefore(box, sec.firstChild.nextSibling);
  });

  /* ---------- программа вечера: золотая нить пробегает по пунктам ---------- */
  var dc = document.querySelector(".dance-card");
  if (dc && !reduce) { var nib = el("span", "nib"); nib.setAttribute("aria-hidden", "true"); dc.appendChild(nib); }

  /* ---------- фото коллажа и галереи: блик пробегает при появлении ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".collage figure, .track figure"), function (f) { f.classList.add("glossy"); });
})();
