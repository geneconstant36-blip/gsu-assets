/* ============================================================================
   GSU PROFILE AUTH  ·  gsu-auth.js  ·  v1.0
   Host at: read.globalsovereignuniversity.org/gsu-auth.js
   ----------------------------------------------------------------------------
   Optional, anonymous profiles. Handle + password. NO email collected.
   Built on the SAME Firebase (compat) app the game engine uses, so a learner's
   XP/badges/scores at users/{uid}/games/* follow them when they create a profile.

   HOW IT WORKS
   - New profile: if the visitor is currently an anonymous player, we LINK an
     email/password credential to that same anonymous account. The uid never
     changes, so everything already earned is preserved. (If they're brand new,
     we create the account outright.)
   - The "email" is synthetic — handle + "@learner.gsu". The learner only ever
     sees their handle. No real email is requested or stored.
   - Returning learner: sign in with handle + password (loads their cloud uid;
     page reloads so the engine reads their profile uid).

   PAGE REQUIREMENTS (same as any climb page)
   - Firebase compat SDK loaded (app + auth + firestore).
   - window.GSU_FIREBASE_CONFIG defined (your gsu-handshake config).
   - Load this script anywhere after those.

   WIRE A BUTTON: add  data-gsu-auth-open  to any element (e.g. your Webflow
   "Sign In / Create Profile" button). A profile chip also auto-appears; it drops
   into #gsu-profile-slot if that element exists, otherwise floats top-right.

   FORGOT PASSWORD: with no email there is no automated reset. Flagged by design.
   ========================================================================== */
