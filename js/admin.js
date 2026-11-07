/* ==========================================================================
   SEEK — admin studio
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var t = SEEK.t;
  var mount = SEEK.$("#admin-app");
  if (!mount) return;

  var REPORT_KEY = "seek.reports.v1";
  var activeTab = SEEK.qs("tab", "overview");
  var catalogueQuery = "";
  var catalogueType = "all";

  var TABS = [
    ["overview", "Overview", "bar"],
    ["catalogue", "Catalogue", "film"],
    ["users", "Users", "users"],
    ["reviews", "Reviews", "message"],
    ["reports", "Reports", "flag"]
  ];

  function guardMarkup() {
    var user = SEEK.auth.currentUser();
    if (user && user.isAdmin) return "";
    return '<div class="error-page">' +
      '<span class="empty-state__icon">' + SEEK.icon("shield") + "</span>" +
      "<h1>Admin access required</h1>" +
      "<p>" + (user ? "Your account does not have administrator access." : "Sign in with an administrator account to open the studio.") + "</p>" +
      '<div class="auth-hint" style="display:inline-block;text-align:left">Demo admin: <strong>admin@seek.app</strong> / <strong>SeekAdmin!2026</strong></div>' +
      '<div class="modal__actions" style="justify-content:center">' +
        '<a class="btn btn-primary" href="account.html?mode=login">' + esc(t("nav.signin")) + "</a>" +
        '<a class="btn btn-ghost" href="index.html">' + esc(t("nav.home")) + "</a>" +
      "</div>" +
    "</div>";
  }

  function statCard(label, value, note) {
    return '<div class="stat-card"><span>' + esc(label) + "</span><strong>" + value + "</strong>" + (note ? "<small>" + esc(note) + "</small>" : "") + "</div>";
  }

  function overviewPanel() {
    var cat = SEEK.getCatalog();
    var users = SEEK.auth.listUsers();
    var reviews = SEEK.reviews.all();
    var reports = SEEK.reports.all();
    var open = reports.filter(function (report) { return report.status !== "closed"; }).length;
    return '<div class="stat-grid">' +
      statCard("Films", cat.movies.length, "catalogue") +
      statCard("Series", cat.shows.length, cat.shows.reduce(function (sum, s) { return sum + s.seasons.length; }, 0) + " seasons") +
      statCard("Trailers", cat.trailers.length, "previews") +
      statCard("Translators", cat.translators.length, "profiles") +
      statCard("Accounts", users.length, users.filter(function (u) { return u.isAdmin; }).length + " admin") +
      statCard("Reviews", reviews.length, reviews.filter(function (r) { return r.hidden; }).length + " hidden") +
      statCard("Open reports", open, reports.length + " total") +
    "</div>" +
    '<div class="section-head"><div><h2>Latest reports</h2><p>Community flags waiting for a catalogue decision.</p></div>' +
      '<button type="button" class="text-link" data-admin-tab="reports">Open reports ' + SEEK.icon("arrow-right") + "</button></div>" +
    (reports.length ? reports.slice(0, 5).map(reportRow).join("") : '<p class="muted">No reports have been submitted yet.</p>') +
    '<div class="section-head" style="margin-top:28px"><div><h2>Quick actions</h2><p>Maintenance tools for this device.</p></div></div>' +
    '<div class="modal__actions" style="margin-top:0">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-export-catalogue>' + SEEK.icon("download") + " Export catalogue JSON</button>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-reset-catalogue>' + SEEK.icon("rotate-ccw") + " Reset to seed catalogue</button>" +
    "</div>";
  }

  function catalogueRows() {
    var cat = SEEK.getCatalog();
    var rows = [];
    cat.movies.forEach(function (item) { rows.push({ type: "movie", item: item }); });
    cat.shows.forEach(function (item) { rows.push({ type: "show", item: item }); });
    var q = catalogueQuery.trim().toLowerCase();
    return rows.filter(function (row) {
      if (catalogueType !== "all" && row.type !== catalogueType) return false;
      if (!q) return true;
      return [row.item.title, row.item.year, (row.item.genres || []).join(" ")].join(" ").toLowerCase().indexOf(q) !== -1;
    });
  }

  function catalogueTable() {
    var rows = catalogueRows();
    if (!rows.length) return '<p class="muted">No titles match that search.</p>';
    return '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>' +
      "<th></th><th>Title</th><th>Type</th><th>Year</th><th>Rating</th><th>Genres</th><th>Actions</th>" +
      "</tr></thead><tbody>" + rows.map(function (row) {
        var item = row.item;
        return "<tr>" +
          '<td><img class="table-thumb" src="' + SEEK.poster(item) + '" alt="" width="40" height="56"></td>' +
          "<td><strong>" + esc(item.title) + "</strong><br><small class=\"muted\">" + esc(item.id) + "</small></td>" +
          "<td>" + esc(row.type) + "</td>" +
          "<td>" + esc(item.year) + "</td>" +
          "<td>" + Number(item.rating).toFixed(1) + "</td>" +
          "<td>" + esc((item.genres || []).slice(0, 2).join(", ")) + "</td>" +
          '<td><div class="table-actions">' +
            '<button type="button" class="icon-btn" data-edit-type="' + row.type + '" data-edit-id="' + esc(item.id) + '" aria-label="Edit">' + SEEK.icon("edit") + "</button>" +
            '<button type="button" class="icon-btn" data-delete-type="' + row.type + '" data-delete-id="' + esc(item.id) + '" aria-label="Delete">' + SEEK.icon("trash") + "</button>" +
          "</div></td>" +
        "</tr>";
      }).join("") + "</tbody></table></div>";
  }

  function cataloguePanel() {
    return '<div class="admin-toolbar">' +
      '<input type="search" placeholder="Search catalogue…" value="' + esc(catalogueQuery) + '" data-catalogue-search>' +
      '<select data-catalogue-type style="min-height:40px;padding:0 12px;border-radius:999px;border:1px solid var(--line-strong);background:rgba(255,255,255,.04)">' +
        ["all", "movie", "show"].map(function (type) {
          return '<option value="' + type + '"' + (catalogueType === type ? " selected" : "") + ">" + (type === "all" ? "All types" : type.charAt(0).toUpperCase() + type.slice(1)) + "</option>";
        }).join("") +
      "</select>" +
      '<span class="results-count">' + catalogueRows().length + " titles</span>" +
    "</div>" +
    '<div data-catalogue-table>' + catalogueTable() + "</div>";
  }

  function usersPanel() {
    var users = SEEK.auth.listUsers();
    var current = SEEK.auth.currentUser();
    return '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>' +
      "<th>Account</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>" +
      "</tr></thead><tbody>" + users.map(function (user) {
        return "<tr>" +
          '<td><div style="display:flex;align-items:center;gap:10px"><img src="' + SEEK.avatar({ name: user.name, id: "admin-" + user.id, seed: user.avatarSeed || 1 }) + '" alt="" width="34" height="34" style="border-radius:50%"><strong>' + esc(user.name) + "</strong></div></td>" +
          "<td>" + esc(user.email) + "</td>" +
          '<td><span class="badge-status ' + (user.isAdmin ? "badge-status--admin" : "") + '">' + (user.isAdmin ? "Admin" : "Viewer") + "</span></td>" +
          "<td>" + esc(user.joined) + "</td>" +
          '<td><div class="table-actions">' +
            (current && current.email === user.email ? '<span class="muted" style="font-size:.76rem">You</span>' :
              '<button type="button" class="icon-btn" data-user-role="' + esc(user.email) + '" data-role="' + (user.isAdmin ? "user" : "admin") + '" aria-label="Change role">' + SEEK.icon(user.isAdmin ? "user" : "shield") + "</button>" +
              '<button type="button" class="icon-btn" data-user-delete="' + esc(user.email) + '" aria-label="Delete user">' + SEEK.icon("trash") + "</button>") +
          "</div></td>" +
        "</tr>";
      }).join("") + "</tbody></table></div>";
  }

  function reviewsPanel() {
    var reviews = SEEK.reviews.all();
    if (!reviews.length) return '<p class="muted">No reviews yet.</p>';
    return reviews.map(function (review) {
      var item = SEEK.get("movie", review.itemId) || SEEK.get("show", review.itemId);
      return '<div class="report-item">' +
        '<div class="report-item__head"><strong>' + esc(review.name) + " · " + (review.rating || 0) + "/5</strong>" +
          '<span class="badge-status ' + (review.hidden ? "badge-status--closed" : "badge-status--open") + '">' + (review.hidden ? "Hidden" : "Visible") + "</span></div>" +
        "<p>" + esc(review.text) + "</p>" +
        '<div class="report-item__head" style="margin-top:8px"><small>' + esc(item ? item.title : review.itemId) + " · " + esc(review.date) + "</small>" +
          '<button type="button" class="text-link" data-review-toggle="' + esc(review.id) + '">' + (review.hidden ? "Unhide" : "Hide") + "</button></div>" +
      "</div>";
    }).join("");
  }

  function reportRow(report) {
    return '<div class="report-item" data-report-id="' + esc(report.id) + '">' +
      '<div class="report-item__head"><strong>' + esc(report.itemTitle || "Catalogue") + " · " + esc(report.reason) + "</strong>" +
        '<span class="badge-status ' + (report.status === "closed" ? "badge-status--closed" : "badge-status--open") + '">' + esc(report.status || "open") + "</span></div>" +
      "<p>" + esc(report.details) + "</p>" +
      '<div class="report-item__head" style="margin-top:8px"><small>' + esc(report.email || "anonymous") + " · " + esc(String(report.date || "").slice(0, 10)) + "</small>" +
        '<button type="button" class="text-link" data-report-close="' + esc(report.id) + '">' + (report.status === "closed" ? "Reopen" : "Mark closed") + "</button></div>" +
    "</div>";
  }

  function reportsPanel() {
    var reports = SEEK.reports.all();
    if (!reports.length) return '<p class="muted">No reports have been submitted yet.</p>';
    return reports.map(reportRow).join("");
  }

  function renderPanel() {
    var panel = SEEK.$("[data-admin-panel]", mount);
    if (!panel) return;
    var html = "";
    if (activeTab === "catalogue") html = cataloguePanel();
    else if (activeTab === "users") html = usersPanel();
    else if (activeTab === "reviews") html = reviewsPanel();
    else if (activeTab === "reports") html = reportsPanel();
    else html = overviewPanel();
    panel.innerHTML = html;
    if (activeTab === "catalogue") bindCatalogueControls();
  }

  function render() {
    var user = SEEK.auth.currentUser();
    if (!user || !user.isAdmin) {
      mount.innerHTML = '<div class="container">' + guardMarkup() + "</div>";
      return;
    }

    mount.innerHTML = '<div class="container admin-shell">' +
      '<div class="admin-head"><div><p class="eyebrow"><span class="pulse-dot"></span> SEEK studio</p><h1>Admin studio</h1>' +
        "<p>Catalogue, community and moderation controls for this device.</p></div>" +
        '<div class="admin-head__actions"><a class="btn btn-ghost btn-sm" href="index.html">' + SEEK.icon("external-link") + " View site</a>" +
        '<a class="btn btn-ghost btn-sm" href="account.html">' + SEEK.icon("user") + " " + esc(t("nav.profile")) + "</a></div></div>" +
      '<div class="tab-bar admin-tabs" data-admin-tabs>' + TABS.map(function (tab) {
        return '<button type="button" class="tab' + (tab[0] === activeTab ? " is-active" : "") + '" data-admin-tab="' + tab[0] + '">' + SEEK.icon(tab[2]) + " " + esc(tab[1]) + "</button>";
      }).join("") + "</div>" +
      '<div data-admin-panel></div>' +
    "</div>";

    if (!clickBound) { bindClicks(); clickBound = true; }
    renderPanel();
  }

  function openEdit(type, id) {
    var cat = JSON.parse(JSON.stringify(SEEK.getCatalog()));
    var bucket = type === "movie" ? cat.movies : cat.shows;
    var item = bucket.find(function (x) { return x.id === id; });
    if (!item) return;
    var wrap = SEEK.openModal(
      '<form class="form" data-edit-form>' +
        '<span class="eyebrow">' + SEEK.icon("edit") + " Edit title</span>" +
        '<h2 class="modal__title">' + esc(item.title) + "</h2>" +
        '<label class="field"><span>Title</span><input type="text" name="title" value="' + esc(item.title) + '" required maxlength="120"></label>' +
        '<label class="field"><span>Year</span><input type="number" name="year" value="' + esc(item.year) + '" min="1900" max="2100" required></label>' +
        '<label class="field"><span>Rating (0–10)</span><input type="number" name="rating" value="' + esc(item.rating) + '" min="0" max="10" step="0.1" required></label>' +
        '<label class="field"><span>Genres (comma separated)</span><input type="text" name="genres" value="' + esc((item.genres || []).join(", ")) + '"></label>' +
        '<div class="modal__actions"><button type="submit" class="btn btn-primary">' + SEEK.icon("check") + " " + esc(t("common.save")) + "</button></div>" +
      "</form>",
      { label: "Edit " + item.title }
    );
    wrap.addEventListener("submit", function (event) {
      if (!event.target.matches("[data-edit-form]")) return;
      event.preventDefault();
      var data = new FormData(event.target);
      item.title = String(data.get("title")).trim().slice(0, 120) || item.title;
      item.year = Number(data.get("year")) || item.year;
      item.rating = Math.max(0, Math.min(10, Number(data.get("rating")) || item.rating));
      item.genres = String(data.get("genres") || "").split(",").map(function (g) { return g.trim(); }).filter(Boolean);
      SEEK.saveCatalog(cat);
      SEEK.closeModal(wrap);
      SEEK.toast("Catalogue updated", "success");
      SEEK.renderHeader();
      renderPanel();
    });
  }

  var clickBound = false;

  function bindClicks() {
    mount.addEventListener("click", function (event) {
      var tab = event.target.closest("[data-admin-tab]");
      if (tab) {
        activeTab = tab.getAttribute("data-admin-tab");
        SEEK.$$("[data-admin-tab]", mount).forEach(function (node) { node.classList.toggle("is-active", node === tab); });
        renderPanel();
        try { history.replaceState(null, "", "admin.html?tab=" + activeTab); } catch (err) { /* ignore */ }
        return;
      }
      var edit = event.target.closest("[data-edit-type]");
      if (edit) { openEdit(edit.getAttribute("data-edit-type"), edit.getAttribute("data-edit-id")); return; }

      var del = event.target.closest("[data-delete-type]");
      if (del) {
        var type = del.getAttribute("data-delete-type");
        var id = del.getAttribute("data-delete-id");
        var cat = JSON.parse(JSON.stringify(SEEK.getCatalog()));
        var bucket = type === "movie" ? cat.movies : cat.shows;
        var item = bucket.find(function (x) { return x.id === id; });
        SEEK.confirmDialog({
          title: "Delete title?", message: "Remove “" + (item ? item.title : id) + "” from this device's catalogue?", danger: true, confirmLabel: "Delete"
        }).then(function (ok) {
          if (!ok) return;
          var index = bucket.indexOf(item);
          if (index !== -1) bucket.splice(index, 1);
          SEEK.saveCatalog(cat);
          SEEK.toast("Title deleted", "success");
          renderPanel();
        });
        return;
      }

      var role = event.target.closest("[data-user-role]");
      if (role) {
        var changed = SEEK.auth.setRole(role.getAttribute("data-user-role"), role.getAttribute("data-role"));
        SEEK.toast(changed ? "Role updated" : "At least one admin must remain.", changed ? "success" : "error");
        if (changed) renderPanel();
        return;
      }

      var delUser = event.target.closest("[data-user-delete]");
      if (delUser) {
        SEEK.confirmDialog({ title: "Delete account?", message: "Remove " + delUser.getAttribute("data-user-delete") + " from this device?", danger: true, confirmLabel: "Delete" }).then(function (ok) {
          if (!ok) return;
          var done = SEEK.auth.deleteUser(delUser.getAttribute("data-user-delete"));
          SEEK.toast(done ? "Account deleted" : "You cannot delete your own account.", done ? "success" : "error");
          if (done) renderPanel();
        });
        return;
      }

      var reviewToggle = event.target.closest("[data-review-toggle]");
      if (reviewToggle) {
        var reviewId = reviewToggle.getAttribute("data-review-toggle");
        if (SEEK.reviews.isHidden(reviewId)) SEEK.reviews.unhide(reviewId);
        else SEEK.reviews.hide(reviewId);
        renderPanel();
        return;
      }

      var closeReport = event.target.closest("[data-report-close]");
      if (closeReport) {
        var reports = SEEK.read(REPORT_KEY, []);
        reports = reports.map(function (report) {
          if (report.id === closeReport.getAttribute("data-report-close")) {
            report.status = report.status === "closed" ? "open" : "closed";
          }
          return report;
        });
        SEEK.write(REPORT_KEY, reports);
        renderPanel();
        return;
      }

      if (event.target.closest("[data-reset-catalogue]")) {
        SEEK.confirmDialog({ title: "Reset catalogue?", message: "Discard local edits and restore the original seed catalogue.", danger: true, confirmLabel: "Reset" }).then(function (ok) {
          if (!ok) return;
          SEEK.resetCatalog();
          SEEK.toast("Catalogue reset", "success");
          render();
        });
        return;
      }

      if (event.target.closest("[data-export-catalogue]")) {
        SEEK.downloadText("seek-catalogue.json", JSON.stringify(SEEK.getCatalog(), null, 2));
        SEEK.toast("Catalogue exported", "success");
      }
    });
  }

  function bindCatalogueControls() {
    var search = SEEK.$("[data-catalogue-search]", mount);
    if (search) {
      SEEK.debounceInput(search, function () {
        catalogueQuery = search.value;
        var table = SEEK.$("[data-catalogue-table]", mount);
        if (table) table.innerHTML = catalogueTable();
      }, 200);
    }

    var typeSelect = SEEK.$("[data-catalogue-type]", mount);
    if (typeSelect) {
      typeSelect.addEventListener("change", function () {
        catalogueType = typeSelect.value;
        var table = SEEK.$("[data-catalogue-table]", mount);
        if (table) table.innerHTML = catalogueTable();
      });
    }
  }

  SEEK.ready(render);
})();
