// Волшебный слой для всех страниц:
// 2) живые фоны секций: светлые получают дамаск и плывущие блики, тёмные мягкое боке;
// 3) 3D-наклон карточек с бликом под курсором;
// 4) заголовки раскрываются в 3D, как страница сказки.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* ---------- 2. живые фоны ---------- */
  function lum(rgb) {
    var m = rgb.match(/[\d.]+/g); if (!m || (m.length > 3 && +m[3] === 0)) return null;
    return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
  }
  var sections = document.querySelectorAll("main > section, footer");
  Array.prototype.forEach.call(sections, function (s) {
    if (s.classList.contains("hero") || s.classList.contains("policy-head")) return;
    var l = lum(getComputedStyle(s).backgroundColor);
    var light = l === null || l > 0.6;
    s.classList.add("has-aura", light ? "aura-light" : "aura-dark");
    var a = document.createElement("div");
    a.className = "aura";
    a.setAttribute("aria-hidden", "true");
    a.innerHTML = "<i></i><i></i><i></i>" + (light ? "<b></b>" : "<em></em>");
    s.insertBefore(a, s.firstChild);
  });

  /* ---------- 4. заголовки раскрываются в 3D ---------- */
  var heads = Array.prototype.slice.call(document.querySelectorAll("main h2"));
  if (!reduce && "IntersectionObserver" in window) {
    var hio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.remove("unfold-wait"); e.target.classList.add("unfold-in"); hio.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    heads.forEach(function (h) { if (h.getBoundingClientRect().top > innerHeight * 0.9) { h.classList.add("unfold-wait"); hio.observe(h); } });
  }

  /* ---------- 3. 3D-наклон карточек ---------- */
  if (fine && !reduce) {
    var cards = document.querySelectorAll(".artist, .collage figure, .hero-photo, .card-wrap, .pledge, .tl-card");
    Array.prototype.forEach.call(cards, function (c) {
      if (c.closest(".ticket")) return;
      var big = c.offsetWidth > 520, max = big ? 3.5 : 9;
      c.classList.add("tilt3d");
      var g = document.createElement("span"); g.className = "glare"; g.setAttribute("aria-hidden", "true");
      if (c.tagName !== "IMG") c.appendChild(g);
      var raf = 0;
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          c.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * max).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * max).toFixed(2) + "deg) translateZ(" + (big ? 0 : 14) + "px)";
          c.style.setProperty("--gx", (x * 100).toFixed(1) + "%"); c.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
          c.classList.add("tilting");
        });
      });
      c.addEventListener("pointerleave", function () { cancelAnimationFrame(raf); c.style.transform = ""; c.classList.remove("tilting"); });
    });
  }


  /* ---------- 5. фото-открытки: нажал на фото, оно вылетает открыткой и переворачивается ---------- */
  var pc = document.createElement("div");
  pc.className = "pc-veil"; pc.hidden = true;
  pc.setAttribute("role", "dialog"); pc.setAttribute("aria-modal", "true"); pc.setAttribute("aria-label", "Открытка");
  pc.innerHTML =
    '<div class="pc-card" tabindex="0" aria-label="Перевернуть открытку">' +
      '<div class="pc-face pc-front"><img alt=""><span class="pc-hint">Нажмите, чтобы перевернуть</span></div>' +
      '<div class="pc-face pc-back">' +
        '<div class="pc-text"><p class="pc-greet">Привет с бала!</p><p class="pc-cap"></p><p class="pc-sign">Студсовет НИШ ЕМН Астана-Нура</p></div>' +
        '<div class="pc-side"><span class="pc-stamp"><b>Vienna Ball</b><i>Астана</i></span><span class="pc-mark" aria-hidden="true">Венский бал</span>' +
        '<span class="pc-line"></span><span class="pc-line"></span><span class="pc-line"></span></div>' +
      '</div>' +
    '</div>' +
    '<button class="pc-close" type="button" aria-label="Закрыть открытку">×</button>';
  document.body.appendChild(pc);
  var card = pc.querySelector(".pc-card"), pimg = pc.querySelector(".pc-front img"), pcap = pc.querySelector(".pc-cap");
  var lastFocus = null;

  function openCard(img) {
    var fig = img.closest("figure, .artist");
    var cap = fig && fig.querySelector("figcaption, .a-name");
    var when = fig && fig.querySelector(".a-when");
    pimg.src = img.currentSrc || img.src; pimg.alt = img.alt || "";
    pcap.textContent = (cap ? cap.textContent.trim() : "Венский бал") + (when ? ". " + when.textContent.trim() : "");
    card.classList.remove("flipped");
    var r = img.getBoundingClientRect();
    pc.hidden = false; lastFocus = document.activeElement;
    // открытка вылетает из того места, где было фото
    var cr = card.getBoundingClientRect();
    var dx = r.left + r.width / 2 - (cr.left + cr.width / 2), dy = r.top + r.height / 2 - (cr.top + cr.height / 2), k = r.width / cr.width;
    card.style.transition = "none";
    card.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + k + ") rotate(-6deg)";
    pc.offsetWidth;
    requestAnimationFrame(function () {
      pc.classList.add("open");
      card.style.transition = "";
      card.style.transform = "";
      card.focus({ preventScroll: true });
    });
    document.documentElement.classList.add("pc-lock");
  }
  function closeCard() {
    pc.classList.remove("open");
    document.documentElement.classList.remove("pc-lock");
    setTimeout(function () { if (!pc.classList.contains("open")) pc.hidden = true; }, reduce ? 0 : 450);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener("click", function (e) {
    var img = e.target.closest && e.target.closest(".gallery figure img, .collage figure img, .hero-photo img, .artist img");
    if (img && !pc.contains(img)) { e.preventDefault(); openCard(img); }
  });
  card.addEventListener("click", function () { card.classList.toggle("flipped"); });
  card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.classList.toggle("flipped"); } });
  pc.addEventListener("click", function (e) { if (e.target === pc || e.target.classList.contains("pc-close")) closeCard(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !pc.hidden) closeCard(); });
  Array.prototype.forEach.call(document.querySelectorAll(".gallery figure img, .collage figure img, .hero-photo img, .artist img"), function (i) { i.classList.add("pc-able"); });


  /* ================= ещё волшебство ================= */
  function seen(sel, cls, margin) {
    var els = document.querySelectorAll(sel);
    if (!els.length) return;
    if (reduce || !("IntersectionObserver" in window)) { Array.prototype.forEach.call(els, function (e) { e.classList.add(cls); }); return; }
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add(cls); o.unobserve(e.target); } });
    }, { rootMargin: margin || "0px 0px -12% 0px" });
    Array.prototype.forEach.call(els, function (e) { o.observe(e); });
  }

  /* 6. зимний снег по всему сайту (бал зимой) */
  if (!reduce) {
    var sn = document.createElement("canvas");
    sn.className = "snow"; sn.setAttribute("aria-hidden", "true");
    document.body.appendChild(sn);
    var sc = sn.getContext("2d"), flakes = [], sw = 0, sh = 0, sd = Math.min(devicePixelRatio || 1, 2);
    var mkFlake = function (any) {
      return { x: Math.random() * sw, y: any ? Math.random() * sh : -10, r: Math.random() * 2.2 + 0.6, s: Math.random() * 0.5 + 0.25, w: Math.random() * 6.28, ws: Math.random() * 0.02 + 0.005, o: Math.random() * 0.5 + 0.3 };
    };
    var snSize = function () {
      sw = innerWidth; sh = innerHeight; sn.width = sw * sd; sn.height = sh * sd; sc.setTransform(sd, 0, 0, sd, 0, 0);
      flakes = []; for (var i = 0, n = Math.round(Math.min(90, sw / 16)); i < n; i++) flakes.push(mkFlake(true));
    };
    snSize(); addEventListener("resize", snSize);
    var lastY = scrollY, wind = 0;
    (function snowLoop() {
      if (!document.hidden) {
        var dy = scrollY - lastY; lastY = scrollY; wind += (dy * 0.04 - wind) * 0.1;
        sc.clearRect(0, 0, sw, sh);
        var bt = window.__beat, pulse = bt ? Math.exp(-(performance.now() - bt.t) / 170) * bt.s : 0;
        for (var i = 0; i < flakes.length; i++) {
          var f = flakes[i]; f.w += f.ws; f.y += f.s - wind * f.r * 0.3; f.x += Math.sin(f.w) * 0.4;
          if (f.y > sh + 10) flakes[i] = mkFlake(false);
          if (f.y < -20) f.y = sh + 5;
          sc.beginPath(); sc.fillStyle = "rgba(255,255,255," + Math.min(1, f.o + pulse * 0.4) + ")"; sc.arc(f.x, f.y - pulse * f.r * 2, f.r * (1 + pulse * 0.9), 0, 6.2832); sc.fill();
        }
      }
      requestAnimationFrame(snowLoop);
    })();
  }

  /* 7. золотая нить прокрутки со звездой */
  var thread = document.createElement("div");
  thread.className = "thread"; thread.setAttribute("aria-hidden", "true"); thread.innerHTML = "<i></i>";
  document.body.appendChild(thread);
  var setThread = function () {
    var max = document.documentElement.scrollHeight - innerHeight;
    thread.style.setProperty("--p", max > 0 ? (scrollY / max).toFixed(4) : 0);
  };
  addEventListener("scroll", setThread, { passive: true }); setThread();

  /* 8. буквы заголовков вальсируют по одной */
  heads.forEach(function (h) {
    if (h.querySelector("*") || h.classList.contains("shine")) return;
    var text = h.textContent; h.setAttribute("aria-label", text);
    var html = "", n = 0;
    text.split(" ").forEach(function (word, wi) {
      html += (wi ? " " : "") + '<span class="w" aria-hidden="true">';
      for (var k = 0; k < word.length; k++) html += '<span class="ch" style="--i:' + (n++) + '">' + word[k] + "</span>";
      html += "</span>";
    });
    h.innerHTML = html; h.classList.add("waltz");
    h.classList.remove("unfold-wait");
  });
  seen("h2.waltz", "danced", "0px 0px -6% 0px");

  /* 9. разделители-вензеля между секциями рисуются при появлении */
  Array.prototype.forEach.call(document.querySelectorAll("main > section.has-aura"), function (s, i) {
    if (i === 0) return;
    var d = document.createElement("div"); d.className = "divider"; d.setAttribute("aria-hidden", "true");
    d.innerHTML = '<svg viewBox="0 0 240 24"><path d="M4 12 H96 M144 12 H236"/><path d="M120 2 L130 12 L120 22 L110 12 Z"/><path d="M96 12 C 104 4, 110 4, 110 12 M144 12 C 136 4, 130 4, 130 12"/></svg>';
    s.insertBefore(d, s.firstChild.nextSibling);
  });
  seen(".divider", "drawn");

  /* 10. артисты поднимаются на сцену по очереди, программа и партнёры появляются каскадом */
  seen(".stage", "lit", "0px 0px -15% 0px");
  seen(".dance-card", "dealt");
  seen(".slots", "dealt");
  seen(".collage", "dealt");

  /* 11. галерея изгибается дугой, как зал */
  var track = document.querySelector(".track"), strip = document.querySelector(".strip");
  if (track && strip && !reduce) {
    var figs = track.children, galVisible = false;
    new IntersectionObserver(function (es) { galVisible = es[0].isIntersecting; }).observe(strip);
    (function arc() {
      if (galVisible && innerWidth > 700) {
        var cx = innerWidth / 2;
        for (var i = 0; i < figs.length; i++) {
          var r = figs[i].getBoundingClientRect();
          if (r.right < -200 || r.left > innerWidth + 200) continue;
          var d = (r.left + r.width / 2 - cx) / cx;
          d = Math.max(-1.4, Math.min(1.4, d));
          figs[i].style.transform = "perspective(1100px) rotateY(" + (-d * 22).toFixed(2) + "deg) translateZ(" + (-Math.abs(d) * 90).toFixed(1) + "px)";
          figs[i].style.filter = "brightness(" + (1 - Math.abs(d) * 0.28).toFixed(3) + ")";
        }
      }
      requestAnimationFrame(arc);
    })();
  }

  /* 12. параллакс фото внутри рамок */
  if (!reduce) {
    var par = Array.prototype.slice.call(document.querySelectorAll(".hero-photo .frame img"));
    var parTick = false;
    var doPar = function () {
      parTick = false;
      par.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var k = ((r.top + r.height / 2) / innerHeight - 0.5);
        im.style.setProperty("--py", (k * -40).toFixed(1) + "px");
      });
    };
    par.forEach(function (im) { im.classList.add("par"); });
    addEventListener("scroll", function () { if (!parTick) { parTick = true; requestAnimationFrame(doPar); } }, { passive: true });
    doPar();
  }

  /* 13. кнопки-магниты и золотое кольцо за курсором */
  if (fine && !reduce) {
    Array.prototype.forEach.call(document.querySelectorAll(".btn"), function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px " + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px";
      });
      b.addEventListener("pointerleave", function () { b.style.translate = ""; });
    });
    var ring = document.createElement("div"); ring.className = "ring"; ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);
    var rx = -100, ry = -100, tx2 = -100, ty2 = -100;
    addEventListener("pointermove", function (e) {
      tx2 = e.clientX; ty2 = e.clientY;
      var t = e.target.closest && e.target.closest("a, button, .btn, .pc-able, .artist, [tabindex]");
      ring.classList.toggle("big", !!t);
    }, { passive: true });
    document.addEventListener("pointerleave", function () { tx2 = ty2 = -100; });
    (function follow() {
      rx += (tx2 - rx) * 0.18; ry += (ty2 - ry) * 0.18;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
      requestAnimationFrame(follow);
    })();
  }

  /* 14. в сборе поднимаются золотые сердечки */
  Array.prototype.forEach.call(document.querySelectorAll(".fund, .donate"), function (f) {
    var box = document.createElement("div"); box.className = "hearts"; box.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 14; i++) {
      var h = document.createElement("i"); h.textContent = "♥";
      h.style.left = (Math.random() * 100).toFixed(1) + "%";
      h.style.animationDelay = (-Math.random() * 14).toFixed(2) + "s";
      h.style.animationDuration = (10 + Math.random() * 8).toFixed(2) + "s";
      h.style.fontSize = (10 + Math.random() * 16).toFixed(0) + "px";
      box.appendChild(h);
    }
    f.insertBefore(box, f.firstChild);
  });

})();