(function (global) {
  "use strict";

  var EMAIL_DOMAIN = "@learner.gsu";           // synthetic; never shown to users
  var db = null, ready = false;

  function ensure() {
    if (ready) return true;
    if (typeof firebase === "undefined") { console.error("[GSUAuth] Firebase SDK not loaded"); return false; }
    try {
      if (!firebase.apps || !firebase.apps.length) {
        if (!global.GSU_FIREBASE_CONFIG) { console.error("[GSUAuth] GSU_FIREBASE_CONFIG missing"); return false; }
        firebase.initializeApp(global.GSU_FIREBASE_CONFIG);
      }
      db = firebase.firestore();
      try { firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) {}
      ready = true; return true;
    } catch (e) { console.error("[GSUAuth]", e.message); return false; }
  }

  function cleanHandle(h) { return (h || "").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, ""); }
  function emailFor(h) { return cleanHandle(h) + EMAIL_DOMAIN; }

  function friendly(code) {
    switch (code) {
      case "auth/email-already-in-use":
      case "auth/credential-already-in-use": return "That handle is already taken. Try signing in instead.";
      case "auth/weak-password": return "Password must be at least 6 characters.";
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials": return "Handle or password not recognized.";
      case "auth/too-many-requests": return "Too many attempts. Please wait a moment and try again.";
      default: return "Something went wrong. Please try again.";
    }
  }

  /* ---- core actions ---- */
  async function createProfile(handle, password) {
    if (!ensure()) throw new Error("Profiles are unavailable right now.");
    var email = emailFor(handle);
    var cred = firebase.auth.EmailAuthProvider.credential(email, password);
    var user = firebase.auth().currentUser;
    if (user && user.isAnonymous) {
      await user.linkWithCredential(cred);          // keep uid -> keep scores
    } else {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
    }
    var uid = firebase.auth().currentUser.uid;
    await db.collection("users").doc(uid).set({
      handle: handle.trim(),
      handleLower: cleanHandle(handle),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      xp: 0, streak: 0, badges: []
    }, { merge: true });
    return uid;                                      // no reload: same uid the engine already holds
  }

  async function signIn(handle, password) {
    if (!ensure()) throw new Error("Profiles are unavailable right now.");
    await firebase.auth().signInWithEmailAndPassword(emailFor(handle), password);
    location.reload();                              // engine re-reads the profile uid on load
  }

  async function signOut() {
    if (!ensure()) return;
    await firebase.auth().signOut();
    location.reload();                              // engine returns to anonymous play
  }

  async function displayHandle(user) {
    if (!user || user.isAnonymous) return null;
    try {
      var d = await db.collection("users").doc(user.uid).get();
      if (d.exists && d.data().handle) return d.data().handle;
    } catch (e) {}
    return (user.email || "").split("@")[0] || "Profile";
  }

  /* ---- UI ---- */
  var V = { navy: "#1B2A4A", gold: "#C9A84C", goldDim: "#8C7532", teal: "#1A8B7F", cream: "#F5F1E8", panel: "#121726", line: "#243049" };

  function injectCSS() {
    if (document.getElementById("gsu-auth-css")) return;
    var s = document.createElement("style"); s.id = "gsu-auth-css";
    s.textContent =
    ".gsa-chip{font-family:Georgia,serif;font-size:14px;background:" + V.panel + ";color:" + V.cream + ";border:1px solid " + V.line + ";border-radius:22px;padding:7px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:8px}" +
    ".gsa-chip:hover{border-color:" + V.gold + ";color:" + V.gold + "}" +
    ".gsa-chip .dot{width:8px;height:8px;border-radius:50%;background:" + V.teal + "}" +
    ".gsa-float{position:fixed;top:14px;right:14px;z-index:9998}" +
    ".gsa-ov{position:fixed;inset:0;background:rgba(6,9,14,.72);z-index:9999;display:none;align-items:center;justify-content:center;padding:18px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}" +
    ".gsa-ov.open{display:flex}" +
    ".gsa-card{background:" + V.panel + ";border:1px solid " + V.line + ";border-radius:14px;max-width:380px;width:100%;padding:26px;color:" + V.cream + ";box-shadow:0 24px 60px rgba(0,0,0,.6)}" +
    ".gsa-card h2{font-family:Georgia,serif;color:" + V.gold + ";margin:0 0 4px;font-size:1.5rem}" +
    ".gsa-card p.sub{margin:0 0 16px;font-size:.9rem;opacity:.8}" +
    ".gsa-tabs{display:flex;gap:6px;margin-bottom:16px}" +
    ".gsa-tab{flex:1;padding:9px;border-radius:7px;border:1px solid " + V.line + ";background:transparent;color:" + V.cream + ";cursor:pointer;font-weight:600;font-size:.9rem}" +
    ".gsa-tab.on{background:" + V.gold + ";color:#1a1407;border-color:" + V.gold + "}" +
    ".gsa-card label{display:block;font-size:.78rem;text-transform:uppercase;letter-spacing:.12em;color:" + V.teal + ";margin:12px 0 5px}" +
    ".gsa-card input{width:100%;padding:11px 12px;border-radius:7px;border:1px solid " + V.line + ";background:#0d1322;color:" + V.cream + ";font-size:1rem}" +
    ".gsa-card input:focus{outline:none;border-color:" + V.gold + "}" +
    ".gsa-go{width:100%;margin-top:18px;padding:12px;border:none;border-radius:7px;background:" + V.gold + ";color:#1a1407;font-weight:700;font-size:1rem;cursor:pointer}" +
    ".gsa-go:disabled{opacity:.6;cursor:default}" +
    ".gsa-err{min-height:18px;margin-top:10px;font-size:.85rem;color:#E1A06A}" +
    ".gsa-note{margin-top:14px;font-size:.74rem;opacity:.6;line-height:1.5}" +
    ".gsa-x{float:right;background:none;border:none;color:" + V.cream + ";font-size:1.3rem;cursor:pointer;opacity:.6;margin:-8px -6px 0 0}";
    document.head.appendChild(s);
  }

  var els = {};
  function buildModal() {
    if (els.ov) return;
    var ov = document.createElement("div"); ov.className = "gsa-ov";
    ov.innerHTML =
      '<div class="gsa-card" role="dialog" aria-modal="true">' +
        '<button class="gsa-x" aria-label="Close">&times;</button>' +
        '<h2 id="gsa-title">Save Your Score</h2>' +
        '<p class="sub">Optional, free, and anonymous. Pick a handle. No email needed.</p>' +
        '<div class="gsa-tabs"><button class="gsa-tab on" data-mode="create">Create Profile</button><button class="gsa-tab" data-mode="signin">Sign In</button></div>' +
        '<label>Handle</label><input id="gsa-handle" autocomplete="username" maxlength="24" placeholder="your handle">' +
        '<label>Password</label><input id="gsa-pass" type="password" autocomplete="current-password" placeholder="at least 6 characters">' +
        '<div class="gsa-err" id="gsa-err"></div>' +
        '<button class="gsa-go" id="gsa-go">Create Profile</button>' +
        '<div class="gsa-note">No email is collected or stored. Because of that, a forgotten password can\'t be recovered — keep it somewhere safe.</div>' +
      '</div>';
    document.body.appendChild(ov);
    els.ov = ov;
    els.title = ov.querySelector("#gsa-title");
    els.handle = ov.querySelector("#gsa-handle");
    els.pass = ov.querySelector("#gsa-pass");
    els.err = ov.querySelector("#gsa-err");
    els.go = ov.querySelector("#gsa-go");
    els.mode = "create";

    ov.querySelector(".gsa-x").addEventListener("click", close);
    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
    ov.querySelectorAll(".gsa-tab").forEach(function (t) {
      t.addEventListener("click", function () {
        ov.querySelectorAll(".gsa-tab").forEach(function (x) { x.classList.remove("on"); });
        t.classList.add("on"); els.mode = t.getAttribute("data-mode");
        els.err.textContent = "";
        els.go.textContent = els.mode === "create" ? "Create Profile" : "Sign In";
        els.title.textContent = els.mode === "create" ? "Save Your Score" : "Welcome Back";
      });
    });
    els.go.addEventListener("click", submit);
    els.pass.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
  }

  async function submit() {
    var h = els.handle.value, p = els.pass.value;
    els.err.textContent = "";
    if (cleanHandle(h).length < 3) { els.err.textContent = "Handle must be at least 3 characters."; return; }
    if ((p || "").length < 6) { els.err.textContent = "Password must be at least 6 characters."; return; }
    els.go.disabled = true; els.go.textContent = "…";
    try {
      if (els.mode === "create") { await createProfile(h, p); close(); refreshChip(); }
      else { await signIn(h, p); }
    } catch (e) {
      els.err.textContent = friendly(e && e.code);
      els.go.disabled = false; els.go.textContent = els.mode === "create" ? "Create Profile" : "Sign In";
    }
  }

  function open() { ensure(); buildModal(); els.err.textContent = ""; els.ov.classList.add("open"); els.handle.focus(); }
  function close() { if (els.ov) els.ov.classList.remove("open"); }

  /* ---- chip ---- */
  function chipEl() {
    var c = document.getElementById("gsu-auth-chip");
    if (c) return c;
    c = document.createElement("button"); c.id = "gsu-auth-chip"; c.className = "gsa-chip";
    var slot = document.getElementById("gsu-profile-slot");
    if (slot) slot.appendChild(c); else { c.classList.add("gsa-float"); document.body.appendChild(c); }
    c.addEventListener("click", function () {
      var u = firebase.auth().currentUser;
      if (u && !u.isAnonymous) { if (confirm("Sign out?")) signOut(); } else open();
    });
    return c;
  }
  async function refreshChip() {
    if (!ensure()) return;
    var c = chipEl(), u = firebase.auth().currentUser;
    var name = await displayHandle(u);
    c.innerHTML = name ? '<span class="dot"></span>' + name : "Sign In";
  }

  /* ---- boot ---- */
  function boot() {
    injectCSS();
    if (!ensure()) return;
    firebase.auth().onAuthStateChanged(function () { refreshChip(); });
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-gsu-auth-open]");
      if (t) { e.preventDefault(); open(); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();

  global.GSUAuth = { open: open, close: close, signOut: signOut, createProfile: createProfile, signIn: signIn };
})(window);
