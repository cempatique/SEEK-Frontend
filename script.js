/* ==========================================================================
   SEEK — boot
   Loaded after all shared modules and before the page-specific controller.
   ========================================================================== */
(function () {
  "use strict";
  if (window.SEEK && typeof window.SEEK.boot === "function") {
    window.SEEK.boot();
  } else {
    console.error("[SEEK] Shared modules did not load correctly.");
  }
})();
