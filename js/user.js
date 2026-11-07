/* ==========================================================================
   SEEK — local accounts, library, progress, reviews and reports
   Demo storage only. In production these flows must be backed by a secure
   API, server-side password hashing (Argon2/bcrypt) and a real database.
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var DATA = SEEK.DATA;

  var USERS_KEY = "seek.users.v1";
  var SESSION_KEY = "seek.session.v1";
  var RESET_KEY = "seek.resets.v1";
  var FAV_KEY = "seek.favorites.v1";
  var LIST_KEY = "seek.watchlist.v1";
  var HISTORY_KEY = "seek.history.v1";
  var PROGRESS_KEY = "seek.progress.v1";
  var REVIEW_KEY = "seek.reviews.v1";
  var REVIEW_HIDDEN_KEY = "seek.reviews.hidden.v1";
  var REVIEW_VOTES_KEY = "seek.review.votes.v1";
  var REPORT_KEY = "seek.reports.v1";
  var PARTY_KEY = "seek.party.v1";

  /* ------------------------------ Hashing --------------------------------- */
  function sha256(ascii) {
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
    var mathPow = Math.pow, maxWord = mathPow(2, 32), result = "", words = [], asciiBitLength = ascii.length * 8;
    var hash = sha256.h = sha256.h || [], k = sha256.k = sha256.k || [], primeCounter = k.length, isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += "\x80";
    while (ascii.length % 64 - 56) ascii += "\x00";
    for (var i = 0; i < ascii.length; i++) {
      var j = ascii.charCodeAt(i);
      if (j >> 8) return "";
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;
    for (var j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), oldHash = hash;
      hash = hash.slice(0, 8);
      for (var i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var temp1 = hash[7] + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (var i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (var i = 0; i < 8; i++) {
      for (var j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? "0" : "") + b.toString(16);
      }
    }
    return result;
  }

  function hashPassword(password) {
    return sha256("seek.demo.v1::" + encodeURIComponent(String(password)));
  }

  function randomId(prefix) {
    var rand = "";
    if (window.crypto && window.crypto.getRandomValues) {
      var buf = new Uint32Array(2);
      window.crypto.getRandomValues(buf);
      rand = buf[0].toString(36) + buf[1].toString(36);
    } else {
      rand = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    return (prefix || "id") + "_" + rand.slice(0, 12);
  }

  function normalizeType(type) {
    if (type === "tv") return "show";
    if (type === "movies") return "movie";
    return type;
  }

  function emitAuth() { document.dispatchEvent(new CustomEvent("seek:auth")); }

  /* ------------------------------ Users ----------------------------------- */
  function readUsers() { return SEEK.read(USERS_KEY, []); }
  function writeUsers(users) { SEEK.write(USERS_KEY, users); }
  function sanitize(user) {
    if (!user) return null;
    return {
      id: user.id, name: user.name, email: user.email, role: user.role,
      joined: user.joined, bio: user.bio || "", avatarSeed: user.avatarSeed || 0,
      isAdmin: user.role === "admin"
    };
  }

  function ensureSeedUsers() {
    var users = readUsers();
    if (!users.length) {
      var now = new Date().toISOString();
      users = [
        {
          id: "u_admin", name: "SEEK Admin", email: DATA.demoAccounts.admin.email,
          passwordHash: hashPassword(DATA.demoAccounts.admin.password), role: "admin",
          joined: "2024-02-10", bio: "Programming, catalogue quality and community operations.",
          avatarSeed: 4
        },
        {
          id: "u_viewer", name: "Demo Viewer", email: DATA.demoAccounts.viewer.email,
          passwordHash: hashPassword(DATA.demoAccounts.viewer.password), role: "user",
          joined: now.slice(0, 10), bio: "Here for translated cinema and late-night sci-fi.",
          avatarSeed: 9
        }
      ];
      writeUsers(users);
    }
  }

  function currentUser() {
    var email = SEEK.read(SESSION_KEY, null);
    if (!email) return null;
    var user = readUsers().find(function (u) { return u.email === email; });
    if (!user) { SEEK.remove(SESSION_KEY); return null; }
    return sanitize(user);
  }

  function login(email, password) {
    email = String(email || "").trim().toLowerCase();
    var user = readUsers().find(function (u) { return u.email === email; });
    if (!user || user.passwordHash !== hashPassword(password)) {
      return { ok: false, message: SEEK.t("auth.invalid") };
    }
    SEEK.write(SESSION_KEY, user.email);
    emitAuth();
    return { ok: true, user: sanitize(user) };
  }

  function register(payload) {
    var name = String(payload.name || "").trim();
    var email = String(payload.email || "").trim().toLowerCase();
    var password = String(payload.password || "");
    var confirm = String(payload.confirm || "");
    if (name.length < 2) return { ok: false, field: "name", message: "Please enter your display name." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, field: "email", message: "Enter a valid email address." };
    if (password.length < 8) return { ok: false, field: "password", message: SEEK.t("auth.passwordShort") };
    if (password !== confirm) return { ok: false, field: "confirm", message: SEEK.t("auth.passwordMismatch") };
    var users = readUsers();
    if (users.some(function (u) { return u.email === email; })) {
      return { ok: false, field: "email", message: SEEK.t("auth.emailTaken") };
    }
    var user = {
      id: randomId("u"), name: name, email: email, passwordHash: hashPassword(password),
      role: "user", joined: SEEK.todayISO(), bio: "", avatarSeed: Math.floor(Math.random() * 12)
    };
    users.push(user);
    writeUsers(users);
    SEEK.write(SESSION_KEY, user.email);
    emitAuth();
    return { ok: true, user: sanitize(user), message: SEEK.t("auth.created") };
  }

  function logout() {
    SEEK.remove(SESSION_KEY);
    emitAuth();
    return { ok: true };
  }

  function updateProfile(patch) {
    var current = currentUser();
    if (!current) return { ok: false, message: "Sign in first." };
    var users = readUsers();
    var user = users.find(function (u) { return u.email === current.email; });
    if (!user) return { ok: false };
    if (patch.name != null) user.name = String(patch.name).trim().slice(0, 60) || user.name;
    if (patch.bio != null) user.bio = String(patch.bio).slice(0, 280);
    if (patch.avatarSeed != null) user.avatarSeed = Number(patch.avatarSeed) || 0;
    writeUsers(users);
    emitAuth();
    return { ok: true, user: sanitize(user) };
  }

  function changePassword(currentPassword, newPassword) {
    var current = currentUser();
    if (!current) return { ok: false, message: "Sign in first." };
    var users = readUsers();
    var user = users.find(function (u) { return u.email === current.email; });
    if (!user) return { ok: false };
    if (user.passwordHash !== hashPassword(currentPassword)) return { ok: false, field: "current", message: "Current password is incorrect." };
    if (String(newPassword).length < 8) return { ok: false, field: "new", message: SEEK.t("auth.passwordShort") };
    user.passwordHash = hashPassword(newPassword);
    writeUsers(users);
    return { ok: true, message: "Password updated." };
  }

  function requestReset(email) {
    email = String(email || "").trim().toLowerCase();
    var user = readUsers().find(function (u) { return u.email === email; });
    if (!user) return { ok: false, message: "No account uses that email address." };
    var codes = SEEK.read(RESET_KEY, {});
    var code = String(Math.floor(100000 + Math.random() * 900000));
    codes[email] = { code: code, expires: Date.now() + 15 * 60 * 1000 };
    SEEK.write(RESET_KEY, codes);
    return { ok: true, code: code, message: SEEK.t("auth.resetSent") };
  }

  function resetPassword(email, code, newPassword) {
    email = String(email || "").trim().toLowerCase();
    var codes = SEEK.read(RESET_KEY, {});
    var record = codes[email];
    if (!record || record.code !== String(code) || Date.now() > record.expires) {
      return { ok: false, message: "That reset code is invalid or has expired." };
    }
    if (String(newPassword).length < 8) return { ok: false, message: SEEK.t("auth.passwordShort") };
    var users = readUsers();
    var user = users.find(function (u) { return u.email === email; });
    if (!user) return { ok: false, message: "Account not found." };
    user.passwordHash = hashPassword(newPassword);
    writeUsers(users);
    delete codes[email];
    SEEK.write(RESET_KEY, codes);
    return { ok: true, message: "Password reset. You can sign in now." };
  }

  function listUsers() {
    return readUsers().map(sanitize);
  }

  function setRole(email, role) {
    var users = readUsers();
    var user = users.find(function (u) { return u.email === email; });
    if (!user) return false;
    if (user.role === "admin" && role !== "admin" && users.filter(function (u) { return u.role === "admin"; }).length <= 1) return false;
    user.role = role === "admin" ? "admin" : "user";
    writeUsers(users);
    emitAuth();
    return true;
  }

  function deleteUser(email) {
    var current = currentUser();
    if (current && current.email === email) return false;
    var users = readUsers().filter(function (u) { return u.email !== email; });
    writeUsers(users);
    emitAuth();
    return true;
  }

  SEEK.auth = {
    ensureSeedUsers: ensureSeedUsers, currentUser: currentUser, login: login, register: register,
    logout: logout, updateProfile: updateProfile, changePassword: changePassword,
    requestReset: requestReset, resetPassword: resetPassword, listUsers: listUsers,
    setRole: setRole, deleteUser: deleteUser
  };

  /* ------------------------------ Favorites ------------------------------- */
  function readMap(key) {
    var raw = SEEK.read(key, null) || {};
    return { movie: raw.movie || [], show: raw.show || [], trailer: raw.trailer || [] };
  }

  function makeLibrary(key, label) {
    function state() { return readMap(key); }
    function toggle(type, id) {
      type = normalizeType(type);
      var data = state();
      data[type] = data[type] || [];
      var index = data[type].indexOf(id);
      var added = index === -1;
      if (added) data[type].push(id); else data[type].splice(index, 1);
      SEEK.write(key, data);
      document.dispatchEvent(new CustomEvent("seek:library", { detail: { key: key, type: type, id: id, added: added } }));
      return added;
    }
    function has(type, id) { return (state()[normalizeType(type)] || []).indexOf(id) !== -1; }
    function remove(type, id) {
      type = normalizeType(type);
      var data = state();
      data[type] = (data[type] || []).filter(function (x) { return x !== id; });
      SEEK.write(key, data);
      document.dispatchEvent(new CustomEvent("seek:library", { detail: { key: key, type: type, id: id, added: false } }));
    }
    function ids(type) { return state()[normalizeType(type)] || []; }
    function count() { var data = state(); return data.movie.length + data.show.length + data.trailer.length; }
    function items() {
      var data = state();
      var out = [];
      ["movie", "show", "trailer"].forEach(function (type) {
        data[type].forEach(function (id) {
          var item = SEEK.get(type, id);
          if (item) out.push({ type: type, id: id, item: item, label: label });
        });
      });
      return out;
    }
    return { toggle: toggle, has: has, remove: remove, ids: ids, count: count, items: items, state: state };
  }

  var favs = makeLibrary(FAV_KEY, "favorites");
  var watchlist = makeLibrary(LIST_KEY, "watchlist");
  SEEK.favs = favs;
  SEEK.watchlist = watchlist;

  /* ------------------------------ History --------------------------------- */
  function trackView(type, id) {
    type = normalizeType(type);
    if (["movie", "show", "translator", "trailer"].indexOf(type) === -1) return;
    var list = SEEK.read(HISTORY_KEY, []);
    var key = type + ":" + id;
    list = list.filter(function (entry) { return entry.key !== key; });
    list.unshift({ key: key, type: type, id: id, at: Date.now() });
    SEEK.write(HISTORY_KEY, list.slice(0, 40));
  }

  function recent(limit) {
    return SEEK.read(HISTORY_KEY, []).slice(0, limit || 20).map(function (entry) {
      var item = SEEK.get(entry.type, entry.id);
      return item ? { type: entry.type, id: entry.id, item: item, at: entry.at } : null;
    }).filter(Boolean);
  }

  SEEK.history = { track: trackView, list: recent };
  SEEK.trackView = trackView;

  /* ------------------------------ Progress -------------------------------- */
  function progressState() { return SEEK.read(PROGRESS_KEY, {}); }

  function saveProgress(entry) {
    if (!entry || !entry.key) return;
    var state = progressState();
    state[entry.key] = Object.assign({}, state[entry.key] || {}, entry, { updatedAt: Date.now() });
    SEEK.write(PROGRESS_KEY, state);
    document.dispatchEvent(new CustomEvent("seek:progress", { detail: { entry: state[entry.key] } }));
  }

  function getProgress(key) { return progressState()[key] || null; }

  function removeProgress(key) {
    var state = progressState();
    delete state[key];
    SEEK.write(PROGRESS_KEY, state);
  }

  function continueWatching(limit) {
    var state = progressState();
    return Object.keys(state).map(function (key) {
      var entry = state[key];
      if (!entry.duration || entry.position < 5) return null;
      if (entry.position >= entry.duration - 8) return null;
      var art = SEEK.get(entry.artType || entry.type, entry.artId || entry.id);
      return { entry: entry, art: art };
    }).filter(Boolean).sort(function (a, b) { return b.entry.updatedAt - a.entry.updatedAt; }).slice(0, limit || 12);
  }

  SEEK.progress = {
    save: saveProgress, get: getProgress, remove: removeProgress,
    all: progressState, continueWatching: continueWatching
  };

  /* ------------------------------ Reviews --------------------------------- */
  function safeItem(itemId) {
    var item = SEEK.get("movie", itemId) || SEEK.get("show", itemId);
    return item;
  }

  function localReviews() { return SEEK.read(REVIEW_KEY, {}); }
  function hiddenSet() { return SEEK.read(REVIEW_HIDDEN_KEY, []); }

  function reviewsFor(itemId) {
    var hidden = hiddenSet();
    var seed = (DATA.seedReviews[itemId] || []).map(function (r) { return Object.assign({ seed: true }, r); });
    var local = (localReviews()[itemId] || []);
    var votes = SEEK.read(REVIEW_VOTES_KEY, []);
    return seed.concat(local).filter(function (r) { return hidden.indexOf(r.id) === -1; }).map(function (r) {
      return Object.assign({}, r, { isVoted: votes.indexOf(r.id) !== -1 });
    }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  }

  function reviewSummary(itemId) {
    var list = reviewsFor(itemId);
    if (!list.length) return { count: 0, average: 0 };
    var average = list.reduce(function (sum, r) { return sum + Number(r.rating || 0); }, 0) / list.length;
    return { count: list.length, average: Math.round(average * 10) / 10 };
  }

  function addReview(itemId, rating, text) {
    var user = currentUser();
    if (!user) return { ok: false, message: SEEK.t("common.signInToReview") };
    rating = SEEK.clamp(Math.round(Number(rating) || 0), 1, 5);
    text = String(text || "").trim();
    if (text.length < 4) return { ok: false, message: "Please write a little more." };
    var all = localReviews();
    all[itemId] = all[itemId] || [];
    var review = {
      id: randomId("rv"), name: user.name, email: user.email, rating: rating,
      text: text.slice(0, 800), date: SEEK.todayISO(), helpful: 0, own: true
    };
    all[itemId].push(review);
    SEEK.write(REVIEW_KEY, all);
    return { ok: true, review: review };
  }

  function voteReview(reviewId) {
    var votes = SEEK.read(REVIEW_VOTES_KEY, []);
    var voted = votes.indexOf(reviewId) !== -1;
    votes = voted ? votes.filter(function (id) { return id !== reviewId; }) : votes.concat([reviewId]);
    SEEK.write(REVIEW_VOTES_KEY, votes);
    return !voted;
  }

  function hideReview(reviewId) {
    var hidden = hiddenSet();
    if (hidden.indexOf(reviewId) === -1) hidden.push(reviewId);
    SEEK.write(REVIEW_HIDDEN_KEY, hidden);
  }

  function unhideReview(reviewId) {
    SEEK.write(REVIEW_HIDDEN_KEY, hiddenSet().filter(function (id) { return id !== reviewId; }));
  }

  function allReviews() {
    var hidden = hiddenSet();
    var out = [];
    Object.keys(DATA.seedReviews).forEach(function (itemId) {
      DATA.seedReviews[itemId].forEach(function (r) {
        out.push(Object.assign({ itemId: itemId, seed: true, hidden: hidden.indexOf(r.id) !== -1 }, r));
      });
    });
    var local = localReviews();
    Object.keys(local).forEach(function (itemId) {
      local[itemId].forEach(function (r) {
        out.push(Object.assign({ itemId: itemId, seed: false, hidden: hidden.indexOf(r.id) !== -1 }, r));
      });
    });
    return out.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  }

  SEEK.reviews = {
    forItem: reviewsFor, summary: reviewSummary, add: addReview, vote: voteReview,
    hide: hideReview, unhide: unhideReview, all: allReviews, isHidden: function (id) { return hiddenSet().indexOf(id) !== -1; }
  };

  /* ------------------------------ Reports --------------------------------- */
  function addReport(payload) {
    var reports = SEEK.read(REPORT_KEY, []);
    var report = Object.assign({
      id: randomId("rep"), date: new Date().toISOString(), status: "open"
    }, payload);
    reports.unshift(report);
    SEEK.write(REPORT_KEY, reports);
    return report;
  }

  SEEK.reports = { add: addReport, all: function () { return SEEK.read(REPORT_KEY, []); } };

  /* ------------------------------ Watch party ----------------------------- */
  function createParty(hostName) {
    var code = "SEEK-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    var room = { code: code, host: hostName || "Guest", createdAt: Date.now(), members: [hostName || "Guest"] };
    SEEK.write(PARTY_KEY, room);
    return room;
  }

  function joinParty(code, name) {
    var room = SEEK.read(PARTY_KEY, null);
    if (room && room.code === String(code).toUpperCase()) {
      if (room.members.indexOf(name) === -1) room.members.push(name);
      SEEK.write(PARTY_KEY, room);
      return room;
    }
    return null;
  }

  SEEK.party = { create: createParty, join: joinParty, current: function () { return SEEK.read(PARTY_KEY, null); } };
})();
