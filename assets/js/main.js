/* =============================================================================
 * Ahlan Rishta — coming-soon page behaviour
 *
 * One concern: the notify-me form.
 * No dependencies, no build step.
 * ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
   * Configuration — the only values you should need to change.
   * ------------------------------------------------------------------ */

  /** POST target for notify requests. Empty string = mailto fallback. */
  var WAITLIST_ENDPOINT = "https://ahlanrishta-lead-capture-795256461991.me-central1.run.app";

  /** Used by the mailto fallback, and shown in the footer. */
  var CONTACT_EMAIL = "contact@ahlanrishta.com";

  var COPY = {
    sending: "Adding you to the list…",
    // No launch date is fixed, so the promise is the message itself, not a
    // day. Nothing here may imply a date we have not committed to.
    success: "You are on the list. We will write to you the day we open — one " +
             "message, nothing else.",
    invalidEmail: "Please enter a valid email address.",
    missingRole: "Please tell us whether you are seeking marriage or a parent/guardian.",
    failure: "Something went wrong. Please email " + CONTACT_EMAIL + ".",
    mailto: "Opening your email app to complete the request…"
  };

  /** Maps form role values to the API's `guest` enum. */
  function roleToGuest(role) {
    return role === "guardian" ? "guardian" : "seeker";
  }

  /* ---------------------------------------------------------------------
   * Notify form
   * ------------------------------------------------------------------ */

  // `#notify` is the section (the anchor target); the form sits inside it.
  // Selecting the section instead would still catch the bubbling submit, then
  // fail on form.reset(), so scope the lookup to the form itself.
  var form = document.querySelector("#notify form");
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
    var subject = "Notify me when Ahlan Rishta opens";
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

      if (!role) {
        setNote(COPY.missingRole, "error");
        roleInput.focus();
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
              // A 4xx is about this submission and worth quoting; a 5xx is
              // about the service, and its internals are not the visitor's
              // problem.
              var reported = data && (data.error || data.message);
              throw new Error(
                response.status < 500 && reported ? reported : COPY.failure
              );
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
          // Surface invalid-email from the API as inline validation.
          if (message.toLowerCase().indexOf("invalid email") !== -1) {
            setNote(COPY.invalidEmail, "error");
            emailInput.focus();
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
