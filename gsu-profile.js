/* ============================================================================
   GSU PROFILE PANEL  ·  gsu-profile.js  ·  v1.0
   Host at: read.globalsovereignuniversity.org/gsu-profile.js
   ----------------------------------------------------------------------------
   Renders the "Your Profile" panel. Add an empty element where it should live:
       <div id="gsu-profile-panel"></div>
   Load order on the page:  firebase compat SDK -> gsu-auth.js -> gsu-profile.js

   SIGNED OUT  -> shows the feature preview + a Create Profile button.
   SIGNED IN   -> shows LIVE data, all computed from real Firestore records:
       XP            = total correct answers across every game (users/{uid}/games/*)
       Accuracy      = lifetime correct / answered
       Badge         = highest tier reached across games (Bronze->Platinum)
       Books         = games started vs. mastered (reached top tier)
       Streak        = daily streak, maintained on this panel's load
       Rank          = position in the leaderboard collection (by XP)
       Certifications= count of users/{uid}/certs (lights up when the cert
                       program writes there)
   No data model yet -> shown honestly as pending, never faked:
       Study plan, GENO conversation history.
   ========================================================================== */
(function (global) {
  "use strict";

  var TIERS = ["Bronze", "Silver", "Gold", "Platinum"];
  var V = { navy:"#1B2A4A", gold:"#C9A84C", goldDim:"#8C7532", teal:"#1A8B7F", cream:"#F5F1E8", panel:"#121726", line:"#243049" };
  var db = null, ready = false;

  function ensure() {
    if (ready) return true;
    if (typeof firebase === "undefined") return false;
    try {
      if (!firebase.apps || !firebase.apps.length) {
        if (!global.GSU_FIREBASE_CONFIG) return false;
        firebase.initializeApp(global.GSU_FIREBASE_CONFIG);
      }
      db = firebase.firestore(); ready = true; return true;
    } catch (e) { return false; }
  }

  function css() {
    if (document.getElementById("gsu-profile-css")) return;
    var s = document.createElement("style"); s.id = "gsu-profile-css";
    s.textContent =
    "#gsu-profile-panel{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}" +
    ".gsp-card{background:linear-gradient(150deg,#101a2e,#0c1322);border:1px solid " + V.line + ";border-radius:14px;padding:24px;color:" + V.cream + "}" +
    ".gsp-card h3{font-family:Georgia,serif;color:" + V.gold + ";margin:0 0 2px;font-size:1.5rem}" +
    ".gsp-sub{font-size:.85rem;opacity:.75;margin:0 0 16px}" +
    ".gsp-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid " + V.line + ";font-size:.95rem}" +
    ".gsp-row:last-of-type{border-bottom:none}" +
    ".gsp-row .k{opacity:.85}" +
    ".gsp-row .v{font-family:Georgia,serif;color:" + V.gold + ";font-weight:700}" +
    ".gsp-row .v.muted{color:" + V.goldDim + ";font-weight:400;font-style:italic;font-family:inherit;font-size:.85rem;opacity:.8}" +
    ".gsp-badge{display:inline-block;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;padding:3px 10px;border-radius:20px;border:1px solid " + V.goldDim + ";color:" + V.gold + "}" +
    ".gsp-hd{display:flex;justify-content:space-between;align-items:baseline}" +
    ".gsp-go{margin-top:18px;width:100%;padding:12px;border:none;border-radius:7px;background:" + V.gold + ";color:#1a1407;font-weight:700;font-size:1rem;cursor:pointer}" +
    ".gsp-out{margin-top:16px;background:none;border:1px solid " + V.line + ";color:" + V.cream + ";border-radius:7px;padding:8px 14px;font-size:.82rem;cursor:pointer;opacity:.8}" +
    ".gsp-out:hover{border-color:" + V.gold + ";color:" + V.gold + "}" +
    ".gsp-feat{display:flex;align-items:center;gap:9px;padding:9px 0;border-bottom:1px solid " + V.line + ";font-size:.92rem}" +
    ".gsp-feat:last-of-type{border-bottom:none}" +
    ".gsp-feat .dot{width:7px;height:7px;border-radius:50%;background:" + V.teal + ";flex:0 0 auto}";
    document.head.appendChild(s);
  }

  function row(k, v, muted) {
    return '<div class="gsp-row"><span class="k">' + k + '</span><span class="v' + (muted ? " muted" : "") + '">' + v + '</span></div>';
  }

  function renderSignedOut(panel) {
    var feats = ["XP earned across all subjects","Badges (Bronze \u2192 Apostle)","Active certifications held",
      "Leaderboard rank (anonymous)","Daily streak","Books finished / in progress","Personal study plan","GENO conversation history"];
    panel.innerHTML =
      '<div class="gsp-card">' +
        '<h3>Your Free Profile</h3>' +
        '<p class="gsp-sub">Optional \u2014 and always will be. Pick a handle, set a password. No email needed. No personal information stored.</p>' +
        feats.map(function (f) { return '<div class="gsp-feat"><span class="dot"></span>' + f + '</div>'; }).join("") +
        '<button class="gsp-go" data-gsu-auth-open>Create Profile / Sign In</button>' +
      '</div>';
  }

  async function aggregateGames(uid) {
    var out = { xp:0, answered:0, correct:0, books:0, mastered:0, bestTier:-1 };
    try {
      var snap = await db.collection("users").doc(uid).collection("games").get();
      snap.forEach(function (d) {
        var g = d.data() || {};
        out.books += 1;
        out.answered += g.lifetimeAnswered || 0;
        out.correct += g.lifetimeCorrect || 0;
        var bt = (typeof g.bestTier === "number") ? g.bestTier : (g.tier || 0);
        if (bt > out.bestTier) out.bestTier = bt;
        if (bt >= TIERS.length - 1) out.mastered += 1;
      });
    } catch (e) {}
    out.xp = out.correct;
    return out;
  }

  async function updateStreak(uid, xp) {
    var today = new Date().toISOString().slice(0, 10);
    var yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    var streak = 1;
    try {
      var d = await db.collection("users").doc(uid).get();
      var p = d.exists ? d.data() : {};
      if (p.lastActive === today) streak = p.streak || 1;
      else if (p.lastActive === yest) streak = (p.streak || 0) + 1;
      else streak = 1;
      await db.collection("users").doc(uid).set(
        { lastActive: today, streak: streak, xp: xp }, { merge: true });
    } catch (e) {}
    return streak;
  }

  async function leaderboard(uid, handle, xp) {
    try {
      await db.collection("leaderboard").doc(uid).set(
        { handle: handle || "Sovereign", xp: xp, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      var snap = await db.collection("leaderboard").get();
      var rank = 1, total = snap.size;
      snap.forEach(function (d) { if ((d.data().xp || 0) > xp) rank += 1; });
      return { rank: rank, total: total };
    } catch (e) { return null; }
  }

  async function certCount(uid) {
    try { return (await db.collection("users").doc(uid).collection("certs").get()).size; }
    catch (e) { return null; }
  }

  async function handleOf(uid, user) {
    try { var d = await db.collection("users").doc(uid).get(); if (d.exists && d.data().handle) return d.data().handle; } catch (e) {}
    return (user.email || "").split("@")[0] || "Sovereign";
  }

  async function renderSignedIn(panel, user) {
    var uid = user.uid;
    panel.innerHTML = '<div class="gsp-card"><h3>Your Profile</h3><p class="gsp-sub">Loading your progress\u2026</p></div>';
    var handle = await handleOf(uid, user);
    var g = await aggregateGames(uid);
    var streak = await updateStreak(uid, g.xp);
    var lb = await leaderboard(uid, handle, g.xp);
    var certs = await certCount(uid);

    var acc = g.answered ? Math.round((g.correct / g.answered) * 100) + "%" : "\u2014";
    var badge = g.bestTier >= 0 ? '<span class="gsp-badge">' + TIERS[Math.min(g.bestTier, TIERS.length - 1)] + '</span>' : "\u2014";
    var inProg = Math.max(g.books - g.mastered, 0);
    var booksVal = g.books ? (g.mastered + " mastered \u00b7 " + inProg + " in progress") : "\u2014";
    var rankVal = lb ? ("#" + lb.rank + " of " + lb.total) : "\u2014";
    var certVal = (certs && certs > 0) ? certs : "None yet";

    panel.innerHTML =
      '<div class="gsp-card">' +
        '<div class="gsp-hd"><h3>' + handle + '</h3><span class="gsp-badge">Sovereign</span></div>' +
        '<p class="gsp-sub">Your progress follows you on any device.</p>' +
        row("XP earned", g.xp) +
        row("Accuracy", acc) +
        row("Highest badge", badge) +
        row("Daily streak", streak + (streak === 1 ? " day" : " days")) +
        row("Books", booksVal) +
        row("Certifications", certVal, !(certs && certs > 0)) +
        row("Leaderboard rank", rankVal) +
        row("Study plan", "Not set up yet", true) +
        row("GENO history", "Open in GENO", true) +
        '<button class="gsp-out" id="gsp-signout">Sign out</button>' +
      '</div>';

    var so = panel.querySelector("#gsp-signout");
    if (so) so.addEventListener("click", function () {
      if (global.GSUAuth && global.GSUAuth.signOut) global.GSUAuth.signOut();
      else { firebase.auth().signOut().then(function(){ location.reload(); }); }
    });
  }

  function boot() {
    var panel = document.getElementById("gsu-profile-panel");
    if (!panel) return;
    css();
    if (!ensure()) { renderSignedOut(panel); return; }
    firebase.auth().onAuthStateChanged(function (user) {
      if (user && !user.isAnonymous) renderSignedIn(panel, user);
      else renderSignedOut(panel);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();

  global.GSUProfile = { refresh: boot };
})(window);
