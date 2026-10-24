// Tiny Pip site: the showreel's play/pause, the waitlist form, the footer year.
// The page works without this file: the form falls back to Mailchimp's own page.

(function () {
  "use strict";

  // Sends a Google Analytics event (see js/analytics.js). Does nothing if GA
  // is blocked. Never send the visitor's email address here.
  var track = function (name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  };

  // ─── Analytics: CTA clicks, sections seen, scroll depth ────────────────
  document.querySelectorAll("[data-cta]").forEach(function (link) {
    link.addEventListener("click", function () {
      track("cta_click", { cta_location: link.dataset.cta });
    });
  });

  document.querySelectorAll(".faq-item").forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) track("faq_open", { question: item.querySelector("summary").textContent.trim() });
    });
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
    link.addEventListener("click", function () {
      track("contact_click");
    });
  });

  if ("IntersectionObserver" in window) {
    // A section counts as seen once its top passes 60% of the way down the screen
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        track("section_view", { section: entry.target.dataset.section });
        seen.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -40% 0px" });
    document.querySelectorAll("[data-section]").forEach(function (section) {
      seen.observe(section);
    });
  }

  var depths = [25, 50, 75, 100];
  var ticking = false;
  var checkDepth = function () {
    ticking = false;
    var doc = document.documentElement;
    var percent = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
    while (depths.length && percent >= depths[0] - 1) {
      track("scroll_depth", { percent: depths.shift() });
    }
    if (!depths.length) window.removeEventListener("scroll", onScroll);
  };
  var onScroll = function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(checkDepth);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // ─── Showreel ──────────────────────────────────────────────────────────
  // Plays muted and looping, unless the visitor prefers reduced motion.
  // Visible buttons pause it and turn Pip's theme music on (browsers only
  // allow sound after a tap).
  var video = document.getElementById("showreel");
  var controls = document.querySelector(".video-controls");

  if (video && controls) {
    var playButton = controls.querySelector(".video-play");
    var soundButton = controls.querySelector(".video-sound");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var heardFromStart = false;

    var setButton = function (button, on, text) {
      button.dataset.on = String(on);
      button.querySelector(".video-toggle-label").textContent = text;
    };

    var sync = function () {
      setButton(playButton, !video.paused, video.paused ? "Play video" : "Pause video");
      setButton(soundButton, !video.muted, video.muted ? "Sound on" : "Sound off");
    };

    var play = function () {
      var attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(sync);
    };

    controls.hidden = false;
    playButton.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
        track("video_pause");
      }
    });
    soundButton.addEventListener("click", function () {
      video.muted = !video.muted;
      if (!video.muted) {
        track("video_sound_on");
        // The first time, start over so the theme plays from the top
        if (!heardFromStart) {
          heardFromStart = true;
          video.currentTime = 0;
        }
        if (video.paused) play();
      }
      sync();
    });
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    video.addEventListener("volumechange", sync);

    if (!reduceMotion.matches) {
      video.preload = "auto";
      play();
    }
    sync();
  }

  // ─── Waitlist ──────────────────────────────────────────────────────────
  // Sends the form to Mailchimp's JSON endpoint so visitors stay on the page.
  var form = document.querySelector(".waitlist-form");

  if (form) {
    var status = form.querySelector(".form-status");
    var submit = form.querySelector("button[type=submit]");
    var notConnected = form.action.indexOf("REPLACE") !== -1;

    var show = function (state, message) {
      status.dataset.state = state;
      status.textContent = message;
    };

    var friendlyError = function (msg) {
      var text = String(msg || "").replace(/<[^>]*>/g, "").replace(/^\d+\s*-\s*/, "");
      if (/already subscribed/i.test(text)) {
        return { state: "success", reason: "already_subscribed", message: "You’re already on the list. Thanks for being here!" };
      }
      if (/too many/i.test(text)) {
        return { state: "error", reason: "too_many_tries", message: "That’s a lot of tries in a row. Please wait a few minutes and try again." };
      }
      if (/email/i.test(text)) {
        return { state: "error", reason: "invalid_email", message: "That email address doesn’t look quite right. Could you check it?" };
      }
      return { state: "error", reason: "other", message: "Something went wrong on our side. Please try again in a moment." };
    };

    // "ios" or "android", from the chosen radio button (never the email)
    var chosenPlatform = function () {
      var checked = form.querySelector('input[name="tags"]:checked');
      return checked ? checked.id.replace("platform-", "") : "unknown";
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (notConnected) {
        show("error", "The waitlist isn’t connected yet. Please check back soon!");
        return;
      }

      var platform = chosenPlatform();
      var callback = "tinyPipWaitlist" + Date.now();
      var params = new URLSearchParams(new FormData(form));
      params.set("c", callback);
      var url = form.action.replace("/post?", "/post-json?") + "&" + params.toString();

      var script = document.createElement("script");
      var timer;
      var done = function () {
        clearTimeout(timer);
        delete window[callback];
        script.remove();
        submit.disabled = false;
      };

      window[callback] = function (data) {
        done();
        if (data && data.result === "success") {
          form.reset();
          track("sign_up", { method: "waitlist", platform: platform });
          show("success", "You’re on the list! Check your inbox to confirm your email.");
        } else {
          var result = friendlyError(data && data.msg);
          track("waitlist_error", { reason: result.reason, platform: platform });
          show(result.state, result.message);
        }
      };

      timer = setTimeout(function () {
        done();
        track("waitlist_error", { reason: "timeout", platform: platform });
        show("error", "We couldn’t reach the waitlist. Please check your connection and try again.");
      }, 12000);

      script.onerror = function () {
        done();
        track("waitlist_error", { reason: "network", platform: platform });
        show("error", "We couldn’t reach the waitlist. Please check your connection and try again.");
      };

      submit.disabled = true;
      show("pending", "Adding you to the list…");
      script.src = url;
      document.body.appendChild(script);
    });
  }

  // ─── Footer year ───────────────────────────────────────────────────────
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
