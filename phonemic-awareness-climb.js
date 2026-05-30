/* ============================================================================
   PHONEMIC AWARENESS — HELIX CLIMB  ·  phonemic-awareness-climb.js  ·  v1.0
   Reading Helix Volume 1.  Built on gsu-game-engine.js.
   Host at: read.globalsovereignuniversity.org/phonemic-awareness-climb.js
   ----------------------------------------------------------------------------
   Phonemic awareness is the ability to hear and work with the individual
   sounds inside spoken words, before letters arrive. The foundation almost
   every other reading skill rests on. Tiers map to the book's chapter spine:
     Bronze   (0): the moment words become sounds · phoneme vs letter · the
                   invisible skill (Chapters 1–3)
     Silver   (1): the four moves — rhyme, syllable, isolation, blending,
                   segmentation, manipulation (Chapters 4–6)
     Gold     (2): what PA cannot do alone · contested research · cueing and
                   well-meaning instruction that quietly fails (Chapters 7–9)
     Platinum (3): self-directed practice · children's curriculum · the
                   working pause · the bridge to phonics (Chapters 10–12)
   ========================================================================== */

(function () {
  const Q = [

    /* ---------- BRONZE (tier 0) : 13 ---------- */
    { id:"b01", tier:0, prompt:"<b>Phonemic awareness</b> is best described as —",
      options:["the ability to hear and work with the individual sounds inside spoken words","the ability to recognize letters in print","reading aloud with expression","memorizing the alphabet song"], answer:0,
      explain:"Phonemic awareness lives in the ear and the mouth. It is a sound skill, not a print skill — and it must come before letters can behave." },
    { id:"b02", tier:0, prompt:"What is the first sound in the word <b>ship</b>?",
      options:["/sh/","/s/","/sh-h/","/s-h/"], answer:0,
      explain:"Letters are not sounds. <b>ship</b> begins with the single phoneme /sh/ — your mouth makes one continuous action, not two. The letter <b>s</b> is a shortcut your eyes learned, not a phoneme your tongue produces." },
    { id:"b03", tier:0, prompt:"How many sounds (phonemes) are in the word <b>box</b>?",
      options:["four","three","two","five"], answer:0,
      explain:"Spelling has a shortcut; speech does not. <b>box</b> = /b/ /o/ /k/ /s/. The letter <b>x</b> is one symbol carrying two phonemes." },
    { id:"b04", tier:0, prompt:"A <b>phoneme</b> is —",
      options:["the smallest unit of sound that can change a word's meaning","a letter of the alphabet","a syllable","a vowel"], answer:0,
      explain:"Change /k/ in <b>cat</b> to /b/ and you get <b>bat</b>. That swap changed the meaning. That is what makes /k/ and /b/ phonemes." },
    { id:"b05", tier:0, prompt:"Phonemes are written between slashes — like /m/ — to remind us that —",
      options:["we are naming a sound, not a letter","the sound is silent","it is a digraph","the phoneme is rare"], answer:0,
      explain:"The slashes are a discipline. They keep the eye honest about what is being discussed. The letter <b>m</b> is a symbol. The phoneme /m/ is the humming sound made with closed lips." },
    { id:"b06", tier:0, prompt:"English has about 26 letters and about —",
      options:["44 phonemes","26 phonemes — they line up neatly","100 phonemes","18 phonemes"], answer:0,
      explain:"Twenty-six letters cannot represent 44 sounds one-to-one. That is the entire reason reading must be taught explicitly. The letters and the sounds are different alphabets." },
    { id:"b07", tier:0, prompt:"A child can recite a familiar book from memory but freezes on new sentences. The most likely cause is —",
      options:["the child has not yet gained conscious control of the sound structure of speech","the child is not interested in reading","the books are not engaging enough","the child needs glasses"], answer:0,
      explain:"Memorizing a book is logo-recognition. Reading a new sentence requires hearing the sounds inside the words. Without that, the child has shapes to recognize but no code to use." },
    { id:"b08", tier:0, prompt:"An adult learner says \"cuh\" when trying to produce /k/. This is —",
      options:["a common slip — a vowel sneaking onto a stop consonant","the correct production","a sign of a speech disorder","the way the letter sounds in another language"], answer:0,
      explain:"Stop consonants (/k/, /b/, /t/, /d/, /g/, /p/) are quick bursts. Adding \"uh\" produces \"kuh\" or \"buh\" — and the learner now hears two sounds where there is one. Clean the sound; the counts stabilize." },
    { id:"b09", tier:0, prompt:"In the word <b>cat</b>, the three phonemes are —",
      options:["/k/ /a/ /t/","/c/ /a/ /t/","/k/ /æ/","/cat/ — one whole sound"], answer:0,
      explain:"Sound, not spelling. The first phoneme is /k/, the same sound made by the letter <b>k</b> in <b>kite</b>. The middle is short /a/. The last is /t/." },
    { id:"b10", tier:0, prompt:"The discovery that a single word like <b>cat</b> is made of smaller sounds is sometimes called —",
      options:["the opening of phonemic awareness","memorization","decoding","fluency"], answer:0,
      explain:"It is the small cognitive door that opens when a learner first hears the parts inside the whole. From that door, all later reading skills proceed." },
    { id:"b11", tier:0, prompt:"Why are phonemic awareness activities traditionally <b>oral</b>?",
      options:["to keep the brain from grabbing the crutch of letters before the sound skill is stable","because writing is too hard","to save paper","because oral language is older than written language"], answer:0,
      explain:"If your eyes are working, you are probably thinking in letters. If you can do the task with eyes closed, you are thinking in phonemes. That distinction is the entire point." },
    { id:"b12", tier:0, prompt:"An adult who reads well enough to survive but freezes on unfamiliar words has most likely —",
      options:["built reading on whole-word memorization without a stable sound foundation","never opened a book","poor vision","weak general intelligence"], answer:0,
      explain:"Surviving by memorizing shapes works until the text changes. Then the foundation shows. The fragile layer is sound — not effort, not intelligence." },
    { id:"b13", tier:0, prompt:"The first words that often signal a child crossing into phonemic awareness are —",
      options:["rhymes — \"cat, hat, bat\" — and noticing words that share parts","sight words like \"the\" and \"of\"","words with three or more syllables","words starting with the child's name"], answer:0,
      explain:"Rhyme is a global sound pattern: the ending matches, the beginning changes. It is not yet full phonemic awareness, but it is the first crack in the wall between whole-word hearing and sound-by-sound hearing." },

    /* ---------- SILVER (tier 1) : 13 — the four moves ---------- */
    { id:"s01", tier:1, prompt:"The <b>four moves</b> of phonemic awareness — in order — are —",
      options:["isolate, blend, segment, manipulate","read, write, speak, listen","memorize, recite, repeat, recall","see, say, sound, spell"], answer:0,
      explain:"<b>Isolate</b> a sound. <b>Blend</b> separate sounds into a word. <b>Segment</b> a word into its sounds. <b>Manipulate</b> a sound — delete, swap, reverse. The four moves climb in difficulty, and manipulation is the mental motion decoding rests on." },
    { id:"s02", tier:1, prompt:"\"Listen: /m/ /a/ /p/. What word?\" — this is —",
      options:["blending","segmenting","isolating","manipulating"], answer:0,
      explain:"Blending combines separate phonemes into a whole word. Hearing /m/ /a/ /p/ and producing <b>map</b> is the blending move." },
    { id:"s03", tier:1, prompt:"\"Say <b>cat</b> slowly. What sounds do you hear?\" — this is —",
      options:["segmenting","blending","rhyming","manipulating"], answer:0,
      explain:"Segmenting is the reverse of blending: taking a whole spoken word apart into its component phonemes. <b>cat</b> → /k/ /a/ /t/." },
    { id:"s04", tier:1, prompt:"\"Say <b>cat</b>. Now say it without the /k/.\" — this is —",
      options:["manipulating","blending","rhyming","isolating"], answer:0,
      explain:"Phoneme manipulation — deleting, substituting, or moving a phoneme — is the hardest of the four moves and the most directly predictive of later decoding ability. <b>cat</b> minus /k/ = <b>at</b>." },
    { id:"s05", tier:1, prompt:"\"What is the first sound in <b>moon</b>?\" — this is —",
      options:["isolating","segmenting","blending","manipulating"], answer:0,
      explain:"Isolation asks for a single phoneme by position — first, middle, or last. It is usually the easiest move to teach first." },
    { id:"s06", tier:1, prompt:"<b>Rhyming</b> is a phonological skill, but is it the same as phonemic awareness?",
      options:["no — rhyming is broader; phonemic awareness is finer-grained","yes — they are identical","no — rhyming is part of decoding, not phonemic awareness","yes, but only for children"], answer:0,
      explain:"Phonological awareness is the umbrella: rhyme, syllable, onset-rime, and phoneme. <b>Phonemic</b> awareness is the most precise kind — single sounds, not chunks." },
    { id:"s07", tier:1, prompt:"A learner can clap the syllables in <b>cathedral</b> (ca-the-dral) but cannot break <b>cat</b> into /k/ /a/ /t/. They have —",
      options:["syllable awareness but not yet full phonemic awareness","full phonemic awareness","mastery of all four moves","completed the climb"], answer:0,
      explain:"Syllables are larger sound chunks than phonemes. A learner can hear syllables and still struggle with individual phonemes — those are different layers, and phonemic awareness goes deeper." },
    { id:"s08", tier:1, prompt:"\"<b>Cat</b> → change /k/ to /b/. What word?\" — the answer is —",
      options:["bat","cat","at","abt"], answer:0,
      explain:"Substitute the /k/ with /b/ in <b>cat</b> and you produce <b>bat</b>. This is the substitution variety of manipulation — and it is the same motion the brain uses when decoding a new word." },
    { id:"s09", tier:1, prompt:"The first sound in <b>chair</b> is —",
      options:["/ch/","/c/","/k/","/sh/"], answer:0,
      explain:"<b>chair</b> begins with the single phoneme /ch/ — the affricate made by stopping at /t/ and releasing into /sh/. One mouth action, one phoneme." },
    { id:"s10", tier:1, prompt:"How many phonemes are in the word <b>fish</b>?",
      options:["three","four","two","five"], answer:0,
      explain:"<b>fish</b> = /f/ /i/ /sh/. Three phonemes spelled with four letters. The digraph <b>sh</b> represents one sound." },
    { id:"s11", tier:1, prompt:"The hardest of the four moves — the one that most directly predicts decoding ability — is —",
      options:["manipulation","isolation","rhyming","syllable clapping"], answer:0,
      explain:"Delete a phoneme. Swap one. Reverse them. That mental motion — holding sounds in working memory and changing them — is exactly what decoding requires when the eyes meet a new word." },
    { id:"s12", tier:1, prompt:"Tokens or counters (pennies, beads) help a child do which move best?",
      options:["segmenting — one token per sound","alphabetizing","rhyming","reading silently"], answer:0,
      explain:"Tokens give the working pause something to do. As the child segments <b>cat</b>, one finger moves one token per sound. The pause becomes a workspace instead of a freeze." },
    { id:"s13", tier:1, prompt:"\"Tap. T-A-P. Now say <b>tap</b> backwards.\" — this is —",
      options:["manipulation — reversal variety","segmentation","blending","rhyming"], answer:0,
      explain:"Reversal — saying <b>tap</b> as <b>pat</b> — is one of the manipulation operations, alongside deletion and substitution. It demands holding all three phonemes in mind and rearranging them, which is why it arrives late in the climb." },

    /* ---------- GOLD (tier 2) : 13 — limits, contested research, what fails ---------- */
    { id:"g01", tier:2, prompt:"Phonemic awareness, by itself, is —",
      options:["necessary but not sufficient for reading","sufficient to read","unrelated to reading","only useful for children"], answer:0,
      explain:"Hearing sounds is the foundation, but a reader also needs letters mapped to those sounds (phonics), automaticity (fluency), word meaning (vocabulary), and comprehension. Phonemic awareness opens the door; it does not walk the reader through the house." },
    { id:"g02", tier:2, prompt:"<b>Three-cueing</b> teaches struggling readers to guess unfamiliar words from —",
      options:["pictures, context, and the first letter","the sound structure of the word","the dictionary","the spelling pattern"], answer:0,
      explain:"Three-cueing trained readers to look anywhere except at the sounds inside the word. It produced fluent guessers who collapse when the text becomes unfamiliar. The science of reading has moved away from it for good reason." },
    { id:"g03", tier:2, prompt:"A child who can correctly read a story but cannot retell it has a gap in —",
      options:["comprehension or vocabulary — not necessarily phonemic awareness","phonemic awareness","decoding","handwriting"], answer:0,
      explain:"Decoding the sounds is not the same as understanding the meaning. Phonemic awareness is upstream of decoding; comprehension is downstream. Different layer, different fix." },
    { id:"g04", tier:2, prompt:"The argument that struggling readers are simply \"unmotivated\" is usually —",
      options:["a misdiagnosis that hides a foundational skill gap","accurate","caused by screens","the result of weak parenting"], answer:0,
      explain:"A bright, eager, curious learner who freezes on print is rarely lacking motivation. They are lacking instruction. Naming the missing skill is the dignified path forward." },
    { id:"g05", tier:2, prompt:"Where the science-of-reading research is <b>most settled</b> is —",
      options:["explicit phonemic awareness instruction outperforms guessing-based approaches","reading is mostly natural and needs no instruction","children should read independently from the start","sight-word memorization is the foundation"], answer:0,
      explain:"Decades of classroom studies and brain imaging converge: explicit, sound-first instruction outperforms predict-and-guess approaches. That is the most settled part of the field." },
    { id:"g06", tier:2, prompt:"Where the science-of-reading research is <b>most contested</b> is —",
      options:["how much time, in what order, and at what age to teach which skills","whether phonemic awareness matters at all","whether English has phonemes","whether reading can be taught"], answer:0,
      explain:"The fact that explicit instruction works is not contested. The dosage, sequence, and intensity for different learners — that is where honest researchers still argue. This book is honest about both." },
    { id:"g07", tier:2, prompt:"A well-meaning teacher who tells a child \"sound it out\" without teaching the sounds first is —",
      options:["asking the child to use a tool they were never given","using best practice","wasting time","being too strict"], answer:0,
      explain:"\"Sound it out\" only works if the sounds have been taught. Asking a child to use a missing tool produces shame, not reading. The instruction has to come first." },
    { id:"g08", tier:2, prompt:"The phenomenon where strong early readers get steadily stronger while weak readers fall further behind is called —",
      options:["the Matthew effect","the cueing collapse","the phoneme gap","the syllable trap"], answer:0,
      explain:"Stanovich named it after Matthew 25:29 — to those who have, more is given. Strong readers read more, learn more words, decode more, and accelerate. Weak readers avoid reading, learn fewer words, and the gap widens. Fix the foundation early and the gap closes." },
    { id:"g09", tier:2, prompt:"A parent who reads many books aloud but skips explicit sound instruction is —",
      options:["helping with vocabulary and joy of reading, but not directly building phonemic awareness","wasting time","doing the most important thing","creating a reading disability"], answer:0,
      explain:"Read-alouds pour in language and love of story — real gifts. But hearing language is not the same as analyzing its sound structure. Both gifts matter; one does not replace the other." },
    { id:"g10", tier:2, prompt:"The instruction \"B says <b>buh</b>\" introduces a problem that often shows up later when —",
      options:["the child tries to blend \"buh-a-tuh\" instead of /b/ /a/ /t/ for <b>bat</b>","the child outgrows it","spelling lessons start","they reach high school"], answer:0,
      explain:"The extra <b>uh</b> sneaks into stop consonants because they are hard to pronounce alone. Teaching them with the vowel hides the actual phoneme. Later, the child blends four sounds when there are three." },
    { id:"g11", tier:2, prompt:"Adults who reach adulthood without phonemic awareness usually —",
      options:["have built sophisticated compensation strategies that worked until they didn't","were never intelligent","were lazy in school","need glasses"], answer:0,
      explain:"Bright adults compensate with memory, context, intelligence, and avoidance. The strategies hold until the text becomes unfamiliar enough — a lease, a medical form, a new field. Then the foundation shows." },
    { id:"g12", tier:2, prompt:"The research consensus on phonemic awareness instruction is that it works <b>best</b> when —",
      options:["it is explicit, brief, sequenced, and tied to letters soon after sounds are stable","it is long, implicit, and entirely separated from print","it is delayed until age eight","it is replaced with computer games"], answer:0,
      explain:"Short, explicit, sequenced instruction. Sounds first; letters introduced once the sounds are stable. The connection between the two should not be delayed too long once the foundation is set — that is the bridge to phonics." },
    { id:"g13", tier:2, prompt:"The honest answer to a parent asking \"why didn't my child learn to read?\" is sometimes —",
      options:["the program your school used was not aligned with the science of reading","the child is not bright","the child did not try","the family did not read enough"], answer:0,
      explain:"An enormous number of children were taught with methods the science had already discredited. Naming that openly — without blaming the child or the family — is the beginning of accountability and the beginning of the path forward." },

    /* ---------- PLATINUM (tier 3) : 13 — practice, mastery, the bridge ---------- */
    { id:"p01", tier:3, prompt:"The <b>frozen pause</b> in a learner is —",
      options:["a stall fed by threat and shame, ending the lesson","a sign of laziness","a normal break","always permanent"], answer:0,
      explain:"The frozen pause is information about the room, not about the learner. Met with calm, it becomes a working pause. Met with panic, it becomes a closed door." },
    { id:"p02", tier:3, prompt:"The <b>working pause</b> uses —",
      options:["tokens, mouth cues, clean sounds, and one sound-first question","silence and waiting","the picture in the book","a faster pace"], answer:0,
      explain:"A working pause is a workspace, not a verdict. The adult's calm and the right tool turn a stall into a teaching moment." },
    { id:"p03", tier:3, prompt:"The <b>two-question check</b> after an adult learner makes a phonemic error is —",
      options:["was I confused about the sound, or about the position? was my mouth doing what I told it to do?","what's wrong with me? am I stupid?","should I quit? am I ready?","what would others think? am I embarrassed?"], answer:0,
      explain:"Almost every adult error reduces to one of two questions: sound or position, and production. The two-question check turns the error into data instead of shame." },
    { id:"p04", tier:3, prompt:"A child's daily phonemic awareness routine works best at —",
      options:["about two minutes — rhyme, first sound, blend, segment","forty-five minutes daily","once a week","only on weekends"], answer:0,
      explain:"Calm, short, repeated. Two minutes folded into car rides, bath time, breakfast. Volume of warm encounters beats long sessions every time." },
    { id:"p05", tier:3, prompt:"A <b>minimal pair</b> is —",
      options:["two words that differ by exactly one phoneme — like <b>bat</b> and <b>pat</b>","two words that mean the same thing","two words spelled the same","two words that rhyme"], answer:0,
      explain:"Minimal pairs are precision tools. Bat/pat trains /b/ vs /p/. Ship/sip trains /sh/ vs /s/. Five minutes a day on one contrast is enough to make the ear sharp." },
    { id:"p06", tier:3, prompt:"For adults whose first language collapses /v/ and /b/ (e.g., Spanish), the most direct training tool is —",
      options:["minimal pairs like <b>berry</b>/<b>very</b>, with mouth cues","reading more silently","writing more often","memorizing word lists"], answer:0,
      explain:"Tell the learner what the mouth is doing — /b/ closes the lips, /v/ touches upper teeth to lower lip — and pair it with minimal pairs. The mouth learns the contrast and the ear follows." },
    { id:"p07", tier:3, prompt:"The <b>schwa</b> /ə/ is —",
      options:["the unstressed vowel sound — the most common vowel in English","a silent letter","a rare phoneme","a consonant"], answer:0,
      explain:"The first vowel in <b>about</b>, the second in <b>sofa</b>, the second in <b>taken</b> — all schwas. It hides behind every unstressed vowel letter in the language. Hearing the schwa unlocks multisyllable English." },
    { id:"p08", tier:3, prompt:"The <b>clean-sound rule</b> for stop consonants says —",
      options:["do not add a vowel to /b/, /p/, /t/, /d/, /k/, /g/","always add a vowel","skip stop consonants","use whisper voice"], answer:0,
      explain:"/b/ is a quick pop with the voice on. As soon as you add \"uh,\" the child hears two sounds and counts wrong. Clean the production; the segmentation stabilizes." },
    { id:"p09", tier:3, prompt:"The 90-day adult phonemic practice plan moves through the four moves in this order —",
      options:["isolate and blend → segment → manipulate","manipulate → blend → segment → isolate","all at once","rhyme only"], answer:0,
      explain:"Build the ear first (days 1–30). Take words apart cleanly (31–60). Move sounds in the mind (61–90). The order honors how the brain actually layers the skill." },
    { id:"p10", tier:3, prompt:"The error log for self-directed practice is most useful for —",
      options:["spotting the pattern in your errors — sound, position, or production","punishing yourself for mistakes","showing the teacher","sharing on social media"], answer:0,
      explain:"Five minutes a week looking at the log tells the truth that no quiz score can. The log is a mirror, not a verdict. The pattern is the path." },
    { id:"p11", tier:3, prompt:"The <b>bridge to phonics</b> happens when —",
      options:["the sounds are stable enough that letters can map onto them without collapsing the foundation","the child turns six","the parent says so","the program reaches Chapter 5"], answer:0,
      explain:"Phonics is sound mapped onto letters. If the sounds are not yet stable, the letters become a second source of confusion instead of a tool. The bridge is built when the foundation will hold the weight." },
    { id:"p12", tier:3, prompt:"For a learner who can hear /sh/ in <b>ship</b> but still says \"sip,\" the most accurate description is —",
      options:["receptive awareness is leading production by months — both are real learning","they have not yet started","they have plateaued","they are regressing"], answer:0,
      explain:"The ear comes first; the mouth follows. A child who hears the contrast but cannot yet produce it is mid-climb, not stuck. Production catches up with continued exposure." },
    { id:"p13", tier:3, prompt:"At the end of the Reading Helix Volume 1 journey, you have mastered —",
      options:["a sound foundation strong enough to carry letters — and a posture of calm, dignified practice","the entire alphabet","sight-word memorization","cursive handwriting"], answer:0,
      explain:"The sounds were always there. You just weren't taught to hear them. Now you are. The next door — Volume 2, <b>The Code That Unlocks Reading</b> — is where letters arrive to ride on the foundation you just built. Welcome to the Helix." }
  ];

  function start() {
    window.GSUGame.init({
      gameId: "phonemic-awareness-climb",
      title: "Phonemic Awareness — Helix Climb",
      subtitle: "The sounds were always there. You just weren't taught to hear them.",
      themeColor: "#1A8B7F",
      footNote: "Reading Helix · Volume 1. Infinite play — your tier is saved.",
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
