/* ==========================================================================
   SEEK — search results page
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;
  var mount = SEEK.$("#search-app");
  if (!mount) return;

  var query = SEEK.qs("q", "");
  var TYPES = [
    ["movie", "search.movies"], ["show", "search.tv"], ["episode", "search.episodes"],
    ["trailer", "search.trailers"], ["translator", "search.translators"]
  ];

  function historyMarkup() {
    var history = SEEK.searchHistory();
    var suggestions = ["Sci-Fi", "Kinyarwanda", "Thriller", "Rocky KIMOMO", "Drama", "Romance"];
    return '<div class="search-panel">' +
      (history.length
        ? '<div class="search-history"><div class="search-history__head"><p class="eyebrow">' + esc(t("search.history")) + '</p><button type="button" class="text-link text-link--muted" data-clear-history>' + esc(t("search.clearHistory")) + "</button></div><div class=\"chips\">" +
          history.map(function (q) { return '<button type="button" class="chip" data-search-chip="' + esc(q) + '">' + esc(q) + "</button>"; }).join("") + "</div></div>"
        : '<p class="search-hint">Start typing to search the whole catalogue — titles, episodes, trailers and translators.</p>') +
      '<div class="search-suggest"><p class="eyebrow">Try a starting point</p><div class="chips">' +
        suggestions.map(function (q) { return '<button type="button" class="chip" data-search-chip="' + esc(q) + '">' + esc(q) + "</button>"; }).join("") +
      "</div></div></div>";
  }

  function resultsMarkup(rawQuery) {
    var results = SEEK.searchAll(rawQuery);
    if (!results.length) {
      return '<div class="search-empty">' + SEEK.icon("search") + "<h3>" + esc(t("common.noResults")) + "</h3><p>" + esc(t("common.noResultsHint")) + "</p>" +
        '<button type="button" class="btn btn-ghost btn-sm" data-clear-query>' + esc(t("common.clear")) + "</button></div>";
    }
    var groups = SEEK.groupResults(results);
    var html = '<p class="results-count" style="margin:0 0 18px"><strong>' + results.length + "</strong> " + esc(t("common.results")) + " for “" + esc(rawQuery) + "”</p>";
    TYPES.forEach(function (pair) {
      var list = groups[pair[0]];
      if (!list) return;
      html += '<section class="search-block"><div class="search-block__head"><h2>' + esc(t(pair[1])) + "</h2><span>" + list.length + " " + esc(list.length === 1 ? "result" : "results") + "</span></div>" +
        list.map(SEEK.searchResult).join("") + "</section>";
    });
    return html;
  }

  function render() {
    mount.innerHTML =
      '<div class="page-head"><div class="page-head__text"><h1>' + esc(t("search.title")) + "</h1>" +
        "<p>" + esc(t("search.placeholder")) + "</p></div></div>" +
      '<form class="search-page-form" data-search-page-form role="search">' + SEEK.icon("search") +
        '<label class="sr-only" for="search-page-input">' + esc(t("nav.search")) + "</label>" +
        '<input id="search-page-input" type="search" value="' + esc(query) + '" placeholder="' + esc(t("common.searchPlaceholder")) + '" autocomplete="off" spellcheck="false" data-search-page-input>' +
        '<button class="btn btn-primary" type="submit">' + esc(t("common.search")) + "</button>" +
      "</form>" +
      '<div data-search-page-body></div>';

    renderBody();
    bind();
  }

  function renderBody() {
    var body = SEEK.$("[data-search-page-body]", mount);
    if (!body) return;
    body.innerHTML = query.trim().length >= 2 ? resultsMarkup(query.trim()) : historyMarkup();
  }

  function updateUrl() {
    try {
      history.replaceState(null, "", query.trim() ? "search.html?q=" + encodeURIComponent(query.trim()) : "search.html");
    } catch (err) { /* ignore */ }
  }

  function bind() {
    var form = SEEK.$("[data-search-page-form]", mount);
    var input = SEEK.$("[data-search-page-input]", mount);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      query = input.value.trim();
      if (query.length >= 2) SEEK.recordSearch(query);
      updateUrl();
      renderBody();
    });
    SEEK.debounceInput(input, function () {
      query = input.value;
      renderBody();
    }, 220);

    mount.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-search-chip]");
      if (chip) {
        input.value = chip.getAttribute("data-search-chip");
        query = input.value;
        SEEK.recordSearch(query);
        updateUrl();
        renderBody();
        return;
      }
      if (event.target.closest("[data-clear-history]")) {
        SEEK.clearSearchHistory();
        renderBody();
        SEEK.toast("Search history cleared");
        return;
      }
      if (event.target.closest("[data-clear-query]")) {
        input.value = "";
        query = "";
        updateUrl();
        renderBody();
        input.focus();
      }
    });
  }

  SEEK.ready(render);
})();
