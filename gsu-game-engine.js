/* ============================================================================
   GSU GAME ENGINE  ·  gsu-game-engine.js  ·  v1.3  ·  patched for profiles
   Host at: read.globalsovereignuniversity.org/gsu-game-engine.js
   ----------------------------------------------------------------------------
   v1.2 adds optional QUEST MODE (cfg.quest). When present, the engine becomes a
   journey: footing, the Drift knockback, named Gates with Keeper challenges,
   synthesized audio cues, a road-map HUD, and a Summit certification finale.
   Games WITHOUT cfg.quest behave exactly as v1.1 (standard tiered play).

   cfg.quest = {
     drift: true,                       // enable footing + knockback
     footing: 3,                        // starting footing
     gateAt: 8,                         // correct answers at a road to reach its Gate
     gateStreak: 3,                     // consecutive correct to pass the Gate
     audio: true,                       // synthesized sound cues (with mute toggle)
     realmWord: "road",                 // noun used in messaging ("road"/"tier")
     gates: [ {name, keeper, intro, pass} , ... ],  // one per tier
     summit: { title, body, ctaText, ctaUrl }       // shown after final Gate
   }
   Each tier may carry {name,color,tagline}. 50+ Qs, >=12/tier standard.
   Brand: navy #1B2A4A · gold #C9A84C · teal #1A8B7F · cream #F5F1E8 · Georgia.
   ========================================================================== */

