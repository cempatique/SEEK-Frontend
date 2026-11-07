/* ==========================================================================
   SEEK — series detail page
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;
  var mount = SEEK.$("#series-app");
  if (!mount) return;

  var id = SEEK.qs("id", "");
  var show = id ? SEEK.get("show", id) : null;
  var activeSeason = Number(SEEK.qs("season", "1")) || 1;

  function stars(value) {
    var n = Math.round(Number(value) || 0);
    var out = "";
    for (var i = 1; i <= 5; i++) out += SEEK.icon("star", i <= n ? "" : "star--off");
    return '<span class="stars" aria-label="' + n + ' out of 5">' + out + "</span>";
  }

  function related() {
    return SEEK.getCatalog().shows.filter(function (s) {
      return s.id !== show.id && s.genres.some(function (g) { return show.genres.indexOf(g) !== -1; });
    }).sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); }).slice(0, 10);
  }

  function currentSeason() {
    return show.seasons.find(function (season) { return season.number === activeSeason; }) || show.seasons[0];
  }

  function seasonMarkup() {
    var season = currentSeason();
    if (!season) return "";
    return '<div class="season-tabs">' + show.seasons.map(function (s) {
      return '<button type="button" class="season-tab' + (s.number === season.number ? " is-active" : "") + '" data-season="' + s.number + '">Season ' + s.number + "</button>";
    }).join("") + "</div>" +
      '<p class="season-summary">' + esc(season.summary || "") + "</p>" +
      '<div data-episode-list>' + season.episodes.map(function (episode) {
        return SEEK.episodeRow(show, season, episode);
      }).join("") + "</div>";
  }

  function reviewFormMarkup() {
    var user = SEEK.auth.currentUser();
    if (!user) {
      return '<div class="guest-note">' + SEEK.icon("user") + '<span><a class="text-link" href="account.html?mode=login">' + esc(t("nav.signin")) + "</a> " + esc(t("common.signInToReview")) + "</span></div>";
    }
    return '<form class="form review-form" data-review-form>' +
      '<label class="field"><span>' + esc(t("common.rate")) + '</span><div class="star-input" data-star-input>' +
        [1, 2, 3, 4, 5].map(function (n) {
          return '<button type="button" data-star="' + n + '" aria-label="' + n + ' stars">' + SEEK.icon("star") + "</button>";
        }).join("") +
      '</div><input type="hidden" name="rating" value="0" data-rating-value></label>' +
      '<label class="field"><span>' + esc(t("common.writeReview")) + '</span><textarea name="text" rows="3" minlength="4" required placeholder="What did you think?"></textarea></label>' +
      '<div><button class="btn btn-primary btn-sm" type="submit">' + SEEK.icon("send") + " " + esc(t("common.submit")) + "</button></div>" +
    "</form>";
  }

  function reviewListMarkup() {
    var list = SEEK.reviews.forItem(show.id);
    if (!list.length) return '<p class="muted">' + esc(t("common.noReviews")) + "</p>";
    return '<div class="review-list">' + list.map(function (review) {
      return '<article class="review-item" data-review-id="' + esc(review.id) + '">' +
        '<div class="review-item__head">' +
          '<span class="review-item__avatar">' + esc(String(review.name || "S").charAt(0).toUpperCase()) + "</span>" +
          "<strong>" + esc(review.name) + "</strong>" +
          "<span>" + esc(SEEK.relativeDate(review.date) || review.date) + "</span>" +
          stars(review.rating) +
        "</div>" +
        "<p>" + esc(review.text) + "</p>" +
        '<div class="review-item__actions">' +
          '<button type="button" data-review-vote class="' + (review.isVoted ? "is-on" : "") + '">' + SEEK.icon("heart") + " " + esc(t("common.helpful")) + " (" + (review.helpful || 0) + ")</button>" +
          (review.own || review.seed ? '<button type="button" data-review-hide>' + SEEK.icon("flag") + " Hide</button>" : "") +
        "</div>" +
      "</article>";
    }).join("") + "</div>";
  }

  function reviewsMarkup() {
    var summary = SEEK.reviews.summary(show.id);
    return '<section class="detail-section" id="reviews">' +
      "<h2>" + esc(t("common.reviews")) + "</h2>" +
      '<div class="review-summary">' +
        '<span class="review-score">' + (summary.average ? summary.average.toFixed(1) : "—") + "<small>/5</small></span>" +
        '<span class="review-summary__meta">' + summary.count + " " + esc(summary.count === 1 ? "review" : "reviews") + "</span>" +
      "</div>" +
      reviewFormMarkup() +
      '<div data-review-list>' + reviewListMarkup() + "</div>" +
    "</section>";
  }

  function render() {
    if (!show) {
      mount.innerHTML = '<div class="container"><div class="error-page"><h1>Series not found</h1><p>That series is not in the catalogue. It may have been removed or the link is incorrect.</p><a class="btn btn-primary" href="tv.html">' + esc(t("nav.tv")) + "</a></div></div>";
      return;
    }
    SEEK.trackView("show", show.id);
    var translator = show.translatorId ? SEEK.get("translator", show.translatorId) : null;
    var season = currentSeason();
    var firstEpisode = season && season.episodes[0];

    mount.innerHTML =
      '<section class="detail-hero">' +
        '<div class="detail-hero__bg"><img src="' + SEEK.backdrop(show) + '" alt="" width="1600" height="900"></div>' +
        '<div class="detail-hero__scrim"></div>' +
        '<div class="container"><div class="detail-hero__inner">' +
          '<div class="detail-poster"><img src="' + SEEK.poster(show) + '" alt="' + esc(show.title) + ' poster" width="420" height="630"></div>' +
          '<div class="detail-main">' +
            '<div class="tag-row">' +
              '<span class="tag tag--accent">' + esc(show.badge || "Series") + "</span>" +
              '<span class="tag">' + esc(t("nav.tv")) + "</span>" +
              (translator ? '<span class="tag tag--accent">' + esc(SEEK.translatorLabel(show)) + "</span>" : "") +
            "</div>" +
            "<h1>" + esc(show.title) + "</h1>" +
            '<div class="detail-meta">' +
              SEEK.ratingChip(show.rating) +
              "<span>" + esc(show.year) + "</span>" +
              "<span>" + show.seasons.length + " " + esc(t("common.seasons").toLowerCase()) + "</span>" +
              "<span>" + esc(show.language) + "</span>" +
              "<span>" + esc((show.genres || []).join(" · ")) + "</span>" +
            "</div>" +
            '<div class="detail-actions">' +
              (firstEpisode ? '<button type="button" class="btn btn-primary" data-play-show="' + esc(show.id) + '" data-play-episode="' + esc(firstEpisode.id) + '">' + SEEK.icon("play") + " " + esc(t("common.play")) + "</button>" : "") +
              '<button type="button" class="btn btn-ghost" data-trailer-type="show" data-trailer-id="' + esc(show.id) + '">' + SEEK.icon("film") + " " + esc(t("common.watchTrailer")) + "</button>" +
              SEEK.watchlistButton("show", show.id) +
              SEEK.favButton("show", show.id) +
              '<button type="button" class="icon-btn" data-share-type="show" data-share-id="' + esc(show.id) + '" aria-label="' + esc(t("common.share")) + '">' + SEEK.icon("share") + "</button>" +
            "</div>" +
            '<div class="detail-facts">' +
              '<div><span>Creator</span><strong>' + esc(show.creator) + "</strong></div>" +
              '<div><span>' + esc(t("common.language")) + "</span><strong>" + esc(show.language) + "</strong></div>" +
              '<div><span>' + esc(t("common.seasons")) + "</span><strong>" + show.seasons.length + "</strong></div>" +
              (show.country ? '<div><span>Country</span><strong>' + esc(show.country) + "</strong></div>" : "") +
            "</div>" +
          "</div>" +
        "</div></div>" +
      "</section>" +
      '<div class="container"><div class="detail-layout">' +
        "<div>" +
          '<section class="detail-section"><h2>' + esc(t("common.synopsis")) + "</h2><p>" + esc(show.synopsis) + "</p>" +
            '<div class="tag-row">' + (show.genres || []).map(function (g) { return '<a class="chip" href="tv.html?genre=' + encodeURIComponent(g) + '">' + esc(g) + "</a>"; }).join("") + "</div>" +
          "</section>" +
          '<section class="detail-section" id="episodes"><h2>' + esc(t("common.episodes")) + "</h2><div data-season-area>" + seasonMarkup() + "</div></section>" +
          '<section class="detail-section"><h2>' + esc(t("common.cast")) + '</h2><div class="cast-list">' +
            (show.cast || []).map(function (person) { return '<span class="chip">' + esc(person) + "</span>"; }).join("") +
          "</div></section>" +
          reviewsMarkup() +
          '<section class="detail-section"><h2>' + esc(t("common.related")) + '</h2><div class="media-grid">' +
            related().map(SEEK.showCard).join("") +
          "</div></section>" +
        "</div>" +
        '<aside class="detail-aside">' +
          '<div class="aside-card"><h3>Details</h3><div class="fact-list">' +
            '<div><span>Rating</span><span>' + show.rating.toFixed(1) + " / 10</span></div>" +
            '<div><span>Seasons</span><span>' + show.seasons.length + "</span></div>" +
            '<div><span>Episodes</span><span>' + show.seasons.reduce(function (sum, s) { return sum + s.episodes.length; }, 0) + "</span></div>" +
            '<div><span>Released</span><span>' + esc(show.year) + "</span></div>" +
            '<div><span>Added</span><span>' + esc(show.addedAt || "—") + "</span></div>" +
          "</div></div>" +
          (translator ? '<div class="aside-card"><h3>Translation</h3><a class="translator-card" href="translator.html?id=' + encodeURIComponent(translator.id) + '" style="padding:0;border:0;background:none">' +
            '<div class="translator-card__avatar"><img src="' + SEEK.avatar(translator) + '" alt="" width="66" height="66"></div>' +
            '<div class="translator-card__body"><p class="eyebrow">' + esc(translator.kind) + "</p><h3>" + esc(translator.name) + "</h3><p class=\"translator-card__langs\">" + esc(translator.languages.join(" · ")) + "</p></div>" +
          "</a></div>" : "") +
          '<div class="aside-card"><h3>Actions</h3><div class="form">' +
            '<button type="button" class="btn btn-ghost btn-block" data-party>' + SEEK.icon("users") + " " + esc(t("common.watchParty")) + "</button>" +
            '<button type="button" class="btn btn-ghost btn-block" data-report-type="show" data-report-id="' + esc(show.id) + '">' + SEEK.icon("flag") + " " + esc(t("common.report")) + "</button>" +
          "</div></div>" +
        "</aside>" +
      "</div></div>";

    bind();
  }

  function bind() {
    var form = SEEK.$("[data-review-form]", mount);
    if (form) {
      var starWrap = SEEK.$("[data-star-input]", form);
      var hidden = SEEK.$("[data-rating-value]", form);
      starWrap.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-star]");
        if (!btn) return;
        var value = Number(btn.getAttribute("data-star"));
        hidden.value = value;
        SEEK.$$("[data-star]", starWrap).forEach(function (node) {
          node.classList.toggle("is-on", Number(node.getAttribute("data-star")) <= value);
        });
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var data = new FormData(form);
        var result = SEEK.reviews.add(show.id, data.get("rating"), data.get("text"));
        if (!result.ok) { SEEK.toast(result.message, "error"); return; }
        form.reset();
        hidden.value = "0";
        SEEK.$$("[data-star]", starWrap).forEach(function (node) { node.classList.remove("is-on"); });
        var list = SEEK.$("[data-review-list]", mount);
        if (list) list.innerHTML = reviewListMarkup();
        SEEK.toast("Review posted", "success");
      });
    }

    mount.addEventListener("click", function (event) {
      var seasonBtn = event.target.closest("[data-season]");
      if (seasonBtn) {
        activeSeason = Number(seasonBtn.getAttribute("data-season"));
        var area = SEEK.$("[data-season-area]", mount);
        if (area) area.innerHTML = seasonMarkup();
        return;
      }
      var vote = event.target.closest("[data-review-vote]");
      if (vote) {
        var review = vote.closest("[data-review-id]");
        if (!review) return;
        SEEK.reviews.vote(review.getAttribute("data-review-id"));
        var list = SEEK.$("[data-review-list]", mount);
        if (list) list.innerHTML = reviewListMarkup();
        return;
      }
      var hide = event.target.closest("[data-review-hide]");
      if (hide) {
        var node = hide.closest("[data-review-id]");
        if (!node) return;
        SEEK.reviews.hide(node.getAttribute("data-review-id"));
        var reviewList = SEEK.$("[data-review-list]", mount);
        if (reviewList) reviewList.innerHTML = reviewListMarkup();
      }
    });
  }

  SEEK.ready(render);
})();
