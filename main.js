// Ссылка на регистрацию и продажу билетов (например, страница в Ticketon или Kaspi).
// Пока пусто, кнопка показывает «Скоро откроется».
var TICKET_URL = "";

(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var root = document.documentElement;

  if (!reduce) {
    root.classList.add("play");
    // страховка: даже если браузер притормозит анимацию, через 4 секунды заголовок и фото видны
    setTimeout(function () { root.classList.remove("play"); }, 4200);
  }

  function fmt(n) { return Math.round(n).toLocaleString("ru-RU"); }

  /* ---------- блики люстры на первом экране ---------- */
  var canvas = document.getElementById("glints");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var dots = [];
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    var make = function (anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        r: Math.random() * 1.6 + 0.4,
        vy: -(Math.random() * 0.25 + 0.05),
        vx: (Math.random() - 0.5) * 0.12,
        t: Math.random() * Math.PI * 2,
        gold: Math.random() < 0.55
      };
    };

    var size = function () {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(90, (w * h) / 14000));
      dots = [];
      for (var i = 0; i < count; i++) dots.push(make(true));
    };

    var frame = function () {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.t += 0.025;
        if (!reduce) { d.x += d.vx; d.y += d.vy; }
        if (d.y < -10) dots[i] = d = make(false);
        var a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(d.t));
        ctx.beginPath();
        ctx.fillStyle = d.gold ? "rgba(211,172,99," + a + ")" : "rgba(232,236,244," + a * 0.8 + ")";
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        if (d.r > 1.6) {
          ctx.fillStyle = "rgba(211,172,99," + a * 0.12 + ")";
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!reduce) requestAnimationFrame(frame);
    };

    size();
    frame();
    window.addEventListener("resize", function () { size(); if (reduce) frame(); });
  }

  /* ---------- волшебная пыль: след за курсором и искры ---------- */
  var dustCanvas = document.getElementById("dust");
  var burst = function () {};
  if (dustCanvas && dustCanvas.getContext && !reduce) {
    var dc = dustCanvas.getContext("2d");
    var parts = [];
    var dw = 0, dh = 0, ddpr = Math.min(window.devicePixelRatio || 1, 2);
    var running = false;

    var dsize = function () {
      dw = window.innerWidth; dh = window.innerHeight;
      dustCanvas.width = Math.round(dw * ddpr);
      dustCanvas.height = Math.round(dh * ddpr);
      dc.setTransform(ddpr, 0, 0, ddpr, 0, 0);
    };

    var star = function (x, y, r) {
      // четырёхлучевая искра
      dc.beginPath();
      dc.moveTo(x, y - r * 2.4);
      dc.quadraticCurveTo(x, y, x + r * 2.4, y);
      dc.quadraticCurveTo(x, y, x, y + r * 2.4);
      dc.quadraticCurveTo(x, y, x - r * 2.4, y);
      dc.quadraticCurveTo(x, y, x, y - r * 2.4);
      dc.fill();
    };

    var loop = function () {
      dc.clearRect(0, 0, dw, dh);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.life -= 1;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.98;
        var k = p.life / p.max;
        dc.fillStyle = p.gold ? "rgba(225,190,120," + k + ")" : "rgba(245,247,252," + k + ")";
        star(p.x, p.y, p.r * (0.4 + 0.6 * k));
      }
      if (parts.length) requestAnimationFrame(loop); else running = false;
    };

    var add = function (p) {
      parts.push(p);
      if (parts.length > 260) parts.shift();
      if (!running) { running = true; requestAnimationFrame(loop); }
    };

    burst = function (x, y, n) {
      for (var i = 0; i < n; i++) {
        var ang = Math.random() * Math.PI * 2, sp = Math.random() * 3.2 + 1;
        add({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, g: 0.06, r: Math.random() * 1.8 + 0.8, life: 55, max: 55, gold: Math.random() < 0.7 });
      }
    };

    dsize();
    window.addEventListener("resize", dsize);

    if (finePointer) {
      var last = 0;
      window.addEventListener("pointermove", function (e) {
        var now = performance.now();
        if (now - last < 28) return;
        last = now;
        add({ x: e.clientX + (Math.random() - 0.5) * 6, y: e.clientY + (Math.random() - 0.5) * 6, vx: (Math.random() - 0.5) * 0.6, vy: Math.random() * 0.6 + 0.2, g: 0.01, r: Math.random() * 1.2 + 0.6, life: 42, max: 42, gold: Math.random() < 0.6 });
      }, { passive: true });
    }

    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest(".btn, .textlink, .bar a");
      if (b) burst(e.clientX, e.clientY, 26);
    });
  }

  /* ---------- луч прожектора за курсором ---------- */
  var hero = document.querySelector(".hero");
  if (hero && finePointer && !reduce) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", (e.clientX - r.left) + "px");
      hero.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  }

  /* ---------- появление при прокрутке ---------- */
  var vh = window.innerHeight;
  var reveal = Array.prototype.slice.call(document.querySelectorAll(".rv, .tl, .flourish"));
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove("rv-wait");
        en.target.classList.add("rv-in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    reveal.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh) {
        el.classList.add("rv-wait");
        io.observe(el);
      }
    });
  }

  /* ---------- линия истории рисуется при прокрутке, точки вспыхивают ---------- */
  var line = document.getElementById("timeline");
  var items = line ? line.querySelectorAll(".tl") : [];
  var onScroll = function () {
    if (!line) return;
    var r = line.getBoundingClientRect();
    var mark = window.innerHeight * 0.62;
    var p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
    line.style.setProperty("--p", reduce ? 1 : p.toFixed(4));
    for (var i = 0; i < items.length; i++) {
      var ir = items[i].getBoundingClientRect();
      var on = reduce || ir.top < mark;
      if (on && !items[i].classList.contains("on") && !reduce) {
        var dot = ir.left + (window.innerWidth > 900 ? ir.width / 2 : 6);
        burst(dot, ir.top + 22, 14);
      }
      items[i].classList.toggle("on", on);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- счётчик денег прошлых балов ---------- */
  var countUp = function (el, to, dur) {
    var start = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - start) / dur);
      el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    })(start);
  };

  var whenVisible = function (el, fn) {
    if (!("IntersectionObserver" in window)) { fn(); return; }
    var o = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      o.disconnect();
      fn();
    }, { threshold: 0.5 });
    o.observe(el);
  };

  var total = document.getElementById("total");
  if (total && !reduce && total.getBoundingClientRect().top > vh) {
    var to = Number(total.getAttribute("data-to")) || 0;
    total.textContent = fmt(0);
    whenVisible(total, function () { countUp(total, to, 2200); });
  }

  /* ---------- сбор 2027: данные из fund.json ---------- */
  var meter = document.getElementById("fund-meter");
  var fill = document.getElementById("fund-fill");
  var raisedEl = document.getElementById("fund-raised");
  var note = document.getElementById("fund-note");
  if (meter && fill && raisedEl) {
    fetch("fund.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        var goal = Number(data.goal) || 4000000;
        var raised = typeof data.raised === "number" && data.raised >= 0 ? data.raised : null;
        if (raised === null) return; // сбор ещё не открыт: остаётся подпись «откроется вместе с продажей билетов»
        var pct = Math.min(100, (raised / goal) * 100);
        var figs = document.getElementById("fund-figs");
        if (figs) figs.hidden = false;
        meter.setAttribute("aria-valuenow", String(raised));
        if (note) note.textContent = "Обновлено " + String(data.updated || "").split("-").reverse().join(".") + ". Спасибо каждому, кто уже поддержал бал.";
        var show = function () {
          fill.style.width = pct.toFixed(2) + "%";
          if (reduce) raisedEl.textContent = fmt(raised); else countUp(raisedEl, raised, 2400);
          if (!reduce) {
            var mr = meter.getBoundingClientRect();
            setTimeout(function () { burst(mr.left + mr.width * pct / 100, mr.top + mr.height / 2, 30); }, 2300);
          }
        };
        whenVisible(meter, show);
      })
      .catch(function () { /* без данных остаётся подпись по умолчанию */ });
  }

  /* ---------- лента фотографий ---------- */
  var track = document.querySelector(".track");
  if (track && !reduce) {
    Array.prototype.slice.call(track.children).forEach(function (fig) {
      var copy = fig.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      track.appendChild(copy);
    });
    track.classList.add("moving");
  }

  /* ---------- билет наклоняется за курсором ---------- */
  var ticket = document.getElementById("ticket");
  if (ticket && finePointer && !reduce) {
    ticket.addEventListener("pointermove", function (e) {
      var r = ticket.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      ticket.style.setProperty("--ry", ((x - 0.5) * 10).toFixed(2) + "deg");
      ticket.style.setProperty("--rx", ((0.5 - y) * 8).toFixed(2) + "deg");
      ticket.style.setProperty("--sx", (x * 100).toFixed(1) + "%");
    });
    ticket.addEventListener("pointerleave", function () {
      ticket.style.setProperty("--rx", "0deg");
      ticket.style.setProperty("--ry", "0deg");
      ticket.style.setProperty("--sx", "50%");
    });
  }

  /* ---------- кнопка регистрации ---------- */
  var tbtn = document.getElementById("ticket-btn");
  var tnote = document.getElementById("ticket-note");
  if (tbtn) {
    if (TICKET_URL && TICKET_URL.indexOf("https://") === 0) {
      tbtn.href = TICKET_URL;
    } else {
      tbtn.removeAttribute("target");
      tbtn.setAttribute("aria-disabled", "true");
      tbtn.textContent = "Скоро откроется";
      tbtn.addEventListener("click", function (e) { e.preventDefault(); });
      if (tnote) tnote.textContent = "Регистрация и продажа откроются ближе к балу.";
    }
  }
})();
