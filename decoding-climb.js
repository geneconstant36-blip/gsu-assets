/* ============================================================================
   DECODING — HELIX CLIMB  ·  decoding-climb.js  ·  v1.0
   Reading Helix Volume 3.  Built on gsu-game-engine.js.
   Host at: read.globalsovereignuniversity.org/decoding-climb.js
   ----------------------------------------------------------------------------
   Decoding is phonics put to work — turning the code into the reading of
   unfamiliar words. Tiers map to the book's chapter spine:
     Bronze   (0): the decoding mindset · CVC review · "knowing vs. using"
     Silver   (1): the six syllable types (closed, open, VCe, vowel team,
                   r-controlled, consonant-le)
     Gold     (2): chunking multisyllabic words · prefixes, suffixes, roots
     Platinum (3): orthographic mapping · sight-word bonding · mastery
   ========================================================================== */

(function () {
  const Q = [

    /* ---------- BRONZE (tier 0) : 13 ---------- */
    { id:"b01", tier:0, prompt:"Decoding is best described as —",
      options:["using phonics on words you have never seen before","memorizing the shape of common words","guessing what the word might be from the picture","reading silently in your head"], answer:0,
      explain:"Decoding takes the code you learned in phonics and applies it in real time to words your eyes have never met. It is phonics in motion." },
    { id:"b02", tier:0, prompt:"Dr. Constant distinguishes <b>knowing</b> phonics from <b>using</b> phonics. The difference is —",
      options:["declarative knowledge versus procedural skill","loud reading versus silent reading","British versus American spelling","reading for school versus reading for fun"], answer:0,
      explain:"\"I know that <b>igh</b> says /ī/\" is declarative. \"I just sounded out <b>flight</b> without thinking\" is procedural. Decoding is the second one." },
    { id:"b03", tier:0, prompt:"When you meet an unfamiliar word, the decoding mindset says —",
      options:["pause on purpose and try a first pass","skip it and keep going","guess from the first letter","wait for someone to read it for you"], answer:0,
      explain:"Decoding begins with engagement — a deliberate pause and a first attempt, then refinement. Skipping, guessing, and waiting are the three reflexes that block decoding." },
    { id:"b04", tier:0, prompt:"In the word <b>snap</b>, the vowel sound is —",
      options:["short /a/","long /a/","short /e/","short /i/"], answer:0,
      explain:"<b>snap</b> is a closed syllable — a single vowel followed by a consonant. The vowel stays short: /a/ as in cat." },
    { id:"b05", tier:0, prompt:"Sounding out is most useful when —",
      options:["the word is unfamiliar to your eyes","you already recognize the word instantly","you want to read faster","the word is in a language you don't know"], answer:0,
      explain:"Sounding out is the entry door for words your eyes haven't bonded yet. Familiar words go straight from sight to meaning." },
    { id:"b06", tier:0, prompt:"A <b>first-pass</b> attempt at a new word is —",
      options:["a best guess at the sounds, ready to be corrected","the final pronunciation","the way teachers say it","not allowed in serious reading"], answer:0,
      explain:"Decoding starts with a first pass, then self-corrects. The first pass is permission to be wrong on the way to being right." },
    { id:"b07", tier:0, prompt:"<b>Self-correction</b> means —",
      options:["noticing your first attempt didn't fit and trying again","asking the teacher to fix it","starting the sentence over","reading more slowly next time"], answer:0,
      explain:"A decoder reads, hears the result, checks it against meaning, and adjusts. That loop is the engine of reading new words." },
    { id:"b08", tier:0, prompt:"Read the word <b>scrap</b>. The vowel sound is —",
      options:["short /a/","long /a/","short /e/","silent"], answer:0,
      explain:"<b>scrap</b> is a closed syllable with a consonant blend (scr) followed by short /a/ and final /p/." },
    { id:"b09", tier:0, prompt:"\"The picture told me\" is —",
      options:["a confession that the reader was never given the code","a sign of strong comprehension","good reading strategy","one of the six syllable types"], answer:0,
      explain:"Pictures are companions, not decoders. A reader who relies on the picture has been failed by the system that should have taught the code." },
    { id:"b10", tier:0, prompt:"The power of decoding is that it gives a reader —",
      options:["access to every word in English, including ones they have never seen","a faster reading speed","better handwriting","a larger vocabulary by memorization"], answer:0,
      explain:"Decoding makes the dictionary accessible. Every printed word becomes reachable — even ones the reader has never met before." },
    { id:"b11", tier:0, prompt:"A <b>sight word</b> is —",
      options:["a word decoded so often it now reads instantly","a word the reader memorized as a shape","a word in a special list","a word with no phonics rule"], answer:0,
      explain:"Sight words are made, not memorized. Repeated accurate decoding bonds the word into instant recognition. (More on this at Platinum.)" },
    { id:"b12", tier:0, prompt:"Phonics teaches the code; decoding —",
      options:["uses the code on real words in real sentences","replaces the code with whole-word memorization","is the same thing as phonics","is only for advanced readers"], answer:0,
      explain:"Phonics is the rule book. Decoding is the game played with it." },
    { id:"b13", tier:0, prompt:"Read the word <b>trust</b>. Sound it out and choose the breakdown —",
      options:["t-r-u-s-t (consonant blend + short /u/ + consonant blend)","tr-ust (digraph + vowel team)","trus-t (open syllable + consonant)","one syllable with a long vowel"], answer:0,
      explain:"<b>trust</b> is one closed syllable. The 'tr' is a consonant blend (you hear both letters), the 'u' is short, and 'st' is a final blend." },

    /* ---------- SILVER (tier 1) : 13 — the six syllable types ---------- */
    { id:"s01", tier:1, prompt:"A <b>closed</b> syllable —",
      options:["ends in a consonant and has a short vowel","ends in a vowel and has a long vowel","always has a silent e","has two vowels side by side"], answer:0,
      explain:"Closed syllables \"close in\" the vowel with a consonant, keeping the vowel short: cat, hop, sit, fish." },
    { id:"s02", tier:1, prompt:"An <b>open</b> syllable —",
      options:["ends in a vowel and the vowel says its long sound","ends in a consonant","always has a silent letter","is the same as a vowel team"], answer:0,
      explain:"Open syllables leave the vowel \"open\" at the end, so it says its name: he, go, hi, me, no." },
    { id:"s03", tier:1, prompt:"In a <b>silent-e (VCe)</b> syllable like <b>cake</b>, what does the final e do?",
      options:["makes the earlier vowel say its long name","says /eh/","blends with the consonant","is pronounced softly"], answer:0,
      explain:"The silent e at the end reaches back and makes the earlier vowel long. <b>cake</b>, <b>bike</b>, <b>hope</b>, <b>cute</b>." },
    { id:"s04", tier:1, prompt:"A <b>vowel team</b> is —",
      options:["two vowels working together to spell one sound","a vowel followed by a silent consonant","a vowel that bounces between long and short","any vowel at the end of a word"], answer:0,
      explain:"Vowel teams pair two vowels for a single sound: boat (oa), beach (ea), play (ay), feet (ee)." },
    { id:"s05", tier:1, prompt:"In an <b>r-controlled</b> syllable like <b>car</b>, the r —",
      options:["changes the vowel sound — not short, not long","is silent","makes the vowel longer","makes the vowel short"], answer:0,
      explain:"The r bends the vowel into a third sound — not short /a/, not long /a/, but /ar/. Same with her, bird, fork, fur." },
    { id:"s06", tier:1, prompt:"A <b>consonant-le</b> syllable like the end of <b>table</b> is —",
      options:["a consonant followed by silent e and l, spoken as /əl/","two consonants and a silent e","a closed syllable","a vowel team"], answer:0,
      explain:"The -le pattern at the end of a word picks up the consonant before it: ta-ble, can-dle, sim-ple, han-dle. Spoken /bəl/, /dəl/, /pəl/." },
    { id:"s07", tier:1, prompt:"The word <b>rabbit</b> divides into syllables as —",
      options:["rab-bit (two closed syllables)","ra-bbit","rabb-it","one long syllable"], answer:0,
      explain:"VC/CV: with two consonants between two vowels, split between them. Both halves are closed, both vowels short." },
    { id:"s08", tier:1, prompt:"The word <b>she</b> is —",
      options:["an open syllable — long /ē/","a closed syllable","a vowel team","a silent-e word"], answer:0,
      explain:"One syllable ending in a vowel — the vowel says its name. <b>she</b>, <b>he</b>, <b>me</b>, <b>we</b>." },
    { id:"s09", tier:1, prompt:"The word <b>cake</b> is —",
      options:["a silent-e (VCe) syllable — long /ā/","a closed syllable","an open syllable","an r-controlled syllable"], answer:0,
      explain:"Vowel-consonant-silent-e. The final e is silent and stretches the a to its long sound." },
    { id:"s10", tier:1, prompt:"The word <b>boat</b> is —",
      options:["a vowel team — oa together spells long /ō/","two open syllables","a closed syllable","a consonant-le syllable"], answer:0,
      explain:"oa is a vowel team. Two letters, one long /ō/ sound." },
    { id:"s11", tier:1, prompt:"The word <b>fork</b> is —",
      options:["an r-controlled syllable","a closed syllable","an open syllable","a vowel team"], answer:0,
      explain:"or is the r-controlled vowel. Not short /o/, not long /ō/, but /or/." },
    { id:"s12", tier:1, prompt:"The word <b>simple</b> divides as —",
      options:["sim-ple (closed + consonant-le)","si-mple","simpl-e","one syllable"], answer:0,
      explain:"The -le picks up the p before it. First half is closed (short /i/), second half is the consonant-le pattern /pəl/." },
    { id:"s13", tier:1, prompt:"The six syllable types are closed, open, silent-e, vowel team, r-controlled, and —",
      options:["consonant-le","digraph","blend","schwa"], answer:0,
      explain:"Closed, open, silent-e (VCe), vowel team, r-controlled, consonant-le. Six patterns that cover almost every English syllable." },

    /* ---------- GOLD (tier 2) : 13 — chunking + prefixes + suffixes ---------- */
    { id:"g01", tier:2, prompt:"To decode <b>fantastic</b>, you chunk it as —",
      options:["fan-tas-tic (three closed syllables)","fa-ntastic","fantast-ic","one long syllable"], answer:0,
      explain:"Apply VC/CV between paired consonants: fan-tas-tic. Each piece is a closed syllable, each vowel short." },
    { id:"g02", tier:2, prompt:"<b>unhappiness</b> chunks most usefully into —",
      options:["un-hap-pi-ness (prefix + root + suffix)","unh-app-iness","unhap-piness","one indivisible word"], answer:0,
      explain:"Morphology beats brute syllable rules here. <b>un-</b> is a prefix, <b>happy</b> is the root, <b>-ness</b> is a suffix that turns the adjective into a noun." },
    { id:"g03", tier:2, prompt:"The prefix <b>un-</b> means —",
      options:["not, or the opposite of","more than one","before in time","very large"], answer:0,
      explain:"<b>un-</b> reverses or negates: unhappy, unkind, undo, unfair." },
    { id:"g04", tier:2, prompt:"The prefix <b>re-</b> means —",
      options:["again, or back","not","large","under"], answer:0,
      explain:"<b>re-</b> signals repetition or return: redo, replay, return, rewrite." },
    { id:"g05", tier:2, prompt:"The suffix <b>-tion</b> is pronounced —",
      options:["/shən/","/tee-on/","/tee-uh-n/","/tone/"], answer:0,
      explain:"<b>-tion</b> says /shən/ — one syllable. nation, station, fraction, attention." },
    { id:"g06", tier:2, prompt:"The suffix <b>-able</b> means —",
      options:["capable of, or worthy of","without","under","more than one"], answer:0,
      explain:"<b>-able</b> turns a verb into an adjective meaning \"capable of being [verb-ed]\": readable, washable, breakable." },
    { id:"g07", tier:2, prompt:"The <b>VC/CV</b> rule says: when two consonants sit between two vowels —",
      options:["split between the consonants","split before both consonants","split after both consonants","never split — keep it one syllable"], answer:0,
      explain:"VC/CV: <b>nap-kin</b>, <b>rab-bit</b>, <b>but-ter</b>. Splitting between the consonants usually gives two closed syllables." },
    { id:"g08", tier:2, prompt:"The <b>V/CV</b> rule says: when one consonant sits between two vowels, try splitting —",
      options:["before the consonant first (open syllable)","after the consonant (closed syllable)","never split","always at the end"], answer:0,
      explain:"V/CV: <b>ba-by</b>, <b>ti-ger</b>, <b>pi-lot</b>. First try open syllable. If the word doesn't sound right, fall back to VC/V (cab-in, lem-on)." },
    { id:"g09", tier:2, prompt:"The word <b>unsubscribable</b> chunks into —",
      options:["un-sub-scribe-able (prefix + root + suffix)","unsub-scrib-able","un-subscrib-able","one block"], answer:0,
      explain:"Morphology unlocks long words. Two prefixes (un, sub), root (scribe), suffix (able). Suddenly readable." },
    { id:"g10", tier:2, prompt:"In <b>predictable</b>, the root is —",
      options:["dict (to say)","pre","predict","able"], answer:0,
      explain:"The Latin root <b>dict</b> means \"to say.\" Predictable: that which can be said before (pre-) it happens — and -able makes it adjective." },
    { id:"g11", tier:2, prompt:"The <b>-ed</b> ending on a verb (walked, jumped, landed) signals —",
      options:["past tense","plural","ongoing action","more than one"], answer:0,
      explain:"<b>-ed</b> marks past tense. It can sound like /t/, /d/, or /ed/ depending on the word, but the meaning is always past." },
    { id:"g12", tier:2, prompt:"<b>antidisestablishmentarianism</b> — the famous long word — chunks into —",
      options:["anti-dis-establish-ment-arian-ism (six morphemes)","one indivisible word","ant-i-dis-establish-mentarianism","random sounds"], answer:0,
      explain:"Six pieces. anti (against) + dis (not) + establish (root) + ment (suffix) + arian (suffix) + ism (suffix). Long words yield to morphology, not phonics alone." },
    { id:"g13", tier:2, prompt:"<b>consequential</b> chunks most naturally into —",
      options:["con-se-quen-tial (prefix + stem + suffix)","conseq-uential","con-sequenti-al","one syllable"], answer:0,
      explain:"con- (with) + sequ (root, follow) + -tial (suffix). The /sh/ in -tial follows the standard -tion family." },

    /* ---------- PLATINUM (tier 3) : 13 — orthographic mapping + mastery ---------- */
    { id:"p01", tier:3, prompt:"<b>Orthographic mapping</b> is —",
      options:["the brain's process of bonding a decoded word into instant recognition","memorizing the shape of a word","a phonics rule for long vowels","another word for spelling"], answer:0,
      explain:"Orthographic mapping is what happens inside the brain when a successfully decoded word, met with meaning, gets filed for instant retrieval. (Decoding, Chapter 2.)" },
    { id:"p02", tier:3, prompt:"For a word to bond into sight memory, the reader needs to —",
      options:["decode it accurately and connect it to meaning, repeatedly","memorize its shape","see it on a flashcard","write it ten times"], answer:0,
      explain:"Accurate decoding + meaning + repetition = a sight word. Shape-memorization gives no foundation; the word doesn't generalize." },
    { id:"p03", tier:3, prompt:"Repeated <b>accurate</b> decoding matters because —",
      options:["each correct decoding strengthens the bond; incorrect decoding wires the wrong pattern","children like routines","spelling tests reward it","it sounds nice"], answer:0,
      explain:"The brain bonds what it does. Wrong decodings, repeated, install wrong sight words that must be unlearned later." },
    { id:"p04", tier:3, prompt:"Context (the meaning of the sentence) is best used —",
      options:["to confirm a decoded word, after the decoding","to skip the decoding by guessing from meaning","instead of phonics","to invent a word"], answer:0,
      explain:"Context confirms; it does not substitute. \"Use context to check your decoding, never to replace it.\" (Decoding, Chapter 6.)" },
    { id:"p05", tier:3, prompt:"Context fails as a decoding strategy when —",
      options:["the unfamiliar word is the one that carries the meaning","the sentence is short","there are no pictures","the reader is tired"], answer:0,
      explain:"If you skip the unfamiliar word and read for context, you miss the very word that defines the sentence. Context can't fill its own hole." },
    { id:"p06", tier:3, prompt:"<b>Procedural</b> knowledge of decoding looks like —",
      options:["sounding out a new word automatically, without thinking about rules","being able to recite phonics rules","passing a phonics test","memorizing word lists"], answer:0,
      explain:"Procedural knowledge has moved below conscious thought. The reader sees the word, the brain decodes it, the meaning arrives — no narration required." },
    { id:"p07", tier:3, prompt:"Even a strong decoder stalls when —",
      options:["the word is decoded correctly but the meaning is unknown","the word is short","there are no pictures","the room is loud"], answer:0,
      explain:"Decoding produces sound; vocabulary supplies meaning. <b>Pulchritudinous</b> can be decoded perfectly and still mean nothing — that's a vocabulary gap, not a decoding gap." },
    { id:"p08", tier:3, prompt:"A reader who decodes accurately but very slowly will struggle with comprehension because —",
      options:["working memory is consumed by the decoding, leaving little for meaning","slow reading is shameful","the words change over time","they read out of order"], answer:0,
      explain:"Reading has a fluency budget. Spend it all on letters and there's nothing left for the sentence. Fluency is the next pillar after Decoding for exactly this reason." },
    { id:"p09", tier:3, prompt:"A sight word is best understood as —",
      options:["a word that has been decoded enough times and bonded with meaning to be instant","a word that breaks phonics rules","a word from a special memorization list","a word with no vowels"], answer:0,
      explain:"All competent readers' words become \"sight words\" eventually — through accurate decoding, not memorization. The list approach mistakes the end state for the path." },
    { id:"p10", tier:3, prompt:"The role of <b>meaning</b> in decoding is —",
      options:["it confirms the decoding and triggers bonding into sight memory","it replaces sound","it's optional","it slows things down"], answer:0,
      explain:"A decoded word without meaning is a phonetic placeholder. Meaning is what binds the sound to long-term memory. (Decoding, Chapter 2.)" },
    { id:"p11", tier:3, prompt:"\"Guess from the first letter and the picture\" doesn't build sight vocabulary because —",
      options:["the brain never bonds the actual letter sequence to the spoken word","it's too slow","the pictures are wrong","it uses too many letters"], answer:0,
      explain:"Without accurate letter-by-letter processing, the brain has nothing real to file. The shortcut prevents the bond from forming." },
    { id:"p12", tier:3, prompt:"The principle that says \"every successful decoding is a self-teaching event\" is sometimes called the —",
      options:["self-teaching hypothesis","picture-walk method","whole language theory","sight-word doctrine"], answer:0,
      explain:"The self-teaching hypothesis: each time a reader successfully decodes a new word with meaning, they teach themselves that word for the future. (Share, referenced throughout Decoding.)" },
    { id:"p13", tier:3, prompt:"When a strong decoder reads <b>thoroughfare</b> for the first time, the process is —",
      options:["chunk it (thor-ough-fare), pronounce, recognize meaning, bond — all in seconds","memorize the shape","ask for help","skip it"], answer:0,
      explain:"That's the whole pipeline at speed: morphological chunking, pronunciation, meaning-match, bonding. The reader now owns the word. Welcome to mastery." }
  ];

  function start() {
    window.GSUGame.init({
      gameId: "decoding-climb",
      title: "Decoding — Helix Climb",
      subtitle: "Phonics put to work — words you have never seen, unlocked.",
      themeColor: "#1A8B7F",
      footNote: "Reading Helix · Volume 3. Infinite play — your tier is saved.",
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
