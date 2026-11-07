/* ==========================================================================
   SEEK - embedded YouTube trailer player
   Uses pre-fetched video ids so trailers play inside SEEK without any
   runtime API request or external navigation.
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var TRAILERS = window.SEEK_YOUTUBE_TRAILERS || {};

  function lookup(item) {
    if (!item) return null;
    return TRAILERS[item.id] || null;
  }

  function embedUrl(videoId) {
    return "https://www.youtube.com/embed/" + encodeURIComponent(videoId) +
      "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
  }

  function findTrailer(item) {
    var video = lookup(item);
    if (!video) return Promise.reject(new Error("No embedded trailer is available for " + ((item && item.title) || "this title")));
    return Promise.resolve(video);
  }

  function markup(video, item) {
    var title = item.title || video.title || "Trailer";
    return '<div class="yt-trailer">' +
      '<div class="yt-trailer__frame"><iframe src="' + esc(embedUrl(video.videoId)) + '" title="' + esc(title + " trailer") + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>' +
      '<div class="yt-trailer__meta"><div><h3>' + esc(title) + "</h3><p>" + esc([video.channel, video.duration].filter(Boolean).join(" \u00b7 ")) + "</p></div></div>" +
    "</div>";
  }

  function openTrailer(item) {
    var video = lookup(item);
    if (!video) return Promise.reject(new Error("No embedded trailer is available for " + ((item && item.title) || "this title")));
    SEEK.openModal(markup(video, item), { label: (item.title || "Trailer") + " trailer", className: "modal-overlay--youtube" });
    return Promise.resolve(video);
  }

  function enhanceTrailerCards(root, list) {
    if (!root || !list) return;
    list.forEach(function (tr) {
      var video = tr.item ? lookup(tr.item) : null;
      if (!video) return;
      var play = root.querySelector('[data-trailer-play="' + tr.id + '"]');
      var article = play && play.closest(".trailer-card");
      if (!article) return;
      var img = article.querySelector(".trailer-card__thumb img");
      if (img && video.thumbnail) img.src = video.thumbnail;
      var duration = article.querySelector(".trailer-card__duration");
      if (duration && video.duration) duration.textContent = video.duration;
    });
  }

  SEEK.youtube = {
    findTrailer: findTrailer,
    openTrailer: openTrailer,
    embedUrl: embedUrl,
    enhanceTrailerCards: enhanceTrailerCards,
    hasTrailer: function (item) { return !!lookup(item); }
  };
})();
