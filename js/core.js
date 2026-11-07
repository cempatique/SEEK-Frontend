/* ==========================================================================
   SEEK — core utilities, preferences and catalogue access
   ========================================================================== */
(function () {
  "use strict";

  var SEEK = window.SEEK = window.SEEK || {};
  var DATA = window.SEEK_DATA;
  var readyQueue = [];
  var booted = false;

  SEEK.DATA = DATA;
  SEEK.VERSION = "1.0.0";
  SEEK.SUPPORTED_LANGS = ["en", "rw", "lg", "fr", "sw"];

  /* ------------------------------ DOM + text ------------------------------ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function hashString(str) {
    var h = 2166136261;
    str = String(str);
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function debounce(fn, wait) {
    var timer;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  /* ------------------------------ Storage --------------------------------- */
  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (err) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (err) { return false; }
  }

  function remove(key) {
    try { localStorage.removeItem(key); } catch (err) { /* ignore */ }
  }

  /* ------------------------------ Formatting ------------------------------ */
  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds || 0));
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = seconds % 60;
    return h ? h + ":" + pad(m) + ":" + pad(s) : m + ":" + pad(s);
  }

  function parseDuration(str) {
    if (!str) return 120;
    var parts = String(str).split(":").map(Number);
    if (parts.some(function (n) { return isNaN(n); })) return 120;
    return parts.reduce(function (total, part) { return total * 60 + part; }, 0);
  }

  function relativeDate(iso) {
    if (!iso) return "";
    var stamp = new Date(String(iso).slice(0, 10) + "T12:00:00").getTime();
    if (isNaN(stamp)) return "";
    var days = Math.floor((Date.now() - stamp) / 86400000);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return days + " days ago";
    var months = Math.floor(days / 30);
    if (months < 12) return months + (months === 1 ? " month ago" : " months ago");
    return Math.floor(months / 12) + " years ago";
  }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  function qs(name, fallback) {
    try { return new URLSearchParams(location.search).get(name) || fallback; }
    catch (err) { return fallback; }
  }

  function debounceInput(node, fn, wait) {
    var handler = debounce(fn, wait || 180);
    node.addEventListener("input", handler);
    node.addEventListener("search", handler);
  }

  /* ------------------------------ Preferences ----------------------------- */
  var PREF_KEY = "seek.prefs.v2";
  var DEFAULT_PREFS = {
    lang: "en",
    accent: "lime",
    lowData: false,
    mutedTrailers: false,
    hiddenShelves: []
  };

  function getPrefs() {
    var stored = read(PREF_KEY, {}) || {};
    var out = {};
    Object.keys(DEFAULT_PREFS).forEach(function (key) {
      out[key] = stored[key] != null ? stored[key] : DEFAULT_PREFS[key];
    });
    if (SEEK.SUPPORTED_LANGS.indexOf(out.lang) === -1) out.lang = "en";
    if (["lime", "violet", "orange"].indexOf(out.accent) === -1) out.accent = "lime";
    if (!Array.isArray(out.hiddenShelves)) out.hiddenShelves = [];
    return out;
  }

  var prefs = getPrefs();
  SEEK.prefs = prefs;
  SEEK.getPrefs = getPrefs;

  function setPref(key, value, options) {
    options = options || {};
    prefs[key] = value;
    write(PREF_KEY, prefs);
    if (key === "lang") {
      document.documentElement.lang = value;
      if (options.reload !== false) location.reload();
      return;
    }
    applyTheme();
    document.dispatchEvent(new CustomEvent("seek:pref", { detail: { key: key, value: value } }));
  }

  function applyTheme() {
    var root = document.documentElement;
    root.setAttribute("data-accent", prefs.accent);
    root.classList.toggle("low-data", !!prefs.lowData);
    var motor = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.toggle("reduce-motion", !!motor);
    root.lang = prefs.lang;
  }

  /* ------------------------------ Catalogue ------------------------------- */
  var CATALOG_KEY = "seek.catalog.v2";

  function getCatalog() {
    var stored = read(CATALOG_KEY, null);
    if (stored && Array.isArray(stored.movies) && Array.isArray(stored.shows)) return stored;
    return DATA;
  }

  function saveCatalog(catalog) {
    catalog.updatedAt = new Date().toISOString();
    return write(CATALOG_KEY, catalog);
  }

  function resetCatalog() { remove(CATALOG_KEY); }

  function get(type, id) {
    var cat = getCatalog();
    if (type === "movie" || type === "movies") return cat.movies.find(function (m) { return m.id === id; }) || null;
    if (type === "show" || type === "tv") return cat.shows.find(function (s) { return s.id === id; }) || null;
    if (type === "translator") return cat.translators.find(function (x) { return x.id === id; }) || null;
    if (type === "trailer") return findTrailer(id);
    return null;
  }

  function findTrailer(id) {
    var cat = getCatalog();
    var tr = cat.trailers.find(function (x) { return x.id === id; });
    if (!tr) return null;
    var ref = get(tr.refType, tr.refId);
    if (!ref) return null;
    return {
      id: tr.id, refType: tr.refType, refId: tr.refId, category: tr.category,
      duration: tr.duration, desc: tr.desc, title: ref.title, item: ref
    };
  }

  function getTrailerFor(type, id) {
    return getCatalog().trailers.find(function (tr) { return tr.refType === type && tr.refId === id; }) || null;
  }

  function translatorLabel(item) {
    if (!item) return "";
    if (!item.translatorId) return item.language || "";
    var tr = get("translator", item.translatorId);
    if (!tr) return item.language || "";
    var others = tr.languages.filter(function (l) { return l !== "English"; });
    return others.length ? others[0] : (item.language || "English");
  }

  function translatorName(id) {
    var tr = get("translator", id);
    return tr ? tr.name : "";
  }

  function moviesForTranslator(id) {
    return getCatalog().movies.filter(function (m) { return m.translatorId === id; });
  }

  function showsForTranslator(id) {
    return getCatalog().shows.filter(function (s) { return s.translatorId === id; });
  }

  function getGenres() {
    var catalog = getCatalog();
    return Array.isArray(catalog.genres) && catalog.genres.length ? catalog.genres : DATA.genres;
  }

  function allEpisodes() {
    var out = [];
    getCatalog().shows.forEach(function (show) {
      show.seasons.forEach(function (season) {
        season.episodes.forEach(function (ep) {
          out.push({ show: show, season: season, episode: ep });
        });
      });
    });
    return out;
  }

  /* ------------------------------ Ready queue ----------------------------- */
  function ready(fn) {
    if (booted) { fn(); return; }
    readyQueue.push(fn);
  }

  function markBooted() {
    booted = true;
    var queue = readyQueue.slice();
    readyQueue = [];
    queue.forEach(function (fn) {
      try { fn(); } catch (err) { console.error("[SEEK] page init failed", err); }
    });
  }

  function on(eventName, handler) {
    document.addEventListener(eventName, handler);
    return function () { document.removeEventListener(eventName, handler); };
  }

  /* ------------------------------ Exports --------------------------------- */
  Object.assign(SEEK, {
    $: $, $$: $$, esc: esc, hashString: hashString, clone: clone, pad: pad, clamp: clamp,
    debounce: debounce, debounceInput: debounceInput,
    read: read, write: write, remove: remove,
    formatNumber: formatNumber, formatTime: formatTime, parseDuration: parseDuration,
    relativeDate: relativeDate, todayISO: todayISO, qs: qs,
    setPref: setPref, applyTheme: applyTheme,
    getCatalog: getCatalog, saveCatalog: saveCatalog, resetCatalog: resetCatalog,
    get: get, findTrailer: findTrailer, getTrailerFor: getTrailerFor,
    translatorLabel: translatorLabel, translatorName: translatorName,
    moviesForTranslator: moviesForTranslator, showsForTranslator: showsForTranslator,
    getGenres: getGenres, allEpisodes: allEpisodes,
    ready: ready, markBooted: markBooted, on: on
  });
})();
