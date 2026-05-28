/* ============================================================================
   GSU GAME ENGINE  ·  gsu-game-engine.js  ·  v1.0  ·  May 28 2026
   The reusable scaffold every GSU game inherits.
   Host at: read.globalsovereignuniversity.org/gsu-game-engine.js
   ----------------------------------------------------------------------------
   A game supplies a config object + a question bank, then calls:
       GSUGame.init({ ...config });
   The engine handles: Firebase progress, the infinite play loop, tier logic,
   randomization, the GENO companion strand, and all GSU-branded styling.

   DESIGN STANDARD (locked): navy #1B2A4A · gold #C9A84C · teal #1A8B7F ·
   cream #F5F1E8 · black bg · Georgia serif headings · system sans body.

   GAME STANDARD (locked): 50+ questions; Bronze/Silver/Gold/Platinum tiers
   (>=12 each); randomized order + randomized answers; infinite play (no end
   screen); Firebase persistence (not localStorage); GENO integration;
   mobile-first; honest counterweight (tiers = demonstrated mastery).
   ========================================================================== */

(function (global) {
  "use strict";

  const GENO_PNG = "https://cdn.prod.website-files.com/690a4028667a2e2c27b665d0/69768f7aaae58ca85c3ce25e_Geno%20head-round.png";

  const TIERS = ["Bronze", "Silver", "Gold", "Platinum"];
  const TIER_COLORS = {
    Bronze:   "#B0763A",
    Silver:   "#9FA7B0",
    Gold:     "#C9A84C",
    Platinum: "#7FD8C9"
  };

  // Promotion rule (honest counterweight): you advance a tier when, over your
  // last PROMO_WINDOW answers AT THE CURRENT TIER, your accuracy is >= PROMO_PCT.
  // You are never silently demoted. If you are clearly struggling, the engine
  // OFFERS a step down — it does not force it, and it never lies about progress.
  const PROMO_WINDOW = 20;
  const PROMO_PCT = 0.80;
  const STRUGGLE_WINDOW = 15;
  const STRUGGLE_PCT = 0.40;

  // ---- Firebase wiring -----------------------------------------------------
  // The engine reuses an already-initialized Firebase app if one exists on the
  // page (e.g. the Sovereign Handshake's gsu-handshake project). Otherwise it
  // initializes from window.GSU_FIREBASE_CONFIG. If neither is available it
  // falls back to in-memory session progress so the game is still playable.
  let db = null;
  let uid = null;
  let firebaseReady = false;

  async function initFirebase() {
    try {
      if (typeof firebase === "undefined") return false;
      if (!firebase.apps || !firebase.apps.length) {
        if (!global.GSU_FIREBASE_CONFIG) return false;
        firebase.initializeApp(global.GSU_FIREBASE_CONFIG);
      }
      db = firebase.firestore();
      const cred = await firebase.auth().signInAnonymously();
      uid = cred.user.uid;
      firebaseReady = true;
      return true;
    } catch (e) {
      console.warn("[GSU] Firebase unavailable, using session progress:", e.message);
      return false;
    }
  }

  async function loadProgress(gameId) {
    const blank = { tier: 0, lifetimeAnswered: 0, lifetimeCorrect: 0, recent: {} };
    if (!firebaseReady) {
      try { return JSON.parse(sessionStorage.getItem("gsu_" + gameId)) || blank; }
      catch (e) { return blank; }
    }
    try {
      const doc = await db.collection("gameProgress").doc(uid)
                          .collection("games").doc(gameId).get();
      return doc.exists ? Object.assign(blank, doc.data()) : blank;
    } catch (e) {
      console.warn("[GSU] loadProgress fell back to session:", e.message);
      return blank;
    }
  }

  async function saveProgress(gameId, progress) {
    if (!firebaseReady) {
      try { sessionStorage.setItem("gsu_" + gameId, JSON.stringify(progress)); }
      catch (e) {}
      return;
    }
    try {
      await db.collection("gameProgress").doc(uid)
              .collection("games").doc(gameId)
              .set(progress, { merge: true });
    } catch (e) {
      console.warn("[GSU] saveProgress fell back to session:", e.message);
      try { sessionStorage.setItem("gsu_" + gameId, JSON.stringify(progress)); } catch (e2) {}
    }
  }

  // ---- Utilities -----------------------------------------------------------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pct(n) { return Math.round(n * 100); }

  // ---- CSS injection (GSU brand, mobile-first) -----------------------------
  function injectCSS(theme) {
    if (document.getElementById("gsu-game-css")) return;
    const accent = theme || "#1A8B7F";
    const css = `
.gsu-game{--navy:#1B2A4A;--gold:#C9A84C;--teal:#1A8B7F;--cream:#F5F1E8;
  --accent:${accent};--ink:#0A0907;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:var(--cream);background:radial-gradient(1200px 600px at 50% -10%,rgba(26,139,127,.10),transparent 60%),var(--ink);
  border-radius:18px;padding:clamp(18px,4vw,34px);max-width:780px;margin:0 auto;
  box-shadow:0 24px 60px rgba(0,0,0,.45);position:relative;overflow:hidden}
.gsu-game *{box-sizing:border-box}
.gsu-game h1,.gsu-game h2,.gsu-game h3{font-family:Georgia,"Times New Roman",serif;color:var(--cream);margin:0}
.gsu-game .gg-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px}
.gsu-game .gg-title{font-size:clamp(20px,4.4vw,28px);line-height:1.15}
.gsu-game .gg-sub{color:#B9D8D2;font-style:italic;font-size:14px;margin-top:4px}
.gsu-game .gg-tier{display:inline-flex;align-items:center;gap:8px;border:1.5px solid var(--gold);
  border-radius:999px;padding:6px 14px;font-size:13px;font-weight:700;letter-spacing:.5px;white-space:nowrap}
.gsu-game .gg-tier .dot{width:11px;height:11px;border-radius:50%}
.gsu-game .gg-card{background:rgba(245,241,232,.04);border:1px solid rgba(201,168,76,.22);
  border-radius:14px;padding:clamp(18px,4vw,28px);margin:10px 0 18px}
.gsu-game .gg-prompt{font-size:clamp(18px,4vw,23px);line-height:1.45;font-family:Georgia,serif}
.gsu-game .gg-context{color:#CFC7B6;font-size:15px;line-height:1.5;margin-bottom:14px}
.gsu-game .gg-answers{display:grid;gap:11px;margin-top:6px}
.gsu-game .gg-ans{appearance:none;text-align:left;width:100%;cursor:pointer;
  background:rgba(27,42,74,.55);border:1.5px solid rgba(201,168,76,.30);color:var(--cream);
  border-radius:11px;padding:15px 16px;font-size:16px;line-height:1.4;transition:transform .08s,border-color .15s,background .15s}
.gsu-game .gg-ans:hover{border-color:var(--gold);background:rgba(27,42,74,.85);transform:translateY(-1px)}
.gsu-game .gg-ans:disabled{cursor:default;transform:none}
.gsu-game .gg-ans.correct{border-color:#5BC98B;background:rgba(91,201,139,.18)}
.gsu-game .gg-ans.wrong{border-color:#D9645B;background:rgba(217,100,91,.16);opacity:.9}
.gsu-game .gg-ans .gg-key{display:inline-block;min-width:24px;font-weight:700;color:var(--gold)}
.gsu-game .gg-fb{margin:16px 0 4px;padding:14px 16px;border-radius:11px;font-size:15px;line-height:1.55;
  border-left:4px solid var(--accent);background:rgba(26,139,127,.10);display:none}
.gsu-game .gg-fb.show{display:block}
.gsu-game .gg-fb.ok{border-left-color:#5BC98B;background:rgba(91,201,139,.10)}
.gsu-game .gg-fb.no{border-left-color:#D9645B;background:rgba(217,100,91,.10)}
.gsu-game .gg-fb b{color:var(--cream)}
.gsu-game .gg-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:14px}
.gsu-game .gg-next{appearance:none;cursor:pointer;font-weight:700;font-size:16px;letter-spacing:.3px;
  background:linear-gradient(135deg,var(--gold),#E5C66A);color:#241B05;border:none;border-radius:11px;
  padding:13px 26px;transition:transform .08s,filter .15s}
.gsu-game .gg-next:hover{filter:brightness(1.06);transform:translateY(-1px)}
.gsu-game .gg-stats{display:flex;gap:18px;flex-wrap:wrap;color:#B9D8D2;font-size:13px}
.gsu-game .gg-stats b{color:var(--cream);font-size:15px}
.gsu-game .gg-progress{height:7px;border-radius:99px;background:rgba(245,241,232,.10);overflow:hidden;margin-top:14px}
.gsu-game .gg-progress > i{display:block;height:100%;background:linear-gradient(90deg,var(--teal),var(--gold));transition:width .4s}
.gsu-game .gg-geno{display:inline-flex;align-items:center;gap:9px;cursor:pointer;text-decoration:none;
  background:rgba(27,42,74,.7);border:1.5px solid rgba(201,168,76,.35);border-radius:999px;
  padding:8px 15px 8px 8px;color:var(--cream);font-size:14px;font-weight:600;transition:border-color .15s}
.gsu-game .gg-geno:hover{border-color:var(--gold)}
.gsu-game .gg-geno img{width:30px;height:30px;border-radius:50%;display:block}
.gsu-game .gg-toast{position:absolute;left:50%;top:14px;transform:translateX(-50%) translateY(-80px);
  background:linear-gradient(135deg,var(--gold),#E5C66A);color:#241B05;font-weight:800;
  padding:12px 22px;border-radius:999px;box-shadow:0 12px 30px rgba(0,0,0,.4);opacity:0;
  transition:transform .45s cubic-bezier(.2,1.3,.4,1),opacity .45s;z-index:5;font-size:15px;text-align:center}
.gsu-game .gg-toast.show{transform:translateX(-50%) translateY(0);opacity:1}
.gsu-game .gg-foot{margin-top:18px;padding-top:14px;border-top:1px solid rgba(201,168,76,.18);
  display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.gsu-game .gg-link{background:none;border:none;color:#B9D8D2;font-size:13px;cursor:pointer;text-decoration:underline;padding:0}
.gsu-game .gg-link:hover{color:var(--gold)}
@media(max-width:520px){.gsu-game .gg-stats{gap:12px}.gsu-game .gg-next{width:100%}}
`;
    const tag = document.createElement("style");
    tag.id = "gsu-game-css";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // ---- The engine ----------------------------------------------------------
  const GSUGame = {
    async init(cfg) {
      const mount = document.getElementById(cfg.mountId || "gsu-game");
      if (!mount) { console.error("[GSU] mount element not found"); return; }
      injectCSS(cfg.themeColor);

      // Validate the bank meets the standard (warn, don't block).
      TIERS.forEach((t, i) => {
        const n = cfg.questions.filter(q => q.tier === i).length;
        if (n < 12) console.warn(`[GSU] ${cfg.gameId}: ${t} tier has only ${n} questions (standard is >=12).`);
      });

      await initFirebase();
      const state = {
        cfg,
        progress: await loadProgress(cfg.gameId),
        current: null,
        answered: false,
        sessionAnswered: 0,
        sessionCorrect: 0
      };
      this._state = state;
      this._render(mount);
      this._nextQuestion();
    },

    _render(mount) {
      const s = this._state, c = s.cfg;
      mount.className = "gsu-game";
      mount.innerHTML = `
        <span class="gg-toast" id="gg-toast"></span>
        <div class="gg-head">
          <div>
            <h1 class="gg-title">${c.title}</h1>
            <div class="gg-sub">${c.subtitle || ""}</div>
          </div>
          <span class="gg-tier" id="gg-tier"><span class="dot"></span><span id="gg-tier-name"></span></span>
        </div>
        <div class="gg-card">
          <div class="gg-context" id="gg-context"></div>
          <div class="gg-prompt" id="gg-prompt"></div>
          <div class="gg-answers" id="gg-answers"></div>
          <div class="gg-fb" id="gg-fb"></div>
          <div class="gg-row">
            <a class="gg-geno" id="gg-geno" href="#" aria-label="Ask GENO about this">
              <img src="${GENO_PNG}" alt="GENO"><span>Ask GENO</span></a>
            <button class="gg-next" id="gg-next" style="display:none">Next →</button>
          </div>
        </div>
        <div class="gg-stats">
          <span>This session: <b id="gg-s-ans">0</b> answered</span>
          <span>Accuracy: <b id="gg-s-acc">—</b></span>
          <span>Lifetime: <b id="gg-s-life">0</b></span>
        </div>
        <div class="gg-progress"><i id="gg-bar" style="width:0%"></i></div>
        <div class="gg-foot">
          <span class="gg-sub" style="margin:0">${c.footNote || "Infinite play. Stop whenever you like — your progress is saved."}</span>
          <button class="gg-link" id="gg-stepdown" style="display:none">Step down a tier</button>
        </div>`;

      mount.querySelector("#gg-geno").addEventListener("click", (e) => {
        e.preventDefault();
        const q = s.current;
        document.dispatchEvent(new CustomEvent("geno:open", {
          detail: { context: `${c.title} — ${TIERS[s.progress.tier]} tier. Question: ${q ? q.prompt : ""}` }
        }));
      });
      mount.querySelector("#gg-next").addEventListener("click", () => this._nextQuestion());
      mount.querySelector("#gg-stepdown").addEventListener("click", () => this._stepDown());
      this._updateChrome();
    },

    _updateChrome() {
      const s = this._state, tier = s.progress.tier;
      document.getElementById("gg-tier-name").textContent = TIERS[tier];
      document.getElementById("gg-tier").style.borderColor = TIER_COLORS[TIERS[tier]];
      document.querySelector("#gg-tier .dot").style.background = TIER_COLORS[TIERS[tier]];
      document.getElementById("gg-s-ans").textContent = s.sessionAnswered;
      document.getElementById("gg-s-life").textContent = s.progress.lifetimeAnswered;
      const acc = s.sessionAnswered ? pct(s.sessionCorrect / s.sessionAnswered) + "%" : "—";
      document.getElementById("gg-s-acc").textContent = acc;
      const recent = s.progress.recent[tier] || [];
      const within = recent.slice(-PROMO_WINDOW);
      const need = PROMO_WINDOW;
      const have = within.length;
      const good = within.filter(Boolean).length;
      const barPct = tier >= TIERS.length - 1
        ? Math.min(100, pct(good / need))
        : Math.min(100, pct(have / need) * 0.5 + pct(good / need) * 0.5);
      document.getElementById("gg-bar").style.width = barPct + "%";
      // Struggle offer
      const struggle = recent.slice(-STRUGGLE_WINDOW);
      const showStep = tier > 0 && struggle.length >= STRUGGLE_WINDOW &&
                       (struggle.filter(Boolean).length / struggle.length) < STRUGGLE_PCT;
      document.getElementById("gg-stepdown").style.display = showStep ? "inline" : "none";
    },

    _nextQuestion() {
      const s = this._state, tier = s.progress.tier;
      const pool = s.cfg.questions.filter(q => q.tier === tier);
      // Avoid immediate repeat of the same question when possible.
      let q = pool[Math.floor(Math.random() * pool.length)];
      if (pool.length > 1 && s.current && q.id === s.current.id) {
        q = pool[(pool.indexOf(q) + 1) % pool.length];
      }
      s.current = q;
      s.answered = false;

      document.getElementById("gg-context").textContent = q.context || "";
      document.getElementById("gg-context").style.display = q.context ? "block" : "none";
      document.getElementById("gg-prompt").innerHTML = q.prompt;
      const fb = document.getElementById("gg-fb");
      fb.className = "gg-fb"; fb.innerHTML = "";
      document.getElementById("gg-next").style.display = "none";

      const answers = shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })));
      const wrap = document.getElementById("gg-answers");
      wrap.innerHTML = "";
      answers.forEach((a, i) => {
        const btn = document.createElement("button");
        btn.className = "gg-ans";
        btn.innerHTML = `<span class="gg-key">${String.fromCharCode(65 + i)}</span> ${a.text}`;
        btn.addEventListener("click", () => this._answer(btn, a, answers));
        wrap.appendChild(btn);
      });
      this._updateChrome();
    },

    _answer(btn, choice, answers) {
      const s = this._state;
      if (s.answered) return;
      s.answered = true;
      const q = s.current, tier = s.progress.tier;

      document.querySelectorAll(".gsu-game .gg-ans").forEach((b, i) => {
        b.disabled = true;
        if (answers[i].correct) b.classList.add("correct");
        else if (b === btn) b.classList.add("wrong");
      });

      const correct = choice.correct;
      s.sessionAnswered++;
      s.progress.lifetimeAnswered++;
      if (correct) { s.sessionCorrect++; s.progress.lifetimeCorrect++; }
      s.progress.recent[tier] = (s.progress.recent[tier] || []).concat(correct).slice(-50);

      const fb = document.getElementById("gg-fb");
      fb.className = "gg-fb show " + (correct ? "ok" : "no");
      fb.innerHTML = `<b>${correct ? "Correct." : "Not quite."}</b> ${q.explain}`;
      document.getElementById("gg-next").style.display = "inline";

      this._maybePromote();
      this._updateChrome();
      saveProgress(s.cfg.gameId, s.progress);
    },

    _maybePromote() {
      const s = this._state, tier = s.progress.tier;
      if (tier >= TIERS.length - 1) return;
      const within = (s.progress.recent[tier] || []).slice(-PROMO_WINDOW);
      if (within.length < PROMO_WINDOW) return;
      const acc = within.filter(Boolean).length / within.length;
      if (acc >= PROMO_PCT) {
        s.progress.tier++;
        s.progress.recent[s.progress.tier] = s.progress.recent[s.progress.tier] || [];
        this._toast(`${TIERS[s.progress.tier]} tier unlocked! 🎉`);
      }
    },

    _stepDown() {
      const s = this._state;
      if (s.progress.tier > 0) {
        s.progress.tier--;
        this._toast(`Back to ${TIERS[s.progress.tier]} — build the foundation, then climb.`);
        saveProgress(s.cfg.gameId, s.progress);
        this._nextQuestion();
      }
    },

    _toast(msg) {
      const t = document.getElementById("gg-toast");
      t.textContent = msg; t.classList.add("show");
      setTimeout(() => t.classList.remove("show"), 2600);
    }
  };

  global.GSUGame = GSUGame;
})(window);
