/* ==========================================================================
   SEEK — movie detail page
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;
  var mount = SEEK.$("#movie-app");
  if (!mount) return;

  var id = SEEK.qs("id", "");
  var movie = id ? SEEK.get("movie", id) : null;

  function stars(value) {
    var n = Math.round(Number(value) || 0);
    var out = "";
    for (var i = 1; i <= 5; i++) out += SEEK.icon("star", i <= n ? "" : "star--off");
    return '<span class="stars" aria-label="' + n + ' out of 5">' + out + "</span>";
  }

  function related() {
    return SEEK.getCatalog().movies.filter(function (m) {
      return m.id !== movie.id && m.genres.some(function (g) { return movie.genres.indexOf(g) !== -1; });
    }).sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); }).slice(0, 10);
  }

  function partRows() {
    var parts = movie.parts && movie.parts.length ? movie.parts : [{ label: "Feature presentation", duration: movie.runtime, quality: "1080p", available: true }];
    return parts.map(function (part, index) {
      var progress = SEEK.progress.get("movie:" + movie.id + ":part:" + index);
      var pct = progress && progress.duration ? Math.min(100, (progress.position / progress.duration) * 100) : 0;
      return '<div class="part-row">' +
        '<span class="part-row__num">' + (index + 1) + "</span>" +
        '<div class="part-row__body"><strong>' + esc(part.label || "Part " + (index + 1)) + "</strong>" +
          "<small>" + esc(part.duration || movie.runtime) + " " + esc(t("common.min")) + " · " + esc(part.quality || "HD") + (progress ? " · " + esc(t("common.resume")) : "") + "</small></div>" +
        '<div class="part-row__progress">' + (pct ? '<div class="progress"><span style="width:' + pct + '%"></span></div>' : "") + "</div>" +
        '<button type="button" class="btn ' + (pct ? "btn-ghost" : "btn-primary") + ' btn-sm" data-play-movie="' + esc(movie.id) + '" data-play-part="' + index + '">' + SEEK.icon("play") + " " + esc(pct ? t("common.resume") : t("common.play")) + "</button>" +
      "</div>";
    }).join("");
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
    var list = SEEK.reviews.forItem(movie.id);
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
    var summary = SEEK.reviews.summary(movie.id);
    return '<section class="detail-section" id="reviews">' +
      "<h2>" + esc(t("common.reviews")) + "</h2>" +
      '<div class="review-summary">' +
        '<span class="review-score">' + (summary.average ? summary.average.toFixed(1) : "—") + "<small>/5</small></span>" +
        '<span class="review-summary__meta">' + summary.count + " " + esc(summary.count === 1 ? "review" : "reviews") + " · " + esc(t("common.reviews")) + "</span>" +
      "</div>" +
      reviewFormMarkup() +
      '<div data-review-list>' + reviewListMarkup() + "</div>" +
    "</section>";
  }

  function render() {
    if (!movie) {
      mount.innerHTML = '<div class="container"><div class="error-page"><h1>Film not found</h1><p>That title is not in the catalogue. It may have been removed or the link is incorrect.</p><a class="btn btn-primary" href="movies.html">' + esc(t("nav.movies")) + "</a></div></div>";
      return;
    }
    SEEK.trackView("movie", movie.id);
    var translator = movie.translatorId ? SEEK.get("translator", movie.translatorId) : null;

    mount.innerHTML =
      '<section class="detail-hero">' +
        '<div class="detail-hero__bg"><img src="' + SEEK.backdrop(movie) + '" alt="" width="1600" height="900"></div>' +
        '<div class="detail-hero__scrim"></div>' +
        '<div class="container"><div class="detail-hero__inner">' +
          '<div class="detail-poster"><img src="' + SEEK.poster(movie) + '" alt="' + esc(movie.title) + ' poster" width="420" height="630"></div>' +
          '<div class="detail-main">' +
            '<div class="tag-row">' +
              (movie.badge ? '<span class="tag tag--accent">' + esc(movie.badge) + "</span>" : "") +
              '<span class="tag">' + esc(t("nav.movies")) + "</span>" +
              (movie.publicDomain ? '<span class="tag">Public domain</span>' : "") +
            "</div>" +
            "<h1>" + esc(movie.title) + "</h1>" +
            (movie.tagline ? '<p class="detail-tagline">' + esc(movie.tagline) + "</p>" : "") +
            '<div class="detail-meta">' +
              SEEK.ratingChip(movie.rating) +
              "<span>" + esc(movie.year) + "</span>" +
              "<span>" + esc(movie.runtime + " " + t("common.min")) + "</span>" +
              "<span>" + esc(movie.language) + "</span>" +
              "<span>" + esc((movie.genres || []).join(" · ")) + "</span>" +
            "</div>" +
            '<div class="detail-actions">' +
              '<button type="button" class="btn btn-primary" data-play-movie="' + esc(movie.id) + '">' + SEEK.icon("play") + " " + esc(t("common.watchMovie")) + "</button>" +
              '<button type="button" class="btn btn-ghost" data-trailer-type="movie" data-trailer-id="' + esc(movie.id) + '">' + SEEK.icon("film") + " " + esc(t("common.watchTrailer")) + "</button>" +
              SEEK.watchlistButton("movie", movie.id) +
              SEEK.favButton("movie", movie.id) +
              '<button type="button" class="icon-btn" data-share-type="movie" data-share-id="' + esc(movie.id) + '" aria-label="' + esc(t("common.share")) + '">' + SEEK.icon("share") + "</button>" +
              '<button type="button" class="icon-btn" data-download-type="movie" data-download-id="' + esc(movie.id) + '" aria-label="' + esc(t("common.download")) + '">' + SEEK.icon("download") + "</button>" +
            "</div>" +
            '<div class="detail-facts">' +
              '<div><span>' + esc(t("common.director")) + "</span><strong>" + esc(movie.director) + "</strong></div>" +
              '<div><span>' + esc(t("common.language")) + "</span><strong>" + esc(movie.language) + "</strong></div>" +
              '<div><span>' + esc(t("common.year")) + "</span><strong>" + esc(movie.year) + "</strong></div>" +
              (movie.country ? '<div><span>Country</span><strong>' + esc(movie.country) + "</strong></div>" : "") +
            "</div>" +
          "</div>" +
        "</div></div>" +
      "</section>" +
      '<div class="container"><div class="detail-layout">' +
        "<div>" +
          '<section class="detail-section"><h2>' + esc(t("common.synopsis")) + "</h2><p>" + esc(movie.synopsis) + "</p>" +
            '<div class="tag-row">' + (movie.genres || []).map(function (g) { return '<a class="chip" href="movies.html?genre=' + encodeURIComponent(g) + '">' + esc(g) + "</a>"; }).join("") + "</div>" +
          "</section>" +
          '<section class="detail-section"><h2>' + esc(t("common.parts")) + '</h2><div class="parts-list">' + partRows() + "</div></section>" +
          '<section class="detail-section"><h2>' + esc(t("common.cast")) + '</h2><div class="cast-list">' +
            (movie.cast || []).map(function (person) { return '<span class="chip">' + esc(person) + "</span>"; }).join("") +
          "</div></section>" +
          reviewsMarkup() +
          '<section class="detail-section"><h2>' + esc(t("common.related")) + '</h2><div class="media-grid">' +
            related().map(SEEK.movieCard).join("") +
          "</div></section>" +
        "</div>" +
        '<aside class="detail-aside">' +
          '<div class="aside-card"><h3>Details</h3><div class="fact-list">' +
            '<div><span>Rating</span><span>' + movie.rating.toFixed(1) + " / 10</span></div>" +
            '<div><span>Runtime</span><span>' + esc(movie.runtime + " " + t("common.min")) + "</span></div>" +
            '<div><span>Released</span><span>' + esc(movie.year) + "</span></div>" +
            '<div><span>Country</span><span>' + esc(movie.country || "—") + "</span></div>" +
            '<div><span>Added</span><span>' + esc(movie.addedAt || "—") + "</span></div>" +
          "</div></div>" +
          (translator ? '<div class="aside-card"><h3>Translation</h3><a class="translator-card" href="translator.html?id=' + encodeURIComponent(translator.id) + '" style="padding:0;border:0;background:none">' +
            '<div class="translator-card__avatar"><img src="' + SEEK.avatar(translator) + '" alt="" width="66" height="66"></div>' +
            '<div class="translator-card__body"><p class="eyebrow">' + esc(translator.kind) + "</p><h3>" + esc(translator.name) + "</h3><p class=\"translator-card__langs\">" + esc(translator.languages.join(" · ")) + "</p></div>" +
          "</a></div>" : "") +
          '<div class="aside-card"><h3>Actions</h3><div class="form">' +
            '<button type="button" class="btn btn-ghost btn-block" data-party>' + SEEK.icon("users") + " " + esc(t("common.watchParty")) + "</button>" +
            '<button type="button" class="btn btn-ghost btn-block" data-report-type="movie" data-report-id="' + esc(movie.id) + '">' + SEEK.icon("flag") + " " + esc(t("common.report")) + "</button>" +
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
        var result = SEEK.reviews.add(movie.id, data.get("rating"), data.get("text"));
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
      var vote = event.target.closest("[data-review-vote]");
      if (vote) {
        var item = vote.closest("[data-review-id]");
        if (!item) return;
        SEEK.reviews.vote(item.getAttribute("data-review-id"));
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
