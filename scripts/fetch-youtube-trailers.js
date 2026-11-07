/* ==========================================================================
   SEEK — fetch trailer metadata and thumbnails from the YouTube Data API.

   Usage:
     1. Put your API key in .env:  YOUTUBE_API_KEY=xxxxxxxx
     2. Run:  node scripts/fetch-youtube-trailers.js
        (add --force to refresh entries that already exist)

   The script reads the catalogue from js/data.js, searches YouTube for each
   title's official trailer, and rewrites js/youtube-trailers.js. The API key
   never leaves this build step and is never written to browser code.
   ========================================================================== */
"use strict";

var fs = require("fs");
var path = require("path");
var https = require("https");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..");
var DATA_FILE = path.join(ROOT, "js", "data.js");
var OUT_FILE = path.join(ROOT, "js", "youtube-trailers.js");
var ENV_FILE = path.join(ROOT, ".env");
var FORCE = process.argv.indexOf("--force") !== -1;

/* Hand-picked official trailers for titles where a plain search picks a
   remake, teaser, reaction or text-heavy reupload. */
var VIDEO_OVERRIDES = {
  m4: "Qwe6qXFTdgc",   // Inception — Warner Bros.
  m6: "isOGD_7hNIY",   // Parasite — NEON
  m9: "giXco2jaZ_4",   // Top Gun: Maverick — Paramount Pictures
  m10: "mqqft2x_Aa4",  // The Batman — Warner Bros. main trailer
  s2: "VaOt6tXyf2Y",   // Breaking Bad — official channel trailer
  s6: "_InqQJRqGW4",   // Money Heist — Netflix
  s8: "LIFeFoPkEVE"    // The Queen's Gambit — official 4K trailer
};

function readEnv(file) {
  var out = {};
  if (!fs.existsSync(file)) return out;
  fs.readFileSync(file, "utf8").split(/\r?\n/).forEach(function (line) {
    var match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!match || /^\s*#/.test(line)) return;
    var value = match[2].trim();
    if ((value[0] === '"' && value[value.length - 1] === '"') || (value[0] === "'" && value[value.length - 1] === "'")) {
      value = value.slice(1, -1);
    }
    out[match[1]] = value;
  });
  return out;
}

function loadCatalog() {
  var sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(DATA_FILE, "utf8"), sandbox, { filename: DATA_FILE });
  return sandbox.window.SEEK_DATA;
}

function loadExisting() {
  if (!fs.existsSync(OUT_FILE)) return {};
  try {
    var sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(OUT_FILE, "utf8"), sandbox, { filename: OUT_FILE });
    return sandbox.window.SEEK_YOUTUBE_TRAILERS || {};
  } catch (err) {
    return {};
  }
}

function getJson(url) {
  return new Promise(function (resolve, reject) {
    https.get(url, function (res) {
      var body = "";
      res.setEncoding("utf8");
      res.on("data", function (chunk) { body += chunk; });
      res.on("end", function () {
        var json;
        try { json = JSON.parse(body); }
        catch (err) { reject(new Error("Invalid JSON from YouTube (" + res.statusCode + ")")); return; }
        if (res.statusCode < 200 || res.statusCode >= 300 || json.error) {
          var reason = json.error && json.error.errors && json.error.errors[0] && json.error.errors[0].reason;
          reject(new Error((reason || "HTTP " + res.statusCode) + ": " + (json.error && json.error.message || "YouTube request failed")));
          return;
        }
        resolve(json);
      });
    }).on("error", reject);
  });
}

