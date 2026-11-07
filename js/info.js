/* ==========================================================================
   SEEK — about, help and policy pages
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;
  var esc = SEEK.esc;
  var mount = SEEK.$("#info-app");
  if (!mount) return;

  var SECTIONS = [
    ["about", "About SEEK"],
    ["contact", "Contact"],
    ["help", "Help centre"],
    ["accessibility", "Accessibility"],
    ["privacy", "Privacy"],
    ["terms", "Terms"],
    ["dmca", "Content removal"]
  ];

  function render() {
    mount.innerHTML =
      '<div class="page-head"><div class="page-head__text"><h1>About & policies</h1>' +
        "<p>How SEEK works, how we handle your data, and how to get in touch or request a content change.</p></div></div>" +
      '<div class="info-layout">' +
        '<nav class="info-nav" aria-label="Sections">' + SECTIONS.map(function (pair) {
          return '<a href="#' + pair[0] + '" data-info-link="' + pair[0] + '">' + esc(pair[1]) + "</a>";
        }).join("") + "</nav>" +
        '<div class="info-content">' +
          '<section class="info-section" id="about"><h2>About SEEK</h2>' +
            "<p>SEEK is a cinematic discovery platform for films, series and trailers, with a dedicated home for translated entertainment. The catalogue in this build is a curated selection of real, well-known films and series used to demonstrate the interface.</p>" +
            "<p>The interface is built as a fast, offline-friendly front end: poster and backdrop art is taken from YouTube trailer thumbnails fetched at build time, with locally generated SVG as a fallback. The catalogue, accounts, library and progress are stored in your browser. Nothing here is sent to a server.</p>" +
            '<div class="info-card"><strong>Demo notice.</strong> Titles and trailer artwork belong to their respective rights holders. SEEK does not host or link to unlicensed media; this build only embeds publicly available trailers.</div>' +
            "<h3>What you can do</h3>" +
            "<ul><li>Browse and filter films and series by genre, year, language, translator, mood and rating.</li>" +
            "<li>Watch simulated trailers and previews, save favourites and build a watchlist.</li>" +
            "<li>Resume films and episodes with locally saved progress.</li>" +
            "<li>Meet the translators behind dubbed and subtitled titles.</li>" +
            "<li>Manage the catalogue and community as an administrator.</li></ul>" +
          "</section>" +
          '<section class="info-section" id="contact"><h2>Contact</h2>' +
            "<p>Questions, corrections and partnership requests are welcome. In this demo the form stores your message on this device and shows a confirmation.</p>" +
            '<form class="form" data-contact-form style="max-width:520px">' +
              '<label class="field"><span>Name</span><input type="text" name="name" required maxlength="80" placeholder="Your name"></label>' +
              '<label class="field"><span>Email</span><input type="email" name="email" required placeholder="you@example.com"></label>' +
              '<label class="field"><span>Message</span><textarea name="message" rows="4" required minlength="10" placeholder="How can we help?"></textarea></label>' +
              '<div><button class="btn btn-primary btn-sm" type="submit">' + SEEK.icon("send") + " Send message</button></div>" +
            "</form>" +
            '<div class="info-card">For rights and takedown requests, use the <a class="text-link" href="#dmca">content removal</a> section.</div>' +
          "</section>" +
          '<section class="info-section" id="help"><h2>Help centre</h2>' +
            "<h3>Why is playback simulated?</h3>" +
            "<p>SEEK ships without copyrighted video files. The player is fully interactive in preview mode and can attach a real HTML5 source when one is provided by an authorised backend.</p>" +
            "<h3>Where is my library stored?</h3>" +
            "<p>Favourites, watchlist, progress, reviews and account data live in your browser's local storage. Clearing site data resets them.</p>" +
            "<h3>How do I change the language or theme?</h3>" +
            "<p>Open your profile and visit Preferences. You can switch between English, Kinyarwanda, Luganda, French and Swahili, and choose a lime, violet or orange accent.</p>" +
            "<h3>Can I download films?</h3>" +
            "<p>Only titles explicitly licensed for download show a download option, and even then the demo provides a metadata package rather than a film file. SEEK never bypasses DRM or paywalls.</p>" +
          "</section>" +
          '<section class="info-section" id="accessibility"><h2>Accessibility</h2>' +
            "<p>SEEK aims to meet WCAG 2.2 AA in its core flows. The interface supports keyboard navigation, visible focus states, skip links, semantic landmarks, reduced-motion preferences and high-contrast dark surfaces.</p>" +
            "<ul><li>Every interactive control has an accessible name.</li>" +
            "<li>Dialogs trap focus and close with Escape.</li>" +
            "<li>Low-data mode reduces artwork size and visual motion.</li>" +
            "<li>Translator profiles include captioning and audio-description specialists.</li></ul>" +
            "<p>If something is hard to use, please tell us through the contact form.</p>" +
          "</section>" +
          '<section class="info-section" id="privacy"><h2>Privacy policy</h2>' +
            "<p>This demo does not collect, transmit or sell personal data. Account details, preferences, library entries and reviews are stored locally in your browser and never leave your device.</p>" +
            "<h3>What is stored</h3>" +
            "<ul><li>Account name, email, a demo password hash and avatar choice.</li>" +
            "<li>Favourites, watchlist, viewing progress, search history and reviews.</li>" +
            "<li>Interface preferences such as language, accent and low-data mode.</li></ul>" +
            "<h3>Your control</h3>" +
            "<p>You can clear this data at any time through your browser settings. In a production deployment these flows would be backed by a secure API, server-side password hashing and a real database.</p>" +
          "</section>" +
          '<section class="info-section" id="terms"><h2>Terms of service</h2>' +
            "<p>SEEK is provided as a demonstration. The catalogue references real titles and trailer artwork owned by their respective rights holders; translator profiles and local data are sample content. You may explore the interface and use the local tools, but you may not present the demo catalogue as a licensed streaming service.</p>" +
            "<ul><li>Do not attempt to bypass access controls or DRM.</li>" +
            "<li>Do not upload unlawful, hateful or infringing content through community features.</li>" +
            "<li>Administrator tools are for demonstration on your own device.</li></ul>" +
            "<p>SEEK is provided “as is” without warranties. In production, these terms would be reviewed by counsel and tied to a real service agreement.</p>" +
          "</section>" +
          '<section class="info-section" id="dmca"><h2>Content removal & copyright</h2>' +
            "<p>SEEK does not host unlicensed media. If you believe content in a production deployment infringes your rights, send a notice including the title, the specific material, your contact details and a good-faith statement.</p>" +
            '<div class="info-card">Email <a class="text-link" href="mailto:rights@seek.example">rights@seek.example</a> or open a takedown request with the catalogue team. We aim to respond within five working days.</div>' +
            "<p>For playback or metadata problems, use the report button on any title page so the issue reaches the moderation queue.</p>" +
          "</section>" +
        "</div>" +
      "</div>";

    bind();
  }

  function bind() {
    var form = SEEK.$("[data-contact-form]", mount);
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var data = new FormData(form);
        var messages = SEEK.read("seek.contact.v1", []);
        messages.unshift({
          name: String(data.get("name") || "").slice(0, 80),
          email: String(data.get("email") || ""),
          message: String(data.get("message") || "").slice(0, 2000),
          at: new Date().toISOString()
        });
        SEEK.write("seek.contact.v1", messages.slice(0, 50));
        form.reset();
        SEEK.toast("Message received. Thank you.", "success");
      });
    }

    if ("IntersectionObserver" in window) {
      var links = SEEK.$$("[data-info-link]", mount);
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("data-info-link") === entry.target.id);
          });
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      SEEK.$$(".info-section", mount).forEach(function (section) { observer.observe(section); });
    }
  }

  SEEK.ready(render);
})();
