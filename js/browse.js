/* ==========================================================================
   SEEK — browse controller (movies.html and tv.html)
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;

  var isTv = document.body.getAttribute("data-page") === "tv";
  var mount = SEEK.$("#browse-app");
  if (!mount) return;

  var state = {
    q: SEEK.qs("q", ""),
    genre: SEEK.qs("genre", ""),
    year: SEEK.qs("year", ""),
    lang: SEEK.qs("lang", ""),
    translator: SEEK.qs("translator", ""),
    rating: SEEK.qs("rating", ""),
    mood: SEEK.qs("mood", ""),
    sort: SEEK.qs("sort", isTv ? "popular" : "popular")
  };

  function allItems() {
    return isTv ? SEEK.getCatalog().shows : SEEK.getCatalog().movies;
  }

  function typeOf() { return isTv ? "show" : "movie"; }

  function unique(list) {
    return list.filter(function (value, index) { return value && list.indexOf(value) === index; }).sort();
  }

  function translatorLanguage(item) {
    if (!item.translatorId) return "";
    return SEEK.translatorLabel(item);
  }

  function matches(item) {
    var q = state.q.trim().toLowerCase();
    if (q) {
      var haystack = [
        item.title, item.synopsis, item.director, item.creator, item.language,
        (item.genres || []).join(" "), (item.cast || []).join(" "),
        item.translatorId ? SEEK.translatorName(item.translatorId) : ""
      ].join(" ").toLowerCase();
      if (haystack.indexOf(q) === -1) return false;
    }
    if (state.genre && (item.genres || []).indexOf(state.genre) === -1) return false;
    if (state.year && String(item.year) !== state.year) return false;
    if (state.lang) {
      var languages = [item.language, translatorLanguage(item)];
      if (languages.indexOf(state.lang) === -1) return false;
    }
    if (state.translator && item.translatorId !== state.translator) return false;
    if (state.rating && Number(item.rating) < Number(state.rating)) return false;
    if (state.mood && (item.moods || []).indexOf(state.mood) === -1) return false;
    return true;
  }

  function sorter(a, b) {
    switch (state.sort) {
      case "rating": return (b.rating || 0) - (a.rating || 0);
      case "newest": return String(b.addedAt || "").localeCompare(String(a.addedAt || ""));
      case "year": return (b.year || 0) - (a.year || 0);
      case "title": return String(a.title).localeCompare(String(b.title));
      default: return (b.popularity || 0) - (a.popularity || 0);
    }
  }

  function option(value, label, selected) {
    return '<option value="' + esc(value) + '"' + (String(value) === String(selected) ? " selected" : "") + ">" + esc(label) + "</option>";
  }

  function moodOptions() {
    var moods = SEEK.DATA.moods || [];
    return '<option value="">All moods</option>' + moods.map(function (mood) {
      return option(mood.id, mood.label, state.mood);
    }).join("");
  }

  function buildShell() {
    var items = allItems();
    var genres = SEEK.getGenres();
    var years = unique(items.map(function (item) { return item.year; })).sort(function (a, b) { return b - a; });
    var langs = unique(items.map(function (item) { return item.language; }).concat(items.map(translatorLanguage)));
    var translators = SEEK.getCatalog().translators.filter(function (tr) {
      return items.some(function (item) { return item.translatorId === tr.id; });
    });

    mount.innerHTML =
      '<div class="container">' +
        '<div class="page-head">' +
          '<div class="page-head__text">' +
            "<h1>" + esc(isTv ? t("nav.tv") : t("nav.movies")) + "</h1>" +
            "<p>" + esc(isTv
              ? "Discover series, seasons and episodes from across the catalogue. Filter by genre, language, translator and rating."
              : "Browse the film catalogue by genre, year, language, translator, mood and rating. Every title opens a full detail page.") + "</p>" +
            '<div class="page-head__stats">' +
              '<span class="stat-pill"><strong>' + items.length + "</strong> " + esc(isTv ? "series" : "films") + "</span>" +
              '<span class="stat-pill"><strong>' + genres.length + "</strong> genres</span>" +
              '<span class="stat-pill"><strong>' + translators.length + "</strong> translators</span>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<form class="filter-bar" data-browse-form>' +
          '<div class="filter-grid">' +
            '<label class="filter-field">Search<input type="search" name="q" value="' + esc(state.q) + '" placeholder="' + esc(t("common.searchPlaceholder")) + '" data-filter="q"></label>' +
            '<label class="filter-field">Genre<select data-filter="genre"><option value="">All genres</option>' + genres.map(function (g) { return option(g, g, state.genre); }).join("") + "</select></label>" +
            '<label class="filter-field">Mood<select data-filter="mood">' + moodOptions() + "</select></label>" +
            '<label class="filter-field">Year<select data-filter="year"><option value="">Any year</option>' + years.map(function (y) { return option(y, y, state.year); }).join("") + "</select></label>" +
            '<label class="filter-field">Language<select data-filter="lang"><option value="">Any language</option>' + langs.map(function (l) { return option(l, l, state.lang); }).join("") + "</select></label>" +
            '<label class="filter-field">Translator<select data-filter="translator"><option value="">Any translator</option>' + translators.map(function (tr) { return option(tr.id, tr.name, state.translator); }).join("") + "</select></label>" +
            '<label class="filter-field">Min rating<select data-filter="rating"><option value="">Any rating</option>' + [9, 8.5, 8, 7.5, 7].map(function (r) { return option(r, r + "+", state.rating); }).join("") + "</select></label>" +
            '<label class="filter-field">Sort by<select data-filter="sort">' +
              option("popular", t("common.popular"), state.sort) +
              option("rating", t("common.topRated"), state.sort) +
              option("newest", t("common.newest"), state.sort) +
              option("year", t("common.latest"), state.sort) +
              option("title", t("common.alphabetical"), state.sort) +
            "</select></label>" +
          "</div>" +
          '<div class="filter-actions">' +
            '<span class="results-count" data-results-count></span>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-clear-filters>' + SEEK.icon("rotate-ccw") + " " + esc(t("common.clearFilters")) + "</button>" +
          "</div>" +
        "</form>" +
        '<div class="media-grid" data-browse-grid></div>' +
      "</div>";

    bind();
    renderGrid();
  }

  function renderGrid() {
    var grid = SEEK.$("[data-browse-grid]", mount);
    var count = SEEK.$("[data-results-count]", mount);
    if (!grid) return;
    var list = allItems().filter(matches).sort(sorter);
    if (count) count.innerHTML = "<strong>" + list.length + "</strong> " + esc(list.length === 1 ? "title" : "titles") + " found";
    if (!list.length) {
      grid.innerHTML = SEEK.emptyState("No titles match these filters", "Clear a filter or try a broader search.", isTv ? "tv.html" : "movies.html", t("common.clearFilters"));
      return;
    }
    grid.innerHTML = list.map(function (item) { return SEEK.cardFor(typeOf(), item); }).join("");
  }

  function updateUrl() {
    var params = new URLSearchParams();
    Object.keys(state).forEach(function (key) {
      if (state[key] && !(key === "sort" && state[key] === "popular")) params.set(key, state[key]);
    });
    var query = params.toString();
    var url = location.pathname + (query ? "?" + query : "");
    try { history.replaceState(null, "", url); } catch (err) { /* ignore */ }
  }

  function syncSelects() {
    SEEK.$$("[data-filter]", mount).forEach(function (node) {
      var key = node.getAttribute("data-filter");
      if (key && key !== "q") node.value = state[key];
    });
  }

  function bind() {
    var form = SEEK.$("[data-browse-form]", mount);
    if (!form) return;
    form.addEventListener("input", SEEK.debounce(function (event) {
      var field = event.target.getAttribute("data-filter");
      if (!field) return;
      state[field] = event.target.value;
      renderGrid();
      updateUrl();
    }, 220));

    form.addEventListener("change", function (event) {
      var field = event.target.getAttribute("data-filter");
      if (!field) return;
      state[field] = event.target.value;
      renderGrid();
      updateUrl();
    });

    form.addEventListener("submit", function (event) { event.preventDefault(); });

    mount.addEventListener("click", function (event) {
      if (!event.target.closest("[data-clear-filters]")) return;
      state.q = ""; state.genre = ""; state.year = ""; state.lang = "";
      state.translator = ""; state.rating = ""; state.mood = ""; state.sort = "popular";
      var search = SEEK.$('[data-filter="q"]', mount);
      if (search) search.value = "";
      syncSelects();
      renderGrid();
      updateUrl();
    });
  }

  SEEK.ready(buildShell);
})();
