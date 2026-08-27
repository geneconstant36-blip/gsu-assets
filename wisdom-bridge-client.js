/* ============================================================================
   GSU WISDOM BRIDGE — SERVER-GRADED CLIENT  v1.0
   Replaces ZONE D in hvac-apprentice.html.

   What changes vs. the current page:
     - No answer key in the browser. POOL is replaced by an answer-free bank.
     - choose() no longer decides right/wrong. It records the picked TEXT.
     - finish() POSTs the picked texts to the Worker and renders what it returns.
     - The serial comes from the Worker. issueSerial() is deleted.

   ONE UNKNOWN, flagged honestly: I probed the Worker from outside and confirmed
   POST /grade {subject, answers} -> {passed, score, correct, total, missed[],
   passMark, message}. I could NOT confirm what "answers" elements must look
   like — index integers and letters both scored 0/48 against the existing
   bank, which means the Worker is almost certainly matching answer TEXT.
   This client sends TEXT. If your Worker source says otherwise, change
   buildPayload() only — nothing else depends on it.
============================================================================ */

const ASSESS_URL = "https://gsu-assess.geneconstant36.workers.dev/grade";
const SUBJECT_ID = "hvac-apprentice";

const startBtn     = document.getElementById("startBridge");
const quizCard     = document.getElementById("quizCard");
const resultBox    = document.getElementById("resultBox");
const retakeBtn    = document.getElementById("retakeBtn");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const qText        = document.getElementById("qText");
const optsBox      = document.getElementById("optsBox");
const whyText      = document.getElementById("whyText");
const nextBtn      = document.getElementById("nextBtn");

let quiz = [], idx = 0, answered = false;
let picks = [];   // picked option TEXT, one per question, in bank order

function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(){
  // PUBLIC_BANK carries questions and options only — no answers.
  quiz = PUBLIC_BANK.questions.map(q => ({
    id: q.id,
    q: q.q,
    opts: shuffle(q.opts)
  }));
  picks = new Array(quiz.length).fill(null);
}

function renderQ(){
  answered = false;
  const it = quiz[idx];
  progressText.textContent = "Question " + (idx + 1) + " of " + quiz.length;
  progressFill.style.width = ((idx + 1) / quiz.length * 100) + "%";
  qText.textContent = it.q;
  optsBox.innerHTML = "";
  whyText.classList.add("hide");
  nextBtn.classList.remove("on");
  it.opts.forEach(opt => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = opt;
    btn.addEventListener("click", () => choose(opt, btn));
    optsBox.appendChild(btn);
  });
}

function choose(optText, btn){
  if (answered) return;
  answered = true;
  optsBox.querySelectorAll("button").forEach(b => { b.disabled = true; });
  btn.classList.add("picked");
  picks[idx] = optText;
  // No right/wrong shown mid-exam — the browser genuinely does not know.
  whyText.textContent = "Answer recorded. Explanations appear after grading.";
  whyText.classList.remove("hide");
  nextBtn.classList.add("on");
}

function buildPayload(){
  return { subject: SUBJECT_ID, answers: picks.map(p => p === null ? "" : p) };
}

nextBtn.addEventListener("click", () => {
  idx++;
  if (idx >= quiz.length) finish();
  else { renderQ(); quizCard.scrollIntoView({behavior:"smooth", block:"start"}); }
});

startBtn.addEventListener("click", () => {
  buildQuiz(); idx = 0;
  quizCard.classList.add("on");
  resultBox.classList.remove("on");
  startBtn.textContent = "Restart from question 1";
  renderQ();
  quizCard.scrollIntoView({behavior:"smooth", block:"start"});
});

retakeBtn.addEventListener("click", () => {
  resultBox.classList.remove("on");
  buildQuiz(); idx = 0;
  quizCard.classList.add("on");
  renderQ();
  quizCard.scrollIntoView({behavior:"smooth", block:"start"});
});

async function finish(){
  quizCard.classList.remove("on");
  const headEl  = document.getElementById("resultHead");
  const msgEl   = document.getElementById("resultMsg");
  const badgeEl = document.getElementById("resultBadge");

  badgeEl.textContent = "…";
  headEl.textContent  = "Grading";
  msgEl.textContent   = "Your answers are being graded by the university, not by this page. One moment.";
  resultBox.classList.add("on");
  resultBox.scrollIntoView({behavior:"smooth", block:"start"});

  let r;
  try {
    const res = await fetch(ASSESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload())
    });
    r = await res.json();
    if (r.error) throw new Error(r.error);
  } catch (err) {
    badgeEl.textContent = "◆";
    headEl.innerHTML = '<span class="fail">Grading is temporarily unavailable.</span>';
    msgEl.textContent = "Your answers could not be graded just now (" + (err.message || "network") +
      "). Nothing was recorded and nothing was lost. Please retake in a few minutes — the exam is free forever.";
    return;
  }

  render(r);
}

