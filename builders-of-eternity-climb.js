/* ============================================================================
   BUILDERS OF ETERNITY — INFINITY CLIMB  ·  builders-of-eternity-climb.js  ·  v1.0
   Built on gsu-game-engine.js.  Host at:
     read.globalsovereignuniversity.org/builders-of-eternity-climb.js
   ----------------------------------------------------------------------------
   Source of truth: the manuscript "Builders of Eternity" (Dr. Gene A. Constant).
   Tiers map to the book's spine — the Three Pillars and the people who live them:
     Bronze   (0): the vocabulary of the movement — the pillars, the bridge,
                   the Moonshot, GENO, Civilization Builders (recall)
     Silver   (1): what each pillar means, the convergence, the numbers, the
                   faith traditions (comprehension)
     Gold     (2): applying the ideas — the builder/learner stories, "not
                   charity," the three requirements (analysis)
     Platinum (3): the philosophy — education not handouts, eternity, legacy,
                   the integration of all three pillars (synthesis)
   ========================================================================== */

(function () {
  const Q = [

    /* ---------- BRONZE (tier 0) : 13 ---------- */
    { id:"b01", tier:0, prompt:"What is the central metaphor at the heart of <b>Global Sovereign University</b>?",
      options:["A bridge of knowledge","A ladder of wealth","A locked library","A mountain to climb alone"], answer:0,
      explain:"GSU is built around a bridge of knowledge — spanning poverty to sovereignty, dependence to freedom." },
    { id:"b02", tier:0, prompt:"What does GSU call its audacious goal to eliminate educational poverty worldwide?",
      options:["The Moonshot","The Mission","The Great Leap","The Summit"], answer:0,
      explain:"The Moonshot answers the question: What is possible?" },
    { id:"b03", tier:0, prompt:"What are the <b>three pillars</b> of Global Sovereign University?",
      options:["The Moonshot, the Second Calling, and the Mission","Faith, Hope, and Charity","Reading, Writing, and Arithmetic","Wisdom, Wealth, and Health"], answer:0,
      explain:"Vision, Purpose, and Transformation — the Moonshot, the Second Calling, and the Mission." },
    { id:"b04", tier:0, prompt:"What does GSU call the mentors who help learners across the bridge?",
      options:["Civilization Builders","Sovereign Scholars","Bridge Keepers","Master Teachers"], answer:0,
      explain:"Civilization Builders provide the human connection algorithms cannot replace." },
    { id:"b05", tier:0, prompt:"Complete the book's signature line: 'What you build in others ____.'",
      options:["lives forever","returns to you","makes you wealthy","will be remembered"], answer:0,
      explain:"The recurring refrain — and the book's closing thought." },
    { id:"b06", tier:0, prompt:"Which U.S. president's challenge opens the chapter on the Moonshot?",
      options:["John F. Kennedy","Franklin D. Roosevelt","Ronald Reagan","Dwight D. Eisenhower"], answer:0,
      explain:"JFK's 1962 Rice Stadium speech: 'We choose to go to the moon...'" },
    { id:"b07", tier:0, prompt:"GSU's mission is 'Building a Bridge to Freedom Through Education — not ____.'",
      options:["Handouts","Lectures","Charity drives","Tuition"], answer:0,
      explain:"Education, not handouts: dignity is built through capability." },
    { id:"b08", tier:0, prompt:"What is the name of GSU's AI tutor, available 24/7?",
      options:["GENO","SAGE","ATLAS","TUTOR-X"], answer:0,
      explain:"GENO — a robot you can actually talk to." },
    { id:"b09", tier:0, prompt:"The two ages the book says have converged are the Digital Age and the <b>____ Age</b>.",
      options:["Golden Age","Information Age","Space Age","Industrial Age"], answer:0,
      explain:"The Golden Age of healthy, experienced retirees meets the Digital Age's reach." },
    { id:"b10", tier:0, prompt:"According to the book, what can you <b>not</b> take with you when you leave this world?",
      options:["Money and possessions","Your memories","Your character","Your faith"], answer:0,
      explain:"Only your impact on other human beings is eternal." },
    { id:"b11", tier:0, prompt:"What does the book say are GSU's only free giveaways?",
      options:["Digital book downloads","Printed books mailed to your home","Branded merchandise","Gift cards"], answer:0,
      explain:"GSU never prints or mails physical books; free titles are digital downloads." },
    { id:"b12", tier:0, prompt:"The First Calling builds your life. The <b>Second Calling</b> builds ____.",
      options:["Eternity","Wealth","A business","A reputation"], answer:0,
      explain:"Your first calling built your life; your second calling builds eternity." },
    { id:"b13", tier:0, prompt:"In what U.S. state does the book say the author lives and writes?",
      options:["Oregon","Washington","Idaho","California"], answer:0,
      explain:"Dr. Constant signs the Preface from Portland, Oregon." },

    /* ---------- SILVER (tier 1) : 13 ---------- */
    { id:"s01", tier:1, prompt:"What question does the <b>Moonshot</b> pillar answer?",
      options:["What is possible?","Why should I participate?","How does change happen?","Who is responsible?"], answer:0,
      explain:"The Moonshot = WHAT is possible." },
    { id:"s02", tier:1, prompt:"What question does the <b>Second Calling</b> answer?",
      options:["Why should I participate?","What is possible?","How does transformation happen?","When should I start?"], answer:0,
      explain:"The Second Calling = WHY participate." },
    { id:"s03", tier:1, prompt:"What question does the <b>Mission</b> answer?",
      options:["How does transformation happen?","What is possible?","Why should I participate?","Where do we begin?"], answer:0,
      explain:"The Mission = HOW transformation happens." },
    { id:"s04", tier:1, prompt:"Roughly how many Americans turn 65 every single day, per the book?",
      options:["About 10,000","About 1,000","About 100,000","About 500"], answer:0,
      explain:"Ten thousand a day; more than seventy million this decade." },
    { id:"s05", tier:1, prompt:"About how many hours a year does the average retiree gain that once went to work?",
      options:["About 2,000 hours","About 200 hours","About 8,000 hours","About 500 hours"], answer:0,
      explain:"About 2,000 freed hours annually — capacity for a second calling." },
    { id:"s06", tier:1, prompt:"Roughly how many people worldwide does the book say live in educational poverty?",
      options:["About two billion","About two million","About 200 million","About twenty billion"], answer:0,
      explain:"Two billion worldwide; 36 million U.S. adults lack basic numeracy." },
    { id:"s07", tier:1, prompt:"The Christian idea of 'calling' comes from the Latin <b>vocare</b>, meaning to ____.",
      options:["Call","Build","Serve","Teach"], answer:0,
      explain:"Vocation — from vocare, 'to call.'" },
    { id:"s08", tier:1, prompt:"Which term names the Jewish duty to 'repair the world'?",
      options:["Tikkun olam","Khalifa","Dharma","Vocare"], answer:0,
      explain:"Tikkun olam — one of four traditions the book cites for the calling to purpose." },
    { id:"s09", tier:1, prompt:"Human beings, the book says, are not designed for extended leisure — they are designed for ____.",
      options:["Contribution","Rest","Reflection","Reward"], answer:0,
      explain:"Purposeless retirement leads to decline; we are made to contribute." },
    { id:"s10", tier:1, prompt:"According to the book, a moonshot without purpose is ____.",
      options:["Just ambition","Still worthwhile","A waste of money","Impossible"], answer:0,
      explain:"Which is why the Second Calling supplies the WHY." },
    { id:"s11", tier:1, prompt:"According to the book, a calling without a method is ____.",
      options:["Just a dream","A failure","A burden","Enough on its own"], answer:0,
      explain:"Which is why the Mission supplies the HOW." },
    { id:"s12", tier:1, prompt:"In the single mother's story, a mentor helped her grasp fractions by comparing them to ____.",
      options:["Recipes","Sports scores","Bank statements","Musical notes"], answer:0,
      explain:"Fractions were recipes; percentages were coupons — and it all made sense." },
    { id:"s13", tier:1, prompt:"The book says today's retirees may have how many productive years still ahead?",
      options:["Twenty or thirty years","Two or three years","Fifty years","Five years"], answer:0,
      explain:"Vigorous, educated, experienced — decades of capacity remain." },

    /* ---------- GOLD (tier 2) : 13 ---------- */
    { id:"g01", tier:2, prompt:"Why does the book insist GSU's work is <b>not charity</b>?",
      options:["It strategically deploys human capital to empower people rather than create dependence","Because donors are repaid","Because the government funds it","Because only the wealthy take part"], answer:0,
      explain:"Empowerment over dependence is the whole point." },
    { id:"g02", tier:2, prompt:"What is the deeper 'freedom' the bridge leads to, per the book?",
      options:["Sovereignty — the freedom to learn anything, do anything, become anything","Freedom from taxes","Freedom to travel","Freedom from all work"], answer:0,
      explain:"Not just economic freedom, but the freedom that comes from understanding." },
    { id:"g03", tier:2, prompt:"In the <b>retired engineer's</b> story, what does he realize his greatest achievement was?",
      options:["The bridge of knowledge he built to a student, not the steel bridges of his career","The patents he filed","The firm he founded","The awards he won"], answer:0,
      explain:"The Engineer's Legacy — career bridges versus the knowledge bridge." },
    { id:"g04", tier:2, prompt:"Why does the book call purposeless retirement dangerous?",
      options:["It is linked to depression, cognitive decline, and even a shortened lifespan","It is too expensive","It bores the family","It wastes tax dollars"], answer:0,
      explain:"We are designed for contribution, not idleness." },
    { id:"g05", tier:2, prompt:"What makes the convergence of the two ages possible 'for the first time in history'?",
      options:["Technology can connect wisdom to need instantly, globally, at near-zero cost","Retirees finally have free time","Governments now fund education","Traditional schools have closed"], answer:0,
      explain:"Geography, time, and resources no longer limit the transfer of wisdom." },
    { id:"g06", tier:2, prompt:"The young man from rural Alabama who dreamed of engineering was mentored by a retiree from where?",
      options:["Arizona","Alabama","California","Florida"], answer:0,
      explain:"A retired aerospace professional from Arizona, every Tuesday morning." },
    { id:"g07", tier:2, prompt:"What does the book mean by '<b>the transformed become transformers</b>'?",
      options:["Those who cross the bridge turn around to help others cross","Learners become wealthy","Students replace their teachers","Graduates leave the movement"], answer:0,
      explain:"The taught become teachers; the legacy multiplies." },
    { id:"g08", tier:2, prompt:"What unites the Civilization Builders despite their different backgrounds?",
      options:["Their answer to the question 'What now?' after their working years","Their wealth","Their teaching degrees","Their religion"], answer:0,
      explain:"Background varies; the answer to 'What now?' is shared." },
    { id:"g09", tier:2, prompt:"What three things does the book say becoming a Civilization Builder requires?",
      options:["Willingness, time, and faith","A degree, a license, and training","Money, contacts, and fame","Youth, energy, and ambition"], answer:0,
      explain:"No teaching degree or certification required — only these three." },
    { id:"g10", tier:2, prompt:"How much time does the book suggest a new Civilization Builder start with?",
      options:["About two hours a week","Forty hours a week","One hour a month","Eight hours a day"], answer:0,
      explain:"Two hours — the price of one round of golf, one movie." },
    { id:"g11", tier:2, prompt:"The career changer told she was 'too old' was proven wrong by a mentor who was ____.",
      options:["Only about ten years older than she was","Half her age","A famous professor","Her former boss"], answer:0,
      explain:"Age was no barrier to mastery." },
    { id:"g12", tier:2, prompt:"What does the book say frameworks and pillars ultimately cannot do?",
      options:["Change lives — only people do","Be measured","Raise money","Last forever"], answer:0,
      explain:"Frameworks don't change lives. People do." },
    { id:"g13", tier:2, prompt:"Why does the book deliberately pair the Golden Age with the Digital Age?",
      options:["One holds wisdom and time; the other provides reach — together they create global opportunity","Both are about money","Both involve retirees","Both replace traditional schools"], answer:0,
      explain:"Wisdom meets reach: the convergence that makes the Moonshot possible." },

    /* ---------- PLATINUM (tier 3) : 13 ---------- */
    { id:"p01", tier:3, prompt:"What is the central paradox about retirement that the book resolves?",
      options:["Retirement doesn't end your calling — it reveals a greater one","Retirement is the reward for a life of work","Retirement means you've earned pure rest","Retirement is the end of usefulness"], answer:0,
      explain:"The vacuum of retirement is the doorway to the Second Calling." },
    { id:"p02", tier:3, prompt:"How does '<b>Education, Not Handouts</b>' distinguish empowerment from charity?",
      options:["Capability builds dignity, while a handout can entrench the dependence it means to relieve","Charity is illegal","Handouts simply cost more","Education is just faster than charity"], answer:0,
      explain:"Teach a man to fish — capability is the dignity." },
    { id:"p03", tier:3, prompt:"Teaching, the book argues, is the one act that nearly every faith tradition calls ____.",
      options:["Sacred","Optional","Profitable","Difficult"], answer:0,
      explain:"Across vocare, tikkun olam, khalifa, and dharma, the transfer of wisdom is sacred." },
    { id:"p04", tier:3, prompt:"What is the book's core claim about how eternity is actually built?",
      options:["One connection at a time","Through large institutions","By accumulating wealth","All at once, through a single act"], answer:0,
      explain:"Every mentor-learner relationship is a brick in the bridge." },
    { id:"p05", tier:3, prompt:"Why does the book say the wisdom you transfer is 'eternal' while money is not?",
      options:["The student you teach will teach others, multiplying through generations you will never see","Because knowledge is tax-free","Because books last forever","Because wisdom is rare"], answer:0,
      explain:"Impact ripples through generations; possessions do not." },
    { id:"p06", tier:3, prompt:"What is the strongest reading of 'Your first calling built your life; your second builds eternity'?",
      options:["The first calling was about achievement; the second is about legacy through others","The second calling simply pays better","The first calling was a mistake","The two callings are identical"], answer:0,
      explain:"Achievement gives way to multiplication." },
    { id:"p07", tier:3, prompt:"The book argues the scarcest resource being wasted today is not money or technology, but ____.",
      options:["The accumulated wisdom and time of the Golden Age","Classroom space","Government funding","Young teachers"], answer:0,
      explain:"An untapped treasure: decades of expertise sitting idle." },
    { id:"p08", tier:3, prompt:"How does GSU's '<b>free but earned</b>' model work, as the book and its programs imply?",
      options:["Materials are free to all, while mastery is earned through achievement and certification","Everything must be paid for","Nothing is ever assessed","Only the wealthy can earn certificates"], answer:0,
      explain:"Free access, real standards — Bronze to Platinum, then certification." },
    { id:"p09", tier:3, prompt:"What does the bridge metaphor reveal about the mentor-learner relationship?",
      options:["Both stand on the bridge — each is changed by helping the other across","The mentor stays safely on one side","The learner walks across alone","Only the learner is transformed"], answer:0,
      explain:"A relationship that transforms both parties." },
    { id:"p10", tier:3, prompt:"Why might the book open with JFK's moonshot rather than with GSU itself?",
      options:["To frame an 'impossible until it isn't' goal that organizes the best of our energies","Because JFK founded GSU","To discuss the space program","To criticize the government"], answer:0,
      explain:"The power of a moonshot: audacious until achieved." },
    { id:"p11", tier:3, prompt:"Which statement most completely integrates all three pillars into GSU's purpose?",
      options:["Mobilizing the wisdom of the Golden Age through the Digital Age to build a bridge to freedom through education","Selling books to fund scholarships","Replacing public schools with AI","Helping retirees enjoy their leisure"], answer:0,
      explain:"Vision + Purpose + Transformation in one sentence." },
    { id:"p12", tier:3, prompt:"The book says the antidote to the retirement 'identity crisis' is to shift from achievement to ____.",
      options:["Multiplication — pouring what you've built into others","Relaxation","Travel","Reinventing your career"], answer:0,
      explain:"From building your own life to multiplying it in others." },
    { id:"p13", tier:3, prompt:"What are the book's three closing commands to the reader?",
      options:["Answer the call, cross the bridge, and build your eternity","Donate, volunteer, and recruit","Read, study, and graduate","Save, invest, and retire"], answer:0,
      explain:"The final crescendo of the book." }

  ];

  function start() {
    window.GSUGame.init({
      gameId: "builders-of-eternity-climb",
      title: "Builders of Eternity — Infinity Climb",
      subtitle: "Eternity is built one connection at a time.",
      themeColor: "#C9A84C",
      footNote: "The Three Pillars of Global Sovereign University. Infinite play — your tier is saved.",
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
