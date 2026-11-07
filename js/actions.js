/* ==========================================================================
   SEEK — share, download, report and watch-party actions
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;

  function slugify(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "seek";
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    area.remove();
    return ok;
  }

  function share(payload) {
    payload = payload || {};
    var url = payload.url || location.href;
    var title = payload.title || document.title;
    if (navigator.share) {
      navigator.share({ title: title, text: payload.text || "", url: url }).catch(function () { /* dismissed */ });
      return;
    }
    copyText(url).then(function (ok) {
      SEEK.toast(ok === false ? url : SEEK.t("common.shareCopied"), ok === false ? "" : "success");
    });
  }

  function downloadText(filename, text) {
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
  }

  function officialSearch(title, extra) {
    return "https://www.youtube.com/results?search_query=" + encodeURIComponent(title + " " + (extra || "official trailer"));
  }

  function openDownload(type, id) {
    var item = SEEK.get(type, id);
    if (!item) return;
    var dl = item.download || { allowed: false };
    var body = "";
    if (dl.allowed) {
      body += '<span class="eyebrow">' + SEEK.icon("download") + " Authorised download</span>" +
        '<h2 class="modal__title">' + esc(item.title) + "</h2>" +
        '<p class="modal__text">' + esc(dl.note || "This title is cleared for download.") + "</p>" +
        '<div class="download-license"><span>Licence</span><strong>' + esc(dl.license || "Authorised") + "</strong></div>" +
        '<ul class="download-files">' + (dl.files || []).map(function (file) {
          return '<li><span class="download-files__icon">' + SEEK.icon("film") + "</span><span><strong>" + esc(file.label || "Feature") + "</strong><small>" + esc(file.quality) + " · " + esc(file.format) + "</small></span><span class=\"download-files__size\">" + esc(file.size) + "</span></li>";
        }).join("") + "</ul>" +
        '<p class="note">SEEK does not ship the film file in this front-end demo. The download package below contains the licence, file manifest and authorised source information. In production, the backend would issue a short-lived signed link after entitlement checks.</p>' +
        '<div class="modal__actions">' +
          '<button type="button" class="btn btn-primary" data-download-package>' + SEEK.icon("download") + " Download details package</button>" +
          (dl.officialUrl ? '<a class="btn btn-ghost" href="' + esc(dl.officialUrl) + '" target="_blank" rel="noopener noreferrer">' + SEEK.icon("external-link") + " Official source</a>" : "") +
        "</div>";
    } else {
      body += '<span class="eyebrow">' + SEEK.icon("info") + " Not available for download</span>" +
        '<h2 class="modal__title">' + esc(item.title) + "</h2>" +
        '<p class="modal__text">This title is not licensed for download on SEEK. Use the official trailer, find a legal streaming service, or check the title\'s official store page.</p>' +
        '<div class="modal__actions">' +
          '<a class="btn btn-primary" href="' + officialSearch(item.title) + '" target="_blank" rel="noopener noreferrer">' + SEEK.icon("external-link") + " Find official trailer</a>" +
          '<a class="btn btn-ghost" href="https://www.justwatch.com/us/search?q=' + encodeURIComponent(item.title) + '" target="_blank" rel="noopener noreferrer">' + SEEK.icon("external-link") + " Find streaming</a>" +
        "</div>" +
        '<p class="note">SEEK never bypasses DRM, paywalls or access restrictions. Download buttons only appear for public-domain material, SEEK originals or licensed content.</p>';
    }
    var wrap = SEEK.openModal('<div class="download-modal"><span class="eyebrow">' + esc(t2("common.download")) + "</span>" + body + "</div>", { label: "Download " + item.title, className: "modal-overlay--sheet" });
    wrap.addEventListener("click", function (event) {
      if (!event.target.closest("[data-download-package]")) return;
      var lines = [
        "SEEK — authorised download information",
        "--------------------------------------",
        "Title: " + item.title,
        "Year: " + item.year,
        "Licence: " + (dl.license || "Authorised"),
        "Licence note: " + (dl.note || ""),
        "",
        "Files:"
      ].concat((dl.files || []).map(function (file) {
        return "  - " + (file.label || "Feature") + " | " + file.quality + " | " + file.format + " | " + file.size;
      })).concat([
        "",
        dl.officialUrl ? "Official source: " + dl.officialUrl : "",
        "Generated: " + new Date().toISOString(),
        "",
        "This demo package contains metadata only. No film file is included.",
        "SEEK — Discover. Watch. Explore."
      ]);
      downloadText("SEEK-" + slugify(item.title) + "-download-info.txt", lines.filter(function (line, i, arr) {
        return !(line === "" && arr[i - 1] === "");
      }).join("\n"));
      SEEK.toast("Download package created", "success");
    });
  }

  function t2(key) { return SEEK.t(key); }

  function openReport(type, id) {
    var item = SEEK.get(type, id);
    var title = item ? item.title : "SEEK";
    var user = SEEK.auth.currentUser();
    var wrap = SEEK.openModal(
      '<form class="form" data-report-form>' +
        '<span class="eyebrow">' + SEEK.icon("flag") + " " + esc(SEEK.t("common.report")) + "</span>" +
        '<h2 class="modal__title">' + esc(title) + "</h2>" +
        '<p class="modal__text">Tell us what is wrong and our catalogue team will review it.</p>' +
        '<label class="field"><span>Issue type</span><select name="reason" required>' +
          '<option value="Playback issue">Playback issue</option>' +
          '<option value="Wrong metadata">Wrong metadata</option>' +
          '<option value="Audio or subtitle problem">Audio or subtitle problem</option>' +
          '<option value="Copyright concern">Copyright concern</option>' +
          '<option value="Other">Other</option>' +
        "</select></label>" +
        '<label class="field"><span>Details</span><textarea name="details" rows="4" required minlength="8" placeholder="Describe the issue…"></textarea></label>' +
        (user ? "" : '<label class="field"><span>Email <em>' + esc(SEEK.t("common.optional")) + "</em></span><input type=\"email\" name=\"email\" placeholder=\"you@example.com\"></label>") +
        '<div class="modal__actions"><button type="submit" class="btn btn-primary">' + SEEK.icon("send") + " Submit report</button></div>" +
      "</form>",
      { label: "Report an issue with " + title }
    );
    wrap.addEventListener("submit", function (event) {
      if (!event.target.matches("[data-report-form]")) return;
      event.preventDefault();
      var form = event.target;
      var data = new FormData(form);
      var report = SEEK.reports.add({
        type: type, itemId: id, itemTitle: title,
        reason: data.get("reason"),
        details: String(data.get("details") || "").slice(0, 1000),
        email: (user && user.email) || data.get("email") || "anonymous"
      });
      SEEK.closeModal(wrap);
      SEEK.toast("Report received. Reference " + report.id.slice(-4).toUpperCase(), "success");
    });
  }

  function partyRoomMarkup(room) {
    return '<div class="party-modal">' +
      '<span class="eyebrow">' + SEEK.icon("users") + " " + esc(SEEK.t("common.watchParty")) + "</span>" +
      '<h2 class="modal__title">Room ' + esc(room.code) + "</h2>" +
      '<p class="modal__text">Invite friends to the same film. In this demo the room is stored on your device; synchronised playback and chat are designed for the production backend.</p>' +
      '<div class="party-code"><span>' + esc(room.code) + '</span><button type="button" class="icon-btn" data-party-copy aria-label="Copy invite">' + SEEK.icon("copy") + "</button></div>" +
      '<div class="party-members">' + room.members.map(function (name) {
        return '<span class="party-member"><span class="party-member__dot"></span>' + esc(name) + "</span>";
      }).join("") + '<span class="party-member party-member--empty">Waiting for friends…</span></div>' +
      '<div class="modal__actions">' +
        '<button type="button" class="btn btn-primary" data-party-start>' + SEEK.icon("play") + " Start a demo room</button>" +
        '<button type="button" class="btn btn-ghost" data-party-copy>' + SEEK.icon("link") + " Copy invite link</button>" +
      "</div>" +
    "</div>";
  }

  function openParty() {
    var user = SEEK.auth.currentUser();
    var existing = SEEK.party.current();
    if (existing) {
      showParty(existing);
      return;
    }
    var wrap = SEEK.openModal(
      '<div class="party-modal">' +
        '<span class="eyebrow">' + SEEK.icon("users") + " " + esc(SEEK.t("common.watchParty")) + "</span>" +
        '<h2 class="modal__title">' + esc(SEEK.t("common.watchParty")) + "</h2>" +
        '<p class="modal__text">Create a room code or join a friend\'s room. This is a front-end demonstration of the watch-party flow.</p>' +
        '<form class="form" data-party-create>' +
          '<label class="field"><span>Your name</span><input name="name" maxlength="40" value="' + esc(user ? user.name : "Guest") + '" required></label>' +
          '<button class="btn btn-primary" type="submit">' + SEEK.icon("plus") + " Create a room</button>" +
        "</form>" +
        '<div class="divider"><span>or join</span></div>' +
        '<form class="form form--inline" data-party-join>' +
          '<label class="field"><span>Room code</span><input name="code" placeholder="SEEK-XXXX" maxlength="9" required></label>' +
          '<button class="btn btn-ghost" type="submit">Join room</button>' +
        "</form>" +
      "</div>",
      { label: "Watch party" }
    );
    wrap.addEventListener("submit", function (event) {
      event.preventDefault();
      var form = event.target;
      var data = new FormData(form);
      if (form.matches("[data-party-create]")) {
        var room = SEEK.party.create(String(data.get("name") || "Guest").slice(0, 40));
        SEEK.closeModal(wrap);
        showParty(room);
      } else if (form.matches("[data-party-join]")) {
        var joined = SEEK.party.join(data.get("code"), (user && user.name) || "Guest");
        if (!joined) { SEEK.toast("That room code was not found on this device.", "error"); return; }
        SEEK.closeModal(wrap);
        showParty(joined);
      }
    });
  }

  function showParty(room) {
    var wrap = SEEK.openModal(partyRoomMarkup(room), { label: "Watch party room " + room.code });
    wrap.addEventListener("click", function (event) {
      if (event.target.closest("[data-party-copy]")) {
        var url = location.href.split("#")[0].split("?")[0] + "?party=" + room.code;
        copyText(url).then(function () { SEEK.toast("Invite link copied", "success"); });
      }
      if (event.target.closest("[data-party-start]")) {
        SEEK.closeModal(wrap);
        var movie = SEEK.getCatalog().movies.slice().sort(function (a, b) { return b.popularity - a.popularity; })[0];
        if (movie && SEEK.player) {
          SEEK.player.open({
            kind: "movie", title: movie.title, subtitle: "Watch party " + room.code + " · demo",
            artType: "movie", artId: movie.id, duration: (movie.parts[0].duration || movie.runtime) * 60,
            key: "party:" + room.code + ":" + movie.id, officialTitle: movie.title, queueLabel: "Watch party"
          });
        }
      }
    });
  }

  Object.assign(SEEK, {
    copyText: copyText, share: share, shareCurrent: function (title) { share({ title: title || document.title, url: location.href }); },
    downloadText: downloadText, openDownload: openDownload, openReport: openReport, openParty: openParty,
    officialSearch: officialSearch
  });
})();
