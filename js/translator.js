/* ==========================================================================
   SEEK — translator profile
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;
  var mount = SEEK.$("#translator-app");
  if (!mount) return;

  var id = SEEK.qs("id", "");
  var translator = id ? SEEK.get("translator", id) : null;

  function socialLinks(tr) {
    var socials = tr.socials || {};
    var labels = { youtube: "YouTube", x: "X", instagram: "Instagram" };
    return Object.keys(socials).filter(function (key) { return socials[key]; }).map(function (key) {
      return '<a class="chip" href="' + esc(socials[key]) + '" target="_blank" rel="noopener noreferrer">' + SEEK.icon("external-link") + " " + esc(labels[key] || key) + "</a>";
    }).join("");
  }

  function render() {
    if (!translator) {
      mount.innerHTML = '<div class="container"><div class="error-page"><h1>Translator not found</h1><p>That profile is not in the directory.</p><a class="btn btn-primary" href="translators.html">' + esc(t("nav.translators")) + "</a></div></div>";
      return;
    }
    SEEK.trackView("translator", translator.id);
    var movies = SEEK.moviesForTranslator(translator.id).sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
    var shows = SEEK.showsForTranslator(translator.id).sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
    var total = movies.length + shows.length;
    var others = translator.languages.filter(function (lang) { return lang !== "English"; });

    mount.innerHTML =
      '<section class="detail-hero">' +
        '<div class="detail-hero__bg"><img src="' + SEEK.wideArt(translator, translator.kind) + '" alt="" width="1600" height="900"></div>' +
        '<div class="detail-hero__scrim"></div>' +
        '<div class="container"><div class="detail-hero__inner">' +
          '<div class="detail-poster" style="aspect-ratio:1"><img src="' + SEEK.avatar(translator) + '" alt="' + esc(translator.name) + '" width="420" height="420"></div>' +
          '<div class="detail-main">' +
            '<div class="tag-row">' +
              '<span class="tag tag--accent">' + esc(translator.kind) + "</span>" +
              '<span class="tag">' + esc(t("nav.translators")) + "</span>" +
            "</div>" +
            "<h1>" + esc(translator.name) + "</h1>" +
            '<div class="detail-meta">' +
              "<span>" + esc(translator.languages.join(" · ")) + "</span>" +
              "<span>" + esc(translator.specialty) + "</span>" +
              "<span>Since " + esc(translator.joined) + "</span>" +
            "</div>" +
            '<div class="detail-actions">' +
              '<a class="btn btn-primary" href="#translated">' + SEEK.icon("film") + " Browse " + total + " titles</a>" +
              '<button type="button" class="icon-btn" data-share-type="translator" data-share-id="' + esc(translator.id) + '" aria-label="' + esc(t("common.share")) + '">' + SEEK.icon("share") + "</button>" +
            "</div>" +
            '<div class="detail-facts">' +
              '<div><span>Films</span><strong>' + movies.length + "</strong></div>" +
              '<div><span>Series</span><strong>' + shows.length + "</strong></div>" +
              '<div><span>Languages</span><strong>' + translator.languages.length + "</strong></div>" +
              '<div><span>Joined</span><strong>' + esc(translator.joined) + "</strong></div>" +
            "</div>" +
          "</div>" +
        "</div></div>" +
      "</section>" +
      '<div class="container"><div class="detail-layout">' +
        "<div>" +
          '<section class="detail-section"><h2>About ' + esc(translator.name.split(" ")[0]) + "</h2><p>" + esc(translator.bio) + "</p>" +
            '<div class="tag-row">' + translator.languages.map(function (lang) { return '<span class="chip">' + esc(lang) + "</span>"; }).join("") + "</div>" +
          "</section>" +
          (movies.length ? '<section class="detail-section" id="translated"><h2>Films in ' + esc(others[0] || translator.languages[0]) + '</h2><div class="media-grid">' + movies.map(SEEK.movieCard).join("") + "</div></section>" : "") +
          (shows.length ? '<section class="detail-section"><h2>Series in ' + esc(others[0] || translator.languages[0]) + '</h2><div class="media-grid">' + shows.map(SEEK.showCard).join("") + "</div></section>" : "") +
          (!movies.length && !shows.length ? SEEK.emptyState("No titles yet", "This translator has no catalogue titles on SEEK yet.", "translators.html", "Back to translators") : "") +
        "</div>" +
        '<aside class="detail-aside">' +
          '<div class="aside-card"><h3>Profile</h3><div class="fact-list">' +
            '<div><span>Discipline</span><span>' + esc(translator.kind) + "</span></div>" +
            '<div><span>Specialty</span><span>' + esc(translator.specialty) + "</span></div>" +
            '<div><span>Languages</span><span>' + esc(translator.languages.join(", ")) + "</span></div>" +
            '<div><span>Joined</span><span>' + esc(translator.joined) + "</span></div>" +
            '<div><span>Titles</span><span>' + total + "</span></div>" +
          "</div></div>" +
          (socialLinks(translator) ? '<div class="aside-card"><h3>Follow</h3><div class="chips">' + socialLinks(translator) + "</div></div>" : "") +
          '<div class="aside-card"><h3>Discover</h3><div class="form">' +
            '<a class="btn btn-ghost btn-block" href="movies.html?translator=' + encodeURIComponent(translator.id) + '">' + SEEK.icon("film") + " All films</a>" +
            '<a class="btn btn-ghost btn-block" href="tv.html?translator=' + encodeURIComponent(translator.id) + '">' + SEEK.icon("tv") + " All series</a>" +
            '<a class="btn btn-ghost btn-block" href="translators.html">' + SEEK.icon("users") + " All translators</a>" +
          "</div></div>" +
        "</aside>" +
      "</div></div>";
  }

  SEEK.ready(render);
})();
