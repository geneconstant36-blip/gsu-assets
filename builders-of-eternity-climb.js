/* =============================================================================
 * BUILDERS OF ETERNITY — INFINITY CLIMB
 * 52 questions · 4 tiers (Bronze/Silver/Gold/Platinum), 13 each
 * Correct answer is always answers[0]; the shared engine shuffles on render.
 * gameId must match the host page's data-game attribute: "builders-of-eternity"
 * Firebase persistence handled by the engine at users/{uid}/games/{gameId}
 * Source of truth: the manuscript "Builders of Eternity" (Dr. Gene A. Constant)
 * =============================================================================
 * INTEGRATION NOTE: the register() call at the bottom hedges across the likely
 * engine entry points. If phonemic-awareness-climb.js / trifurcation-road-climb.js
 * use a specific call (e.g. GSUGame.load(...)), change ONLY that one line to match.
 * Question content is engine-agnostic and final.
 * ========================================================================== */
(function () {
  "use strict";

  var GAME_ID = "builders-of-eternity";

  var QUESTIONS = [
    /* ---------------------------- BRONZE (13) ---------------------------- */
    { tier: "Bronze", question: "What is the central metaphor at the heart of Global Sovereign University?",
      answers: ["A bridge of knowledge", "A ladder of wealth", "A locked library", "A mountain to climb alone"],
      explain: "GSU is built around a bridge of knowledge spanning poverty to sovereignty." },
    { tier: "Bronze", question: "What does GSU call its audacious goal to eliminate educational poverty worldwide?",
      answers: ["The Moonshot", "The Mission", "The Great Leap", "The Summit"],
      explain: "The Moonshot answers the question: What is possible?" },
    { tier: "Bronze", question: "What are the three pillars of Global Sovereign University?",
      answers: ["The Moonshot, the Second Calling, and the Mission", "Faith, Hope, and Charity", "Reading, Writing, and Arithmetic", "Wisdom, Wealth, and Health"],
      explain: "Vision, Purpose, and Transformation — the Moonshot, the Second Calling, and the Mission." },
    { tier: "Bronze", question: "What does GSU call the mentors who help learners across the bridge?",
      answers: ["Civilization Builders", "Sovereign Scholars", "Bridge Keepers", "Master Teachers"],
      explain: "Civilization Builders provide the human connection algorithms cannot replace." },
    { tier: "Bronze", question: "Complete the book's signature line: \"What you build in others ____.\"",
      answers: ["lives forever", "returns to you", "makes you wealthy", "will be remembered"],
      explain: "The recurring refrain and the book's closing thought." },
    { tier: "Bronze", question: "Which U.S. president's challenge opens the chapter on the Moonshot?",
      answers: ["John F. Kennedy", "Franklin D. Roosevelt", "Ronald Reagan", "Dwight D. Eisenhower"],
      explain: "JFK's 1962 Rice Stadium speech: 'We choose to go to the moon...'" },
    { tier: "Bronze", question: "GSU's mission is \"Building a Bridge to Freedom Through Education — not ____.\"",
      answers: ["Handouts", "Lectures", "Charity drives", "Tuition"],
      explain: "Education, not handouts: dignity through capability." },
    { tier: "Bronze", question: "What is the name of GSU's AI tutor, available 24/7?",
      answers: ["GENO", "SAGE", "ATLAS", "TUTOR-X"],
      explain: "GENO — a robot you can actually talk to." },
    { tier: "Bronze", question: "The two ages the book says have converged are the Digital Age and the ____ Age.",
      answers: ["Golden Age", "Information Age", "Space Age", "Industrial Age"],
      explain: "The Golden Age of healthy, experienced retirees meets the Digital Age's reach." },
    { tier: "Bronze", question: "According to the book, what can you NOT take with you when you leave this world?",
      answers: ["Money and possessions", "Your memories", "Your character", "Your faith"],
      explain: "Only your impact on other human beings is eternal." },
    { tier: "Bronze", question: "What does the book say are GSU's only free giveaways?",
      answers: ["Digital book downloads", "Printed books mailed to your home", "Branded merchandise", "Gift cards"],
      explain: "GSU never prints or mails physical books; free titles are digital downloads." },
    { tier: "Bronze", question: "The First Calling builds your life. The Second Calling builds ____.",
      answers: ["Eternity", "Wealth", "A business", "A reputation"],
      explain: "Your first calling built your life; your second calling builds eternity." },
    { tier: "Bronze", question: "In what U.S. state does the book say the author lives and writes?",
      answers: ["Oregon", "Washington", "Idaho", "California"],
      explain: "Dr. Constant signs the Preface from Portland, Oregon." },

    /* ---------------------------- SILVER (13) ---------------------------- */
    { tier: "Silver", question: "What question does the Moonshot pillar answer?",
      answers: ["What is possible?", "Why should I participate?", "How does change happen?", "Who is responsible?"],
      explain: "The Moonshot = WHAT is possible." },
    { tier: "Silver", question: "What question does the Second Calling answer?",
      answers: ["Why should I participate?", "What is possible?", "How does transformation happen?", "When should I start?"],
      explain: "The Second Calling = WHY participate." },
    { tier: "Silver", question: "What question does the Mission answer?",
      answers: ["How does transformation happen?", "What is possible?", "Why should I participate?", "Where do we begin?"],
      explain: "The Mission = HOW transformation happens." },
    { tier: "Silver", question: "Roughly how many Americans turn 65 every single day, per the book?",
      answers: ["About 10,000", "About 1,000", "About 100,000", "About 500"],
      explain: "Ten thousand a day; more than seventy million this decade." },
    { tier: "Silver", question: "About how many hours a year does the average retiree gain that once went to work?",
      answers: ["About 2,000 hours", "About 200 hours", "About 8,000 hours", "About 500 hours"],
      explain: "~2,000 freed hours annually — capacity for a second calling." },
    { tier: "Silver", question: "Roughly how many people worldwide does the book say live in educational poverty?",
      answers: ["About two billion", "About two million", "About 200 million", "About twenty billion"],
      explain: "Two billion worldwide; 36 million U.S. adults lack basic numeracy." },
    { tier: "Silver", question: "The Christian idea of 'calling' comes from the Latin \"vocare,\" meaning to ____.",
      answers: ["Call", "Build", "Serve", "Teach"],
      explain: "Vocation — from vocare, 'to call.'" },
    { tier: "Silver", question: "Which term names the Jewish duty to 'repair the world'?",
      answers: ["Tikkun olam", "Khalifa", "Dharma", "Vocare"],
      explain: "Tikkun olam — one of four traditions the book cites for the calling to purpose." },
    { tier: "Silver", question: "Human beings, the book says, are not designed for extended leisure — they are designed for ____.",
      answers: ["Contribution", "Rest", "Reflection", "Reward"],
      explain: "Purposeless retirement leads to decline; we are made to contribute." },
    { tier: "Silver", question: "According to the book, a moonshot without purpose is ____.",
      answers: ["Just ambition", "Still worthwhile", "A waste of money", "Impossible"],
      explain: "Which is why the Second Calling supplies the WHY." },
    { tier: "Silver", question: "According to the book, a calling without a method is ____.",
      answers: ["Just a dream", "A failure", "A burden", "Enough on its own"],
      explain: "Which is why the Mission supplies the HOW." },
    { tier: "Silver", question: "In the single mother's story, a mentor helped her grasp fractions by comparing them to ____.",
      answers: ["Recipes", "Sports scores", "Bank statements", "Musical notes"],
      explain: "Fractions were recipes; percentages were coupons — and it all made sense." },
    { tier: "Silver", question: "The book says today's retirees may have how many productive years still ahead?",
      answers: ["Twenty or thirty years", "Two or three years", "Fifty years", "Five years"],
      explain: "Vigorous, educated, experienced — decades of capacity remain." },

    /* ----------------------------- GOLD (13) ----------------------------- */
    { tier: "Gold", question: "Why does the book insist GSU's work is 'not charity'?",
      answers: ["It strategically deploys human capital to empower people rather than create dependence", "Because donors are repaid", "Because the government funds it", "Because only the wealthy take part"],
      explain: "Empowerment over dependence is the whole point." },
    { tier: "Gold", question: "What is the deeper 'freedom' the bridge leads to, per the book?",
      answers: ["Sovereignty — the freedom to learn anything, do anything, become anything", "Freedom from taxes", "Freedom to travel", "Freedom from all work"],
      explain: "Not just economic freedom, but the freedom that comes from understanding." },
    { tier: "Gold", question: "In the retired engineer's story, what does he realize his greatest achievement was?",
      answers: ["The bridge of knowledge he built to a student, not the steel bridges of his career", "The patents he filed", "The firm he founded", "The awards he won"],
      explain: "The Engineer's Legacy — career bridges versus the knowledge bridge." },
    { tier: "Gold", question: "Why does the book call purposeless retirement dangerous?",
      answers: ["It is linked to depression, cognitive decline, and even a shortened lifespan", "It is too expensive", "It bores the family", "It wastes tax dollars"],
      explain: "We are designed for contribution, not idleness." },
    { tier: "Gold", question: "What makes the convergence of the two ages possible 'for the first time in history'?",
      answers: ["Technology can connect wisdom to need instantly, globally, at near-zero cost", "Retirees finally have free time", "Governments now fund education", "Traditional schools have closed"],
      explain: "Geography, time, and resources no longer limit the transfer of wisdom." },
    { tier: "Gold", question: "The young man from rural Alabama who dreamed of engineering was mentored by a retiree from where?",
      answers: ["Arizona", "Alabama", "California", "Florida"],
      explain: "A retired aerospace professional from Arizona, every Tuesday morning." },
    { tier: "Gold", question: "What does the book mean by 'the transformed become transformers'?",
      answers: ["Those who cross the bridge turn around to help others cross", "Learners become wealthy", "Students replace their teachers", "Graduates leave the movement"],
      explain: "The taught become teachers; the legacy multiplies." },
    { tier: "Gold", question: "What unites the Civilization Builders despite their different backgrounds?",
      answers: ["Their answer to the question 'What now?' after their working years", "Their wealth", "Their teaching degrees", "Their religion"],
      explain: "Background varies; the answer to 'What now?' is shared." },
    { tier: "Gold", question: "What three things does the book say becoming a Civilization Builder requires?",
      answers: ["Willingness, time, and faith", "A degree, a license, and training", "Money, contacts, and fame", "Youth, energy, and ambition"],
      explain: "No teaching degree or certification required — only these three." },
    { tier: "Gold", question: "How much time does the book suggest a new Civilization Builder start with?",
      answers: ["About two hours a week", "Forty hours a week", "One hour a month", "Eight hours a day"],
      explain: "Two hours — the price of one round of golf, one movie." },
    { tier: "Gold", question: "The career changer told she was 'too old' was proven wrong by a mentor who was ____.",
      answers: ["Only about ten years older than she was", "Half her age", "A famous professor", "Her former boss"],
      explain: "Age was no barrier to mastery." },
    { tier: "Gold", question: "What does the book say frameworks and pillars ultimately cannot do?",
      answers: ["Change lives — only people do", "Be measured", "Raise money", "Last forever"],
      explain: "Frameworks don't change lives. People do." },
    { tier: "Gold", question: "Why does the book deliberately pair the Golden Age with the Digital Age?",
      answers: ["One holds wisdom and time; the other provides reach — together they create global opportunity", "Both are about money", "Both involve retirees", "Both replace traditional schools"],
      explain: "Wisdom meets reach: the convergence that makes the Moonshot possible." },

    /* --------------------------- PLATINUM (13) --------------------------- */
    { tier: "Platinum", question: "What is the central paradox about retirement that the book resolves?",
      answers: ["Retirement doesn't end your calling — it reveals a greater one", "Retirement is the reward for a life of work", "Retirement means you've earned pure rest", "Retirement is the end of usefulness"],
      explain: "The vacuum of retirement is the doorway to the Second Calling." },
    { tier: "Platinum", question: "How does 'Education, Not Handouts' distinguish empowerment from charity?",
      answers: ["Capability builds dignity, while a handout can entrench the dependence it means to relieve", "Charity is illegal", "Handouts simply cost more", "Education is just faster than charity"],
      explain: "Teach a man to fish — capability is the dignity." },
    { tier: "Platinum", question: "Teaching, the book argues, is the one act that nearly every faith tradition calls ____.",
      answers: ["Sacred", "Optional", "Profitable", "Difficult"],
      explain: "Across vocare, tikkun olam, khalifa, and dharma, the transfer of wisdom is sacred." },
    { tier: "Platinum", question: "What is the book's core claim about how eternity is actually built?",
      answers: ["One connection at a time", "Through large institutions", "By accumulating wealth", "All at once, through a single act"],
      explain: "Every mentor-learner relationship is a brick in the bridge." },
    { tier: "Platinum", question: "Why does the book say the wisdom you transfer is 'eternal' while money is not?",
      answers: ["The student you teach will teach others, multiplying through generations you'll never see", "Because knowledge is tax-free", "Because books last forever", "Because wisdom is rare"],
      explain: "Impact ripples through generations; possessions do not." },
    { tier: "Platinum", question: "What is the strongest reading of 'Your first calling built your life; your second builds eternity'?",
      answers: ["The first calling was about achievement; the second is about legacy through others", "The second calling simply pays better", "The first calling was a mistake", "The two callings are identical"],
      explain: "Achievement gives way to multiplication." },
    { tier: "Platinum", question: "The book argues the scarcest resource being wasted today is not money or technology, but ____.",
      answers: ["The accumulated wisdom and time of the Golden Age", "Classroom space", "Government funding", "Young teachers"],
      explain: "An untapped treasure: decades of expertise sitting idle." },
    { tier: "Platinum", question: "How does GSU's 'free but earned' model work, as the book and its programs imply?",
      answers: ["Materials are free to all, while mastery is earned through achievement and certification", "Everything must be paid for", "Nothing is ever assessed", "Only the wealthy can earn certificates"],
      explain: "Free access, real standards — Bronze to Platinum, then certification." },
    { tier: "Platinum", question: "What does the bridge metaphor reveal about the mentor-learner relationship?",
      answers: ["Both stand on the bridge — each is changed by helping the other across", "The mentor stays safely on one side", "The learner walks across alone", "Only the learner is transformed"],
      explain: "A relationship that transforms both parties." },
    { tier: "Platinum", question: "Why might the book open with JFK's moonshot rather than with GSU itself?",
      answers: ["To frame an 'impossible until it isn't' goal that organizes the best of our energies", "Because JFK founded GSU", "To discuss the space program", "To criticize the government"],
      explain: "The power of a moonshot: audacious until achieved." },
    { tier: "Platinum", question: "Which statement most completely integrates all three pillars into GSU's purpose?",
      answers: ["Mobilizing the wisdom of the Golden Age through the Digital Age to build a bridge to freedom through education", "Selling books to fund scholarships", "Replacing public schools with AI", "Helping retirees enjoy their leisure"],
      explain: "Vision + Purpose + Transformation in one sentence." },
    { tier: "Platinum", question: "The book says the antidote to the retirement 'identity crisis' is to shift from achievement to ____.",
      answers: ["Multiplication — pouring what you've built into others", "Relaxation", "Travel", "Reinventing your career"],
      explain: "From building your own life to multiplying it in others." },
    { tier: "Platinum", question: "What are the book's three closing commands to the reader?",
      answers: ["Answer the call, cross the bridge, and build your eternity", "Donate, volunteer, and recruit", "Read, study, and graduate", "Save, invest, and retire"],
      explain: "The final crescendo of the book." }
  ];

  /* ---- Register with the shared engine (gsu-game-engine.js) ----
   * Hedged across likely entry points; collapse to the one your other
   * climbs use once confirmed. */
  function register() {
    if (window.GSUClimb && typeof window.GSUClimb.register === "function") {
      window.GSUClimb.register(GAME_ID, QUESTIONS);
    } else if (window.GSUGameEngine && typeof window.GSUGameEngine.register === "function") {
      window.GSUGameEngine.register(GAME_ID, QUESTIONS);
    } else if (typeof window.registerClimb === "function") {
      window.registerClimb(GAME_ID, QUESTIONS);
    } else {
      // Fallback: publish a registry the engine can read by gameId.
      window.GSU_CLIMBS = window.GSU_CLIMBS || {};
      window.GSU_CLIMBS[GAME_ID] = QUESTIONS;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register);
  } else {
    register();
  }
})();
