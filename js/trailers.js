/* ==========================================================================
   SEEK — trailers page
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;
  var mount = SEEK.$("#trailers-app");
  if (!mount) return;

  var category = SEEK.qs("category", "all");
  var deepLink = SEEK.qs("id", "");

  var LABELS = {
    all: "All trailers", trending: "Trending", latest: "Latest", tv: "TV shows",
    upcoming: "Upcoming"
  };

  function resolved() {
    return SEEK.getCatalog().trailers.map(function (tr) { return SEEK.findTrailer(tr.id); }).filter(Boolean);
  }

  function categories() {
    var present = {};
    resolved().forEach(function (tr) { present[tr.category] = true; });
    return ["all"].concat(Object.keys(LABELS).filter(function (key) { return key !== "all" && present[key]; }));
  }

  function filtered() {
    var list = resolved();
    if (category !== "all") list = list.filter(function (tr) { return tr.category === category; });
    return list;
  }

  function renderGrid() {
    var grid = SEEK.$("[data-trailer-grid]", mount);
    var count = SEEK.$("[data-trailer-count]", mount);
    if (!grid) return;
    var list = filtered();
    if (count) count.innerHTML = "<strong>" + list.length + "</strong> trailers";
    grid.innerHTML = list.length
      ? list.map(SEEK.trailerCard).join("")
      : SEEK.emptyState("No trailers in this category", "Try another category or browse the full list.", "trailers.html", "All trailers");
    if (SEEK.youtube && SEEK.youtube.enhanceTrailerCards) SEEK.youtube.enhanceTrailerCards(grid, list);
  }

  function render() {
    var cats = categories();
    if (cats.indexOf(category) === -1) category = "all";
    var total = resolved().length;

    mount.innerHTML =
      '<div class="container">' +
        '<div class="page-head"><div class="page-head__text">' +
          "<h1>" + esc(t("nav.trailers")) + "</h1>" +
          "<p>Official previews and teasers. Save a trailer to your library or start a full-screen queue.</p>" +
          '<div class="page-head__stats">' +
            '<span class="stat-pill"><strong>' + total + "</strong> trailers</span>" +
            '<span class="stat-pill"><strong>' + (SEEK.getCatalog().movies.length + SEEK.getCatalog().shows.length) + "</strong> titles</span>" +
          "</div>" +
        "</div></div>" +
        '<div class="library-toolbar"><div class="tab-bar" style="margin:0" data-trailer-tabs>' +
          cats.map(function (key) {
            return '<button type="button" class="tab' + (key === category ? " is-active" : "") + '" data-category="' + key + '">' + esc(LABELS[key] || key) + "</button>";
          }).join("") +
        "</div>" +
        '<button type="button" class="btn btn-primary btn-sm" data-play-all>' + SEEK.icon("play") + " Play queue</button></div>" +
        '<div class="results-count" data-trailer-count style="margin-bottom:16px"></div>' +
        '<div class="media-grid media-grid--trailers" data-trailer-grid></div>' +
      "</div>";

    renderGrid();
    bind();

    if (deepLink) {
      setTimeout(function () { SEEK.openTrailerById(deepLink); }, 260);
      deepLink = "";
    }
  }

  function bind() {
    mount.addEventListener("click", function (event) {
      var tab = event.target.closest("[data-category]");
      if (tab) {
        category = tab.getAttribute("data-category");
        SEEK.$$("[data-category]", mount).forEach(function (node) {
          node.classList.toggle("is-active", node === tab);
        });
        renderGrid();
        return;
      }
      if (event.target.closest("[data-play-all]")) {
        var list = filtered();
        if (list.length) SEEK.openTrailerList(list, 0);
      }
    });
  }

  SEEK.ready(render);
})();
