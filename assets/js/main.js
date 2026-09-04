/* =============================================================================
 * Ahlan Rishta — teaser behaviour
 *
 * Three concerns, in order: the countdown, the EN/AR language switch, and the
 * invitation form. No dependencies, no build step.
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
   *
   * PLACEHOLDER — replace with the confirmed launch date.
   */
  var LAUNCH_ISO = "2026-10-02T00:00:00+03:00";

  /** POST target for invitation requests. Empty string = mailto fallback. */
  var WAITLIST_ENDPOINT = "";

  /** Used by the mailto fallback and shown in the footer. */
  var CONTACT_EMAIL = "hello@ahlanrishta.com";

  /* ---------------------------------------------------------------------
   * Copy that lives in script rather than markup
   * ------------------------------------------------------------------ */

  var COPY = {
    en: {
      toggleLabel: "Switch to Arabic",
      privacy: "Your details stay private. No marketing lists, nothing shared.",
      sending: "Sending your request…",
      success: "Thank you. We will write to you before we open.",
      invalidEmail: "Please enter a valid email address.",
      failure: "Something went wrong. Please email " + CONTACT_EMAIL + ".",
      mailto: "Opening your email app to complete the request…",
      summary: function (d, h, m) {
        return "We open in " + d + " days, " + h + " hours and " + m + " minutes.";
      },
      open: "We are open."
    },
    ar: {
      toggleLabel: "التبديل إلى الإنجليزية",
      privacy: "بياناتك تبقى خاصّة.",
      sending: "جارٍ إرسال طلبك…",
      success: "شكراً لك. سنراسلك قبل الافتتاح.",
      invalidEmail: "الرجاء إدخال بريد إلكتروني صحيح.",
      failure: "حدث خطأ. راسلنا على " + CONTACT_EMAIL + ".",
      mailto: "يتم فتح تطبيق البريد لإكمال الطلب…",
      summary: function (d, h, m) {
        return "نفتح خلال " + d + " يوماً و" + h + " ساعة و" + m + " دقيقة.";
      },
      open: "لقد افتتحنا."
    }
  };

  /* ---------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */

  var root = document.documentElement;
  var LANG_KEY = "ar-lang";
  var ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤",
                       "٥", "٦", "٧", "٨", "٩"];

  function currentLang() {
    return root.lang === "ar" ? "ar" : "en";
  }

  function t(key) {
    return COPY[currentLang()][key];
  }

  /** Zero-pads to two digits, then renders Arabic-Indic numerals in Arabic. */
  function formatNumber(value, lang) {
    var text = String(value);
    if (text.length < 2) text = "0" + text;
    if (lang !== "ar") return text;
    return text.replace(/[0-9]/g, function (d) {
      return ARABIC_DIGITS[Number(d)];
    });
  }

  /* ---------------------------------------------------------------------
   * Countdown
   * ------------------------------------------------------------------ */

  var launchAt = new Date(LAUNCH_ISO).getTime();
  var valueNodes = {};
  var summaryNode = document.getElementById("countdownSummary");
  var lastRendered = {};
  var lastSummaryMinute = null;

  ["days", "hours", "minutes", "seconds"].forEach(function (unit) {
    valueNodes[unit] = document.querySelector('[data-unit="' + unit + '"]');
  });

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
    var lang = currentLang();
    var remaining = launchAt - Date.now();

    if (!isFinite(launchAt)) return;

    if (remaining <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach(function (unit) {
        paint(unit, formatNumber(0, lang));
      });
      if (summaryNode) summaryNode.textContent = t("open");
      return;
    }

    var totalSeconds = Math.floor(remaining / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    paint("days", formatNumber(days, lang));
    paint("hours", formatNumber(hours, lang));
    paint("minutes", formatNumber(minutes, lang));
    paint("seconds", formatNumber(seconds, lang));

    // Announce once a minute rather than once a second, so screen readers are
    // informed without being flooded.
    if (summaryNode && lastSummaryMinute !== minutes) {
      lastSummaryMinute = minutes;
      summaryNode.textContent = COPY[lang].summary(days, hours, minutes);
    }
  }

  renderCountdown();
  setInterval(renderCountdown, 1000);

  /* ---------------------------------------------------------------------
   * Language
   * ------------------------------------------------------------------ */

  var langToggle = document.getElementById("langToggle");

  /** Applies attributes CSS alone cannot reach: placeholders and option text. */
  function applyLanguage(lang) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-placeholder-en]").forEach(function (input) {
      input.placeholder = input.getAttribute("data-placeholder-" + lang) || "";
    });

    document.querySelectorAll("option[data-label-en]").forEach(function (option) {
      option.textContent = option.getAttribute("data-label-" + lang) || option.textContent;
    });

    if (langToggle) langToggle.setAttribute("aria-label", COPY[lang].toggleLabel);

    // Redraw immediately so the numerals switch script with the rest of the page.
    lastRendered = {};
    lastSummaryMinute = null;
    renderCountdown();

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* Private browsing — the choice simply will not persist. */
    }
  }

  applyLanguage(currentLang());

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      applyLanguage(currentLang() === "ar" ? "en" : "ar");
    });
  }

  /* ---------------------------------------------------------------------
   * Invitation form
   * ------------------------------------------------------------------ */

  var form = document.getElementById("inviteForm");
  var note = document.getElementById("inviteNote");

  /** Replaces the bilingual default note with a single-language status line. */
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
    setNote(t("mailto"), "ok");
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
        setNote(t("invalidEmail"), "error");
        emailInput.focus();
        return;
      }

      if (!WAITLIST_ENDPOINT) {
        sendByMail(email, role);
        return;
      }

      submit.disabled = true;
      setNote(t("sending"), null);

      fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, role: role, locale: currentLang() })
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed: " + response.status);
          form.reset();
          applyLanguage(currentLang());
          setNote(t("success"), "ok");
        })
        .catch(function () {
          setNote(t("failure"), "error");
        })
        .then(function () {
          submit.disabled = false;
        });
    });
  }
})();
