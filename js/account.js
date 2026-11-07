/* ==========================================================================
   SEEK — account, authentication and preferences
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;
  var mount = SEEK.$("#account-app");
  if (!mount) return;

  var LANG_LABELS = { en: "English", rw: "Ikinyarwanda", lg: "Luganda", fr: "Français", sw: "Kiswahili" };
  var SHELVES = [
    ["continue", "Continue watching"],
    ["trending", "Trending now"],
    ["popular-movies", "Popular movies"],
    ["top-rated", "Top rated movies"],
    ["popular-tv", "Popular TV shows"],
    ["trailers", "Latest trailers"],
    ["translators", "Featured translators"]
  ];

  function fieldError(name, message) {
    var node = SEEK.$('[data-field="' + name + '"]', mount);
    if (node) node.classList.add("field--error");
    var error = SEEK.$("[data-auth-error]", mount);
    if (error) { error.textContent = message; error.hidden = false; }
  }

  function clearErrors() {
    SEEK.$$(".field--error", mount).forEach(function (node) { node.classList.remove("field--error"); });
    var error = SEEK.$("[data-auth-error]", mount);
    if (error) { error.textContent = ""; error.hidden = true; }
  }

  /* ------------------------------ Auth ------------------------------------ */
  function authAside() {
    return '<div class="auth-aside">' +
      '<p class="eyebrow"><span class="pulse-dot"></span> SEEK account</p>' +
      "<h2>Your stories, remembered.</h2>" +
      "<p>Keep a watchlist, save favourites, pick up where you left off and tune recommendations to your taste. Your library is stored on this device in the demo.</p>" +
      '<ul class="auth-benefits">' +
        "<li>" + SEEK.icon("bookmark") + "<span>One library for films, series and trailers.</span></li>" +
        "<li>" + SEEK.icon("clock") + "<span>Resume films and episodes exactly where you stopped.</span></li>" +
        "<li>" + SEEK.icon("globe") + "<span>Choose from five interface languages and three accent themes.</span></li>" +
        "<li>" + SEEK.icon("shield") + "<span>Admin tools for catalogue and community moderation.</span></li>" +
      "</ul>" +
      '<div class="auth-hint">Demo accounts — admin: <strong>admin@seek.app</strong> / <strong>SeekAdmin!2026</strong><br>viewer: <strong>viewer@seek.app</strong> / <strong>SeekViewer!2026</strong></div>' +
    "</div>";
  }

  function loginMarkup() {
    return '<div class="auth-layout">' +
      '<div class="auth-card">' +
        "<h1>" + esc(t("auth.signin")) + "</h1><p>" + esc(t("auth.welcome")) + "</p>" +
        '<div class="auth-tabs"><a href="account.html?mode=login" class="is-active">' + esc(t("auth.signin")) + '</a><a href="account.html?mode=register">' + esc(t("auth.signup")) + "</a></div>" +
        '<form class="form" data-auth-form="login" novalidate>' +
          '<label class="field" data-field="email"><span>' + esc(t("auth.email")) + '</span><input type="email" name="email" autocomplete="email" required placeholder="you@example.com"></label>' +
          '<label class="field" data-field="password"><span>' + esc(t("auth.password")) + '</span><input type="password" name="password" autocomplete="current-password" required placeholder="••••••••"></label>' +
          '<p class="form__error" data-auth-error hidden></p>' +
          '<button class="btn btn-primary btn-block" type="submit">' + esc(t("auth.signin")) + "</button>" +
        "</form>" +
        '<p style="margin-top:16px;font-size:.84rem"><a class="text-link" href="account.html?mode=reset">' + esc(t("auth.forgot")) + "</a></p>" +
      "</div>" + authAside() + "</div>";
  }

  function registerMarkup() {
    return '<div class="auth-layout">' +
      '<div class="auth-card">' +
        "<h1>" + esc(t("auth.signup")) + "</h1><p>" + esc(t("auth.noAccount")) + "</p>" +
        '<div class="auth-tabs"><a href="account.html?mode=login">' + esc(t("auth.signin")) + '</a><a href="account.html?mode=register" class="is-active">' + esc(t("auth.signup")) + "</a></div>" +
        '<form class="form" data-auth-form="register" novalidate>' +
          '<label class="field" data-field="name"><span>' + esc(t("auth.name")) + '</span><input type="text" name="name" autocomplete="name" required maxlength="60" placeholder="Your name"></label>' +
          '<label class="field" data-field="email"><span>' + esc(t("auth.email")) + '</span><input type="email" name="email" autocomplete="email" required placeholder="you@example.com"></label>' +
          '<label class="field" data-field="password"><span>' + esc(t("auth.password")) + '</span><input type="password" name="password" autocomplete="new-password" required minlength="8" placeholder="At least 8 characters"></label>' +
          '<label class="field" data-field="confirm"><span>' + esc(t("auth.confirmPassword")) + '</span><input type="password" name="confirm" autocomplete="new-password" required placeholder="Repeat password"></label>' +
          '<p class="form__error" data-auth-error hidden></p>' +
          '<button class="btn btn-primary btn-block" type="submit">' + esc(t("auth.signup")) + "</button>" +
        "</form>" +
      "</div>" + authAside() + "</div>";
  }

  function resetMarkup() {
    return '<div class="auth-layout">' +
      '<div class="auth-card">' +
        "<h1>" + esc(t("auth.reset")) + "</h1><p>Enter your email and we will generate a reset code for this demo device.</p>" +
        '<form class="form" data-auth-form="request-reset" novalidate>' +
          '<label class="field" data-field="email"><span>' + esc(t("auth.email")) + '</span><input type="email" name="email" autocomplete="email" required placeholder="you@example.com"></label>' +
          '<p class="form__error" data-auth-error hidden></p>' +
          '<button class="btn btn-primary btn-block" type="submit">' + esc(t("auth.reset")) + "</button>" +
        "</form>" +
        '<div class="divider"><span>then</span></div>' +
        '<form class="form" data-auth-form="reset" novalidate>' +
          '<label class="field" data-field="reset-email"><span>' + esc(t("auth.email")) + '</span><input type="email" name="email" autocomplete="email" required></label>' +
          '<label class="field" data-field="code"><span>Reset code</span><input type="text" name="code" inputmode="numeric" maxlength="6" required placeholder="6-digit code"></label>' +
          '<label class="field" data-field="new"><span>New password</span><input type="password" name="password" autocomplete="new-password" required minlength="8"></label>' +
          '<p class="form__error" data-auth-error hidden></p>' +
          '<button class="btn btn-ghost btn-block" type="submit">' + esc(t("auth.reset")) + "</button>" +
        "</form>" +
        '<p style="margin-top:16px;font-size:.84rem"><a class="text-link" href="account.html?mode=login">' + esc(t("auth.hasAccount")) + "</a></p>" +
      "</div>" + authAside() + "</div>";
  }

  /* ------------------------------ Profile --------------------------------- */
  function avatarPicker(user) {
    var out = "";
    for (var seed = 1; seed <= 12; seed++) {
      out += '<button type="button" class="' + (Number(user.avatarSeed) === seed ? "is-active" : "") + '" data-avatar-seed="' + seed + '" aria-label="Avatar ' + seed + '">' +
        '<img src="' + SEEK.avatar({ name: user.name, id: "avatar-" + seed, seed: seed }) + '" alt="" width="46" height="46"></button>';
    }
    return out;
  }

  function dashboardMarkup(user) {
    var favs = SEEK.favs.count();
    var watch = SEEK.watchlist.count();
    var reviews = SEEK.reviews.all().filter(function (review) { return review.email === user.email; }).length;
    var hidden = SEEK.prefs.hiddenShelves || [];
    var accent = SEEK.prefs.accent;

    return '<div class="account-layout">' +
      '<aside class="profile-card">' +
        '<div class="profile-card__avatar"><img src="' + SEEK.avatar({ name: user.name, id: "profile-" + user.avatarSeed, seed: user.avatarSeed || 1 }) + '" alt="" width="92" height="92"></div>' +
        "<h2>" + esc(user.name) + "</h2>" +
        "<p>" + esc(user.email) + "</p>" +
        (user.bio ? "<p>" + esc(user.bio) + "</p>" : "") +
        '<div class="profile-stats">' +
          "<div><strong>" + favs + "</strong><span>Favourites</span></div>" +
          "<div><strong>" + watch + "</strong><span>Watchlist</span></div>" +
          "<div><strong>" + reviews + "</strong><span>Reviews</span></div>" +
        "</div>" +
        '<div class="form">' +
          '<a class="btn btn-ghost btn-block" href="library.html">' + SEEK.icon("bookmark") + " " + esc(t("nav.library")) + "</a>" +
          (user.isAdmin ? '<a class="btn btn-ghost btn-block" href="admin.html">' + SEEK.icon("shield") + " " + esc(t("nav.admin")) + "</a>" : "") +
          '<button type="button" class="btn btn-ghost btn-block" data-signout>' + SEEK.icon("logout") + " " + esc(t("nav.logout")) + "</button>" +
        "</div>" +
      "</aside>" +
      "<div>" +
        '<section class="account-section" id="profile"><h2>Profile</h2><p>Update the name, bio and avatar shown across SEEK.</p>' +
          '<form class="form" data-profile-form>' +
            '<label class="field"><span>' + esc(t("auth.name")) + '</span><input type="text" name="name" maxlength="60" value="' + esc(user.name) + '" required></label>' +
            '<label class="field"><span>Bio <em>' + esc(t("common.optional")) + '</em></span><textarea name="bio" rows="3" maxlength="280" placeholder="A line about your taste in stories…">' + esc(user.bio || "") + "</textarea></label>" +
            '<div class="field"><span>Avatar</span><div class="avatar-picker" data-avatar-picker>' + avatarPicker(user) + '</div><input type="hidden" name="avatarSeed" value="' + (user.avatarSeed || 1) + '"></div>' +
            '<div><button class="btn btn-primary btn-sm" type="submit">' + SEEK.icon("check") + " " + esc(t("common.save")) + "</button></div>" +
          "</form>" +
        "</section>" +
        '<section class="account-section" id="preferences"><h2>' + esc(t("nav.settings")) + "</h2><p>Interface language, accent colour, data use and which shelves appear on the home page.</p>" +
          '<div class="pref-list">' +
            '<div class="pref-row"><div class="pref-row__text"><strong>Accent colour</strong><span>Choose the highlight colour across the interface.</span></div>' +
              '<div class="accent-swatches" data-accent-picker>' +
                ["lime", "violet", "orange"].map(function (name) {
                  return '<button type="button" class="accent-swatch' + (accent === name ? " is-active" : "") + '" data-accent="' + name + '" aria-label="' + name + ' accent"></button>';
                }).join("") +
              "</div></div>" +
            '<div class="pref-row"><div class="pref-row__text"><strong>' + esc(t("footer.language")) + "</strong><span>Applies to navigation and interface labels.</span></div>" +
              '<select data-lang-pref>' + Object.keys(LANG_LABELS).map(function (code) {
                return '<option value="' + code + '"' + (SEEK.prefs.lang === code ? " selected" : "") + ">" + esc(LANG_LABELS[code]) + "</option>";
              }).join("") + "</select></div>" +
            '<div class="pref-row"><div class="pref-row__text"><strong>' + esc(t("footer.lowData")) + "</strong><span>Loads smaller artwork and reduces motion.</span></div>" +
              '<label class="switch"><input type="checkbox" data-lowdata-pref' + (SEEK.prefs.lowData ? " checked" : "") + '><span class="switch__track"></span><span class="sr-only">' + esc(t("footer.lowData")) + "</span></label></div>" +
          "</div>" +
          '<h3 style="margin-top:22px;font-size:.95rem">Home shelves</h3>' +
          '<div class="pref-list">' + SHELVES.map(function (pair) {
            return '<div class="pref-row"><div class="pref-row__text"><strong>' + esc(pair[1]) + "</strong></div>" +
              '<label class="switch"><input type="checkbox" data-shelf-toggle="' + pair[0] + '"' + (hidden.indexOf(pair[0]) === -1 ? " checked" : "") + '><span class="switch__track"></span><span class="sr-only">' + esc(pair[1]) + "</span></label></div>";
          }).join("") + "</div>" +
        "</section>" +
        '<section class="account-section" id="security"><h2>Security</h2><p>Change the password used to sign in on this device.</p>' +
          '<form class="form" data-password-form>' +
            '<label class="field"><span>Current password</span><input type="password" name="current" autocomplete="current-password" required></label>' +
            '<label class="field"><span>New password</span><input type="password" name="next" autocomplete="new-password" required minlength="8"></label>' +
            '<p class="form__error" data-password-error hidden></p>' +
            '<div><button class="btn btn-ghost btn-sm" type="submit">' + SEEK.icon("lock") + " Update password</button></div>" +
          "</form>" +
        "</section>" +
        '<section class="account-section danger-zone"><h2>Sign out</h2><p>Signing out keeps your local library on this device.</p>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-signout>' + SEEK.icon("logout") + " " + esc(t("nav.logout")) + "</button>" +
        "</section>" +
      "</div>" +
    "</div>";
  }

  function render() {
    var user = SEEK.auth.currentUser();
    if (user) {
      mount.innerHTML = dashboardMarkup(user);
      bindDashboard(user);
      return;
    }
    var mode = SEEK.qs("mode", "login");
    if (mode === "register") mount.innerHTML = registerMarkup();
    else if (mode === "reset" || mode === "forgot") mount.innerHTML = resetMarkup();
    else mount.innerHTML = loginMarkup();
    bindAuth();
  }

  /* ------------------------------ Bind ------------------------------------ */
  function bindAuth() {
    mount.addEventListener("submit", function (event) {
      var form = event.target.closest("[data-auth-form]");
      if (!form) return;
      event.preventDefault();
      clearErrors();
      var kind = form.getAttribute("data-auth-form");
      var data = new FormData(form);

      if (kind === "login") {
        var login = SEEK.auth.login(data.get("email"), data.get("password"));
        if (!login.ok) { fieldError("password", login.message); return; }
        SEEK.toast(t("auth.welcome"), "success");
        location.href = "index.html";
        return;
      }
      if (kind === "register") {
        var result = SEEK.auth.register({
          name: data.get("name"), email: data.get("email"),
          password: data.get("password"), confirm: data.get("confirm")
        });
        if (!result.ok) { fieldError(result.field || "email", result.message); return; }
        SEEK.toast(result.message || t("auth.created"), "success");
        location.href = "index.html";
        return;
      }
      if (kind === "request-reset") {
        var reset = SEEK.auth.requestReset(data.get("email"));
        if (!reset.ok) { fieldError("email", reset.message); return; }
        SEEK.toast("Reset code: " + reset.code + " (demo only)", "success");
        var resetForm = SEEK.$('[data-auth-form="reset"]', mount);
        if (resetForm) {
          resetForm.elements.email.value = data.get("email");
          resetForm.elements.code.value = reset.code;
          resetForm.elements.password.focus();
        }
        return;
      }
      if (kind === "reset") {
        var done = SEEK.auth.resetPassword(data.get("email"), data.get("code"), data.get("password"));
        if (!done.ok) { fieldError("code", done.message); return; }
        SEEK.toast(done.message, "success");
        setTimeout(function () { location.href = "account.html?mode=login"; }, 700);
      }
    });

  }

  function bindDashboard(user) {
    var profileForm = SEEK.$("[data-profile-form]", mount);
    var picker = SEEK.$("[data-avatar-picker]", mount);
    if (picker) {
      picker.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-avatar-seed]");
        if (!btn) return;
        var seed = btn.getAttribute("data-avatar-seed");
        SEEK.$$("[data-avatar-seed]", picker).forEach(function (node) { node.classList.toggle("is-active", node === btn); });
        profileForm.elements.avatarSeed.value = seed;
      });
    }
    if (profileForm) {
      profileForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var data = new FormData(profileForm);
        var result = SEEK.auth.updateProfile({
          name: data.get("name"), bio: data.get("bio"), avatarSeed: Number(data.get("avatarSeed"))
        });
        if (!result.ok) { SEEK.toast(result.message || "Could not save profile.", "error"); return; }
        SEEK.toast("Profile updated", "success");
        render();
      });
    }

    var accentPicker = SEEK.$("[data-accent-picker]", mount);
    if (accentPicker) {
      accentPicker.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-accent]");
        if (!btn) return;
        SEEK.setPref("accent", btn.getAttribute("data-accent"));
        SEEK.$$("[data-accent]", accentPicker).forEach(function (node) { node.classList.toggle("is-active", node === btn); });
      });
    }

    var lang = SEEK.$("[data-lang-pref]", mount);
    if (lang) {
      lang.addEventListener("change", function () { SEEK.setPref("lang", lang.value); });
    }

    var lowData = SEEK.$("[data-lowdata-pref]", mount);
    if (lowData) {
      lowData.addEventListener("change", function () { SEEK.setPref("lowData", lowData.checked); });
    }

    var toggles = SEEK.$$("[data-shelf-toggle]", mount);
    toggles.forEach(function (toggle) {
      toggle.addEventListener("change", function () {
        var id = toggle.getAttribute("data-shelf-toggle");
        var hidden = (SEEK.getPrefs().hiddenShelves || []).slice();
        if (toggle.checked) hidden = hidden.filter(function (item) { return item !== id; });
        else if (hidden.indexOf(id) === -1) hidden.push(id);
        SEEK.setPref("hiddenShelves", hidden);
      });
    });

    var passwordForm = SEEK.$("[data-password-form]", mount);
    if (passwordForm) {
      passwordForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var error = SEEK.$("[data-password-error]", mount);
        var data = new FormData(passwordForm);
        var result = SEEK.auth.changePassword(data.get("current"), data.get("next"));
        if (!result.ok) { if (error) { error.textContent = result.message; error.hidden = false; } return; }
        if (error) error.hidden = true;
        passwordForm.reset();
        SEEK.toast(result.message || "Password updated", "success");
      });
    }

    SEEK.$$("[data-signout]", mount).forEach(function (button) {
      button.addEventListener("click", function () {
        SEEK.auth.logout();
        SEEK.toast("Signed out");
        location.href = "index.html";
      });
    });
  }

  SEEK.ready(render);
})();
