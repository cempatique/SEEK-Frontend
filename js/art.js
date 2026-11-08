/* ==========================================================================
   SEEK — artwork and icon set
   Posters, backdrops and wide art prefer the YouTube trailer thumbnail that
   scripts/fetch-youtube-trailers.js writes into js/youtube-trailers.js.
   When a title has no fetched thumbnail the artwork falls back to locally
   generated SVG, so the catalogue still works fully offline.
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var DATA = SEEK.DATA;
  var cache = {};

  function xmlEscape(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function wrapText(text, max) {
    var words = String(text).split(/\s+/).filter(Boolean);
    var lines = [], current = "";
    words.forEach(function (word) {
      if (!current.length) { current = word; return; }
      if ((current + " " + word).length <= max) current += " " + word;
      else { lines.push(current); current = word; }
    });
    if (current) lines.push(current);
    return lines.length ? lines : ["SEEK"];
  }

  function makeArt(item, opts) {
    opts = opts || {};
    item = item || { title: "SEEK" };
    var w = opts.w || 600, h = opts.h || 900, minimal = !!opts.minimal;
    var key = (item.id || item.title) + "|" + w + "x" + h + "|" + (minimal ? 1 : 0) + "|" + (opts.label || "");
    if (cache[key]) return cache[key];

    var seed = SEEK.hashString((item.title || "SEEK") + (item.id || ""));
    var p = DATA.palettes[seed % DATA.palettes.length];
    var p2 = DATA.palettes[(seed + 5) % DATA.palettes.length];
    var uid = "a" + (seed % 99991).toString(36) + w;
    var title = item.title || "SEEK";
    var genre = (item.genres && item.genres[0]) || item.genre || "";
    var meta = [item.year, genre].filter(Boolean).join("  ·  ");
    var lines = wrapText(title, w > 700 ? 22 : 15).slice(0, 3);
    var fs = w > 700 ? (lines.length > 2 ? 40 : 48) : (lines.length > 2 ? 27 : lines.length > 1 ? 32 : 38);
    var lh = Math.round(fs * 1.1);
    var blockBottom = h - Math.round(h * 0.09);
    var titleTop = blockBottom - (lines.length - 1) * lh;
    var watermark = (title.charAt(0) || "S").toUpperCase();
    var motif = "", m = seed % 5;
    var cx = w * 0.78, cy = h * 0.24;

    if (m === 0) {
      motif = [0.9, 0.66, 0.42].map(function (scale, i) {
        return '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.min(w, h) * 0.3 * scale + '" fill="none" stroke="' + p.accent + '" stroke-width="' + (i === 0 ? 2 : 1.2) + '" opacity="' + (0.3 - i * 0.07) + '"/>';
      }).join("");
    } else if (m === 1) {
      var stripes = "";
      for (var i = 0; i < 9; i++) {
        stripes += '<line x1="' + (-w * 0.1 + i * w * 0.16) + '" y1="' + (h * 0.05) + '" x2="' + (w * 0.05 + i * w * 0.16) + '" y2="' + (h * 0.72) + '" stroke="' + p.accent + '" stroke-width="1" opacity="0.16"/>';
      }
      motif = stripes;
    } else if (m === 2) {
      var dots = "";
      for (var gx = 0; gx < 6; gx++) {
        for (var gy = 0; gy < 6; gy++) {
          dots += '<circle cx="' + (w * 0.42 + gx * w * 0.085) + '" cy="' + (h * 0.12 + gy * w * 0.085) + '" r="2.2" fill="' + p.accent + '" opacity="' + (0.1 + ((gx + gy) % 4) * 0.05) + '"/>';
        }
      }
      motif = dots;
    } else if (m === 3) {
      motif = '<path d="M ' + (w * 0.52) + ' ' + (h * 0.62) + ' L ' + (w * 0.76) + ' ' + (h * 0.14) + ' L ' + w + ' ' + (h * 0.62) + ' Z" fill="none" stroke="' + p.accent + '" stroke-width="1.6" opacity="0.28"/>' +
        '<path d="M ' + (w * 0.64) + ' ' + (h * 0.62) + ' L ' + (w * 0.82) + ' ' + (h * 0.27) + ' L ' + w + ' ' + (h * 0.62) + ' Z" fill="' + p.accent + '" opacity="0.07"/>';
    } else {
      motif = '<circle cx="' + (w * 0.72) + '" cy="' + (h * 0.3) + '" r="' + (Math.min(w, h) * 0.2) + '" fill="' + p.glow + '" opacity="0.2"/>' +
        '<rect x="0" y="' + (h * 0.55) + '" width="' + w + '" height="2" fill="' + p.accent + '" opacity="0.35"/>' +
        '<rect x="0" y="' + (h * 0.56) + '" width="' + w + '" height="' + (h * 0.44) + '" fill="' + p.bg1 + '" opacity="0.35"/>';
    }

    var textSvg = "";
    if (!minimal) {
      var topLabel = genre.toUpperCase();
      if (item.badge) topLabel = String(item.badge).toUpperCase();
      textSvg += '<text x="' + (w * 0.075) + '" y="' + (h * 0.085) + '" font-family="Segoe UI, Arial, sans-serif" font-size="' + Math.round(w * 0.027) + '" letter-spacing="3" fill="' + p.accent + '" opacity="0.92">' + xmlEscape(topLabel) + '</text>';
      textSvg += '<text x="' + (w * 0.925) + '" y="' + (h * 0.085) + '" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="' + Math.round(w * 0.024) + '" letter-spacing="5" fill="' + p.ink + '" opacity="0.45">SEEK</text>';
      textSvg += '<rect x="' + (w * 0.075) + '" y="' + (titleTop - fs - 14) + '" width="' + Math.round(w * 0.09) + '" height="' + Math.max(2, Math.round(w * 0.006)) + '" fill="' + p.accent + '"/>';
      lines.forEach(function (line, idx) {
        textSvg += '<text x="' + (w * 0.075) + '" y="' + (titleTop + idx * lh) + '" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="' + fs + '" letter-spacing="-1" fill="' + p.ink + '">' + xmlEscape(line) + '</text>';
      });
      textSvg += '<text x="' + (w * 0.075) + '" y="' + (h - Math.round(h * 0.038)) + '" font-family="Segoe UI, Arial, sans-serif" font-size="' + Math.round(w * 0.031) + '" letter-spacing="1" fill="' + p.ink + '" opacity="0.72">' + xmlEscape(meta) + '</text>';
      if (opts.label) {
        textSvg += '<text x="' + (w * 0.925) + '" y="' + (h - Math.round(h * 0.038)) + '" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="' + Math.round(w * 0.023) + '" letter-spacing="2" fill="' + p.accent + '" opacity="0.85">' + xmlEscape(opts.label) + '</text>';
      }
    } else if (opts.label) {
      textSvg += '<text x="' + (w * 0.06) + '" y="' + (h * 0.9) + '" font-family="Segoe UI, Arial, sans-serif" font-size="' + Math.round(w * 0.022) + '" letter-spacing="3" fill="' + p.ink + '" opacity="0.7">' + xmlEscape(opts.label) + '</text>';
    }

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
      '<defs>' +
      '<linearGradient id="bg' + uid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p.bg1 + '"/><stop offset="1" stop-color="' + p.bg2 + '"/></linearGradient>' +
      '<radialGradient id="glow' + uid + '" cx="0.78" cy="0.22" r="0.75"><stop offset="0" stop-color="' + p.glow + '" stop-opacity="0.4"/><stop offset="1" stop-color="' + p.glow + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="glow2' + uid + '" cx="0.16" cy="0.85" r="0.7"><stop offset="0" stop-color="' + p2.accent + '" stop-opacity="0.24"/><stop offset="1" stop-color="' + p2.accent + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="fade' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.bg1 + '" stop-opacity="0"/><stop offset="1" stop-color="' + p.bg1 + '" stop-opacity="0.92"/></linearGradient>' +
      '<pattern id="grain' + uid + '" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.45" fill="' + p.ink + '" opacity="0.08"/><circle cx="3" cy="3" r="0.35" fill="' + p.ink + '" opacity="0.05"/></pattern>' +
      '</defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#bg' + uid + ')"/>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#glow' + uid + ')"/>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#glow2' + uid + ')"/>' +
      '<text x="' + (w * 0.5) + '" y="' + (h * 0.64) + '" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="' + Math.round(h * 0.62) + '" fill="' + p.ink + '" opacity="0.045">' + xmlEscape(watermark) + '</text>' +
      motif +
      '<rect x="0" y="' + (h * 0.55) + '" width="' + w + '" height="' + (h * 0.45) + '" fill="url(#fade' + uid + ')"/>' +
      textSvg +
      '<rect width="' + w + '" height="' + h + '" fill="url(#grain' + uid + ')"/>' +
      '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.08"/>' +
      '</svg>';

    var uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    cache[key] = uri;
    return uri;
  }

  function trailerArt(item) {
    if (!item || !item.id) return "";
    var map = window.SEEK_YOUTUBE_TRAILERS;
    var tr = map && map[item.id];
    return tr && tr.thumbnail ? tr.thumbnail : "";
  }

  function poster(item) {
    var art = trailerArt(item);
    if (art) return art;
    return SEEK.prefs.lowData ? makeArt(item, { w: 240, h: 360 }) : makeArt(item, { w: 420, h: 630 });
  }

  function wideArt(item, label) {
    var art = trailerArt(item);
    if (art) return art;
    return SEEK.prefs.lowData ? makeArt(item, { w: 480, h: 270, minimal: true, label: label }) : makeArt(item, { w: 960, h: 540, minimal: true, label: label });
  }

  function backdrop(item) {
    var art = trailerArt(item);
    if (art) return art;
    return makeArt(item, { w: 1600, h: 900, minimal: true });
  }

  function avatar(person) {
    if (person && person.photo) return encodeURI(person.photo);
    var seed = SEEK.hashString(person.name + (person.id || ""));
    var p = DATA.palettes[(person.seed || seed) % DATA.palettes.length];
    var initials = String(person.name || "S").split(/\s+/).map(function (x) { return x.charAt(0); }).join("").slice(0, 2).toUpperCase();
    var key = "avatar|" + person.name + (person.id || "");
    if (cache[key]) return cache[key];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">' +
      '<defs><linearGradient id="av" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p.bg2 + '"/><stop offset="1" stop-color="' + p.bg1 + '"/></linearGradient></defs>' +
      '<rect width="200" height="200" fill="url(#av)"/>' +
      '<circle cx="100" cy="100" r="66" fill="none" stroke="' + p.accent + '" stroke-width="1.5" opacity="0.55"/>' +
      '<circle cx="100" cy="100" r="52" fill="' + p.accent + '" opacity="0.1"/>' +
      '<text x="100" y="118" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="58" letter-spacing="1" fill="' + p.ink + '">' + xmlEscape(initials) + '</text>' +
      '<rect x="1" y="1" width="198" height="198" fill="none" stroke="' + p.ink + '" stroke-opacity="0.12"/>' +
      '</svg>';
    var uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    cache[key] = uri;
    return uri;
  }

  /* Feather-inspired icon paths (MIT licensed). */
  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3"/>',
    heart: '<path d="M12 20.7S4.5 16 4.5 9.9A4.4 4.4 0 0 1 12 6.6a4.4 4.4 0 0 1 7.5 3.3c0 6.1-7.5 10.8-7.5 10.8z"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M4.5 12.5l5 5L20 6.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "chevron-left": '<path d="M15 5l-7 7 7 7"/>',
    "chevron-right": '<path d="M9 5l7 7-7 7"/>',
    "chevron-down": '<path d="M6 9l6 6 6-6"/>',
    "arrow-right": '<path d="M4 12h16M14 6l6 6-6 6"/>',
    "arrow-up": '<path d="M12 20V4M6 10l6-6 6 6"/>',
    star: '<path d="M12 3.2l2.7 5.5 6 .9-4.35 4.2 1.03 6-5.38-2.83L6.6 19.8l1.03-6L3.3 9.6l6-.9z" fill="currentColor" stroke="none"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.6-4 3.6-6.2 7.5-6.2s6.9 2.2 7.5 6.2"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.9l7.6-4.4M8.2 13.1l7.6 4.4"/>',
    flag: '<path d="M5 21V4h9l-1 3h6l-2 5 2 5h-7l-1-3H5"/>',
    film: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"/>',
    tv: '<rect x="2.5" y="6" width="19" height="13" rx="2"/><path d="M8 2l4 4 4-4M8 22h8"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z"/>',
    sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    volume: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a4.8 4.8 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12"/>',
    "volume-x": '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 6M21 9l-5 6"/>',
    fullscreen: '<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/>',
    "skip-back": '<path d="M18 5v14L7 12z" fill="currentColor" stroke="none"/><path d="M5 5v14"/>',
    "skip-forward": '<path d="M6 5v14l11-7z" fill="currentColor" stroke="none"/><path d="M19 5v14"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    logout: '<path d="M9 21H4V3h5M14 16l5-4-5-4M19 12H9"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    message: '<path d="M21 12a8 8 0 0 1-8 8H4l2-4a8 8 0 1 1 15-4z"/>',
    send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3 3.8M6.6 6.6C4 8.5 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4.1-.9"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/>',
    "external-link": '<path d="M14 3h7v7M21 3l-9 9M20 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"/>',
    subtitles: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M6 10h5M6 14h9M15 10h3M17 15h1M6 18h8"/>',
    mic: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    bar: '<path d="M4 20V10M10 20V4M16 20v-7M22 20v-4"/>',
    shield: '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
  };

  function icon(name, cls) {
    return '<svg class="icon' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || ICONS.film) + "</svg>";
  }

  SEEK.art = makeArt;
  SEEK.poster = poster;
  SEEK.wideArt = wideArt;
  SEEK.backdrop = backdrop;
  SEEK.avatar = avatar;
  SEEK.icon = icon;
})();
