/* ==========================================================================
   SEEK — cards, rows, shelves and search-result components
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;

  function rating(value) {
    var n = Number(value) || 0;
    return '<span class="rating-chip">' + SEEK.icon("star") + " " + n.toFixed(1) + "</span>";
  }

  function favButton(type, id, extraClass) {
    var active = SEEK.favs.has(type, id);
    var label = active ? t("common.favorited") : t("common.favorite");
    return '<button type="button" class="icon-btn fav-btn' + (active ? " is-active" : "") + (extraClass ? " " + extraClass : "") + '" ' +
      'data-fav-type="' + esc(type) + '" data-fav-id="' + esc(id) + '" aria-pressed="' + active + '" aria-label="' + esc(label) + '" title="' + esc(label) + '">' +
      SEEK.icon("heart") + "</button>";
  }

  function watchlistButton(type, id, extraClass) {
    var active = SEEK.watchlist.has(type, id);
    var label = active ? t("common.inWatchlist") : t("common.watchlist");
    return '<button type="button" class="btn btn-ghost btn-sm watchlist-btn' + (active ? " is-active" : "") + (extraClass ? " " + extraClass : "") + '" ' +
      'data-watchlist-type="' + esc(type) + '" data-watchlist-id="' + esc(id) + '" aria-pressed="' + active + '">' +
      SEEK.icon("bookmark") + "<span>" + esc(label) + "</span></button>";
  }

  function mediaCard(item, type, options) {
    options = options || {};
    var isShow = type === "show";
    var href = isShow ? "series.html?id=" + encodeURIComponent(item.id) : "movie.html?id=" + encodeURIComponent(item.id);
    var seasons = isShow ? (item.seasons || []).length : 0;
    var meta = isShow
      ? item.year + " · " + esc(item.genres[0] || "") + " · " + seasons + " " + t("common.seasons").toLowerCase()
      : item.year + " · " + esc(item.genres[0] || "") + " · " + item.runtime + " " + t("common.min");
    var typeLabel = isShow ? t("nav.tv") : t("nav.movies");
    return '<article class="media-card" data-card-type="' + type + '" data-card-id="' + esc(item.id) + '">' +
      '<div class="media-card__poster">' +
        '<a class="media-card__poster-link" href="' + href + '" tabindex="-1" aria-hidden="true">' +
          '<img src="' + SEEK.poster(item) + '" alt="" loading="lazy" decoding="async" width="420" height="630">' +
        "</a>" +
        (item.badge ? '<span class="card-badge">' + esc(item.badge) + "</span>" : "") +
        '<span class="card-type">' + esc(typeLabel) + "</span>" +
        '<div class="media-card__overlay">' +
          '<div class="overlay-top">' + rating(item.rating) + "</div>" +
          '<p class="overlay-synopsis">' + esc(item.synopsis) + "</p>" +
          '<div class="overlay-actions">' +
            '<button type="button" class="btn btn-primary btn-xs" data-trailer-type="' + type + '" data-trailer-id="' + esc(item.id) + '">' + SEEK.icon("play") + " " + esc(t("common.watchTrailer")) + "</button>" +
            favButton(type, item.id, "fav-btn--overlay") +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="media-card__body">' +
        '<h3 class="media-card__title"><a href="' + href + '">' + esc(item.title) + "</a></h3>" +
        '<p class="media-card__meta">' + meta + "</p>" +
        '<div class="media-card__tags">' + rating(item.rating) +
          (item.parts && item.parts.length > 1 ? '<span class="tag">' + item.parts.length + " parts</span>" : "") +
        "</div>" +
      "</div>" +
    "</article>";
  }

  function movieCard(item) { return mediaCard(item, "movie"); }
  function showCard(item) { return mediaCard(item, "show"); }

  function trailerCard(tr) {
    var item = tr.item || {};
    var typeLabel = tr.refType === "show" ? t("nav.tv") : t("nav.movies");
    return '<article class="trailer-card">' +
      '<div class="trailer-card__thumb">' +
        '<img src="' + SEEK.wideArt(item) + '" alt="" loading="lazy" decoding="async" width="960" height="540">' +
        '<button type="button" class="trailer-card__play" data-trailer-play="' + esc(tr.id) + '" aria-label="' + esc(t("common.watchTrailer") + ": " + tr.title) + '">' + SEEK.icon("play") + "</button>" +
        '<span class="trailer-card__duration">' + esc(tr.duration) + "</span>" +
        '<div class="trailer-card__save">' + favButton("trailer", tr.id) + "</div>" +
      "</div>" +
      '<div class="trailer-card__body">' +
        '<p class="eyebrow">' + esc(typeLabel) + " · " + esc(tr.category || "trailer") + "</p>" +
        '<h3><a href="trailers.html?id=' + encodeURIComponent(tr.id) + '">' + esc(tr.title) + "</a></h3>" +
        '<p class="trailer-card__desc">' + esc(tr.desc || "") + "</p>" +
      "</div>" +
    "</article>";
  }

  function translatorCard(tr) {
    var movies = SEEK.moviesForTranslator(tr.id);
    var shows = SEEK.showsForTranslator(tr.id);
    var total = movies.length + shows.length;
    return '<a class="translator-card" href="translator.html?id=' + encodeURIComponent(tr.id) + '">' +
      '<div class="translator-card__avatar"><img src="' + SEEK.avatar(tr) + '" alt="" loading="lazy" width="200" height="200"></div>' +
      '<div class="translator-card__body">' +
        '<p class="eyebrow">' + esc(tr.kind) + "</p>" +
        '<h3>' + esc(tr.name) + "</h3>" +
        '<p class="translator-card__langs">' + esc(tr.languages.join(" · ")) + "</p>" +
        '<p class="translator-card__stats"><strong>' + total + "</strong> " + (total === 1 ? "title" : "titles") + " · since " + esc(tr.joined) + "</p>" +
      "</div>" +
      '<span class="translator-card__arrow">' + SEEK.icon("arrow-right") + "</span>" +
    "</a>";
  }

  function episodeRow(show, season, episode, options) {
    options = options || {};
    var key = "episode:" + show.id + ":" + episode.id;
    var progress = SEEK.progress.get(key);
    var pct = progress && progress.duration ? Math.min(100, (progress.position / progress.duration) * 100) : 0;
    return '<article class="episode-row" id="episode-' + esc(episode.id) + '">' +
      '<span class="episode-row__num">' + SEEK.pad(episode.number) + "</span>" +
      '<div class="episode-row__thumb">' +
        '<img src="' + SEEK.wideArt(show, "S" + SEEK.pad(season.number) + "E" + SEEK.pad(episode.number)) + '" alt="" loading="lazy" width="480" height="270">' +
        '<button type="button" class="episode-row__play" data-play-show="' + esc(show.id) + '" data-play-episode="' + esc(episode.id) + '" aria-label="' + esc("Play " + episode.title) + '">' + SEEK.icon("play") + "</button>" +
        (pct ? '<span class="episode-row__progress" style="width:' + pct + '%"></span>' : "") +
      "</div>" +
      '<div class="episode-row__body">' +
        '<div class="episode-row__head"><h3>' + esc(episode.title) + "</h3><span>" + episode.duration + " " + esc(t("common.min")) + "</span></div>" +
        '<p>' + esc(episode.description) + "</p>" +
      "</div>" +
      '<button type="button" class="btn btn-ghost btn-sm episode-row__action" data-play-show="' + esc(show.id) + '" data-play-episode="' + esc(episode.id) + '">' +
        SEEK.icon("play") + "<span>" + esc(progress ? t("common.resume") : t("common.play")) + "</span></button>" +
    "</article>";
  }

  function continueCard(record) {
    var entry = record.entry;
    var art = record.art || { title: entry.title };
    var pct = Math.min(100, (entry.position / entry.duration) * 100);
    return '<article class="continue-card">' +
      '<div class="continue-card__art">' +
        '<img src="' + SEEK.wideArt(art, entry.kind === "episode" ? "Episode" : "Resume") + '" alt="" loading="lazy" width="960" height="540">' +
        '<button type="button" class="continue-card__play" data-resume-key="' + esc(entry.key) + '" aria-label="' + esc(t("common.resume") + " " + entry.title) + '">' + SEEK.icon("play") + "</button>" +
        '<span class="continue-card__remaining">' + SEEK.formatTime(Math.max(0, entry.duration - entry.position)) + " left</span>" +
      "</div>" +
      '<div class="continue-card__body">' +
        "<h3>" + esc(entry.title) + "</h3>" +
        '<p class="muted">' + esc(entry.subtitle || "") + "</p>" +
        '<div class="progress"><span style="width:' + pct + '%"></span></div>' +
      "</div>" +
    "</article>";
  }

  function topTen(items) {
    if (!items.length) return "";
    var cards = items.map(function (movie, index) {
      return '<a class="top10-card" href="movie.html?id=' + encodeURIComponent(movie.id) + '">' +
        '<span class="top10-rank" aria-hidden="true">' + (index + 1) + "</span>" +
        '<span class="top10-poster"><img src="' + SEEK.poster(movie) + '" alt="" loading="lazy" width="420" height="630"></span>' +
        '<span class="top10-title">' + esc(movie.title) + "</span>" +
        '<span class="top10-meta">' + rating(movie.rating) + "<span>" + esc(movie.year) + "</span></span>" +
      "</a>";
    }).join("");
    return '<section class="shelf shelf--top10" id="shelf-top10" aria-labelledby="top10-title">' +
      '<div class="container shelf__head">' +
        '<div><p class="eyebrow"><span class="pulse-dot"></span> ' + esc(t("common.trending")) + '</p><h2 id="top10-title">' + esc(t("shelf.top10")) + "</h2></div>" +
        '<a class="text-link" href="movies.html?sort=popular">' + esc(t("common.viewAll")) + " " + SEEK.icon("arrow-right") + "</a>" +
      "</div>" +
      '<div class="shelf__track top10-track">' + cards + "</div>" +
    "</section>";
  }

  function shelf(options) {
    var items = options.items || [];
    if (!items.length && !options.customCards) return "";
    var cards = options.customCards || items.map(function (item) {
      if (options.type === "trailer") return trailerCard(item);
      if (options.type === "translator") return translatorCard(item);
      if (options.type === "show") return showCard(item);
      return movieCard(item);
    }).join("");
    var id = options.id || "";
    return '<section class="shelf" id="' + esc(id) + '"' + (options.titleId ? ' aria-labelledby="' + esc(options.titleId) + '"' : "") + ">" +
      '<div class="container shelf__head">' +
        "<div>" +
          (options.eyebrow ? '<p class="eyebrow">' + esc(options.eyebrow) + "</p>" : "") +
          '<h2' + (options.titleId ? ' id="' + esc(options.titleId) + '"' : "") + ">" + esc(options.title) + "</h2>" +
          (options.reason ? '<p class="shelf__reason">' + esc(options.reason) + "</p>" : "") +
        "</div>" +
        '<div class="shelf__tools">' +
          (options.seeAll ? '<a class="text-link" href="' + esc(options.seeAll) + '">' + esc(t("common.viewAll")) + " " + SEEK.icon("arrow-right") + "</a>" : "") +
          (options.scroll === false ? "" : '<div class="scroll-buttons"><button type="button" class="icon-btn scroll-btn" data-scroll="-1" aria-label="' + esc(t("common.prev")) + '">' + SEEK.icon("chevron-left") + '</button><button type="button" class="icon-btn scroll-btn" data-scroll="1" aria-label="' + esc(t("common.next")) + '">' + SEEK.icon("chevron-right") + "</button></div>") +
        "</div>" +
      "</div>" +
      '<div class="shelf__track' + (options.wide ? " shelf__track--wide" : "") + '" data-shelf-track>' + cards + "</div>" +
    "</section>";
  }

  function cardFor(type, item) {
    if (type === "trailer") return trailerCard(item);
    if (type === "translator") return translatorCard(item);
    if (type === "show" || type === "tv") return showCard(item);
    return movieCard(item);
  }

  function searchResult(r) {
    return '<a class="search-result" href="' + esc(r.href) + '" data-search-result>' +
      '<img src="' + r.image + '" alt="" loading="lazy" width="120" height="80">' +
      '<span class="search-result__text"><span class="eyebrow">' + esc(r.typeLabel) + "</span><strong>" + esc(r.title) + "</strong><span>" + esc(r.subtitle || "") + "</span></span>" +
      SEEK.icon("arrow-right") +
    "</a>";
  }

  function emptyState(title, hint, actionHref, actionLabel) {
    return '<div class="empty-state">' +
      '<span class="empty-state__icon">' + SEEK.icon("sparkles") + "</span>" +
      "<h3>" + esc(title || t("common.noResults")) + "</h3>" +
      "<p>" + esc(hint || t("common.noResultsHint")) + "</p>" +
      (actionHref ? '<a class="btn btn-primary" href="' + esc(actionHref) + '">' + esc(actionLabel || t("common.viewAll")) + "</a>" : "") +
    "</div>";
  }

  Object.assign(SEEK, {
    ratingChip: rating, favButton: favButton, watchlistButton: watchlistButton,
    movieCard: movieCard, showCard: showCard, trailerCard: trailerCard,
    translatorCard: translatorCard, episodeRow: episodeRow, continueCard: continueCard,
    topTen: topTen, shelf: shelf, cardFor: cardFor, searchResult: searchResult, emptyState: emptyState
  });
})();
