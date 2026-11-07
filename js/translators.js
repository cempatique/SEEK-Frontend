/* ==========================================================================
   SEEK — translators directory
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;
  var mount = SEEK.$("#translators-app");
  if (!mount) return;

  var state = {
    q: SEEK.qs("q", ""),
    lang: SEEK.qs("lang", "")
  };

  function translators() { return SEEK.getCatalog().translators; }

  function unique(list) {
    return list.filter(function (value, index) { return value && list.indexOf(value) === index; }).sort();
  }

  function matches(translator) {
    var q = state.q.trim().toLowerCase();
    if (q) {
      var haystack = [translator.name, translator.bio, translator.specialty, translator.kind, translator.languages.join(" ")].join(" ").toLowerCase();
      if (haystack.indexOf(q) === -1) return false;
    }
    if (state.lang && translator.languages.indexOf(state.lang) === -1) return false;
    return true;
  }

  function renderGrid() {
    var grid = SEEK.$("[data-translator-grid]", mount);
    var count = SEEK.$("[data-translator-count]", mount);
    if (!grid) return;
    var list = translators().filter(matches);
    if (count) count.innerHTML = "<strong>" + list.length + "</strong> " + esc(list.length === 1 ? "translator" : "translators");
    grid.innerHTML = list.length
      ? list.map(SEEK.translatorCard).join("")
      : SEEK.emptyState("No translators match", "Try another language or clear the filters.", "translators.html", t("common.clearFilters"));
  }

  function render() {
    var all = translators();
    var langs = unique(all.reduce(function (acc, tr) { return acc.concat(tr.languages); }, []));
    var kinds = unique(all.map(function (tr) { return tr.kind; }));

    mount.innerHTML =
      '<div class="container">' +
        '<div class="page-head"><div class="page-head__text">' +
          "<h1>" + esc(t("nav.translators")) + "</h1>" +
          "<p>Meet the translators, dubbing directors and accessibility specialists bringing cinema to Kinyarwanda, Luganda, Swahili, French and beyond.</p>" +
          '<div class="page-head__stats">' +
            '<span class="stat-pill"><strong>' + all.length + "</strong> translators</span>" +
            '<span class="stat-pill"><strong>' + langs.length + "</strong> languages</span>" +
            '<span class="stat-pill"><strong>' + kinds.length + "</strong> disciplines</span>" +
          "</div>" +
        "</div></div>" +
        '<form class="filter-bar" data-translator-form>' +
          '<div class="filter-grid">' +
            '<label class="filter-field">Search<input type="search" value="' + esc(state.q) + '" placeholder="Search names, languages, specialties…" data-filter="q"></label>' +
            '<label class="filter-field">Language<select data-filter="lang"><option value="">All languages</option>' + langs.map(function (lang) {
              return '<option value="' + esc(lang) + '"' + (lang === state.lang ? " selected" : "") + ">" + esc(lang) + "</option>";
            }).join("") + "</select></label>" +
          "</div>" +
          '<div class="filter-actions"><span class="results-count" data-translator-count></span>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-clear-translators>' + SEEK.icon("rotate-ccw") + " " + esc(t("common.clearFilters")) + "</button></div>" +
        "</form>" +
        '<div class="translator-grid" data-translator-grid></div>' +
      "</div>";

    renderGrid();
    bind();
  }

  function bind() {
    var form = SEEK.$("[data-translator-form]", mount);
    if (!form) return;
    form.addEventListener("input", SEEK.debounce(function (event) {
      var field = event.target.getAttribute("data-filter");
      if (!field) return;
      state[field] = event.target.value;
      renderGrid();
    }, 200));
    form.addEventListener("change", function (event) {
      var field = event.target.getAttribute("data-filter");
      if (!field) return;
      state[field] = event.target.value;
      renderGrid();
    });
    form.addEventListener("submit", function (event) { event.preventDefault(); });
    mount.addEventListener("click", function (event) {
      if (!event.target.closest("[data-clear-translators]")) return;
      state.q = ""; state.lang = "";
      SEEK.$$("[data-filter]", mount).forEach(function (node) {
        var key = node.getAttribute("data-filter");
        if (key) node.value = key === "q" ? "" : state[key];
      });
      renderGrid();
    });
  }

  SEEK.ready(render);
})();
