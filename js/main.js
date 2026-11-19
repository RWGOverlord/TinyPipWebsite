// Tiny Pip site: analytics events, the showreel's play/pause, the footer year.
// The page works without this file.

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

  document.querySelectorAll("[data-social]").forEach(function (link) {
    link.addEventListener("click", function () {
      track("social_click", { network: link.dataset.social });
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
  // Plays muted and looping once it's near the screen, unless the visitor
  // prefers reduced motion.
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

    // The showreel sits below the fold: load and start it only when it's
    // about to scroll into view, so visitors who never get there don't
    // download it.
    if (!reduceMotion.matches) {
      if ("IntersectionObserver" in window) {
        var nearby = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) return;
          nearby.disconnect();
          video.preload = "auto";
          if (video.paused) play();
        }, { rootMargin: "0px 0px 200px 0px" });
        nearby.observe(video);
      } else {
        video.preload = "auto";
        play();
      }
    }
    sync();
  }

  // ─── Footer year ───────────────────────────────────────────────────────
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