function delay(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function scoreResult(result, title) {
  var needle = title.toLowerCase();
  var text = String(result.snippet && result.snippet.title || "").toLowerCase();
  var channel = String(result.snippet && result.snippet.channelTitle || "").toLowerCase();
  var score = 0;

  if (text.indexOf("official trailer") !== -1) score += 5;
  else if (text.indexOf("trailer") !== -1) score += 2;
  if (text.indexOf(needle) !== -1) score += 2;
  if (/netflix|hbo|max|warner|universal|sony|disney|paramount|apple|a24|lionsgate|amazon|prime video/.test(channel)) score += 3;
  if (/reaction|review|breakdown|explained|fan made|fan-made|concept|behind the scenes|interview/.test(text)) score -= 12;
  return score;
}

function isoDurationToClock(iso) {
  var match = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || "");
  if (!match) return "";
  var minutes = (parseInt(match[1] || "0", 10) * 1440) + (parseInt(match[2] || "0", 10) * 60) + parseInt(match[3] || "0", 10);
  var seconds = parseInt(match[4] || "0", 10);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function bestThumbnail(thumbnails) {
  if (!thumbnails) return "";
  var order = ["maxres", "standard", "high", "medium", "default"];
  for (var i = 0; i < order.length; i++) {
    if (thumbnails[order[i]] && thumbnails[order[i]].url) return thumbnails[order[i]].url;
  }
  return "";
}

async function findTrailer(item, key) {
  var videoId = VIDEO_OVERRIDES[item.id];

  if (!videoId) {
    var query = encodeURIComponent(item.title + " official trailer");
    var searchUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=" + query + "&key=" + encodeURIComponent(key);
    var search = await getJson(searchUrl);
    var results = (search.items || []).filter(function (r) { return r.id && r.id.videoId; });
    if (!results.length) throw new Error("no search results");

    results.sort(function (a, b) { return scoreResult(b, item.title) - scoreResult(a, item.title); });
    videoId = results[0].id.videoId;
  }

  var detailUrl = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=" + encodeURIComponent(videoId) + "&key=" + encodeURIComponent(key);
  var details = await getJson(detailUrl);
  var video = (details.items || [])[0];
  if (!video) throw new Error("video details unavailable");

  return {
    videoId: videoId,
    title: video.snippet.title,
    channel: video.snippet.channelTitle,
    duration: isoDurationToClock(video.contentDetails.duration),
    thumbnail: bestThumbnail(video.snippet.thumbnails)
  };
}

function writeOutput(map) {
  var ids = Object.keys(map).sort(function (a, b) {
    var na = parseInt(String(a).replace(/\D/g, ""), 10) || 0;
    var nb = parseInt(String(b).replace(/\D/g, ""), 10) || 0;
    if (a.charAt(0) === b.charAt(0)) return na - nb;
    return a < b ? -1 : 1;
  });
  var sorted = {};
  ids.forEach(function (id) { sorted[id] = map[id]; });

  var header = "/* ==========================================================================\n" +
    "   SEEK — YouTube trailer index (generated)\n" +
    "   Run `node scripts/fetch-youtube-trailers.js` after setting\n" +
    "   YOUTUBE_API_KEY in .env. Do not edit by hand; re-run the script.\n" +
    "   ========================================================================== */\n";
  var body = "window.SEEK_YOUTUBE_TRAILERS = " + JSON.stringify(sorted, null, 2) + ";\n";
  fs.writeFileSync(OUT_FILE, header + body, "utf8");
}

async function main() {
  var env = readEnv(ENV_FILE);
  var key = env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
  var data = loadCatalog();
  var items = (data.movies || []).concat(data.shows || []);
  var existing = FORCE ? {} : loadExisting();
  var map = {};
  var fetched = 0;
  var failed = 0;
  var missing = [];

  items.forEach(function (item) {
    if (existing[item.id] && existing[item.id].videoId) map[item.id] = existing[item.id];
    else missing.push(item);
  });

  if (missing.length && !key) {
    console.error("YOUTUBE_API_KEY is missing or empty in .env.");
    console.error("Add your key, then run: node scripts/fetch-youtube-trailers.js");
    process.exitCode = 1;
    return;
  }

  console.log("Catalogue: " + items.length + " titles, " + missing.length + " to fetch.");

  for (var i = 0; i < missing.length; i++) {
    var item = missing[i];
    process.stdout.write("[" + (i + 1) + "/" + missing.length + "] " + item.title + " ... ");
    try {
      map[item.id] = await findTrailer(item, key);
      fetched++;
      console.log(map[item.id].duration + "  " + map[item.id].channel);
    } catch (err) {
      failed++;
      console.log("FAILED (" + err.message + ")");
      if (existing[item.id]) map[item.id] = existing[item.id];
    }
    await delay(250);
  }

  writeOutput(map);
  console.log("Wrote " + OUT_FILE);
  console.log("Fetched: " + fetched + ", reused: " + (items.length - missing.length) + ", failed: " + failed);
  if (failed) process.exitCode = 1;
}

main().catch(function (err) {
  console.error(err.message);
  process.exitCode = 1;
});
