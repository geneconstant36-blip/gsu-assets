/* ============================================================================
   TRIFURCATION ROAD — HELIX CLIMB  ·  trifurcation-road-climb.js  ·  v1.0
   IRREALITY Companion Game (BookGame Standard).  Built on gsu-game-engine.js.
   Host at: read.globalsovereignuniversity.org/trifurcation-road-climb.js
   ----------------------------------------------------------------------------
   Trifurcation Road is the GSU narrative game of contemplative choice: three
   paths (Witness, Steward, Unbound), three honorable endings, no wrong
   answer — only the answer that is yours. This climb is the companion
   review experience — comprehension and integration of the journey.
   Tiers map to layers of the work:
     Bronze   (0): the architecture — crossroads, three paths, three endings
     Silver   (1): the three voices — each path's contemplative lineage
                   (Tikkun · Bittul · Recognition · fana · wu wei · kenosis)
     Gold     (2): the beats within — specific moments, cross-arc cameos,
                   the choice mechanics
     Platinum (3): integration — IRREALITY chapters, the Helix, the
                   apostles loop, the triangular ethics of see/tend/release
   ========================================================================== */

(function () {
  const Q = [

    /* ---------- BRONZE (tier 0) : 13 — the architecture ---------- */
    { id:"b01", tier:0, prompt:"<b>Trifurcation Road</b> is best described as —",
      options:["a branching narrative game of contemplative choice with three honorable paths","a quiz about American history","a phonics curriculum","a math word-problem generator"], answer:0,
      explain:"Three paths, three endings, no wrong answer — only the answer that is yours. The game is the companion experience to <em>IRREALITY</em>, the GSU book on consciousness, repair, and release." },
    { id:"b02", tier:0, prompt:"A <b>trifurcation</b> is —",
      options:["a three-way fork or division","a four-way intersection","a dead end","a circular path"], answer:0,
      explain:"From Latin <em>tri-</em> (three) + <em>furca</em> (fork). The road of the game divides into three, and the geometry of that division is the game's central image." },
    { id:"b03", tier:0, prompt:"The three paths of the game are named —",
      options:["Witness, Steward, Unbound","Past, Present, Future","Body, Mind, Spirit","Faith, Hope, Love"], answer:0,
      explain:"Each path is a distinct contemplative posture — a different way of being in the world. None is the right one. All three lead to honorable endings." },
    { id:"b04", tier:0, prompt:"The opening scene of the game takes place —",
      options:["at a crossroads at dawn, with an old bench at the fork","in a classroom","at sea","in a library"], answer:0,
      explain:"\"You wake in a place you do not remember entering. The road behind you has no beginning you can recall. The road ahead divides into three.\" The bench is older than it looks. The crossroads is the moral architecture of the game itself." },
    { id:"b05", tier:0, prompt:"At each node of the game, the player typically faces —",
      options:["three choices, each with its own flavor","one forced choice","ten options","a yes/no question"], answer:0,
      explain:"Three options, three flavors. The number echoes the three paths themselves — and reflects the philosophical wager that meaningful choice almost always has more than two real shapes." },
    { id:"b06", tier:0, prompt:"The <b>Witness</b> path is most concerned with —",
      options:["seeing clearly without grasping","fighting injustice","building wealth","raising children"], answer:0,
      explain:"The Witness sits with the fork. The Witness lets the world arrive on its own. The Witness ending — \"recognition without grasping\" — changes nothing visible and everything invisible." },
    { id:"b07", tier:0, prompt:"The <b>Steward</b> path is most concerned with —",
      options:["tending what was given without claiming credit","seizing control of the situation","escaping responsibility","accumulating possessions"], answer:0,
      explain:"The Steward receives a broken inheritance and does the slow, unsigned work of repair. The Steward's name will be forgotten. The work will survive — and the forgetting is the quiet sign that the work succeeded." },
    { id:"b08", tier:0, prompt:"The <b>Unbound</b> path is most concerned with —",
      options:["releasing what was never yours to carry","achieving enlightenment","ignoring all obligations","abandoning relationships"], answer:0,
      explain:"The Unbound learns that the small self was holding much that belonged elsewhere. The opening hand is the sovereign gesture in both directions — letting go AND receiving without grasping." },
    { id:"b09", tier:0, prompt:"The companion book to <b>Trifurcation Road</b> is titled —",
      options:["IRREALITY","The Reader's Toolkit","Phonemic Awareness","The Sovereign Trades"], answer:0,
      explain:"<em>IRREALITY</em> is the GSU contemplative book (Voltage Magazine Special Edition) on consciousness, recognition, repair, and release. Each Trifurcation Road ending bridges to a specific IRREALITY chapter." },
    { id:"b10", tier:0, prompt:"The game's central wager is that —",
      options:["there is no single right path — only the path that is yours","one path is correct and the others are wrong","all paths lead to the same ending","you must walk all three at once"], answer:0,
      explain:"Three honorable endings. The work of the game is not to find the right answer but to discover which kind of self you are choosing to become. The choice itself is the curriculum." },
    { id:"b11", tier:0, prompt:"Each path travels through —",
      options:["seventeen nodes across four tiers, converging on one honorable ending","one straight line","an infinite loop","a maze"], answer:0,
      explain:"The structural shape is identical across all three arcs: 1 opening + 3 branches + 9 deeper beats + 3 convergence nodes + 1 ending = 17 nodes. Same architecture, three different inhabitations." },
    { id:"b12", tier:0, prompt:"The first badge a player earns — simply by arriving — is called —",
      options:["The Crossroads","The Winner","The First","The Pilgrim"], answer:0,
      explain:"\"Arrived at the fork.\" The act of facing the choice is itself meaningful. The badge marks the moment before anything is decided — the standing-at-the-bench moment." },
    { id:"b13", tier:0, prompt:"A player who reaches <b>all three endings</b> across replays earns —",
      options:["The Full Walker — knows the road from all three angles","nothing","a refund","a trophy"], answer:0,
      explain:"The Full Walker is the rarest badge. It marks the player who has walked each contemplative posture and learned that the three roads were never as separate as the maps suggested." },

    /* ---------- SILVER (tier 1) : 13 — the three voices ---------- */
    { id:"s01", tier:1, prompt:"The Steward arc's philosophy is most directly rooted in —",
      options:["Kabbalistic <b>Tikkun</b> — sacred repair, gathering scattered sparks","Roman Stoicism","modern productivity culture","ancient Greek tragedy"], answer:0,
      explain:"Tikkun olam — \"repair of the world.\" The broken inheritance you are handed is the world with its sparks scattered. Your hand on the work is the chain of stewardship continuing through you." },
    { id:"s02", tier:1, prompt:"The Unbound arc's philosophy is most directly rooted in —",
      options:["Kabbalistic <b>Bittul</b>, Sufi <b>fana</b>, and Daoist <b>wu wei</b>","Aristotelian virtue ethics","Cartesian rationalism","Marxist materialism"], answer:0,
      explain:"Three traditions, one teaching: the small self dissolved into the larger whole; the ego annihilated in the divine; effortless action without grasping. The Unbound arc weaves all three into a single posture — the open hand." },
    { id:"s03", tier:1, prompt:"The Witness arc's philosophy is most directly rooted in —",
      options:["non-dual recognition — presence without grasping","Hegelian dialectics","behaviorist psychology","quantum mechanics"], answer:0,
      explain:"The Witness path teaches recognition: seeing clearly without converting the seeing into possession. Present in Advaita Vedanta, contemplative Christianity, Mahayana Buddhism, and the Quaker tradition." },
    { id:"s04", tier:1, prompt:"<b>Tikkun</b> (Hebrew) most accurately translates as —",
      options:["repair, restoration, mending","punishment","prayer","sacrifice"], answer:0,
      explain:"Sometimes rendered \"perfection\" or \"rectification.\" In the Lurianic Kabbalah, creation involved a shattering of vessels; tikkun is the long human work of gathering the scattered sparks back into wholeness." },
    { id:"s05", tier:1, prompt:"<b>Bittul</b> (Hebrew) most accurately refers to —",
      options:["self-nullification — the small self dissolved into the larger reality","accumulation","loud public prayer","punishment"], answer:0,
      explain:"Bittul ha-yesh — the dissolution of separate self-existence. Not death, not erasure — a quieter recognition that the boundaries of \"me\" were always more porous than they felt." },
    { id:"s06", tier:1, prompt:"<b>Fana</b> (Arabic/Sufi) most accurately refers to —",
      options:["the annihilation of the ego in the divine","fasting during Ramadan","memorization of scripture","ritual washing"], answer:0,
      explain:"Fana fi'llah — \"annihilation in God.\" The Sufi term for the dissolving of the small self in the larger reality. Rumi's poetry is, in large part, an extended commentary on what fana feels like from the inside." },
    { id:"s07", tier:1, prompt:"<b>Wu wei</b> (Daoist) most accurately refers to —",
      options:["effortless action — non-grasping, non-forcing","laziness or inactivity","strict discipline","ritual obedience"], answer:0,
      explain:"Often mistranslated as \"non-action.\" Closer to: action that does not push against the grain of the moment. The Unbound path's posture of the opening hand is wu wei in narrative form." },
    { id:"s08", tier:1, prompt:"Christian <b>kenosis</b> — the self-emptying of Christ — is closest to which Trifurcation Road path?",
      options:["the Unbound","the Witness","the Steward","none of the three"], answer:0,
      explain:"Kenosis (κένωσις) — the self-emptying described in Philippians 2. The Unbound arc draws from the same well: the deliberate setting-down of what was never the small self's to keep." },
    { id:"s09", tier:1, prompt:"The Witness ending — <b>\"The Witness\"</b> — is described as —",
      options:["the quiet ending that changes nothing visible and everything invisible","the most dramatic of the three","an ending with fireworks","a failed ending"], answer:0,
      explain:"\"You will carry this forward, into whatever comes next, and the world will not know you have crossed a threshold. You will know. The witness always knows.\"" },
    { id:"s10", tier:1, prompt:"The Steward ending — <b>\"The Steward's Bequest\"</b> — turns on the recognition that —",
      options:["the forgetting of the maker is the quiet sign that the work succeeded","everyone must remember the steward","the steward must sign every work","the work was never important"], answer:0,
      explain:"\"A monument announces the maker. A bequest disappears the maker into the made.\" The indistinguishability of your hand from the work is the actual eternity the path was offering." },
    { id:"s11", tier:1, prompt:"The Unbound ending — <b>\"The Walking Free\"</b> — explicitly refuses —",
      options:["transcendence and enlightenment, in favor of presence and reachability","ordinary life","relationships","emotion"], answer:0,
      explain:"\"You did not become enlightened. You did not become anything. You became reachable.\" The Unbound path refuses the heroic frame and offers instead something smaller and more useful." },
    { id:"s12", tier:1, prompt:"\"The speed of tending is the speed of trust\" is —",
      options:["the counsel offered to a Steward who chose patient examination over quick repair","a rule for chess","a slogan from a movie","a saying in a foreign language"], answer:0,
      explain:"The wisdom carried by the figure standing where the field meets the trees — both an ancestor of yours and a stranger you have never met. The instruction lands in a body willing to be slow." },
    { id:"s13", tier:1, prompt:"Beneath all three paths, the central question is —",
      options:["which kind of self do you want to become","what's the right answer","who's to blame","how can I win"], answer:0,
      explain:"Trifurcation Road treats moral choice as identity formation. Each path is not a strategy for solving a problem; each path is a shape of personhood. The choice IS the curriculum." },

    /* ---------- GOLD (tier 2) : 13 — the beats within ---------- */
    { id:"g01", tier:2, prompt:"In the Steward arc, <b>\"The Buyer at the Gate\"</b> represents —",
      options:["the temptation to sell the broken inheritance for fair-market cash and walk away light","an actual real-estate transaction","a parable from the Bible","the IRS"], answer:0,
      explain:"The temptation is not the money. The temptation is the lightness. The buyer is fair; the price is real. The only thing the buyer cannot give you is the version of yourself that would have stayed." },
    { id:"g02", tier:2, prompt:"The Steward who refuses the buyer earns the badge —",
      options:["Untraded","Wealthy","Stubborn","Free"], answer:0,
      explain:"\"The buyer leaves. The charge remains. So do you.\" The badge marks the choice to keep the work that is not yet finished and not yet repaid." },
    { id:"g03", tier:2, prompt:"In the Witness arc, the figure walking toward you down the path turns out to be —",
      options:["an older version of yourself who has been to all three endings","a stranger asking for directions","a child","an enemy"], answer:0,
      explain:"\"This figure has been to all three endings, at different times, in different lives, and has come back each time to this bench to watch someone else begin.\" The territory of IRREALITY Chapter 7 — The Permeable Membrane." },
    { id:"g04", tier:2, prompt:"In the Unbound arc, <b>\"The Calling Back\"</b> beat is —",
      options:["a voice from your old life asking you to pick up what you set down","a phone call from a friend","an alarm clock","a memory"], answer:0,
      explain:"The voice is familiar and not malevolent. It is calling on a contract whose other party has dissolved. You can answer the voice without lifting the weight again." },
    { id:"g05", tier:2, prompt:"The Unbound arc's <b>\"Stripping\"</b> beat reveals that —",
      options:["the discipline practiced on voluntary release prepares the hand for involuntary loss","loss only happens to other people","losses can always be reversed","grief and resentment are the same thing"], answer:0,
      explain:"\"The opening hand is the same hand, in both directions.\" Grief is real; resentment is optional. The voluntary practice quietly built the muscle the involuntary moment now requires." },
    { id:"g06", tier:2, prompt:"The Steward player who meets the Witness across the field earns —",
      options:["Cross-Witness — the recognition that the roads were never as separate as the maps suggested","Witness Killer","Spy","Trespasser"], answer:0,
      explain:"\"Some recognitions are entirely sufficient to themselves. The work of consciousness and the work of repair are not the same work, but they are two faces of the same patience.\"" },
    { id:"g07", tier:2, prompt:"The Unbound player who meets the Steward across the field earns —",
      options:["Cross-Steward — tending and releasing are not arguments, they are languages","Steward Killer","Reluctant","Defeated"], answer:0,
      explain:"\"Neither of you raises a voice. The distance is small enough that you could speak; the distance is also large enough that the speech would be incidental to the meeting.\" The cross-arc cameo." },
    { id:"g08", tier:2, prompt:"The Steward's <b>\"Sovereign Choice\"</b> beat teaches that the work is —",
      options:["not restoration but addition — each steward adds a layer the previous could not have","always restoration to the original","destruction of the old","escape from the work"], answer:0,
      explain:"\"Your addition is not a contamination. Your addition is the way the lineage learns. Each steward in the chain adds a layer the previous stewards could not have added, because the world they tended in was not yet the world that produced you.\"" },
    { id:"g09", tier:2, prompt:"In the Witness arc, <b>\"The Path That Scared You\"</b> turns out to be scary because —",
      options:["you were unfamiliar with being the kind of person who walks this path","the path is genuinely dangerous","of supernatural forces","of bad lighting"], answer:0,
      explain:"\"The path has not been scary because it was wrong. The path has been scary because it was teaching you who you are becoming.\" The unfamiliar is the curriculum, not the obstacle." },
    { id:"g10", tier:2, prompt:"The Unbound arc's <b>\"Mirror\"</b> beat — meeting someone gripping what you released — teaches that —",
      options:["their grasp is theirs; you cannot pry a fist open from outside without bruising what is inside","you should rescue them","you should ignore them","you should compete with them"], answer:0,
      explain:"\"The most honest thing you can do — for them, for yourself — is to keep walking your own path with your own opening hand. They will see it, if they are ready.\" Releasing your need to teach is itself a release." },
    { id:"g11", tier:2, prompt:"The Steward's <b>\"Heir\"</b> beat reveals that the steward's job is —",
      options:["both the work AND becoming someone the next hand can imitate","only the work","only the teaching","neither, both pass automatically"], answer:0,
      explain:"\"Whatever this charge is, it was being prepared for them as much as for you — and your job is not only to repair the gift but to make of yourself someone they can imitate. The work is double. The hand and the eye that watches the hand.\"" },
    { id:"g12", tier:2, prompt:"In the Unbound arc, <b>\"The Bowl Refilling Itself\"</b> teaches that —",
      options:["the open hand is not empty; it is simply not gripping","empty hands are useless","you must always be receiving","release is the same as starvation"], answer:0,
      explain:"\"The pouring-in was a function of the pouring-out. You did not become emptier by releasing. You became more receivable.\" Things still land in the open palm — they just are not held." },
    { id:"g13", tier:2, prompt:"The Steward's first opening choice — examine, repair, or question — is —",
      options:["a posture toward inheritance: patient, eager, or skeptical","a moral test","a memory game","a random fork"], answer:0,
      explain:"Each opening choice in the Steward arc reveals a different relationship to what was given. None is wrong. Each surfaces different beats — the patient examiner meets the heir early; the eager repairer meets the storm." },

    /* ---------- PLATINUM (tier 3) : 13 — integration ---------- */
    { id:"p01", tier:3, prompt:"Trifurcation Road belongs to the GSU <b>BookGame Standard</b> — meaning each book at GSU comes with —",
      options:["one video, one podcast, one embedded chapter, one game, and three cross-links","only a PDF","only a podcast","nothing besides the text"], answer:0,
      explain:"The BookGame Standard is the locked deployment pattern across GSU's Library. <em>IRREALITY</em> was the first book to ship complete in this standard. Trifurcation Road is its game-leg." },
    { id:"p02", tier:3, prompt:"The IRREALITY chapter that opens the Witness ending — <b>Chapter 8</b> — is titled —",
      options:["Recognition","Tikkun","Unbinding","The Permeable Membrane"], answer:0,
      explain:"\"The philosophy of recognition — seeing clearly without grasping — is given its full treatment in Chapter Eight of IRREALITY.\" The ending and the chapter are the same teaching in two forms." },
    { id:"p03", tier:3, prompt:"The IRREALITY chapter that opens the Steward ending — <b>Chapter 9</b> — is titled —",
      options:["Tikkun","Recognition","Unbinding","Shells and Peels"], answer:0,
      explain:"\"The philosophy of Tikkun — the sacred work of repair, the bequest that erases the maker — is given its full treatment in Chapter Nine.\" The Steward arc points the player to this chapter at the moment of crossing." },
    { id:"p04", tier:3, prompt:"The IRREALITY chapter that opens the Unbound ending — <b>Chapter 10</b> — is titled —",
      options:["Unbinding","Tikkun","Recognition","The Permeable Membrane"], answer:0,
      explain:"\"The philosophy of unbinding — release as a quality of attention, the open hand as the sovereign gesture in both directions — is given its full treatment in Chapter Ten.\"" },
    { id:"p05", tier:3, prompt:"Trifurcation Road connects to the larger Reading Helix curriculum through the principle —",
      options:["No one reads alone — the line is a circle, the learner becomes the teacher","reading is solitary","games are not learning","contemplation is private"], answer:0,
      explain:"The Helix's apostles loop — Bronze · Silver · Gold · Platinum · Apostle — turns every learner into the next teacher. Trifurcation Road's three paths are three different ways of taking up that responsibility." },
    { id:"p06", tier:3, prompt:"The three arcs together can be summarized as a triangular ethics of —",
      options:["<b>see</b> · <b>tend</b> · <b>release</b>","fight · flee · freeze","past · present · future","know · do · believe"], answer:0,
      explain:"Each verb is one face of the same dignity. See clearly without grasping. Tend what was given without claiming credit. Release what was never yours to carry. Three angles on one ethical orientation." },
    { id:"p07", tier:3, prompt:"The Steward ending names the steward's eventual <b>forgetting by future generations</b> as —",
      options:["the quiet sign that the work succeeded","a tragedy to be resisted","a punishment","an accident"], answer:0,
      explain:"\"A monument announces the maker. A bequest disappears the maker into the made.\" The forgetting and the success are the same event seen from different sides. The work outlives the name." },
    { id:"p08", tier:3, prompt:"The phrase \"the indistinguishability of your hand from the work\" is described in the Steward ending as —",
      options:["the actual eternity the path was offering all along","a tragedy of erasure","an unfortunate side effect","a failure to be remembered"], answer:0,
      explain:"\"You will be more present in the lives of those strangers than the people who carved their names into stone will ever be in the lives of theirs.\" Hands disappear into work; work persists. That persistence IS the steward." },
    { id:"p09", tier:3, prompt:"The Unbound ending refuses the language of <b>transcendence</b> in favor of —",
      options:["reachability — by yourself, by the world, by the moments that had been arriving at a sealed-up door","mystical union","total detachment","retreat from society"], answer:0,
      explain:"\"You did not become enlightened. You did not become anything. You became reachable.\" The Unbound path teaches that release is not departure from the world — it is the door through which the world finally arrives." },
    { id:"p10", tier:3, prompt:"The Witness ending teaches that recognition is —",
      options:["the capacity to be present to your own life without demanding it become something else first","an achievement that takes years","reserved for monks","unreachable by ordinary people"], answer:0,
      explain:"\"This is not transcendence. It is not escape. It is not enlightenment. It is something smaller and more useful.\" Recognition is the everyday posture that the Witness arc was teaching all along." },
    { id:"p11", tier:3, prompt:"A learner who walks Trifurcation Road, reads IRREALITY, and shares both with another person has begun the <b>apostles loop</b> by —",
      options:["becoming a teacher in waiting — the line is a circle","completing a transaction","earning credit","reaching the end"], answer:0,
      explain:"Every learner is a teacher in waiting. Every teacher was once a learner. The Helix closes only when the learner hands the work forward. Trifurcation Road is one of the loops where that handoff begins." },
    { id:"p12", tier:3, prompt:"The deepest claim Trifurcation Road makes about moral choice is that —",
      options:["the choice is not between right and wrong, but between which kind of self to become","there are no real choices","all choices are equally good","the rules are fixed and external"], answer:0,
      explain:"Three honorable endings. Zero villains. Zero wrong turns. The game's quiet wager is that identity is forged in the act of choosing, not in obeying an external rulebook. Choice is the practice of becoming." },
    { id:"p13", tier:3, prompt:"At the end of the climb, what has the player gained?",
      options:["a vocabulary for naming the contemplative work already happening in their own life","a high score","a certificate","nothing — it was only a game"], answer:0,
      explain:"The climb is not about the game. The climb is about giving names to the see-tend-release work the learner is already doing in the world. <em>Trifurcation Road</em>, IRREALITY, and the Helix together offer one thing: a shared language for the inner work of becoming. The road continues. Welcome to the loop." }
  ];

  function start() {
    window.GSUGame.init({
      gameId: "trifurcation-road-climb",
      title: "Trifurcation Road — Helix Climb",
      subtitle: "Three roads. Three endings. No wrong answer — only the one that is yours.",
      themeColor: "#1A8B7F",
      footNote: "IRREALITY Companion Game · BookGame Standard. Infinite play — your tier is saved.",
      questions: Q
    });
  }

  if (window.GSUGame) start();
  else {
    let tries = 0;
    const t = setInterval(() => {
      if (window.GSUGame) { clearInterval(t); start(); }
      else if (++tries > 50) { clearInterval(t); console.error("[GSU] engine failed to load"); }
    }, 100);
  }
})();
