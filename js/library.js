/* ==========================================================================
   SEEK — personal library
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;
  var mount = SEEK.$("#library-app");
  if (!mount) return;

  var TABS = [
    ["favorites", "library.favorites", "heart"],
    ["watchlist", "library.watchlist", "bookmark"],
    ["continue", "library.continue", "play"],
    ["recent", "library.recent", "clock"],
    ["trailers", "library.savedTrailers", "film"]
  ];
  var active = SEEK.qs("tab", "favorites");
  if (!TABS.some(function (tab) { return tab[0] === active; })) active = "favorites";

  function itemsFor(type) {
    return type === "favorites" ? SEEK.favs.items() : SEEK.watchlist.items();
  }

  function gridFor(type) {
    if (type === "continue") {
      var records = SEEK.progress.continueWatching(24);
      if (!records.length) return { empty: true, html: "" };
      return { html: '<div class="media-grid">' + records.map(SEEK.continueCard).join("") + "</div>" };
    }
    if (type === "recent") {
      var recent = SEEK.history.list(24);
      if (!recent.length) return { empty: true, html: "" };
      return { html: '<div class="media-grid">' + recent.map(function (entry) { return SEEK.cardFor(entry.type, entry.item); }).join("") + "</div>" };
    }
    if (type === "trailers") {
      var trailers = SEEK.favs.ids("trailer").map(function (id) { return SEEK.findTrailer(id); }).filter(Boolean);
      if (!trailers.length) return { empty: true, html: "" };
      return { html: '<div class="media-grid media-grid--trailers">' + trailers.map(SEEK.trailerCard).join("") + "</div>" };
    }
    var list = itemsFor(type);
    if (!list.length) return { empty: true, html: "" };
    if (type === "watchlist") {
      return { html: '<div class="saved-list">' + list.map(function (entry) {
        var item = entry.item;
        var href = entry.type === "movie" ? "movie.html?id=" + encodeURIComponent(entry.id)
          : entry.type === "show" ? "series.html?id=" + encodeURIComponent(entry.id)
          : "trailers.html?id=" + encodeURIComponent(entry.id);
        var subtitle = entry.type === "trailer" ? "Trailer · " + (item.duration || "") : [item.year, (item.genres || [])[0]].filter(Boolean).join(" · ");
        return '<div class="saved-item">' +
          '<img src="' + (entry.type === "trailer" ? SEEK.wideArt(item.item || item) : SEEK.poster(item)) + '" alt="" width="110" height="66">' +
          '<div class="saved-item__body"><h3><a href="' + href + '">' + esc(item.title) + "</a></h3><p>" + esc(subtitle) + "</p></div>" +
          '<div class="saved-item__actions">' +
            '<a class="btn btn-ghost btn-sm" href="' + href + '">Open</a>' +
            '<button type="button" class="icon-btn" data-remove-watchlist="' + esc(entry.id) + '" data-remove-type="' + esc(entry.type) + '" aria-label="' + esc(t("library.remove")) + '">' + SEEK.icon("trash") + "</button>" +
          "</div>" +
        "</div>";
      }).join("") + "</div>" };
    }
    return { html: '<div class="media-grid">' + list.map(function (entry) { return SEEK.cardFor(entry.type, entry.item); }).join("") + "</div>" };
  }

  function emptyFor(type) {
    var hints = {
      favorites: "Tap the heart on any film, series or trailer and it will appear here.",
      watchlist: "Add a title to your watchlist and it will be waiting for you here.",
      continue: "Start watching a film or episode and your progress will be saved here.",
      recent: "Titles you open will show up here so you can find them again quickly.",
      trailers: "Save a trailer with the heart button to build your own preview queue."
    };
    return SEEK.emptyState(t("library.empty"), hints[type] || t("library.emptyHint"), "movies.html", "Browse the catalogue");
  }

  function panelMarkup(type) {
    var data = gridFor(type);
    var label = TABS.find(function (tab) { return tab[0] === type; });
    return '<div class="library-toolbar"><div><h2>' + esc(t(label[1])) + "</h2>" +
      '<span data-library-count></span></div>' +
      '<a class="text-link" href="movies.html">' + esc(t("common.viewAll")) + " " + SEEK.icon("arrow-right") + "</a></div>" +
      (data.empty ? emptyFor(type) : data.html);
  }

  function renderPanel() {
    var panel = SEEK.$("[data-library-panel]", mount);
    if (!panel) return;
    panel.innerHTML = panelMarkup(active);
  }

  function render() {
    var user = SEEK.auth.currentUser();
    mount.innerHTML =
      '<div class="page-head"><div class="page-head__text"><h1>' + esc(t("library.title")) + "</h1>" +
        "<p>Your favourites, watchlist, progress and saved trailers, kept together on this device.</p></div></div>" +
      (user ? "" : '<div class="guest-note">' + SEEK.icon("info") + "<span>" + esc(t("library.guestNote")) + ' <a class="text-link" href="account.html?mode=login">' + esc(t("nav.signin")) + "</a></span></div>") +
      '<div class="tab-bar library-tabs" data-library-tabs>' +
        TABS.map(function (tab) {
          return '<button type="button" class="tab' + (tab[0] === active ? " is-active" : "") + '" data-library-tab="' + tab[0] + '">' + SEEK.icon(tab[2]) + " " + esc(t(tab[1])) + "</button>";
        }).join("") +
      "</div>" +
      '<div data-library-panel></div>';

    renderPanel();
    bind();
  }

  function bind() {
    mount.addEventListener("click", function (event) {
      var tab = event.target.closest("[data-library-tab]");
      if (tab) {
        active = tab.getAttribute("data-library-tab");
        SEEK.$$("[data-library-tab]", mount).forEach(function (node) {
          node.classList.toggle("is-active", node === tab);
        });
        renderPanel();
        try { history.replaceState(null, "", "library.html?tab=" + active); } catch (err) { /* ignore */ }
        return;
      }
      var remove = event.target.closest("[data-remove-watchlist]");
      if (remove) {
        SEEK.watchlist.remove(remove.getAttribute("data-remove-type"), remove.getAttribute("data-remove-watchlist"));
        SEEK.toast(t("common.removedWatchlist"));
        renderPanel();
      }
    });

    document.addEventListener("seek:library", function () {
      if (document.body.getAttribute("data-page") === "library") renderPanel();
    });
    document.addEventListener("seek:progress", function () {
      if (active === "continue" && document.body.getAttribute("data-page") === "library") renderPanel();
    });
  }

  SEEK.ready(render);
})();
