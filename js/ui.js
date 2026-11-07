/* ==========================================================================
   SEEK — shell (header, footer, drawer), search, modals and interactions
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;
  var modalStack = [];
  var booted = false;

  /* ------------------------------ Toast ----------------------------------- */
  function toast(message, tone) {
    var region = SEEK.$("#seek-toasts");
    if (!region) {
      region = document.createElement("div");
      region.id = "seek-toasts";
      region.className = "toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    var node = document.createElement("div");
    node.className = "toast" + (tone ? " toast--" + tone : "");
    node.innerHTML = '<span class="toast__dot"></span><span>' + esc(message) + "</span>";
    region.appendChild(node);
    requestAnimationFrame(function () { node.classList.add("is-open"); });
    setTimeout(function () {
      node.classList.remove("is-open");
      setTimeout(function () { node.remove(); }, 280);
    }, 3600);
  }

  /* ------------------------------ Modals ---------------------------------- */
  function openModal(html, options) {
    options = options || {};
    var root = SEEK.$("#seek-overlays");
    if (!root) {
      root = document.createElement("div");
      root.id = "seek-overlays";
      document.body.appendChild(root);
    }
    var wrap = document.createElement("div");
    wrap.className = "modal-overlay" + (options.className ? " " + options.className : "");
    wrap.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(options.label || "Dialog") + '">' +
      (options.dismissible === false ? "" : '<button class="modal__close icon-btn" type="button" data-close-modal aria-label="' + esc(t("common.close")) + '">' + SEEK.icon("close") + "</button>") +
      '<div class="modal__body">' + html + "</div></div>";
    root.appendChild(wrap);
    modalStack.push(wrap);
    document.body.classList.add("modal-open");
    requestAnimationFrame(function () { wrap.classList.add("is-open"); });
    var focusTarget = wrap.querySelector("[autofocus], input, select, textarea, button, a[href]");
    if (focusTarget) setTimeout(function () { focusTarget.focus(); }, 70);
    wrap.addEventListener("click", function (event) {
      if (event.target === wrap && options.dismissible !== false) closeModal(wrap);
    });
    wrap.addEventListener("keydown", trapFocus);
    return wrap;
  }

  function trapFocus(event) {
    if (event.key !== "Tab") return;
    var wrap = event.currentTarget;
    var nodes = SEEK.$$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', wrap)
      .filter(function (node) { return node.offsetParent !== null; });
    if (!nodes.length) return;
    var first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function closeModal(el) {
    var target = el || modalStack[modalStack.length - 1];
    if (!target || target.classList.contains("is-closing")) return;
    target.classList.add("is-closing");
    target.classList.remove("is-open");
    setTimeout(function () {
      target.remove();
      modalStack = modalStack.filter(function (node) { return node !== target; });
      if (!modalStack.length) document.body.classList.remove("modal-open");
    }, 220);
    document.dispatchEvent(new CustomEvent("seek:modalclose", { detail: { modal: target } }));
  }

  function confirmDialog(options) {
    options = options || {};
    return new Promise(function (resolve) {
      var wrap = openModal(
        '<h3 class="modal__title">' + esc(options.title || "Are you sure?") + "</h3>" +
        '<p class="modal__text">' + esc(options.message || "") + "</p>" +
        '<div class="modal__actions"><button class="btn btn-ghost" type="button" data-confirm-no>' + esc(options.cancelLabel || t("common.cancel")) + "</button>" +
        '<button class="btn ' + (options.danger ? "btn-danger" : "btn-primary") + '" type="button" data-confirm-yes>' + esc(options.confirmLabel || t("common.save")) + "</button></div>",
        { label: options.title || "Confirm" }
      );
      wrap.addEventListener("click", function (event) {
        if (event.target.closest("[data-confirm-yes]")) { closeModal(wrap); resolve(true); }
        if (event.target.closest("[data-confirm-no]")) { closeModal(wrap); resolve(false); }
      });
    });
  }

  /* ------------------------------ Brand ----------------------------------- */
  function logoMarkup(extraClass) {
    return '<span class="brand-mark' + (extraClass ? " " + extraClass : "") + '" aria-hidden="true">' +
      '<svg viewBox="0 0 48 48" fill="none" focusable="false">' +
        '<circle cx="24" cy="24" r="19.5" stroke="currentColor" stroke-width="2" opacity=".5"/>' +
        '<circle cx="24" cy="24" r="13" stroke="currentColor" stroke-width="1.4" opacity=".22"/>' +
        '<path d="M19.8 15.8 34 24 19.8 32.2Z" fill="currentColor"/>' +
        '<circle cx="39" cy="11" r="3.2" class="brand-mark__dot"/>' +
      "</svg></span>";
  }

  function brandMarkup() {
    return '<a class="brand" href="index.html" aria-label="SEEK home">' + logoMarkup() +
      '<span class="brand-word">SEEK</span><span class="brand-dot" aria-hidden="true"></span></a>';
  }

  function langSelect(className) {
    var langs = [["en", "English"], ["rw", "Ikinyarwanda"], ["lg", "Luganda"], ["fr", "Français"], ["sw", "Kiswahili"]];
    return '<label class="lang-select-wrap"><span class="sr-only">' + esc(t("footer.language")) + "</span>" +
      '<span class="lang-select-icon">' + SEEK.icon("globe") + "</span>" +
      '<select class="' + (className || "lang-select") + '" data-lang-select aria-label="' + esc(t("footer.language")) + '">' +
      langs.map(function (pair) {
        return '<option value="' + pair[0] + '"' + (SEEK.prefs.lang === pair[0] ? " selected" : "") + ">" + esc(pair[1]) + "</option>";
      }).join("") + "</select></label>";
  }

  /* ------------------------------ Header ---------------------------------- */
  var NAV = [
    ["home", "index.html", "Home"],
    ["movies", "movies.html", "Movies"],
    ["tv", "tv.html", "TV Shows"],
    ["trailers", "trailers.html", "Trailers"]
  ];

  var PAGE_NAV = { home: "home", movies: "movies", movie: "movies", tv: "tv", series: "tv", trailers: "trailers", translators: "translators", translator: "translators" };

  function authSlot() {
    var user = SEEK.auth.currentUser();
    if (!user) {
      return '<a class="btn btn-ghost btn-sm auth-signin" href="account.html?mode=login">' + esc(t("nav.signin")) + "</a>" +
        '<a class="btn btn-primary btn-sm auth-join" href="account.html?mode=register">' + esc(t("nav.join")) + "</a>";
    }
    return '<div class="dropdown profile-menu" data-dropdown>' +
      '<button class="profile-btn" type="button" data-dropdown-toggle aria-haspopup="true" aria-expanded="false">' +
        '<img class="avatar-img" src="' + SEEK.avatar(user) + '" alt="" width="34" height="34">' +
        '<span class="profile-name">' + esc(user.name.split(" ")[0]) + "</span>" +
        SEEK.icon("chevron-down") +
      "</button>" +
      '<div class="dropdown__menu profile-dropdown">' +
        '<div class="profile-dropdown__head"><img class="avatar-img" src="' + SEEK.avatar(user) + '" alt="" width="42" height="42"><span><strong>' + esc(user.name) + "</strong><small>" + esc(user.email) + "</small></span></div>" +
        '<a href="account.html">' + SEEK.icon("user") + " " + esc(t("nav.profile")) + "</a>" +
        '<a href="library.html">' + SEEK.icon("bookmark") + " " + esc(t("nav.library")) + "</a>" +
        '<a href="account.html#preferences">' + SEEK.icon("settings") + " " + esc(t("nav.settings")) + "</a>" +
        (user.isAdmin ? '<a href="admin.html">' + SEEK.icon("shield") + " " + esc(t("nav.admin")) + "</a>" : "") +
        '<button type="button" data-logout>' + SEEK.icon("logout") + " " + esc(t("nav.logout")) + "</button>" +
      "</div>" +
    "</div>";
  }

  function categoriesMenu() {
    var genres = SEEK.getGenres().slice(0, 12);
    return '<div class="mega-menu">' +
      '<div class="mega-menu__main"><p class="eyebrow">Browse by genre</p><div class="mega-grid">' +
        genres.map(function (genre) {
          return '<a href="movies.html?genre=' + encodeURIComponent(genre) + '">' + esc(genre) + "</a>";
        }).join("") +
      "</div></div>" +
      '<div class="mega-menu__side">' +
        '<a href="translators.html"><span class="mega-icon">' + SEEK.icon("mic") + "</span><span><strong>" + esc(t("nav.translators")) + "</strong><small>Translated cinema</small></span></a>" +
        '<a href="index.html#moods"><span class="mega-icon">' + SEEK.icon("sparkles") + "</span><span><strong>Mood discovery</strong><small>Start with a feeling</small></span></a>" +
      "</div>" +
    "</div>";
  }

  function headerMarkup() {
    var active = PAGE_NAV[document.body.getAttribute("data-page")] || "";
    var favCount = SEEK.favs.count();
    var navLinks = NAV.map(function (item) {
      return '<a class="nav-link' + (active === item[0] ? " is-active" : "") + '" data-nav="' + item[0] + '" href="' + item[1] + '">' + esc(t("nav." + item[0])) + "</a>";
    }).join("");
    var drawerLinks = NAV.concat([["translators", "translators.html", "Translators"], ["library", "library.html", "Library"]]).map(function (item) {
      return '<a class="drawer-link' + (active === item[0] ? " is-active" : "") + '" href="' + item[1] + '">' + esc(t("nav." + (item[0] === "library" ? "library" : item[0]))) + "</a>";
    }).join("");
    var drawerGenres = SEEK.getGenres().slice(0, 10).map(function (genre) {
      return '<a class="chip" href="movies.html?genre=' + encodeURIComponent(genre) + '">' + esc(genre) + "</a>";
    }).join("");

    return '<div class="site-header__bar"><div class="container header-inner">' +
      '<button type="button" class="icon-btn nav-toggle" data-toggle-drawer aria-label="' + esc(t("nav.menu")) + '" aria-expanded="false" aria-controls="seek-drawer">' + SEEK.icon("menu") + "</button>" +
      brandMarkup() +
      '<nav class="main-nav" aria-label="Primary">' + navLinks +
        '<div class="dropdown nav-dropdown" data-dropdown>' +
          '<button type="button" class="nav-link nav-link--button" data-dropdown-toggle aria-haspopup="true" aria-expanded="false">' + esc(t("nav.categories")) + SEEK.icon("chevron-down") + "</button>" +
          categoriesMenu() +
        "</div>" +
      "</nav>" +
      '<div class="header-actions">' +
        '<button type="button" class="search-trigger" data-open-search aria-label="' + esc(t("nav.search")) + '">' + SEEK.icon("search") + '<span>' + esc(t("nav.search")) + "</span><kbd>/</kbd></button>" +
        '<a class="icon-btn fav-link" href="library.html" aria-label="' + esc(t("nav.library")) + '">' + SEEK.icon("heart") + '<span class="fav-count"' + (favCount ? "" : " hidden") + ">" + favCount + "</span></a>" +
        langSelect("lang-select lang-select--header") +
        authSlot() +
      "</div>" +
    "</div></div>" +
    '<div class="drawer-scrim" data-close-drawer></div>' +
    '<aside class="drawer" id="seek-drawer" aria-hidden="true" aria-label="' + esc(t("nav.menu")) + '">' +
      '<div class="drawer__head">' + brandMarkup() + '<button type="button" class="icon-btn" data-close-drawer aria-label="' + esc(t("common.close")) + '">' + SEEK.icon("close") + "</button></div>" +
      '<nav class="drawer__nav" aria-label="Mobile primary">' + drawerLinks + "</nav>" +
      '<div class="drawer__section"><p class="eyebrow">' + esc(t("nav.categories")) + '</p><div class="chips">' + drawerGenres + "</div></div>" +
      '<div class="drawer__section">' + (SEEK.auth.currentUser()
        ? '<a class="btn btn-primary btn-block" href="account.html">' + SEEK.icon("user") + " " + esc(t("nav.profile")) + "</a>"
        : '<a class="btn btn-primary btn-block" href="account.html?mode=register">' + esc(t("nav.join")) + '</a><a class="btn btn-ghost btn-block" href="account.html?mode=login">' + esc(t("nav.signin")) + "</a>") +
      "</div>" +
      '<div class="drawer__foot">' + langSelect() + '<label class="switch"><input type="checkbox" data-lowdata' + (SEEK.prefs.lowData ? " checked" : "") + '><span class="switch__track"></span><span>' + esc(t("footer.lowData")) + "</span></label></div>" +
    "</aside>" +
    '<nav class="bottom-nav" aria-label="Quick navigation">' +
      [["index.html", "home", "Home", "home"], ["movies.html", "movies", "Movies", "film"], ["tv.html", "tv", "TV", "tv"], ["library.html", "library", "Library", "bookmark"]].map(function (item) {
        return '<a href="' + item[0] + '" class="bottom-nav__item' + (active === item[1] ? " is-active" : "") + '">' + SEEK.icon(item[3]) + "<span>" + esc(t("nav." + item[1])) + "</span></a>";
      }).join("") +
    "</nav>";
  }

  /* ------------------------------ Footer ---------------------------------- */
  function footerMarkup() {
    var year = new Date().getFullYear();
    return '<div class="container footer-grid">' +
      '<div class="footer-brand">' + brandMarkup() +
        '<p class="footer-tagline">' + esc(t("footer.tagline")) + "</p>" +
        '<p class="footer-blurb">A cinematic discovery platform for films, series and trailers — with a home for translated entertainment.</p>' +
        '<div class="footer-socials">' +
          '<a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">YouTube</a>' +
          '<a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X">X</a>' +
          '<a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>' +
          '<a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">TikTok</a>' +
        "</div>" +
      "</div>" +
      '<div class="footer-col"><h3>' + esc(t("footer.explore")) + "</h3><ul>" +
        '<li><a href="index.html">' + esc(t("nav.home")) + "</a></li>" +
        '<li><a href="movies.html">' + esc(t("nav.movies")) + "</a></li>" +
        '<li><a href="tv.html">' + esc(t("nav.tv")) + "</a></li>" +
        '<li><a href="trailers.html">' + esc(t("nav.trailers")) + "</a></li>" +
        '<li><a href="translators.html">' + esc(t("nav.translators")) + "</a></li>" +
      "</ul></div>" +
      '<div class="footer-col"><h3>' + esc(t("footer.company")) + "</h3><ul>" +
        '<li><a href="info.html#about">' + esc(t("footer.about")) + "</a></li>" +
        '<li><a href="info.html#contact">' + esc(t("footer.contact")) + "</a></li>" +
        '<li><a href="info.html#help">' + esc(t("footer.help")) + "</a></li>" +
        '<li><a href="library.html">' + esc(t("nav.library")) + "</a></li>" +
        '<li><a href="info.html#accessibility">Accessibility</a></li>' +
      "</ul></div>" +
      '<div class="footer-col"><h3>' + esc(t("footer.legal")) + "</h3><ul>" +
        '<li><a href="info.html#privacy">' + esc(t("footer.privacy")) + "</a></li>" +
        '<li><a href="info.html#terms">' + esc(t("footer.terms")) + "</a></li>" +
        '<li><a href="info.html#dmca">' + esc(t("footer.dmca")) + "</a></li>" +
        '<li><a href="account.html">' + esc(t("nav.profile")) + "</a></li>" +
        '<li><a href="admin.html">' + esc(t("nav.admin")) + "</a></li>" +
      "</ul></div>" +
      '<div class="footer-news"><h3>' + esc(t("footer.newsletter")) + "</h3><p>" + esc(t("footer.newsletterHint")) + "</p>" +
        '<form class="newsletter" data-newsletter><label class="sr-only" for="newsletter-email">Email</label><input id="newsletter-email" type="email" name="email" placeholder="you@example.com" required><button class="btn btn-primary" type="submit">' + esc(t("footer.subscribe")) + "</button></form>" +
        '<p class="footer-news__note">No spam. Unsubscribe anytime.</p>' +
      "</div>" +
    "</div>" +
    '<div class="container footer-bottom">' +
      '<p>&copy; ' + year + " SEEK. " + esc(t("footer.rights")) + " " + esc(t("footer.made")) + "</p>" +
      '<div class="footer-controls">' + langSelect() +
        '<label class="switch switch--sm"><input type="checkbox" data-lowdata' + (SEEK.prefs.lowData ? " checked" : "") + '><span class="switch__track"></span><span>' + esc(t("footer.lowData")) + "</span></label>" +
        '<button type="button" class="text-link" data-scroll-top>' + esc(t("footer.backToTop")) + SEEK.icon("arrow-up") + "</button>" +
      "</div>" +
    "</div>" +
    '<div class="container footer-legal"><p>Content removal and copyright: <a href="info.html#dmca">open a takedown request</a> or email <a href="mailto:rights@seek.example">rights@seek.example</a>. SEEK does not host unlicensed media. Catalogue titles and trailer artwork belong to their respective rights holders; this demo only embeds publicly available trailers.</p></div>';
  }

  /* ------------------------------ Shell ----------------------------------- */
  function renderHeader() {
    var mount = SEEK.$("#seek-header");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "seek-header";
      document.body.insertBefore(mount, document.body.firstChild);
    }
    mount.innerHTML = headerMarkup();
    syncLibraryUI();
  }

  function renderFooter() {
    var mount = SEEK.$("#seek-footer");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "seek-footer";
      document.body.appendChild(mount);
    }
    mount.innerHTML = footerMarkup();
  }

  function renderShell() {
    if (!SEEK.$("#seek-overlays")) {
      var overlays = document.createElement("div");
      overlays.id = "seek-overlays";
      document.body.appendChild(overlays);
    }
    renderHeader();
    renderFooter();
  }

  /* ------------------------------ Search ---------------------------------- */
  var SEARCH_KEY = "seek.searches.v1";

  function searchHistory() { return SEEK.read(SEARCH_KEY, []); }

  function recordSearch(query) {
    query = String(query || "").trim();
    if (query.length < 2) return;
    var list = searchHistory().filter(function (q) { return q.toLowerCase() !== query.toLowerCase(); });
    list.unshift(query);
    SEEK.write(SEARCH_KEY, list.slice(0, 8));
  }

  function clearSearchHistory() { SEEK.remove(SEARCH_KEY); }

  function typeLabel(type) {
    return t({ movie: "search.movies", show: "search.tv", episode: "search.episodes", trailer: "search.trailers", translator: "search.translators" }[type] || "common.search");
  }

  function searchAll(rawQuery) {
    var q = String(rawQuery || "").trim().toLowerCase();
    if (q.length < 2) return [];
    var results = [];

    function scoreText(text, strong, weak) {
      text = String(text || "").toLowerCase();
      if (!text) return 0;
      if (text === q) return strong + 30;
      if (text.indexOf(q) === 0) return strong + 15;
      if (text.indexOf(q) !== -1) return strong;
      return weak || 0;
    }

    getCatalog().movies.forEach(function (m) {
      var tr = m.translatorId ? SEEK.translatorName(m.translatorId) : "";
      var score = scoreText(m.title, 100, 0);
      score = Math.max(score, scoreText(m.genres.join(" "), 46, 0));
      score = Math.max(score, scoreText(m.cast.join(" "), 34, 0));
      score = Math.max(score, scoreText(m.director, 30, 0));
      score = Math.max(score, scoreText(tr, 34, 0));
      if (!score && String(m.synopsis).toLowerCase().indexOf(q) !== -1) score = 12;
      if (score) results.push({ type: "movie", id: m.id, title: m.title, subtitle: [m.year, m.genres[0], tr].filter(Boolean).join(" · "), image: SEEK.wideArt(m), href: "movie.html?id=" + encodeURIComponent(m.id), typeLabel: typeLabel("movie"), score: score, item: m });
    });

    getCatalog().shows.forEach(function (s) {
      var tr = s.translatorId ? SEEK.translatorName(s.translatorId) : "";
      var score = scoreText(s.title, 100, 0);
      score = Math.max(score, scoreText(s.genres.join(" "), 46, 0));
      score = Math.max(score, scoreText(s.cast.join(" "), 32, 0));
      score = Math.max(score, scoreText(tr, 34, 0));
      s.seasons.forEach(function (season) {
        season.episodes.forEach(function (ep) {
          var epScore = scoreText(ep.title, 54, 0);
          if (epScore) results.push({ type: "episode", id: s.id + ":" + ep.id, title: ep.title, subtitle: s.title + " · S" + SEEK.pad(season.number) + "E" + SEEK.pad(ep.number), image: SEEK.wideArt(s, "S" + SEEK.pad(season.number) + "E" + SEEK.pad(ep.number)), href: "series.html?id=" + encodeURIComponent(s.id) + "&season=" + season.number + "#episode-" + encodeURIComponent(ep.id), typeLabel: typeLabel("episode"), score: epScore - 4, showId: s.id });
        });
      });
      if (score) results.push({ type: "show", id: s.id, title: s.title, subtitle: [s.year, s.seasons.length + " seasons", tr].filter(Boolean).join(" · "), image: SEEK.wideArt(s), href: "series.html?id=" + encodeURIComponent(s.id), typeLabel: typeLabel("show"), score: score, item: s });
    });

    getCatalog().translators.forEach(function (tr) {
      var score = scoreText(tr.name, 100, 0);
      score = Math.max(score, scoreText(tr.languages.join(" "), 48, 0), scoreText(tr.specialty, 26, 0));
      if (score) results.push({ type: "translator", id: tr.id, title: tr.name, subtitle: tr.languages.join(" · "), image: SEEK.avatar(tr), href: "translator.html?id=" + encodeURIComponent(tr.id), typeLabel: typeLabel("translator"), score: score, item: tr });
    });

    getCatalog().trailers.forEach(function (tr) {
      var resolved = SEEK.findTrailer(tr.id);
      if (!resolved) return;
      var score = scoreText(resolved.title, 90, 0);
      score = Math.max(score, scoreText(tr.category, 20, 0));
      if (score) results.push({ type: "trailer", id: tr.id, title: resolved.title, subtitle: "Trailer · " + (tr.duration || ""), image: SEEK.wideArt(resolved.item), href: "trailers.html?id=" + encodeURIComponent(tr.id), typeLabel: typeLabel("trailer"), score: score - 8, trailerId: tr.id });
    });

    return results.sort(function (a, b) { return b.score - a.score || a.title.localeCompare(b.title); });
  }

  function getCatalog() { return SEEK.getCatalog(); }

  function groupResults(results) {
    var groups = {};
    results.forEach(function (r) { (groups[r.type] = groups[r.type] || []).push(r); });
    return groups;
  }

  function historyMarkup() {
    var history = searchHistory();
    var suggestions = ["Sci-Fi", "Kinyarwanda", "Thriller", "Rocky KIMOMO", "Drama", "Romance"];
    return '<div class="search-panel">' +
      (history.length
        ? '<div class="search-history"><div class="search-history__head"><p class="eyebrow">' + esc(t("search.history")) + '</p><button type="button" class="text-link text-link--muted" data-clear-history>' + esc(t("search.clearHistory")) + "</button></div><div class=\"chips\">" +
          history.map(function (q) { return '<button type="button" class="chip" data-search-chip="' + esc(q) + '">' + esc(q) + "</button>"; }).join("") + "</div></div>"
        : '<p class="search-hint">Start typing to search the whole catalogue. Tip: press <kbd>/</kbd> anywhere.</p>') +
      '<div class="search-suggest"><p class="eyebrow">Try a starting point</p><div class="chips">' +
        suggestions.map(function (q) { return '<button type="button" class="chip" data-search-chip="' + esc(q) + '">' + esc(q) + "</button>"; }).join("") +
      "</div></div></div>";
  }

  function resultsMarkup(query) {
    var results = searchAll(query);
    if (!results.length) {
      return '<div class="search-empty">' + SEEK.icon("search") + "<h3>" + esc(t("common.noResults")) + "</h3><p>" + esc(t("common.noResultsHint")) + "</p>" +
        '<button type="button" class="btn btn-ghost btn-sm" data-clear-query>' + esc(t("common.clear")) + "</button></div>";
    }
    var groups = groupResults(results);
    var order = ["movie", "show", "episode", "trailer", "translator"];
    var total = results.length;
    var html = "";
    order.forEach(function (type) {
      var list = groups[type];
      if (!list) return;
      html += '<div class="search-group"><p class="eyebrow">' + esc(typeLabel(type)) + " <span>" + list.length + "</span></p>" +
        list.slice(0, 4).map(SEEK.searchResult).join("") + "</div>";
    });
    html += '<a class="search-all" href="search.html?q=' + encodeURIComponent(query) + '" data-search-all>View all ' + total + " " + esc(t("common.results")) + " for “" + esc(query) + "” " + SEEK.icon("arrow-right") + "</a>";
    return html;
  }

  function openSearch(initial) {
    var wrap = openModal(
      '<div class="search-modal">' +
        '<form class="search-box" data-search-form role="search">' + SEEK.icon("search") +
          '<label class="sr-only" for="seek-search-input">' + esc(t("nav.search")) + "</label>" +
          '<input id="seek-search-input" type="search" autocomplete="off" spellcheck="false" placeholder="' + esc(t("common.searchPlaceholder")) + '" value="' + esc(initial || "") + '" data-search-input>' +
          '<kbd>Esc</kbd>' +
        "</form>" +
        '<div class="search-body" data-search-body></div>' +
      "</div>",
      { label: t("search.title"), className: "modal-overlay--search" }
    );
    var input = wrap.querySelector("[data-search-input]");
    var body = wrap.querySelector("[data-search-body]");
    var timer;

    function render() {
      var q = input.value.trim();
      body.innerHTML = q.length >= 2 ? resultsMarkup(q) : historyMarkup();
    }

    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(render, 120);
    });

    wrap.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-search-chip]");
      if (chip) { input.value = chip.getAttribute("data-search-chip"); render(); input.focus(); return; }
      if (event.target.closest("[data-clear-history]")) {
        clearSearchHistory();
        render();
        toast("Search history cleared");
        return;
      }
      if (event.target.closest("[data-clear-query]")) {
        input.value = "";
        render();
        input.focus();
        return;
      }
      var result = event.target.closest("[data-search-result]");
      if (result) { recordSearch(input.value); closeModal(wrap); }
    });

    wrap.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      if (q.length < 2) return;
      recordSearch(q);
      location.href = "search.html?q=" + encodeURIComponent(q);
    });

    render();
    setTimeout(function () { input.focus(); }, 90);
    return wrap;
  }

  /* ------------------------------ UI sync --------------------------------- */
  function syncLibraryUI() {
    var favCount = SEEK.favs.count();
    SEEK.$$(".fav-count").forEach(function (node) {
      node.textContent = favCount;
      node.hidden = favCount === 0;
    });
    SEEK.$$("[data-fav-type]").forEach(function (btn) {
      var active = SEEK.favs.has(btn.getAttribute("data-fav-type"), btn.getAttribute("data-fav-id"));
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
      var label = active ? t("common.favorited") : t("common.favorite");
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
      var textSpan = btn.querySelector("[data-fav-text]");
      if (textSpan) textSpan.textContent = label;
    });
    SEEK.$$("[data-watchlist-type]").forEach(function (btn) {
      var active = SEEK.watchlist.has(btn.getAttribute("data-watchlist-type"), btn.getAttribute("data-watchlist-id"));
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
      var span = btn.querySelector("span");
      if (span) span.textContent = active ? t("common.inWatchlist") : t("common.watchlist");
    });
  }

  function setDrawer(open) {
    document.body.classList.toggle("drawer-open", open);
    var drawer = SEEK.$("#seek-drawer");
    var toggle = SEEK.$("[data-toggle-drawer]");
    if (drawer) drawer.setAttribute("aria-hidden", String(!open));
    if (toggle) toggle.setAttribute("aria-expanded", String(open));
  }

  function closeDropdowns(except) {
    SEEK.$$(".dropdown.is-open").forEach(function (node) {
      if (node !== except) {
        node.classList.remove("is-open");
        var trigger = node.querySelector("[data-dropdown-toggle]");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------ Events ---------------------------------- */
  function bindEvents() {
    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-open-search]")) {
        event.preventDefault();
        openSearch();
        return;
      }
      if (event.target.closest("[data-toggle-drawer]")) {
        setDrawer(!document.body.classList.contains("drawer-open"));
        return;
      }
      if (event.target.closest("[data-close-drawer]")) { setDrawer(false); return; }
      if (event.target.closest("[data-close-modal]")) {
        closeModal(event.target.closest(".modal-overlay"));
        return;
      }

      var dropdownTrigger = event.target.closest("[data-dropdown-toggle]");
      if (dropdownTrigger) {
        event.preventDefault();
        var dropdown = dropdownTrigger.closest("[data-dropdown]");
        var open = !dropdown.classList.contains("is-open");
        closeDropdowns(dropdown);
        dropdown.classList.toggle("is-open", open);
        dropdownTrigger.setAttribute("aria-expanded", String(open));
        return;
      }
      if (!event.target.closest("[data-dropdown]")) closeDropdowns(null);

      if (event.target.closest("[data-logout]")) {
        event.preventDefault();
        SEEK.auth.logout();
        toast("Signed out");
        renderHeader();
        if (/account\.html|admin\.html|library\.html/.test(location.pathname)) {
          setTimeout(function () { location.href = "index.html"; }, 350);
        }
        return;
      }

      var scrollBtn = event.target.closest("[data-scroll]");
      if (scrollBtn) {
        var shelf = scrollBtn.closest(".shelf");
        var track = shelf && shelf.querySelector("[data-shelf-track]");
        if (track) track.scrollBy({ left: Number(scrollBtn.getAttribute("data-scroll")) * Math.max(320, track.clientWidth * 0.8), behavior: "smooth" });
        return;
      }

      var fav = event.target.closest("[data-fav-type]");
      if (fav) {
        event.preventDefault();
        event.stopPropagation();
        var type = fav.getAttribute("data-fav-type");
        var id = fav.getAttribute("data-fav-id");
        var added = SEEK.favs.toggle(type, id);
        toast(added ? t("common.addedFav") : t("common.removedFav"), added ? "success" : "");
        syncLibraryUI();
        return;
      }

      var watch = event.target.closest("[data-watchlist-type]");
      if (watch) {
        event.preventDefault();
        var wt = watch.getAttribute("data-watchlist-type");
        var wid = watch.getAttribute("data-watchlist-id");
        var wAdded = SEEK.watchlist.toggle(wt, wid);
        toast(wAdded ? t("common.addedWatchlist") : t("common.removedWatchlist"), wAdded ? "success" : "");
        syncLibraryUI();
        return;
      }

      var trailer = event.target.closest("[data-trailer-type]");
      if (trailer) {
        event.preventDefault();
        if (SEEK.openTrailer) SEEK.openTrailer(trailer.getAttribute("data-trailer-type"), trailer.getAttribute("data-trailer-id"));
        return;
      }
      var trailerPlay = event.target.closest("[data-trailer-play]");
      if (trailerPlay) {
        event.preventDefault();
        if (SEEK.openTrailerById) SEEK.openTrailerById(trailerPlay.getAttribute("data-trailer-play"));
        return;
      }

      var resume = event.target.closest("[data-resume-key]");
      if (resume) {
        event.preventDefault();
        if (SEEK.resumeEntry) SEEK.resumeEntry(resume.getAttribute("data-resume-key"));
        return;
      }

      var episodePlay = event.target.closest("[data-play-show]");
      if (episodePlay) {
        event.preventDefault();
        if (SEEK.playEpisode) SEEK.playEpisode(episodePlay.getAttribute("data-play-show"), episodePlay.getAttribute("data-play-episode"));
        return;
      }

      var moviePlay = event.target.closest("[data-play-movie]");
      if (moviePlay) {
        event.preventDefault();
        if (SEEK.playMovie) SEEK.playMovie(moviePlay.getAttribute("data-play-movie"), Number(moviePlay.getAttribute("data-play-part") || 0));
        return;
      }

      var shareBtn = event.target.closest("[data-share-type]");
      if (shareBtn) {
        event.preventDefault();
        var shareItem = SEEK.get(shareBtn.getAttribute("data-share-type"), shareBtn.getAttribute("data-share-id"));
        if (shareItem) SEEK.share({ title: shareItem.title, url: location.href });
        return;
      }

      var downloadBtn = event.target.closest("[data-download-type]");
      if (downloadBtn) {
        event.preventDefault();
        SEEK.openDownload(downloadBtn.getAttribute("data-download-type"), downloadBtn.getAttribute("data-download-id"));
        return;
      }

      var reportBtn = event.target.closest("[data-report-type]");
      if (reportBtn) {
        event.preventDefault();
        SEEK.openReport(reportBtn.getAttribute("data-report-type"), reportBtn.getAttribute("data-report-id"));
        return;
      }

      if (event.target.closest("[data-party]")) {
        event.preventDefault();
        SEEK.openParty();
        return;
      }

      var copyBtn = event.target.closest("[data-copy-text]");
      if (copyBtn) {
        event.preventDefault();
        SEEK.copyText(copyBtn.getAttribute("data-copy-text")).then(function () { toast(t("common.shareCopied"), "success"); });
        return;
      }

      if (event.target.closest("[data-scroll-top]")) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (event.target.closest("#seek-drawer a")) setDrawer(false);
    });

    document.addEventListener("change", function (event) {
      if (event.target.matches("[data-lang-select]")) {
        SEEK.setPref("lang", event.target.value);
      }
      if (event.target.matches("[data-lowdata]")) {
        SEEK.setPref("lowData", event.target.checked);
        toast(event.target.checked ? "Low-data mode enabled" : "Low-data mode disabled", "success");
        setTimeout(function () { location.reload(); }, 500);
      }
    });

    document.addEventListener("submit", function (event) {
      if (event.target.matches("[data-newsletter]")) {
        event.preventDefault();
        var email = String(new FormData(event.target).get("email") || "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast("Enter a valid email address.", "error"); return; }
        var list = SEEK.read("seek.newsletter.v1", []);
        if (list.indexOf(email) === -1) list.push(email);
        SEEK.write("seek.newsletter.v1", list);
        event.target.reset();
        toast("Subscribed — welcome to the SEEK brief.", "success");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeDropdowns(null);
        if (document.body.classList.contains("drawer-open")) setDrawer(false);
        if (modalStack.length) closeModal();
        return;
      }
      var tag = (event.target.tagName || "").toLowerCase();
      var typing = tag === "input" || tag === "textarea" || tag === "select" || event.target.isContentEditable;
      if (typing) return;
      if (event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        openSearch();
      }
    });

    document.addEventListener("seek:auth", function () {
      renderHeader();
    });

    document.addEventListener("seek:library", function () {
      syncLibraryUI();
    });

    var lastScroll = 0;
    window.addEventListener("scroll", function () {
      var header = SEEK.$("#seek-header");
      if (!header) return;
      var y = window.scrollY || 0;
      header.classList.toggle("is-scrolled", y > 12);
      lastScroll = y;
    }, { passive: true });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980 && document.body.classList.contains("drawer-open")) setDrawer(false);
    });
  }

  /* ------------------------------ Boot ------------------------------------ */
  function boot() {
    if (booted) return;
    SEEK.auth.ensureSeedUsers();
    SEEK.applyTheme();
    renderShell();
    SEEK.applyI18n();
    bindEvents();
    var partyCode = SEEK.qs("party", "");
    if (partyCode) {
      var user = SEEK.auth.currentUser();
      var room = SEEK.party.join(partyCode, user ? user.name : "Guest");
      if (room) toast("Joined watch party " + room.code + " (demo room)", "success");
    }
    var yearNodes = SEEK.$$("[data-year]");
    yearNodes.forEach(function (node) { node.textContent = new Date().getFullYear(); });
    booted = true;
    SEEK.markBooted();
  }

  Object.assign(SEEK, {
    toast: toast, openModal: openModal, closeModal: closeModal, confirmDialog: confirmDialog,
    renderShell: renderShell, renderHeader: renderHeader, renderFooter: renderFooter,
    syncLibraryUI: syncLibraryUI, openSearch: openSearch, searchAll: searchAll,
    groupResults: groupResults, searchHistory: searchHistory, recordSearch: recordSearch,
    clearSearchHistory: clearSearchHistory, boot: boot, modalStack: function () { return modalStack.slice(); }
  });
})();