function render(r){
  const badgeEl  = document.getElementById("resultBadge");
  const headEl   = document.getElementById("resultHead");
  const msgEl    = document.getElementById("resultMsg");
  const certBlock  = document.getElementById("certBlock");
  const certAlias  = document.getElementById("certAlias");
  const certSerial = document.getElementById("certSerial");

  const total = r.total, correct = r.correct;
  const gold  = typeof r.gold === "boolean" ? r.gold
              : (r.score >= (r.goldMark || 90));

  if (r.passed && gold){
    badgeEl.textContent = "🏆";
    headEl.innerHTML = '<span class="pass">Gold — you cleared the highest bar.</span>';
    msgEl.textContent = "Scored " + correct + "/" + total +
      ". You understand The HVAC Apprentice's Field Guide at the level Dr. Constant wrote it for. Now teach it to one person — that is Chapter 14.";
    certBlock.classList.add("on");
    certAlias.textContent  = "Level: Gold · Wisdom Bridge · HVAC Apprentice's Field Guide";
    certSerial.textContent = r.serial || "Serial pending";
    fireConversion();
  } else if (r.passed){
    badgeEl.textContent = "🥈";
    headEl.innerHTML = '<span class="pass">Silver — you cleared the bar.</span>';
    msgEl.textContent = "Scored " + correct + "/" + total +
      ". Solid comprehension. Read the chapters you missed once more and come back for Gold — a fresh set of questions is drawn every time.";
    certBlock.classList.add("on");
    certAlias.textContent  = "Level: Silver · Wisdom Bridge · HVAC Apprentice's Field Guide";
    certSerial.textContent = r.serial || "Serial pending";
    fireConversion();
    renderRemedial(r.missed);
  } else {
    badgeEl.textContent = "◆";
    const need = Math.ceil((r.passMark || 80) / 100 * total);
    headEl.innerHTML = '<span class="fail">Not yet — ' + correct + '/' + total +
      ' scored, ' + need + ' needed for Silver.</span>';
    msgEl.textContent = r.message ||
      "You have not cleared the bar. That means you are not yet ready to be certified in the comprehension of this book — and that is honest information you can act on. The exam is free forever and there is no limit on retakes.";
    certBlock.classList.remove("on");
    renderRemedial(r.missed);
  }
}

/* Google Ads conversion — fires only on a real, Worker-issued pass. */
function fireConversion(){
  try {
    if (typeof gtag === "function"){
      gtag('event','conversion',{ send_to: 'AW-18179257989/PASTE_CERT_EARNED_LABEL_HERE' });
    }
  } catch(e){}
}

/* Remediation. The Worker returns missed question indices; explanations for
   those questions live in PUBLIC_BANK, which is safe because an explanation
   without the question's correct option reveals nothing. */
function renderRemedial(missed){
  const box = document.getElementById("remedialBlock");
  if (!box) return;
  let html = '<h4>Your study path before the retake</h4>';
  html += '<div class="intro-line">' + PREPPATH.intro + '</div>';

  if (Array.isArray(missed) && missed.length){
    html += '<h5>The ' + missed.length + ' question' + (missed.length === 1 ? '' : 's') +
            ' you missed — with the chapter to re-read:</h5>';
    missed.forEach(i => {
      const src = PUBLIC_BANK.questions[i];
      if (!src) return;
      html += '<div class="missq">';
      html += '<div class="qtxt">' + esc(src.q) + '</div>';
      if (src.why) html += '<div class="whytxt">Why: ' + esc(src.why) + '</div>';
      if (src.ref) html += '<div class="chref">Reference: ' + esc(src.ref) + '</div>';
      html += '</div>';
    });
  }

  html += '<h5>Where to shore up each pillar of the book:</h5><ul class="path">';
  PREPPATH.pillars.forEach(p => {
    html += '<li><a href="' + p.href + '">' + esc(p.label || p.name) + ' →</a>' +
            '<span class="desc">' + esc(p.note) + '</span></li>';
  });
  html += '</ul>';

  html += '<div class="geno-invite"><b>Talk to GENO before you retake.</b> ' +
          'GENO is available 24/7 in 83 languages and has memorized the entire book. ' +
          'Try this conversation starter:<div class="quote">"' + esc(PREPPATH.genoStarter) +
          '"</div>Scroll to the bottom-right of any GSU page to open the GENO widget, then paste the line above.</div>';

  box.innerHTML = html;
  box.classList.add("on");
}

function esc(s){
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, ch =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
}