(function (global) {
  "use strict";

  /* Certificate styling (unscoped — reused in the print window). */
  const CERT_CSS = `
.cert-inner{background:linear-gradient(135deg,#F7F3E8,#EFE7D2);color:#1B2A4A;border:3px solid #C9A84C;border-radius:6px;padding:34px 30px;max-width:520px;margin:0 auto;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.4);position:relative;font-family:Georgia,"Times New Roman",serif}
.cert-inner:before{content:"";position:absolute;inset:8px;border:1px solid rgba(201,168,76,.6);border-radius:3px;pointer-events:none}
.cert-seal{width:54px;height:54px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#E5C66A,#C9A84C);color:#1B2A4A;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 12px;box-shadow:0 3px 10px rgba(0,0,0,.25)}
.cert-org{letter-spacing:3px;font-size:12px;font-weight:700;color:#1A8B7F;font-family:Arial,sans-serif;margin-bottom:14px}
.cert-title{font-size:26px;font-weight:700;color:#1B2A4A;margin-bottom:16px;line-height:1.15}
.cert-presented{font-size:13px;color:#6B5320;font-style:italic;margin-bottom:6px}
.cert-name{font-size:30px;color:#1B2A4A;border-bottom:1px solid rgba(201,168,76,.6);display:inline-block;padding:0 18px 6px;margin-bottom:16px}
.cert-recognition{font-size:15px;line-height:1.5;color:#2A2A2A;max-width:440px;margin:0 auto 22px}
.cert-recognition b{color:#9C7F35}
.cert-meta{display:flex;justify-content:space-between;gap:14px;align-items:flex-end;margin-top:10px}
.cert-sig{text-align:left;font-family:Arial,sans-serif}
.cert-code{text-align:right;font-family:Arial,sans-serif}
.cert-sig span{display:block;font-family:Georgia,serif;font-size:15px;color:#1B2A4A;border-top:1px solid #1B2A4A;padding-top:4px}
.cert-sig small,.cert-code small{display:block;font-size:10px;color:#6B5320;margin-top:2px}
.cert-code span{display:block;font-size:12px;font-weight:700;color:#1B2A4A;letter-spacing:1px}
`;
  const DEFAULT_TIERS = [
    { name: "Bronze", color: "#B0763A" }, { name: "Silver", color: "#9FA7B0" },
    { name: "Gold", color: "#C9A84C" }, { name: "Platinum", color: "#7FD8C9" }
  ];
  const PROMO_WINDOW = 20, PROMO_PCT = 0.80, STRUGGLE_WINDOW = 15, STRUGGLE_PCT = 0.40;

  /* ---- Firebase ---- */
  let db = null, uid = null, firebaseReady = false;
  async function initFirebase() {
    try {
      if (typeof firebase === "undefined") return false;
      if (!firebase.apps || !firebase.apps.length) {
        if (!global.GSU_FIREBASE_CONFIG) return false;
        firebase.initializeApp(global.GSU_FIREBASE_CONFIG);
      }
      db = firebase.firestore();
      // v1.3: respect a restored profile session before falling back to anonymous.
      await new Promise(function(res){ var off = firebase.auth().onAuthStateChanged(function(u){ off(); res(u); }); });
      uid = (firebase.auth().currentUser || (await firebase.auth().signInAnonymously()).user).uid;
      firebaseReady = true; return true;
    } catch (e) { console.warn("[GSU] Firebase off, session progress:", e.message); return false; }
  }
  async function loadProgress(gameId) {
    const blank = { tier: 0, lifetimeAnswered: 0, lifetimeCorrect: 0, recent: {}, bestTier: 0 };
    if (!firebaseReady) { try { return Object.assign(blank, JSON.parse(sessionStorage.getItem("gsu_" + gameId)) || {}); } catch (e) { return blank; } }
    try {
      const doc = await db.collection("users").doc(uid).collection("games").doc(gameId).get();
      return doc.exists ? Object.assign(blank, doc.data()) : blank;
    } catch (e) { return blank; }
  }
  async function saveProgress(gameId, p) {
    if (!firebaseReady) { try { sessionStorage.setItem("gsu_" + gameId, JSON.stringify(p)); } catch (e) {} return; }
    try { await db.collection("users").doc(uid).collection("games").doc(gameId).set(p, { merge: true }); }
    catch (e) { try { sessionStorage.setItem("gsu_" + gameId, JSON.stringify(p)); } catch (e2) {} }
  }

  /* ---- Utils ---- */
  function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function pct(n){return Math.round(n*100);}

  /* ---- Audio (synthesized; original cues, no files) ---- */
  const Audio = {
    ctx: null, muted: false,
    ensure(){ if(!this.ctx){ try{ this.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } },
    tone(freq, dur, type, when, gain){
      if(this.muted||!this.ctx) return;
      const t=this.ctx.currentTime+(when||0);
      const o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type=type||"sine"; o.frequency.value=freq;
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(gain||0.18,t+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t+dur+0.02);
    },
    correct(){ this.ensure(); this.tone(660,0.12,"sine",0,0.16); this.tone(880,0.16,"sine",0.10,0.16); },
    wrong(){ this.ensure(); this.tone(220,0.22,"sawtooth",0,0.12); },
    slip(){ this.ensure(); this.tone(180,0.18,"triangle",0,0.13); this.tone(120,0.22,"triangle",0.10,0.12); },
    gate(){ this.ensure(); [523,659,784,1047].forEach((f,i)=>this.tone(f,0.20,"sine",i*0.10,0.16)); },
    drift(){ this.ensure(); this.tone(300,0.5,"sine",0,0.14); if(this.ctx){const t=this.ctx.currentTime;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type="sine";o.frequency.setValueAtTime(300,t);o.frequency.exponentialRampToValueAtTime(90,t+0.6);g.gain.setValueAtTime(0.14,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.6);o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+0.62);} },
    summit(){ this.ensure(); [523,659,784,1047,1319].forEach((f,i)=>this.tone(f,0.3,"sine",i*0.12,0.17)); }
  };

  /* ---- CSS ---- */
  function injectCSS(theme){
    if(document.getElementById("gsu-game-css")) return;
    const accent=theme||"#1A8B7F";
    const css=`
.gsu-game{--navy:#1B2A4A;--gold:#C9A84C;--teal:#1A8B7F;--cream:#F5F1E8;--accent:${accent};--ink:#0A0907;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--cream);
  background:radial-gradient(1200px 600px at 50% -10%,rgba(26,139,127,.10),transparent 60%),var(--ink);
  border-radius:18px;padding:clamp(18px,4vw,34px);max-width:780px;margin:0 auto;box-shadow:0 24px 60px rgba(0,0,0,.45);position:relative;overflow:hidden}
.gsu-game *{box-sizing:border-box}
.gsu-game h1,.gsu-game h2,.gsu-game h3{font-family:Georgia,"Times New Roman",serif;color:var(--cream);margin:0}
.gsu-game .gg-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:6px}
.gsu-game .gg-title{font-size:clamp(20px,4.4vw,28px);line-height:1.15}
.gsu-game .gg-sub{color:#B9D8D2;font-style:italic;font-size:14px;margin-top:4px}
.gsu-game .gg-tier{display:inline-flex;align-items:center;gap:8px;border:1.5px solid var(--gold);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:700;letter-spacing:.5px;white-space:nowrap}
.gsu-game .gg-tier .dot{width:11px;height:11px;border-radius:50%}
.gsu-game .gg-tagline{color:#CFC7B6;font-size:13px;font-style:italic;margin:2px 0 12px}
/* quest HUD */
.gsu-game .gg-hud{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:6px 0 14px;padding:12px 14px;background:rgba(27,42,74,.45);border:1px solid rgba(201,168,76,.2);border-radius:12px}
.gsu-game .gg-roadmap{display:flex;align-items:center;gap:6px;flex:1;min-width:200px}
.gsu-game .gg-seg{flex:1;height:8px;border-radius:99px;background:rgba(245,241,232,.12);position:relative;overflow:hidden}
.gsu-game .gg-seg > i{display:block;height:100%;width:0;transition:width .5s}
.gsu-game .gg-seg.done > i{width:100%}
.gsu-game .gg-gatemark{font-size:11px;color:#9E978A;margin:0 2px}
.gsu-game .gg-footing{display:flex;align-items:center;gap:6px}
.gsu-game .gg-foot-orb{width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFE9A8,var(--gold));box-shadow:0 0 10px rgba(201,168,76,.7);transition:opacity .3s,filter .3s}
.gsu-game .gg-foot-orb.dim{opacity:.2;filter:grayscale(1);box-shadow:none}
.gsu-game .gg-mute{background:none;border:1px solid rgba(245,241,232,.2);color:#B9D8D2;border-radius:8px;cursor:pointer;font-size:12px;padding:4px 9px}
.gsu-game .gg-mute:hover{border-color:var(--gold);color:var(--cream)}
.gsu-game .gg-card{background:rgba(245,241,232,.04);border:1px solid rgba(201,168,76,.22);border-radius:14px;padding:clamp(18px,4vw,28px);margin:6px 0 18px}
.gsu-game .gg-card.gate{border-color:var(--gold);box-shadow:0 0 40px rgba(201,168,76,.25) inset}
.gsu-game .gg-keeper{margin:-4px 0 14px;padding:12px 14px;border-radius:10px;background:linear-gradient(135deg,rgba(201,168,76,.16),rgba(27,42,74,.4));border-left:3px solid var(--gold)}
.gsu-game .gg-keeper b{color:var(--gold);font-family:Georgia,serif;font-size:16px}
.gsu-game .gg-keeper p{margin:6px 0 0;font-style:italic;color:#E6DFCF;font-size:14px;line-height:1.5}
.gsu-game .gg-prompt{font-size:clamp(18px,4vw,23px);line-height:1.45;font-family:Georgia,serif}
.gsu-game .gg-context{color:#E6DFCF;font-size:16px;line-height:1.6;margin-bottom:16px;padding:14px 16px;background:rgba(27,42,74,.4);border-left:3px solid var(--accent);border-radius:0 10px 10px 0}
.gsu-game .gg-answers{display:grid;gap:11px;margin-top:6px}
.gsu-game .gg-ans{appearance:none;text-align:left;width:100%;cursor:pointer;background:rgba(27,42,74,.55);border:1.5px solid rgba(201,168,76,.30);color:var(--cream);border-radius:11px;padding:15px 16px;font-size:16px;line-height:1.4;transition:transform .08s,border-color .15s,background .15s}
.gsu-game .gg-ans:hover{border-color:var(--gold);background:rgba(27,42,74,.85);transform:translateY(-1px)}
.gsu-game .gg-ans:disabled{cursor:default;transform:none}
.gsu-game .gg-ans.correct{border-color:#5BC98B;background:rgba(91,201,139,.18)}
.gsu-game .gg-ans.wrong{border-color:#D9645B;background:rgba(217,100,91,.16);opacity:.9}
.gsu-game .gg-ans .gg-key{display:inline-block;min-width:24px;font-weight:700;color:var(--gold)}
.gsu-game .gg-fb{margin:16px 0 4px;padding:14px 16px;border-radius:11px;font-size:15px;line-height:1.55;border-left:4px solid var(--accent);background:rgba(26,139,127,.10);display:none}
.gsu-game .gg-fb.show{display:block}
.gsu-game .gg-fb.ok{border-left-color:#5BC98B;background:rgba(91,201,139,.10)}
.gsu-game .gg-fb.no{border-left-color:#D9645B;background:rgba(217,100,91,.10)}
.gsu-game .gg-fb b{color:var(--cream)}
.gsu-game .gg-row{display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap;margin-top:14px}
.gsu-game .gg-next{appearance:none;cursor:pointer;font-weight:700;font-size:16px;letter-spacing:.3px;background:linear-gradient(135deg,var(--gold),#E5C66A);color:#241B05;border:none;border-radius:11px;padding:13px 26px;transition:transform .08s,filter .15s}
.gsu-game .gg-next:hover{filter:brightness(1.06);transform:translateY(-1px)}
.gsu-game .gg-stats{display:flex;gap:18px;flex-wrap:wrap;color:#B9D8D2;font-size:13px}
.gsu-game .gg-stats b{color:var(--cream);font-size:15px}
.gsu-game .gg-toast{position:absolute;left:50%;top:14px;transform:translateX(-50%) translateY(-90px);background:linear-gradient(135deg,var(--gold),#E5C66A);color:#241B05;font-weight:800;padding:12px 22px;border-radius:999px;box-shadow:0 12px 30px rgba(0,0,0,.4);opacity:0;transition:transform .45s cubic-bezier(.2,1.3,.4,1),opacity .45s;z-index:6;font-size:15px;text-align:center;max-width:90%}
.gsu-game .gg-toast.show{transform:translateX(-50%) translateY(0);opacity:1}
.gsu-game .gg-summit{text-align:center;padding:24px 6px}
.gsu-game .gg-summit h2{font-size:clamp(24px,5vw,34px);color:var(--gold);margin-bottom:14px}
.gsu-game .gg-summit p{color:#E6DFCF;font-size:16px;line-height:1.6;max-width:560px;margin:0 auto 22px}
.gsu-game .gg-namelabel{display:block;color:#B9D8D2;font-size:13px;margin-bottom:16px}
.gsu-game .gg-nameinput{display:block;margin:8px auto 0;width:min(320px,90%);background:rgba(245,241,232,.95);border:1px solid var(--gold);border-radius:8px;padding:10px 12px;font-size:15px;color:#1B2A4A;text-align:center}
.gsu-game .gg-summit-btns{margin-top:22px;display:flex;flex-direction:column;align-items:center;gap:12px}
.gsu-game .gg-summit .cta{background:linear-gradient(135deg,var(--gold),#E5C66A);color:#241B05;font-weight:800;border:none;cursor:pointer;padding:14px 32px;border-radius:12px;font-size:16px}
.gsu-game .gg-summit .cta:hover{filter:brightness(1.06)}
.gsu-game .gg-summit .again{background:none;border:none;color:#B9D8D2;text-decoration:underline;cursor:pointer;font-size:13px}
@media(max-width:520px){.gsu-game .gg-stats{gap:12px}.gsu-game .gg-next{width:100%}}
${CERT_CSS}
`;
    const tag=document.createElement("style"); tag.id="gsu-game-css"; tag.textContent=css; document.head.appendChild(tag);
  }

  /* ---- Engine ---- */
  const GSUGame = {
    async init(cfg){
      const mount=document.getElementById(cfg.mountId||"gsu-game");
      if(!mount){console.error("[GSU] mount not found");return;}
      injectCSS(cfg.themeColor);
      const tiers=(cfg.tiers&&cfg.tiers.length>=2)?cfg.tiers:DEFAULT_TIERS;
      tiers.forEach((t,i)=>{const n=cfg.questions.filter(q=>q.tier===i).length; if(n<12) console.warn(`[GSU] ${cfg.gameId}: ${t.name} has only ${n} Qs (>=12 standard).`);});
      await initFirebase();
      const quest=cfg.quest||null;
      Audio.muted = quest ? !(quest.audio) : true;
      const state={ cfg, tiers, quest,
        progress: await loadProgress(cfg.gameId),
        current:null, answered:false, sessionAnswered:0, sessionCorrect:0,
        footing: quest?(quest.footing||3):0, roadProgress:0, atGate:false, gateStreak:0, summited:false };
      if(state.progress.tier>=tiers.length) state.progress.tier=tiers.length-1;
      this._state=state; this._render(mount); this._nextQuestion();
    },

    _render(mount){
      const s=this._state,c=s.cfg,q=s.quest;
      mount.className="gsu-game";
      const hud = q ? `
        <div class="gg-hud">
          <div class="gg-roadmap" id="gg-roadmap"></div>
          <div class="gg-footing" id="gg-footing" title="Your footing on the road"></div>
          ${q.audio?`<button class="gg-mute" id="gg-mute">🔊 Sound</button>`:""}
        </div>` : "";
      mount.innerHTML=`
        <span class="gg-toast" id="gg-toast"></span>
        <div class="gg-head">
          <div><h1 class="gg-title">${c.title}</h1><div class="gg-sub">${c.subtitle||""}</div></div>
          <span class="gg-tier" id="gg-tier"><span class="dot"></span><span id="gg-tier-name"></span></span>
        </div>
        <div class="gg-tagline" id="gg-tagline"></div>
        ${hud}
        <div class="gg-card" id="gg-card">
          <div class="gg-keeper" id="gg-keeper" style="display:none"></div>
          <div class="gg-context" id="gg-context"></div>
          <div class="gg-prompt" id="gg-prompt"></div>
          <div class="gg-answers" id="gg-answers"></div>
          <div class="gg-fb" id="gg-fb"></div>
          <div class="gg-row">
            <button class="gg-next" id="gg-next" style="display:none">Next →</button>
          </div>
        </div>
        <div class="gg-stats">
          <span>This session: <b id="gg-s-ans">0</b></span>
          <span>Accuracy: <b id="gg-s-acc">—</b></span>
          <span>Lifetime: <b id="gg-s-life">0</b></span>
        </div>`;
      mount.querySelector("#gg-next").addEventListener("click",()=>this._nextQuestion());
      if(q&&q.audio){const mb=mount.querySelector("#gg-mute");mb.addEventListener("click",()=>{Audio.muted=!Audio.muted;Audio.ensure();mb.textContent=Audio.muted?"🔇 Muted":"🔊 Sound";});}
      this._updateChrome();
    },

    _updateChrome(){
      const s=this._state,tier=s.progress.tier,T=s.tiers[tier];
      document.getElementById("gg-tier-name").textContent=T.name;
      document.getElementById("gg-tier").style.borderColor=T.color;
      document.querySelector("#gg-tier .dot").style.background=T.color;
      const tl=document.getElementById("gg-tagline"); tl.textContent=T.tagline||""; tl.style.display=T.tagline?"block":"none";
      document.getElementById("gg-s-ans").textContent=s.sessionAnswered;
      document.getElementById("gg-s-life").textContent=s.progress.lifetimeAnswered;
      document.getElementById("gg-s-acc").textContent=s.sessionAnswered?pct(s.sessionCorrect/s.sessionAnswered)+"%":"—";
      if(s.quest) this._updateHUD();
    },

    _updateHUD(){
      const s=this._state,q=s.quest,tier=s.progress.tier;
      const rm=document.getElementById("gg-roadmap"); if(rm){
        rm.innerHTML="";
        s.tiers.forEach((t,i)=>{
          const seg=document.createElement("div"); seg.className="gg-seg"+(i<tier?" done":"");
          const fill=document.createElement("i"); fill.style.background=t.color;
          if(i===tier){ const frac=s.atGate?1:Math.min(1,s.roadProgress/(q.gateAt||8)); fill.style.width=pct(frac)+"%"; }
          seg.appendChild(fill); rm.appendChild(seg);
          if(i<s.tiers.length-1){const g=document.createElement("span");g.className="gg-gatemark";g.textContent="⛩";rm.appendChild(g);}
        });
      }
      const fEl=document.getElementById("gg-footing"); if(fEl){
        fEl.innerHTML=""; const max=q.footing||3;
        for(let i=0;i<max;i++){const o=document.createElement("span");o.className="gg-foot-orb"+(i<s.footing?"":" dim");fEl.appendChild(o);}
      }
    },

    _nextQuestion(){
      const s=this._state,tier=s.progress.tier;
      if(s.summited) return;
      const promptEl=document.getElementById("gg-prompt");
      if(!promptEl) return;
      const pool=s.cfg.questions.filter(x=>x.tier===tier);
      let q=pool[Math.floor(Math.random()*pool.length)];
      if(pool.length>1&&s.current&&q.id===s.current.id) q=pool[(pool.indexOf(q)+1)%pool.length];
      s.current=q; s.answered=false;

      // Keeper banner when at a gate
      const keeper=document.getElementById("gg-keeper"), card=document.getElementById("gg-card");
      if(s.quest&&s.atGate){
        const g=s.quest.gates&&s.quest.gates[tier];
        card.classList.add("gate");
        if(g){keeper.style.display="block";keeper.innerHTML=`<b>${g.name}</b><p>${g.intro} <em>(Answer ${s.quest.gateStreak||3} in a row — ${s.gateStreak}/${s.quest.gateStreak||3} so far.)</em></p>`;}
      } else { keeper.style.display="none"; card.classList.remove("gate"); }

      const ctx=document.getElementById("gg-context"); ctx.innerHTML=q.context||""; ctx.style.display=q.context?"block":"none";
      document.getElementById("gg-prompt").innerHTML=q.prompt;
      const fb=document.getElementById("gg-fb"); fb.className="gg-fb"; fb.innerHTML="";
      document.getElementById("gg-next").style.display="none";
      const answers=shuffle(q.options.map((text,i)=>({text,correct:i===q.answer})));
      const wrap=document.getElementById("gg-answers"); wrap.innerHTML="";
      answers.forEach((a,i)=>{const b=document.createElement("button");b.className="gg-ans";b.innerHTML=`<span class="gg-key">${String.fromCharCode(65+i)}</span> ${a.text}`;b.addEventListener("click",()=>this._answer(b,a,answers));wrap.appendChild(b);});
      this._updateChrome();
    },

    _answer(btn,choice,answers){
      const s=this._state; if(s.answered) return; s.answered=true;
      const q=s.current,tier=s.progress.tier,correct=choice.correct;
      document.querySelectorAll(".gsu-game .gg-ans").forEach((b,i)=>{b.disabled=true;if(answers[i].correct)b.classList.add("correct");else if(b===btn)b.classList.add("wrong");});
      s.sessionAnswered++; s.progress.lifetimeAnswered++;
      if(correct){s.sessionCorrect++;s.progress.lifetimeCorrect++;}
      s.progress.recent[tier]=(s.progress.recent[tier]||[]).concat(correct).slice(-50);
      const fb=document.getElementById("gg-fb"); fb.className="gg-fb show "+(correct?"ok":"no");
      fb.innerHTML=`<b>${correct?"Correct.":"Not quite."}</b> ${q.explain}`;
      document.getElementById("gg-next").style.display="inline";

      if(s.quest) this._questAfterAnswer(correct);
      else this._maybePromote();
      this._updateChrome();
      saveProgress(s.cfg.gameId,s.progress);
    },

    /* ---- Quest progression: footing, gates, Drift, Summit ---- */
    _questAfterAnswer(correct){
      const s=this._state,q=s.quest,tier=s.progress.tier,maxF=q.footing||3;
      if(correct){
        Audio.correct();
        if(s.atGate){
          s.gateStreak++;
          if(s.gateStreak>=(q.gateStreak||3)){ this._passGate(); return; }
        } else {
          s.roadProgress++;
          s.footing=Math.min(maxF,s.footing+1);
          if(s.roadProgress>=(q.gateAt||8)){ s.atGate=true; s.gateStreak=0; const g=q.gates&&q.gates[tier]; this._toast(g?`⛩ ${g.name} appears`:"A Gate appears"); }
        }
      } else {
        s.footing--;
        if(s.atGate){ Audio.wrong(); s.atGate=false; s.gateStreak=0; s.roadProgress=Math.max(0,(q.gateAt||8)-2); this._toast("The Keeper turns you back. Steady yourself."); }
        else Audio.slip();
        if(s.footing<=0){ this._drift(); return; }
      }
    },

    _passGate(){
      const s=this._state,q=s.quest,tier=s.progress.tier;
      const g=q.gates&&q.gates[tier];
      Audio.gate();
      s.atGate=false; s.gateStreak=0; s.roadProgress=0; s.footing=q.footing||3;
      if(tier>=s.tiers.length-1){ this._summit(); return; }
      s.progress.tier++; s.progress.bestTier=Math.max(s.progress.bestTier||0,s.progress.tier);
      this._toast(g&&g.pass?g.pass:`${s.tiers[s.progress.tier].name} unlocked!`);
      saveProgress(s.cfg.gameId,s.progress);
    },

    _drift(){
      const s=this._state,q=s.quest;
      Audio.drift();
      s.footing=q.footing||3; s.roadProgress=0; s.atGate=false; s.gateStreak=0;
      if(s.progress.tier>0){ s.progress.tier--; this._toast("The Drift pulls you back a road. Rise, and try again."); }
      else this._toast("The Drift nearly took you. Hold the road.");
      saveProgress(s.cfg.gameId,s.progress);
    },

    _summit(){
      const s=this._state,q=s.quest,sm=q.summit||{},cert=q.certificate||{};
      s.summited=true; Audio.summit();
      // The labor was the test. Going right to approval — recorded as a real credential.
      s.progress.certified=true;
      s.progress.certDate=s.progress.certDate||new Date().toISOString().slice(0,10);
      s.progress.certCode=s.progress.certCode||this._certCode(cert.codePrefix||"GSU");
      saveProgress(s.cfg.gameId,s.progress);
      const card=document.getElementById("gg-card");
      card.classList.remove("gate");
      card.innerHTML=`<div class="gg-summit">
        <h2>${sm.title||"You have reached the Summit."}</h2>
        <p>${sm.body||""}</p>
        <label class="gg-namelabel">Put your name on it (optional):
          <input id="gg-certname" class="gg-nameinput" placeholder="Sovereign Reader" maxlength="40" autocomplete="name">
        </label>
        <div id="gg-cert">${this._certHTML(cert,s.progress,"")}</div>
        <div class="gg-summit-btns">
          <button class="cta" id="gg-print">Print / Save Certificate</button>
          <button class="again" id="gg-again">Walk the road again, deeper</button>
        </div>
      </div>`;
      const nm=document.getElementById("gg-certname");
      nm.addEventListener("input",()=>{document.getElementById("gg-cert").innerHTML=this._certHTML(cert,s.progress,nm.value.trim());});
      document.getElementById("gg-print").addEventListener("click",()=>this._printCert(cert,s.progress,nm.value.trim()));
      document.getElementById("gg-again").addEventListener("click",()=>{ s.progress.tier=0; s.footing=q.footing||3; s.roadProgress=0; s.atGate=false; s.gateStreak=0; s.summited=false; this._render(document.getElementById("gsu-game")); this._nextQuestion(); });
    },

    _certCode(prefix){
      const t=Date.now().toString(36).toUpperCase().slice(-5);
      const r=Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,3);
      return `${prefix}-${t}${r}`;
    },

    _certHTML(cert,progress,name){
      const who=(name&&name.length)?name.replace(/[<>]/g,""):"Sovereign Reader";
      return `<div class="cert-inner">
        <div class="cert-seal">★</div>
        <div class="cert-org">GLOBAL SOVEREIGN UNIVERSITY</div>
        <div class="cert-title">${cert.title||"Certificate of Mastery"}</div>
        <div class="cert-presented">This certifies that</div>
        <div class="cert-name">${who}</div>
        <div class="cert-recognition">${cert.recognition||""} <b>${cert.designation||""}</b>.</div>
        <div class="cert-meta">
          <div class="cert-sig"><span>${cert.signer||""}</span><small>${cert.signerTitle||""}</small></div>
          <div class="cert-code"><span>${progress.certCode}</span><small>Issued ${progress.certDate}</small></div>
        </div>
      </div>`;
    },

    _printCert(cert,progress,name){
      const html=this._certHTML(cert,progress,name);
      const w=window.open("","_blank");
      if(!w){ alert("Please allow pop-ups to print your certificate."); return; }
      w.document.write(`<!DOCTYPE html><html><head><title>GSU Certificate of Mastery</title><meta charset="utf-8"><style>
        body{margin:0;background:#0A0907;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
        ${CERT_CSS}
        @media print{body{background:#fff;padding:0}.cert-inner{box-shadow:none}}
      </style></head><body>${html}</body></html>`);
      w.document.close(); w.focus(); setTimeout(()=>{ try{w.print();}catch(e){} },400);
    },

    /* ---- Standard (non-quest) promotion, unchanged from v1.1 ---- */
    _maybePromote(){
      const s=this._state,tier=s.progress.tier;
      if(tier>=s.tiers.length-1) return;
      const w=(s.progress.recent[tier]||[]).slice(-PROMO_WINDOW);
      if(w.length<PROMO_WINDOW) return;
      if(w.filter(Boolean).length/w.length>=PROMO_PCT){ s.progress.tier++; s.progress.recent[s.progress.tier]=s.progress.recent[s.progress.tier]||[]; this._toast(`${s.tiers[s.progress.tier].name} unlocked! 🎉`); }
    },

    _toast(msg){ const t=document.getElementById("gg-toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2800); }
  };

  global.GSUGame=GSUGame;
})(window);
