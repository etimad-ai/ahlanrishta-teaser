/* =============================================================================
 * Ahlan Rishta — teaser behaviour
 *
 * Two concerns: the countdown, and the invitation form.
 * No dependencies, no build step.
 * ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
   * Configuration — the only values you should need to change.
   * ------------------------------------------------------------------ */

  /**
   * Public launch, as an ISO 8601 instant with an explicit offset.
   * +03:00 is Arabian Standard Time (Riyadh), which the GCC observes
   * year-round, so no daylight-saving correction is needed.
   */
  var LAUNCH_ISO = "2026-10-02T00:00:00+03:00";

  /** POST target for invitation requests. Empty string = mailto fallback. */
  var WAITLIST_ENDPOINT = "https://ahlanrishta-lead-capture-795256461991.me-central1.run.app";

  /** Used by the mailto fallback and shown in the footer. */
  var CONTACT_EMAIL = "hello@ahlanrishta.com";

  var COPY = {
    sending: "Sending your request…",
    success: "Thank you. We will write to you before the gathering.",
    invalidEmail: "Please enter a valid email address.",
    failure: "Something went wrong. Please email " + CONTACT_EMAIL + ".",
    mailto: "Opening your email app to complete the request…",
    open: "We are open."
  };

  /** Maps form role values to the API's `guest` enum. */
  function roleToGuest(role) {
    return role === "guardian" ? "guardian" : "seeker";
  }

  /* ---------------------------------------------------------------------
   * Countdown
   * ------------------------------------------------------------------ */

  var UNITS = ["days", "hours", "minutes", "seconds"];
  var launchAt = new Date(LAUNCH_ISO).getTime();
  var valueNodes = {};
  var summaryNode = document.getElementById("countdownSummary");
  var lastRendered = {};
  var lastSummaryMinute = null;

  UNITS.forEach(function (unit) {
    valueNodes[unit] = document.querySelector('[data-unit="' + unit + '"]');
  });

  /** Zero-pads to two digits. */
  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function paint(unit, text) {
    var node = valueNodes[unit];
    if (!node || lastRendered[unit] === text) return;
    lastRendered[unit] = text;
    node.textContent = text;

    // Restart the tick animation by forcing a reflow between class changes.
    node.classList.remove("is-ticking");
    void node.offsetWidth;
    node.classList.add("is-ticking");
  }

  function renderCountdown() {
    if (!isFinite(launchAt)) return;

    var remaining = launchAt - Date.now();

    if (remaining <= 0) {
      UNITS.forEach(function (unit) { paint(unit, "00"); });
      if (summaryNode) summaryNode.textContent = COPY.open;
      return;
    }

    var totalSeconds = Math.floor(remaining / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);

    paint("days", pad(days));
    paint("hours", pad(hours));
    paint("minutes", pad(minutes));
    paint("seconds", pad(totalSeconds % 60));

    // Announce once a minute rather than once a second, so screen readers are
    // informed without being flooded.
    if (summaryNode && lastSummaryMinute !== minutes) {
      lastSummaryMinute = minutes;
      summaryNode.textContent = "We open in " + days + " days, " + hours +
        " hours and " + minutes + " minutes.";
    }
  }

  renderCountdown();
  setInterval(renderCountdown, 1000);

  /* ---------------------------------------------------------------------
   * Invitation form
   * ------------------------------------------------------------------ */

  var form = document.getElementById("invite");
  var note = document.getElementById("inviteNote");

  function setNote(message, state) {
    if (!note) return;
    note.textContent = message;
    note.classList.toggle("invite__note--ok", state === "ok");
    note.classList.toggle("invite__note--error", state === "error");
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  /**
   * With no endpoint configured the request would otherwise be dropped in
   * silence, so hand it to the visitor's mail client instead.
   */
  function sendByMail(email, role) {
    var subject = "Early invitation request — Ahlan Rishta";
    var body = "Email: " + email + "\nI am: " + role + "\n";
    window.location.href = "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
    setNote(COPY.mailto, "ok");
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var emailInput = form.querySelector("#email");
      var roleInput = form.querySelector("#role");
      var submit = form.querySelector("button[type=submit]");
      var email = (emailInput.value || "").trim();
      var role = roleInput.value;

      if (!isValidEmail(email)) {
        setNote(COPY.invalidEmail, "error");
        emailInput.focus();
        return;
      }

      if (!WAITLIST_ENDPOINT) {
        sendByMail(email, role);
        return;
      }

      submit.disabled = true;
      setNote(COPY.sending, null);

      fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, guest: roleToGuest(role) })
      })
        .then(function (response) {
          return response.text().then(function (text) {
            var data = null;
            try { data = text ? JSON.parse(text) : null; } catch (_) { data = null; }
            if (!response.ok) {
              var msg = (data && (data.error || data.message)) || COPY.failure;
              throw new Error(msg);
            }
            return data;
          });
        })
        .then(function () {
          form.reset();
          setNote(COPY.success, "ok");
        })
        .catch(function (err) {
          var message = (err && err.message) ? err.message : COPY.failure;
          // Surface invalid-email from API as inline validation.
          if (message.toLowerCase().indexOf("invalid email") !== -1) {
            setNote(COPY.invalidEmail, "error");
            emailInput.focus();
          } else if (message === COPY.failure) {
            setNote(COPY.failure, "error");
          } else {
            setNote(message, "error");
          }
        })
        .then(function () {
          submit.disabled = false;
        });
    });
  }
})();
