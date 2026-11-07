/* ==========================================================================
   SEEK — video player
   Supports real HTML5 sources (track.src) and a fully interactive simulated
   preview mode used by the demo catalogue. Every control is functional.
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;

  var VOLUME_KEY = "seek.player.volume";
  var MUTED_KEY = "seek.player.muted";
  var CAPTION_KEY = "seek.player.captions";

  var DEMO_CAPTIONS = [
    { start: 2, end: 7, text: "Every signal leaves a trace." },
    { start: 9, end: 14, text: "The city looks different after midnight." },
    { start: 17, end: 22, text: "Some doors only open from the inside." },
    { start: 26, end: 31, text: "We have less time than we thought." },
    { start: 36, end: 42, text: "If you are hearing this, do not answer." },
    { start: 48, end: 53, text: "This is where the story changes." },
    { start: 59, end: 65, text: "SEEK — discover what comes next." }
  ];

  var state = {
    wrap: null, queue: [], index: 0, track: null, pos: 0, duration: 0,
    playing: false, speed: 1, volume: SEEK.read(VOLUME_KEY, 0.8),
    muted: SEEK.read(MUTED_KEY, false), captionsOn: SEEK.read(CAPTION_KEY, false),
    quality: "Auto", timer: null, lastTick: 0, lastSaved: 0, video: null, ended: false
  };

  function $(sel) { return state.wrap ? state.wrap.querySelector(sel) : null; }
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }

  function moviePartTrack(movie, part, index) {
    return {
      kind: "movie", title: movie.title,
      subtitle: (part.label || "Feature") + " · " + movie.year + " · " + movie.genres.join(", "),
      artType: "movie", artId: movie.id,
      duration: (part.duration || movie.runtime) * 60,
      key: "movie:" + movie.id + ":part:" + index,
      officialTitle: movie.title, movieId: movie.id, partIndex: index
    };
  }

  function episodeTrack(show, season, episode) {
    return {
      kind: "episode", title: show.title,
      subtitle: "S" + SEEK.pad(season.number) + "E" + SEEK.pad(episode.number) + " · " + episode.title,
      artType: "show", artId: show.id,
      duration: (episode.duration || 45) * 60,
      key: "episode:" + show.id + ":" + episode.id,
      officialTitle: show.title, showId: show.id, episodeId: episode.id, seasonNumber: season.number
    };
  }

  function trailerTrack(tr) {
    var item = tr.item;
    return {
      kind: "trailer", title: item.title, subtitle: "Official trailer · " + (tr.duration || ""),
      artType: tr.refType, artId: tr.refId,
      duration: SEEK.parseDuration(tr.duration || item.trailerDuration || "2:00"),
      key: "trailer:" + tr.id, officialTitle: item.title, trailerId: tr.id
    };
  }

  function artFor(track) {
    var item = SEEK.get(track.artType, track.artId);
    if (item) return SEEK.wideArt(item, track.kind === "episode" ? track.subtitle.split(" · ")[0] : "SEEK");
    return SEEK.wideArt({ title: track.title || "SEEK", id: track.key });
  }

  function officialUrl(track) {
    var query = track.officialTitle || track.title;
    return SEEK.officialSearch(query, "official trailer");
  }

  function shellMarkup(track) {
    return '<div class="player" data-player>' +
      '<div class="player__stage" data-player-stage>' +
        '<img class="player__art" data-player-art alt="" width="1600" height="900">' +
        '<div class="player__scrim"></div>' +
        '<div class="player__top">' +
          '<div class="player__heading">' +
            '<span class="preview-badge"><span class="pulse-dot"></span> <span data-player-mode>' + esc(t("player.previewMode")) + "</span></span>" +
            '<h2 data-player-title>' + esc(track.title) + "</h2>" +
            '<p data-player-subtitle>' + esc(track.subtitle || "") + "</p>" +
          "</div>" +
          '<div class="player__top-tools"><span class="player__count" data-player-count hidden></span>' +
            '<button type="button" class="icon-btn player__close" data-player-close aria-label="' + esc(t("common.close")) + '">' + SEEK.icon("close") + "</button>" +
          "</div>" +
        "</div>" +
        '<button type="button" class="player__big-play" data-player-toggle aria-label="' + esc(t("common.play")) + '">' + SEEK.icon("play") + "</button>" +
        '<div class="player__captions" data-player-captions aria-live="off"></div>' +
        '<div class="player__upnext" data-player-upnext hidden>' +
          '<p class="eyebrow">' + esc(t("player.upNext")) + '</p><h3 data-player-upnext-title></h3>' +
          '<div class="player__upnext-actions"><button type="button" class="btn btn-primary btn-sm" data-player-next>Next</button><button type="button" class="btn btn-ghost btn-sm" data-player-replay>Replay</button></div>' +
        "</div>" +
        '<div class="player__bottom">' +
          '<div class="player__notice"><span data-player-notice>' + esc(t("player.previewNote")) + '</span><a href="' + esc(officialUrl(track)) + '" target="_blank" rel="noopener noreferrer" data-player-official>' + SEEK.icon("external-link") + " " + esc(t("player.officialTrailer")) + "</a></div>" +
          '<div class="player__controls">' +
            '<input type="range" min="0" max="' + Math.max(1, state.duration || 1) + '" step="0.1" value="0" class="player__timeline" data-player-seek aria-label="Seek">' +
            '<div class="player__row">' +
              '<button type="button" class="icon-btn player__control" data-player-toggle aria-label="' + esc(t("common.play")) + '">' + SEEK.icon("play") + "</button>" +
              '<button type="button" class="icon-btn player__control" data-player-prev aria-label="' + esc(t("common.prev")) + '">' + SEEK.icon("skip-back") + "</button>" +
              '<button type="button" class="icon-btn player__control" data-player-next aria-label="' + esc(t("common.next")) + '">' + SEEK.icon("skip-forward") + "</button>" +
              '<span class="player__time"><span data-player-current>0:00</span> / <span data-player-duration>0:00</span></span>' +
              '<div class="player__spacer"></div>' +
              '<div class="player__volume"><button type="button" class="icon-btn player__control" data-player-mute aria-label="Mute">' + SEEK.icon(SEEK.read(MUTED_KEY, false) ? "volume-x" : "volume") + '</button>' +
                '<input type="range" min="0" max="1" step="0.05" value="' + esc(SEEK.read(VOLUME_KEY, 0.8)) + '" data-player-volume aria-label="Volume"></div>' +
              '<label class="player__select"><span class="sr-only">' + esc(t("player.speed")) + '</span>' + SEEK.icon("clock") + '<select data-player-speed><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>' +
              '<label class="player__select"><span class="sr-only">' + esc(t("player.quality")) + '</span>' + SEEK.icon("settings") + '<select data-player-quality><option>Auto</option><option>1080p</option><option>720p</option><option>480p</option></select></label>' +
              '<button type="button" class="icon-btn player__control player__control--toggle" data-player-captions-toggle aria-label="' + esc(t("player.subtitles")) + '">' + SEEK.icon("subtitles") + "</button>" +
              '<button type="button" class="icon-btn player__control" data-player-fullscreen aria-label="' + esc(t("player.fullscreen")) + '">' + SEEK.icon("fullscreen") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  function open(track, options) {
    options = options || {};
    if (!track) return;
    if (state.wrap) close();

    var queue = options.queue && options.queue.length ? options.queue.slice() : [track];
    var index = options.index != null ? options.index : queue.findIndex(function (item) { return item.key === track.key; });
    if (index < 0) index = 0;

    state.queue = queue;
    state.index = index;
    state.track = queue[index];
    state.lastSaved = 0;
    state.ended = false;

    var wrap = SEEK.openModal(shellMarkup(state.track), { label: "SEEK player", className: "modal-overlay--player", dismissible: false });
    state.wrap = wrap;
    bindControls();
    loadTrack(index, options.startAt);
    startTicker();
  }

  function close() {
    persist();
    state.playing = false;
    if (state.video) { try { state.video.pause(); } catch (err) { /* ignore */ } }
    if (state.wrap) SEEK.closeModal(state.wrap);
  }

  function cleanup() {
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
    document.removeEventListener("keydown", onKeyDown);
    if (state.video) { try { state.video.pause(); } catch (err) { /* ignore */ } }
    state.wrap = null;
    state.video = null;
    state.playing = false;
    state.queue = [];
  }

  function loadTrack(index, explicitStart) {
    persist();
    state.index = index;
    state.track = state.queue[index];
    state.ended = false;
    var track = state.track;
    if (!track) return;

    state.duration = track.duration || 120;
    var saved = (track.kind === "movie" || track.kind === "episode") ? SEEK.progress.get(track.key) : null;
    state.pos = explicitStart != null ? explicitStart : (saved && saved.position > 5 && saved.position < state.duration - 8 ? saved.position : 0);
    state.playing = false;

    var art = $("[data-player-art]");
    if (art) art.src = artFor(track);
    var title = $("[data-player-title]");
    if (title) title.textContent = track.title;
    var subtitle = $("[data-player-subtitle]");
    if (subtitle) subtitle.textContent = track.subtitle || "";
    var count = $("[data-player-count]");
    if (count) {
      count.hidden = state.queue.length < 2;
      count.textContent = (index + 1) + " / " + state.queue.length;
    }
    var official = $("[data-player-official]");
    if (official) official.href = officialUrl(track);
    var mode = $("[data-player-mode]");
    if (mode) mode.textContent = track.src ? "Sample source" : t("player.previewMode");
    var notice = $("[data-player-notice]");
    if (notice) notice.textContent = track.src ? "Playing a sample source connected to the SEEK player." : t("player.previewNote");

    var seek = $("[data-player-seek]");
    if (seek) { seek.max = Math.max(1, state.duration); seek.value = state.pos; }
    var durationEl = $("[data-player-duration]");
    if (durationEl) durationEl.textContent = SEEK.formatTime(state.duration);
    var stage = $("[data-player-stage]");

    var existingVideo = $("[data-player-video]");
    if (existingVideo) existingVideo.remove();
    state.video = null;

    if (track.src) {
      var video = document.createElement("video");
      video.className = "player__video";
      video.setAttribute("data-player-video", "");
      video.setAttribute("playsinline", "");
      video.preload = "metadata";
      video.src = track.src;
      video.poster = artFor(track);
      video.volume = state.volume;
      video.muted = state.muted;
      video.playbackRate = state.speed;
      stage.appendChild(video);
      state.video = video;
      video.addEventListener("loadedmetadata", function () {
        if (isFinite(video.duration) && video.duration > 0) {
          state.duration = video.duration;
          var d = $("[data-player-duration]"); if (d) d.textContent = SEEK.formatTime(state.duration);
          var s = $("[data-player-seek]"); if (s) s.max = state.duration;
        }
        if (state.pos > 0) { try { video.currentTime = state.pos; } catch (err) { /* ignore */ } }
        play();
      });
      video.addEventListener("timeupdate", function () {
        if (!state.video) return;
        state.pos = video.currentTime;
        updateUI();
        maybeSave();
      });
      video.addEventListener("ended", onEnded);
      video.addEventListener("play", function () { state.playing = true; updateUI(); });
      video.addEventListener("pause", function () { if (!video.ended) { state.playing = false; updateUI(); } });
    } else {
      if (stage) stage.classList.add("is-simulated");
    }
    if (stage) stage.classList.toggle("is-playing", false);

    updateUI();
    updateCaptions();
    updateUpNextPanel();
    toastIfResumed(saved, explicitStart);
    if (!track.src) {
      setTimeout(function () { if (state.track && state.track.key === track.key) play(); }, 260);
    }
  }

  function toastIfResumed(saved, explicitStart) {
    if (explicitStart == null && saved && saved.position > 5) {
      setTimeout(function () { SEEK.toast("Resuming from " + SEEK.formatTime(saved.position), "success"); }, 420);
    }
  }

  function play() {
    if (!state.track) return;
    if (state.pos >= state.duration - 0.5) state.pos = 0;
    state.ended = false;
    state.playing = true;
    state.lastTick = Date.now();
    if (state.video) {
      state.video.play().catch(function () { state.playing = false; updateUI(); });
    }
    var stage = $("[data-player-stage]");
    if (stage) stage.classList.add("is-playing");
    updateUI();
    updateUpNextPanel();
  }

  function pause() {
    state.playing = false;
    if (state.video) { try { state.video.pause(); } catch (err) { /* ignore */ } }
    var stage = $("[data-player-stage]");
    if (stage) stage.classList.remove("is-playing");
    persist();
    updateUI();
  }

  function toggle() {
    if (state.ended) { state.pos = 0; state.ended = false; }
    if (state.playing) pause(); else play();
  }

  function seekTo(value) {
    state.pos = clamp(Number(value) || 0, 0, state.duration);
    if (state.video) {
      try { state.video.currentTime = state.pos; } catch (err) { /* ignore */ }
    }
    state.ended = false;
    updateUI();
    updateCaptions();
    updateUpNextPanel();
  }

  function startTicker() {
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(function () {
      if (!state.wrap || !state.track) return;
      if (state.playing && !state.video) {
        var now = Date.now();
        var delta = Math.min(1, (now - state.lastTick) / 1000);
        state.lastTick = now;
        state.pos = Math.min(state.duration, state.pos + delta * state.speed);
        updateUI();
        updateCaptions();
        maybeSave();
        if (state.pos >= state.duration) onEnded();
      }
    }, 250);
  }

  function maybeSave() {
    var now = Date.now();
    if (now - state.lastSaved > 4000) { state.lastSaved = now; persist(); }
  }

  function persist() {
    var track = state.track;
    if (!track || (track.kind !== "movie" && track.kind !== "episode")) return;
    if (state.pos < 2) return;
    SEEK.progress.save({
      key: track.key, kind: track.kind, type: track.artType,
      artType: track.artType, artId: track.artId,
      title: track.title, subtitle: track.subtitle,
      position: state.pos, duration: state.duration,
      showId: track.showId || null, episodeId: track.episodeId || null,
      seasonNumber: track.seasonNumber || null, partIndex: track.partIndex != null ? track.partIndex : 0
    });
  }

  function onEnded() {
    state.playing = false;
    state.ended = true;
    state.pos = state.duration;
    if (state.video) { try { state.video.pause(); } catch (err) { /* ignore */ } }
    persist();
    var stage = $("[data-player-stage]");
    if (stage) stage.classList.remove("is-playing");
    updateUI();
    updateUpNextPanel();
  }

  function updateUI() {
    var seek = $("[data-player-seek]");
    if (seek && document.activeElement !== seek) seek.value = state.pos;
    if (seek) seek.style.setProperty("--progress", (state.duration ? (state.pos / state.duration) * 100 : 0) + "%");
    var current = $("[data-player-current]");
    if (current) current.textContent = SEEK.formatTime(state.pos);
    var durationEl = $("[data-player-duration]");
    if (durationEl) durationEl.textContent = SEEK.formatTime(state.duration);

    SEEK.$$("[data-player-toggle]").forEach(function (btn) {
      btn.innerHTML = SEEK.icon(state.playing ? "pause" : "play");
      btn.setAttribute("aria-label", state.playing ? t("common.pause") : t("common.play"));
    });
    var prev = $("[data-player-prev]");
    if (prev) prev.disabled = state.index <= 0;
    var next = $("[data-player-next]");
    if (next) next.disabled = state.index >= state.queue.length - 1;
    var captionsBtn = $("[data-player-captions-toggle]");
    if (captionsBtn) captionsBtn.classList.toggle("is-active", state.captionsOn);
    var stage = $("[data-player-stage]");
    if (stage) stage.classList.toggle("is-playing", state.playing);
  }

  function updateCaptions() {
    var node = $("[data-player-captions]");
    if (!node) return;
    if (!state.captionsOn) { node.textContent = ""; node.classList.remove("has-text"); return; }
    var lines = (state.track && state.track.captions) || DEMO_CAPTIONS;
    var line = lines.find(function (c) { return state.pos >= c.start && state.pos <= c.end; });
    node.textContent = line ? line.text : "";
    node.classList.toggle("has-text", !!line);
  }

  function updateUpNextPanel() {
    var panel = $("[data-player-upnext]");
    if (!panel) return;
    if (!state.ended) { panel.hidden = true; return; }
    panel.hidden = false;
    var nextTrack = state.queue[state.index + 1];
    var title = $("[data-player-upnext-title]");
    if (title) title.textContent = nextTrack ? nextTrack.title + " — " + (nextTrack.subtitle || "") : "You reached the end of this queue.";
    var nextBtn = panel.querySelector("[data-player-next]");
    if (nextBtn) nextBtn.hidden = !nextTrack;
  }

  function bindControls() {
    var wrap = state.wrap;
    if (!wrap) return;
    wrap.addEventListener("click", function (event) {
      if (event.target.closest("[data-player-close]")) { close(); return; }
      if (event.target.closest("[data-player-toggle]")) { toggle(); return; }
      if (event.target.closest("[data-player-prev]")) { if (state.index > 0) { persist(); loadTrack(state.index - 1); play(); } return; }
      if (event.target.closest("[data-player-next]")) { if (state.index < state.queue.length - 1) { persist(); loadTrack(state.index + 1); play(); } return; }
      if (event.target.closest("[data-player-replay]")) { state.pos = 0; state.ended = false; play(); return; }
      if (event.target.closest("[data-player-mute]")) {
        state.muted = !state.muted;
        SEEK.write(MUTED_KEY, state.muted);
        if (state.video) state.video.muted = state.muted;
        var muteBtn = $("[data-player-mute]");
        if (muteBtn) muteBtn.innerHTML = SEEK.icon(state.muted ? "volume-x" : "volume");
        SEEK.toast(state.muted ? "Muted" : "Sound on");
        return;
      }
      if (event.target.closest("[data-player-captions-toggle]")) {
        state.captionsOn = !state.captionsOn;
        SEEK.write(CAPTION_KEY, state.captionsOn);
        updateCaptions();
        updateUI();
        return;
      }
      if (event.target.closest("[data-player-fullscreen]")) { toggleFullscreen(); return; }
    });

    wrap.addEventListener("input", function (event) {
      if (event.target.matches("[data-player-seek]")) seekTo(event.target.value);
      if (event.target.matches("[data-player-volume]")) {
        state.volume = clamp(Number(event.target.value) || 0, 0, 1);
        state.muted = state.volume === 0;
        SEEK.write(VOLUME_KEY, state.volume);
        SEEK.write(MUTED_KEY, state.muted);
        if (state.video) { state.video.volume = state.volume; state.video.muted = state.muted; }
        var muteBtn = $("[data-player-mute]");
        if (muteBtn) muteBtn.innerHTML = SEEK.icon(state.muted ? "volume-x" : "volume");
      }
    });

    wrap.addEventListener("change", function (event) {
      if (event.target.matches("[data-player-speed]")) {
        state.speed = Number(event.target.value) || 1;
        if (state.video) state.video.playbackRate = state.speed;
        SEEK.toast("Playback speed " + state.speed + "×");
      }
      if (event.target.matches("[data-player-quality]")) {
        state.quality = event.target.value;
        SEEK.toast("Quality preference: " + state.quality + (state.video ? "" : " (preview)"));
      }
    });

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("seek:modalclose", onModalClose);
  }

  function onModalClose(event) {
    if (state.wrap && event.detail.modal === state.wrap) {
      persist();
      cleanup();
      document.removeEventListener("seek:modalclose", onModalClose);
    }
  }

  function onKeyDown(event) {
    if (!state.wrap) return;
    var tag = (event.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea") return;
    if (event.key === " " || event.code === "Space") { event.preventDefault(); toggle(); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); seekTo(state.pos - 10); }
    else if (event.key === "ArrowRight") { event.preventDefault(); seekTo(state.pos + 10); }
    else if (event.key.toLowerCase() === "m") { var btn = $("[data-player-mute]"); if (btn) btn.click(); }
    else if (event.key.toLowerCase() === "f") toggleFullscreen();
    else if (event.key === "Escape") { event.preventDefault(); close(); }
  }

  function toggleFullscreen() {
    var stage = $("[data-player-stage]");
    if (!stage) return;
    if (!document.fullscreenElement) {
      if (stage.requestFullscreen) stage.requestFullscreen().catch(function () { stage.classList.toggle("is-faux-fullscreen"); });
      else stage.classList.toggle("is-faux-fullscreen");
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(function () { /* ignore */ });
    }
  }

  /* ------------------------------ Public API -------------------------------- */
  function playMovie(id, partIndex) {
    var movie = SEEK.get("movie", id);
    if (!movie) return;
    var parts = movie.parts && movie.parts.length ? movie.parts : [{ label: "Feature presentation", duration: movie.runtime, quality: "1080p", available: true }];
    var queue = parts.map(function (part, index) { return moviePartTrack(movie, part, index); });
    var index = clamp(Number(partIndex) || 0, 0, queue.length - 1);
    open(queue[index], { queue: queue, index: index });
    SEEK.trackView("movie", id);
  }

  function playEpisode(showId, episodeId) {
    var show = SEEK.get("show", showId);
    if (!show) return;
    var season = null, episode = null;
    show.seasons.forEach(function (s) {
      s.episodes.forEach(function (e) { if (e.id === episodeId) { season = s; episode = e; } });
    });
    if (!season || !episode) return;
    var queue = season.episodes.map(function (ep) { return episodeTrack(show, season, ep); });
    var index = season.episodes.findIndex(function (ep) { return ep.id === episodeId; });
    open(queue[index], { queue: queue, index: index });
    SEEK.trackView("show", showId);
  }

  function openTrailerById(trailerId) {
    var resolved = SEEK.findTrailer(trailerId);
    if (!resolved) return;
    openYouTubeTrailer(resolved.item, function () { openTrailerQueue(trailerId); });
  }

  function openTrailerQueue(trailerId) {
    var queue = SEEK.getCatalog().trailers.map(function (tr) { return SEEK.findTrailer(tr.id); }).filter(Boolean).map(trailerTrack);
    var index = queue.findIndex(function (track) { return track.trailerId === trailerId; });
    open(queue[Math.max(0, index)], { queue: queue, index: Math.max(0, index) });
  }

  function openYouTubeTrailer(item, fallback) {
    if (!SEEK.youtube || !SEEK.youtube.openTrailer) { fallback(); return; }
    SEEK.youtube.openTrailer(item).catch(function (error) {
      if (error && error.message) SEEK.toast(error.message, "error");
      fallback();
    });
  }

  function openSimulatedTrailer(type, id, item) {
    var track = {
      kind: "trailer",
      title: item.title, subtitle: "Preview \u00b7 " + (item.year || ""),
      artType: type, artId: id,
      duration: SEEK.parseDuration(item.trailerDuration || "2:00"),
      key: "trailer:" + type + ":" + id,
      officialTitle: item.title
    };
    open(track);
  }

  function openTrailer(type, id) {
    var item = SEEK.get(type, id);
    if (!item) return;
    var tr = SEEK.getTrailerFor(type, id);
    openYouTubeTrailer(item, function () {
      if (tr) openTrailerQueue(tr.id);
      else openSimulatedTrailer(type, id, item);
    });
  }

  function openTrailerList(list, startIndex) {
    var queue = (list || []).map(function (tr) { return tr.item ? trailerTrack(tr) : null; }).filter(Boolean);
    if (!queue.length) return;
    var index = clamp(startIndex || 0, 0, queue.length - 1);
    open(queue[index], { queue: queue, index: index });
  }

  function resumeEntry(key) {
    var entry = SEEK.progress.get(key);
    if (!entry) { SEEK.toast("Nothing to resume for that title."); return; }
    if (entry.kind === "movie") {
      var movie = SEEK.get("movie", entry.artId);
      if (!movie) return;
      var parts = movie.parts && movie.parts.length ? movie.parts : [{ label: "Feature presentation", duration: movie.runtime, quality: "1080p", available: true }];
      var queue = parts.map(function (part, index) { return moviePartTrack(movie, part, index); });
      var index = clamp(entry.partIndex || 0, 0, queue.length - 1);
      open(queue[index], { queue: queue, index: index, startAt: entry.position });
    } else if (entry.kind === "episode") {
      var show = SEEK.get("show", entry.showId || entry.artId);
      if (!show) return;
      var season = show.seasons.find(function (s) { return s.number === entry.seasonNumber; }) || show.seasons[0];
      var episode = season.episodes.find(function (e) { return e.id === entry.episodeId; });
      if (!episode) return;
      var q = season.episodes.map(function (ep) { return episodeTrack(show, season, ep); });
      var i = season.episodes.findIndex(function (ep) { return ep.id === episode.id; });
      open(q[i], { queue: q, index: i, startAt: entry.position });
    } else {
      SEEK.toast("Resume is available for films and episodes.");
    }
  }

  SEEK.player = { open: open, close: close, toggle: toggle };
  SEEK.playMovie = playMovie;
  SEEK.playEpisode = playEpisode;
  SEEK.openTrailer = openTrailer;
  SEEK.openTrailerById = openTrailerById;
  SEEK.openTrailerList = openTrailerList;
  SEEK.resumeEntry = resumeEntry;
  SEEK.trackFrom = { movie: moviePartTrack, episode: episodeTrack, trailer: trailerTrack };
})();
