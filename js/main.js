// Tiny Pip site: the showreel's play/pause, the waitlist form, the footer year.
// The page works without this file: the form falls back to Mailchimp's own page.

(function () {
  "use strict";

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
      if (video.paused) play();
      else video.pause();
    });
    soundButton.addEventListener("click", function () {
      video.muted = !video.muted;
      if (!video.muted) {
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
        return { state: "success", message: "You’re already on the list. Thanks for being here!" };
      }
      if (/too many/i.test(text)) {
        return { state: "error", message: "That’s a lot of tries in a row. Please wait a few minutes and try again." };
      }
      if (/email/i.test(text)) {
        return { state: "error", message: "That email address doesn’t look quite right. Could you check it?" };
      }
      return { state: "error", message: "Something went wrong on our side. Please try again in a moment." };
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (notConnected) {
        show("error", "The waitlist isn’t connected yet. Please check back soon!");
        return;
      }

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
          show("success", "You’re on the list! Check your inbox to confirm your email.");
        } else {
          var result = friendlyError(data && data.msg);
          show(result.state, result.message);
        }
      };

      timer = setTimeout(function () {
        done();
        show("error", "We couldn’t reach the waitlist. Please check your connection and try again.");
      }, 12000);

      script.onerror = function () {
        done();
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
