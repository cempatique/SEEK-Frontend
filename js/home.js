/* ==========================================================================
   SEEK — home page controller
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;

  function byPopularity(a, b) { return (b.popularity || 0) - (a.popularity || 0); }
  function byRating(a, b) { return (b.rating || 0) - (a.rating || 0); }
  function byAdded(a, b) { return String(b.addedAt || "").localeCompare(String(a.addedAt || "")); }

  function catalog() { return SEEK.getCatalog(); }

  var heroTimer = null;
  var heroIndex = 0;

  function heroPool() {
    var cat = catalog();
    var pool = (cat.heroIds || []).map(function (id) {
      return SEEK.get("movie", id) || SEEK.get("show", id);
    }).filter(Boolean);
    if (!pool.length) pool = cat.movies.concat(cat.shows).filter(function (x) { return x.featured; });
    if (!pool.length) pool = cat.movies.slice().sort(byPopularity).slice(0, 4);
    return pool;
  }

  function startHeroRotation(mount, pool) {
    if (heroTimer) clearInterval(heroTimer);
    if (pool.length < 2) return;
    heroTimer = setInterval(function () {
      heroIndex = (heroIndex + 1) % pool.length;
      mount.innerHTML = heroMarkup(pool[heroIndex]);
    }, 6000);
  }

  function heroMarkup(item) {
    var isShow = !!(item.seasons && item.seasons.length);
    var href = isShow ? "series.html?id=" + encodeURIComponent(item.id) : "movie.html?id=" + encodeURIComponent(item.id);
    var typeLabel = isShow ? t("nav.tv") : t("nav.movies");
    var translator = item.translatorId ? SEEK.translatorName(item.translatorId) : "";
    return '<section class="hero">' +
      '<div class="hero__media"><img src="' + SEEK.backdrop(item) + '" alt="" width="1600" height="900"></div>' +
      '<div class="hero__scrim"></div>' +
      '<div class="container"><div class="hero__content">' +
        '<div class="hero__badges">' +
          '<span class="tag tag--accent"><span class="pulse-dot"></span> ' + esc(t("home.hero")) + "</span>" +
          (item.badge ? '<span class="tag">' + esc(item.badge) + "</span>" : "") +
          '<span class="tag">' + esc(typeLabel) + "</span>" +
        "</div>" +
        '<h1 class="hero__title">' + esc(item.title) + "</h1>" +
        (item.tagline ? '<p class="hero__tagline">' + esc(item.tagline) + "</p>" : "") +
        '<div class="hero__meta">' +
          SEEK.ratingChip(item.rating) +
          "<span>" + esc(item.year) + "</span>" +
          "<span>" + esc((item.genres || []).join(" · ")) + "</span>" +
          "<span>" + esc(isShow ? (item.seasons.length + " " + t("common.seasons").toLowerCase()) : (item.runtime + " " + t("common.min"))) + "</span>" +
          (translator ? "<span>" + SEEK.icon("mic") + " " + esc(translator) + "</span>" : "") +
        "</div>" +
        '<p class="hero__synopsis">' + esc(item.synopsis) + "</p>" +
        '<div class="hero__actions">' +
          '<button type="button" class="btn btn-primary" data-trailer-type="' + (isShow ? "show" : "movie") + '" data-trailer-id="' + esc(item.id) + '">' + SEEK.icon("play") + " " + esc(t("common.watchTrailer")) + "</button>" +
          '<a class="btn btn-ghost" href="' + href + '">' + SEEK.icon("info") + " " + esc(t("common.details")) + "</a>" +
          SEEK.favButton(isShow ? "show" : "movie", item.id) +
        "</div>" +
      "</div></div>" +
      '<a class="hero__scroll icon-btn" href="#spotlight" aria-label="' + esc(t("common.learnMore")) + '">' + SEEK.icon("chevron-down") + "</a>" +
    "</section>";
  }

  function spotlightMarkup() {
    var cat = catalog();
    var item = cat.movies.slice().sort(byRating)[0];
    if (!item) return "";
    var reasons = [
      "A complete story in " + item.runtime + " minutes, built around a performance the reviews keep returning to.",
      "One of the highest-rated titles in the catalogue, with a " + item.rating.toFixed(1) + " audience score.",
      "A distinctive voice in " + (item.genres[0] || "cinema") + " that stands apart from the rest of the shelf."
    ];
    return '<section class="spotlight-section" id="spotlight"><div class="container"><div class="spotlight">' +
      '<a class="spotlight__art" href="movie.html?id=' + encodeURIComponent(item.id) + '"><img src="' + SEEK.wideArt(item) + '" alt="" width="960" height="540"></a>' +
      '<div class="spotlight__body">' +
        '<p class="eyebrow"><span class="pulse-dot"></span> ' + esc(t("home.movieOfDay")) + "</p>" +
        "<h2>" + esc(item.title) + "</h2>" +
        '<div class="tag-row">' + SEEK.ratingChip(item.rating) + '<span class="tag">' + esc(item.year) + "</span>" + (item.genres || []).slice(0, 2).map(function (g) { return '<span class="tag">' + esc(g) + "</span>"; }).join("") + "</div>" +
        "<p>" + esc(item.synopsis) + "</p>" +
        '<ul class="spotlight__list">' + reasons.map(function (reason) {
          return "<li>" + SEEK.icon("sparkles") + "<span>" + esc(reason) + "</span></li>";
        }).join("") + "</ul>" +
        '<div class="hero__actions">' +
          '<button type="button" class="btn btn-primary" data-play-movie="' + esc(item.id) + '">' + SEEK.icon("play") + " " + esc(t("common.watchMovie")) + "</button>" +
          '<a class="btn btn-ghost" href="movie.html?id=' + encodeURIComponent(item.id) + '">' + esc(t("common.details")) + " " + SEEK.icon("arrow-right") + "</a>" +
        "</div>" +
      "</div>" +
    "</div></div></section>";
  }

  function moodMarkup() {
    var moods = SEEK.DATA.moods || [];
    if (!moods.length) return "";
    var icons = ["sparkles", "film", "heart", "flag", "star", "users", "globe", "clock"];
    return '<section class="mood-section" id="moods"><div class="container">' +
      '<div class="section-head"><div><p class="eyebrow">' + esc(t("home.moodTitle")) + '</p><h2>' + esc(t("home.moodHint")) + '</h2></div></div>' +
      '<div class="mood-grid">' + moods.map(function (mood, index) {
        return '<a class="mood-card" href="movies.html?mood=' + encodeURIComponent(mood.id) + '">' +
          '<span class="mood-card__icon">' + SEEK.icon(icons[index % icons.length]) + "</span>" +
          "<strong>" + esc(mood.label) + "</strong>" +
          "<span>" + esc(mood.hint) + "</span>" +
        "</a>";
      }).join("") + "</div>" +
    "</div></section>";
  }

  function homeCtaMarkup() {
    var user = SEEK.auth.currentUser();
    if (user) {
      return '<div class="container"><section class="home-cta">' +
        "<div><h2>Welcome back, " + esc(user.name.split(" ")[0]) + ".</h2>" +
        "<p>" + esc(t("home.guestNote")) + "</p></div>" +
        '<div class="home-cta__actions">' +
          '<a class="btn btn-primary" href="library.html">' + SEEK.icon("bookmark") + " " + esc(t("nav.library")) + "</a>" +
          '<a class="btn btn-ghost" href="account.html">' + SEEK.icon("settings") + " " + esc(t("nav.settings")) + "</a>" +
        "</div>" +
      "</section></div>";
    }
    return '<div class="container"><section class="home-cta">' +
      "<div><h2>Make SEEK yours.</h2>" +
      "<p>Create a free account to keep a watchlist, save favourites, pick up where you left off and tune the home page to your taste.</p></div>" +
      '<div class="home-cta__actions">' +
        '<a class="btn btn-primary" href="account.html?mode=register">' + esc(t("nav.join")) + "</a>" +
        '<a class="btn btn-ghost" href="account.html?mode=login">' + esc(t("nav.signin")) + "</a>" +
      "</div>" +
    "</section></div>";
  }

  function render() {
    var cat = catalog();
    var hidden = SEEK.prefs.hiddenShelves || [];
    var heroMount = SEEK.$("#hero-mount");
    var spotlightMount = SEEK.$("#spotlight-mount");
    var moodMount = SEEK.$("#mood-mount");
    var shelvesMount = SEEK.$("#shelves-mount");
    var ctaMount = SEEK.$("#home-cta");
    if (!heroMount || !shelvesMount) return;

    var pool = heroPool();
    if (pool.length) {
      heroIndex = SEEK.hashString(SEEK.todayISO()) % pool.length;
      heroMount.innerHTML = heroMarkup(pool[heroIndex]);
      startHeroRotation(heroMount, pool);
    }
    if (spotlightMount) spotlightMount.innerHTML = spotlightMarkup();
    if (moodMount) moodMount.innerHTML = moodMarkup();
    if (ctaMount) ctaMount.innerHTML = homeCtaMarkup();

    var shelves = [];

    var continuing = SEEK.progress.continueWatching(8);
    if (continuing.length && hidden.indexOf("continue") === -1) {
      shelves.push(SEEK.shelf({
        id: "shelf-continue", titleId: "shelf-continue-title",
        eyebrow: t("shelf.recommended"), title: t("shelf.continue"),
        customCards: continuing.map(SEEK.continueCard), scroll: true
      }));
    }

    var trendingMovies = cat.movies.filter(function (m) { return m.trending; }).sort(byPopularity);
    if (!trendingMovies.length) trendingMovies = cat.movies.slice().sort(byPopularity).slice(0, 12);
    if (hidden.indexOf("trending") === -1) {
      shelves.push(SEEK.shelf({
        id: "shelf-trending", titleId: "shelf-trending-title",
        eyebrow: t("common.trending"), title: t("shelf.trending"),
        items: trendingMovies.slice(0, 14), type: "movie",
        seeAll: "movies.html?sort=popular"
      }));
    }

    if (hidden.indexOf("popular-movies") === -1) {
      shelves.push(SEEK.shelf({
        id: "shelf-popular-movies", titleId: "shelf-popular-movies-title",
        eyebrow: t("common.popular"), title: t("shelf.popularMovies"),
        items: cat.movies.slice().sort(byPopularity).slice(0, 14), type: "movie",
        seeAll: "movies.html?sort=popular"
      }));
    }

    if (hidden.indexOf("top-rated") === -1) {
      shelves.push(SEEK.shelf({
        id: "shelf-top-rated", titleId: "shelf-top-rated-title",
        eyebrow: t("common.topRated"), title: t("shelf.topRated"),
        items: cat.movies.slice().sort(byRating).slice(0, 14), type: "movie",
        seeAll: "movies.html?sort=rating"
      }));
    }

    if (hidden.indexOf("popular-tv") === -1) {
      shelves.push(SEEK.shelf({
        id: "shelf-popular-tv", titleId: "shelf-popular-tv-title",
        eyebrow: t("common.trending"), title: t("shelf.popularTV"),
        items: cat.shows.slice().sort(byPopularity).slice(0, 14), type: "show",
        seeAll: "tv.html?sort=popular"
      }));
    }

    if (hidden.indexOf("trailers") === -1) {
      var trailers = cat.trailers.map(function (tr) { return SEEK.findTrailer(tr.id); }).filter(Boolean);
      if (trailers.length) {
        shelves.push(SEEK.shelf({
          id: "shelf-trailers", titleId: "shelf-trailers-title",
          eyebrow: "Official previews", title: t("shelf.latestTrailers"),
          items: trailers.slice(0, 10), type: "trailer", wide: true,
          seeAll: "trailers.html"
        }));
      }
    }

    if (hidden.indexOf("translators") === -1) {
      shelves.push(SEEK.shelf({
        id: "shelf-translators", titleId: "shelf-translators-title",
        eyebrow: "People behind the voice", title: t("shelf.translators"),
        items: cat.translators.slice(0, 8), type: "translator", wide: true,
        seeAll: "translators.html"
      }));
    }

    shelves.push(SEEK.topTen(cat.movies.slice().sort(byPopularity).slice(0, 10)));

    shelvesMount.innerHTML = shelves.join("");
  }

  SEEK.ready(render);
})();
