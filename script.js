// Ссылка на Google Форму для пожертвований выпускников.
// Вставьте сюда адрес формы, например "https://forms.gle/xxxxxxxx".
var DONATION_FORM_URL = "";

(function () {
  var btn = document.getElementById("donate-btn");
  var note = document.getElementById("donate-note");
  if (!btn) return;
  if (DONATION_FORM_URL) {
    btn.href = DONATION_FORM_URL;
  } else {
    btn.removeAttribute("target");
    btn.setAttribute("aria-disabled", "true");
    btn.textContent = "Форма скоро откроется";
    btn.addEventListener("click", function (e) { e.preventDefault(); });
    if (note) note.textContent = "Мы опубликуем форму для выпускников ближе к балу.";
  }
})();

// Шкала сбора: данные из fund.json (общий файл для обеих страниц).
(function () {
  var meter = document.getElementById("fund-meter");
  var fill = document.getElementById("fund-fill");
  var raisedEl = document.getElementById("fund-raised");
  var note = document.getElementById("fund-note");
  if (!meter || !fill || !raisedEl || !window.fetch) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fmt = function (n) { return Math.round(n).toLocaleString("ru-RU"); };
  fetch("fund.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || typeof data.raised !== "number" || data.raised < 0) return;
      var goal = Number(data.goal) || 4000000;
      var raised = data.raised;
      var figs = document.getElementById("fund-figs");
      if (figs) figs.hidden = false;
      meter.setAttribute("aria-valuenow", String(raised));
      if (note) note.textContent = "Обновлено " + String(data.updated || "").split("-").reverse().join(".") + ".";
      setTimeout(function () { fill.style.width = Math.min(100, raised / goal * 100).toFixed(2) + "%"; }, 200);
      if (reduce) { raisedEl.textContent = fmt(raised); return; }
      var start = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - start) / 2400);
        raisedEl.textContent = fmt(raised * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(start);
    })
    .catch(function () {});
})();
