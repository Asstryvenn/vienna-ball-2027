// Сказочный слой для дополнительных страниц: блики в первом экране,
// золотая пыль за курсором, искры при нажатии и мягкое появление блоков.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (reduce) return;

  /* блики люстры */
  var canvas = document.getElementById("glints");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d"), dots = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var make = function (any) {
      return { x: Math.random() * w, y: any ? Math.random() * h : h + 10, r: Math.random() * 1.6 + 0.4,
        vy: -(Math.random() * 0.25 + 0.05), vx: (Math.random() - 0.5) * 0.12, t: Math.random() * 6.3, gold: Math.random() < 0.55 };
    };
    var size = function () {
      var r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = []; for (var i = 0, n = Math.round(Math.min(80, w * h / 14000)); i < n; i++) dots.push(make(true));
    };
    var frame = function () {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i]; d.t += 0.025; d.x += d.vx; d.y += d.vy;
        if (d.y < -10) dots[i] = d = make(false);
        var a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(d.t));
        ctx.beginPath(); ctx.fillStyle = d.gold ? "rgba(211,172,99," + a + ")" : "rgba(232,236,244," + a * 0.8 + ")";
        ctx.arc(d.x, d.y, d.r, 0, 6.2832); ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    size(); frame(); window.addEventListener("resize", size);
  }

  /* золотая пыль и искры */
  var dust = document.getElementById("dust");
  if (dust && dust.getContext) {
    var dc = dust.getContext("2d"), parts = [], dw = 0, dh = 0, ddpr = Math.min(window.devicePixelRatio || 1, 2), running = false;
    var dsize = function () { dw = innerWidth; dh = innerHeight; dust.width = Math.round(dw * ddpr); dust.height = Math.round(dh * ddpr); dc.setTransform(ddpr, 0, 0, ddpr, 0, 0); };
    var star = function (x, y, r) {
      dc.beginPath(); dc.moveTo(x, y - r * 2.4);
      dc.quadraticCurveTo(x, y, x + r * 2.4, y); dc.quadraticCurveTo(x, y, x, y + r * 2.4);
      dc.quadraticCurveTo(x, y, x - r * 2.4, y); dc.quadraticCurveTo(x, y, x, y - r * 2.4); dc.fill();
    };
    var loop = function () {
      dc.clearRect(0, 0, dw, dh);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i]; if (--p.life <= 0) { parts.splice(i, 1); continue; }
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.98;
        var k = p.life / p.max;
        dc.fillStyle = p.gold ? "rgba(225,190,120," + k + ")" : "rgba(245,247,252," + k + ")";
        star(p.x, p.y, p.r * (0.4 + 0.6 * k));
      }
      if (parts.length) requestAnimationFrame(loop); else running = false;
    };
    var add = function (p) { parts.push(p); if (parts.length > 260) parts.shift(); if (!running) { running = true; requestAnimationFrame(loop); } };
    var burst = function (x, y, n) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.2832, s = Math.random() * 3.2 + 1;
        add({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, g: 0.06, r: Math.random() * 1.8 + 0.8, life: 55, max: 55, gold: Math.random() < 0.7 });
      }
    };
    dsize(); window.addEventListener("resize", dsize);
    if (finePointer) {
      var last = 0;
      window.addEventListener("pointermove", function (e) {
        var now = performance.now(); if (now - last < 28) return; last = now;
        add({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 0.6, vy: Math.random() * 0.6 + 0.2, g: 0.01, r: Math.random() * 1.2 + 0.6, life: 42, max: 42, gold: Math.random() < 0.6 });
      }, { passive: true });
    }
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a, .btn")) burst(e.clientX, e.clientY, 26);
    });
  }

  /* мягкое появление блоков при прокрутке */
  var items = Array.prototype.slice.call(document.querySelectorAll(".rv"));
  if ("IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove("rv-wait"); en.target.classList.add("rv-in"); io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    items.forEach(function (el) { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("rv-wait"); io.observe(el); } });
  }
})();
