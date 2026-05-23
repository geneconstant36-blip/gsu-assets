/* ============================================================================
 * GSU READIFICATION — BLOCK 3A · "The Helix Climb"
 * External game logic — hosted at read.globalsovereignuniversity.org/helix-climb.js
 * Loaded by the Webflow embed in Block 3A on the Readification hub.
 *
 * ARCHITECTURE
 *   - Webflow embed contains only HTML + CSS (~17K chars, well under 50K limit)
 *   - This file contains: Firebase auth + Firestore persistence, 8 pillars,
 *     400+ tier-tagged questions, render logic, particles/confetti, helix SVG
 *   - Edit this file in gsu-assets, commit, push. GitHub Pages deploys in ~60s.
 *     No Webflow republish needed.
 *
 * STANDING RULES (May 2026)
 *   - 50+ questions per pillar, Bronze/Silver/Gold/Platinum tiers (≥12 each)
 *   - Real-world scenarios, application over recall
 *   - Spaced repetition via no-repeat seen-tracking (resets when pool exhausts)
 *   - Firebase Auth + Firestore from the start (never localStorage-only)
 *   - Anonymous on load; Google sign-in optional to carry progress across devices
 *   - Mobile-first, randomized option order, GENO integration throughout
 *
 * TIER PROGRESSION
 *   - Player starts every pillar on Bronze questions
 *   - Earn Silver+ medal on a session → next session draws from Silver questions
 *   - Earn Silver+ on Silver → advance to Gold; Silver+ on Gold → advance to Platinum
 *   - Platinum medal on Platinum questions = pillar mastered
 *
 * GENO + AUTH
 *   - GENO_URL points learners to the AI tutor for any tough question
 *   - Anonymous Firebase auth starts on load; progress saves silently
 *   - "Sign in to sync" links the anonymous account to Google for cross-device
 * ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, linkWithPopup }
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ============== CONFIG ==============================================
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyARIAF3fVoGReq27aY9u5SgNq6mlrw7SKc",
  authDomain:        "gsu-handshake.firebaseapp.com",
  projectId:         "gsu-handshake",
  storageBucket:     "gsu-handshake.firebasestorage.app",
  messagingSenderId: "301089416765",
  appId:             "1:301089416765:web:dff926a7aa52191e9a6c54",
  measurementId:     "G-LZDRK48TL7"
};
const GENO_URL = "https://www.globalsovereignuniversity.org/geno";

// ============== GAME CONSTANTS ======================================
const POINTS_PER_Q = 10;
const SESSION_LEN  = 6;          // questions per session
const TIER_ORDER   = ["bronze", "silver", "gold", "platinum"];
const N_PILLARS    = 8;
const MAX_SHOWN_TOTAL = POINTS_PER_Q * SESSION_LEN * N_PILLARS; // 480

// ============== PILLAR + QUESTION BANK ==============================
// Each question: { id, tier, q, opts:[4], a:correctIndex, explain }
// Tiers: bronze=foundation, silver=consolidation, gold=advanced, platinum=mastery
// IDs use {pillarPrefix}-{tier}{n} for stable seen-tracking across deploys.

const PILLARS = [
  {
    slug:"phonemic-awareness", name:"Phonemic Awareness", tag:"Foundation Five",
    lesson:"Before letters, there are sounds. Phonemic awareness is the ear trained to hear the individual sounds — phonemes — that make up spoken words. It's listening work, not reading work, and it's the ground floor of the whole Helix.",
    qs:[
      // ---------- BRONZE — counting and identifying basic phonemes ----------
      {id:"pa-b01", tier:"bronze", q:"How many separate sounds (phonemes) are in the word \"cat\"?", opts:["2","3","4","1"], a:1, explain:"Three: /k/ /a/ /t/. Letters and sounds line up one-for-one here."},
      {id:"pa-b02", tier:"bronze", q:"What sound do you hear at the BEGINNING of \"ship\"?", opts:["/s/","/h/","/sh/","/p/"], a:2, explain:"The digraph s-h makes a single sound, /sh/. Two letters, one phoneme."},
      {id:"pa-b03", tier:"bronze", q:"What sound do you hear at the END of \"fish\"?", opts:["/h/","/sh/","/s/","/i/"], a:1, explain:"The /sh/ digraph closes the word. Two letters, one phoneme."},
      {id:"pa-b04", tier:"bronze", q:"Blend these sounds together: /f/ /l/ /a/ /g/. What word do you get?", opts:["frog","flag","flat","fang"], a:1, explain:"Four phonemes blended in sequence give you \"flag.\" Blending is the inverse of segmenting."},
      {id:"pa-b05", tier:"bronze", q:"Blend these sounds: /m/ /oo/ /n/. The word is…", opts:["moan","moon","main","mine"], a:1, explain:"Three phonemes — the long /oo/ in the middle — make \"moon.\""},
      {id:"pa-b06", tier:"bronze", q:"How many syllables are in \"umbrella\"?", opts:["2","3","4","5"], a:1, explain:"Um-brel-la. Three syllables, each with its own vowel sound."},
      {id:"pa-b07", tier:"bronze", q:"What sound do \"cat,\" \"cup,\" and \"cake\" all begin with?", opts:["/k/","/s/","/ch/","/c/"], a:0, explain:"All three start with the /k/ sound, even though it's spelled with the letter c."},
      {id:"pa-b08", tier:"bronze", q:"How many phonemes are in the word \"stop\"?", opts:["3","4","5","2"], a:1, explain:"Four: /s/ /t/ /o/ /p/. Every letter represents its own sound here."},
      {id:"pa-b09", tier:"bronze", q:"What sound do you hear in the MIDDLE of \"hop\"?", opts:["/h/","/p/","/o/","/ho/"], a:2, explain:"The middle phoneme is the short vowel /o/. Beginning /h/, middle /o/, end /p/."},
      {id:"pa-b10", tier:"bronze", q:"What's the first sound in \"thumb\"?", opts:["/t/","/th/","/h/","/u/"], a:1, explain:"\"Th\" is one sound, not two. The digraph /th/ opens the word."},
      {id:"pa-b11", tier:"bronze", q:"How many phonemes are in \"dog\"?", opts:["2","3","4","1"], a:1, explain:"Three: /d/ /o/ /g/. Three letters, three sounds."},
      {id:"pa-b12", tier:"bronze", q:"Which two words rhyme?", opts:["cat / cup","dog / log","sun / sit","bed / bin"], a:1, explain:"Rhyming words share the ending sound. /og/ in dog matches /og/ in log."},

      // ---------- SILVER — phoneme manipulation, harder counts ----------
      {id:"pa-s01", tier:"silver", q:"If you take the /s/ off the front of \"smile,\" what word is left?", opts:["mile","mild","smile","ile"], a:0, explain:"Drop /s/ and you hear /m/ /ī/ /l/ — \"mile.\" That's phoneme deletion."},
      {id:"pa-s02", tier:"silver", q:"How many phonemes are in \"string\"?", opts:["4","5","6","3"], a:1, explain:"Five: /s/ /t/ /r/ /i/ /ng/. The \"ng\" at the end is a single sound."},
      {id:"pa-s03", tier:"silver", q:"Remove the first sound from \"play.\" What word remains?", opts:["lay","pay","ay","play"], a:0, explain:"Drop /p/ and you're left with \"lay.\" Phoneme deletion at the onset."},
      {id:"pa-s04", tier:"silver", q:"Swap the first sound of \"cat\" with /h/. What word do you get?", opts:["hat","cot","cat","hate"], a:0, explain:"Phoneme substitution: /h/ + /a/ + /t/ = \"hat.\""},
      {id:"pa-s05", tier:"silver", q:"How many phonemes are in \"chunk\"?", opts:["3","4","5","6"], a:1, explain:"Four: /ch/ /u/ /n/ /k/. The \"ch\" is one sound; the \"nk\" is two."},
      {id:"pa-s06", tier:"silver", q:"Take \"clap\" and swap /l/ for /r/. What word do you hear?", opts:["clap","crap","cap","crab"], a:1, explain:"Substitute the second phoneme: /k/ /r/ /a/ /p/ = crap (a real medial substitution drill)."},
      {id:"pa-s07", tier:"silver", q:"Add /s/ to the start of \"top.\" What word do you make?", opts:["stop","tops","sop","sot"], a:0, explain:"Phoneme addition at the onset: /s/ /t/ /o/ /p/ = stop."},
      {id:"pa-s08", tier:"silver", q:"How many phonemes are in \"box\"?", opts:["3","4","5","2"], a:1, explain:"Four: /b/ /o/ /k/ /s/. The letter x represents TWO sounds: /k/ + /s/."},
      {id:"pa-s09", tier:"silver", q:"Remove the LAST sound from \"plant.\" What word remains?", opts:["plan","pant","plate","plat"], a:0, explain:"Drop /t/ at the end: /p/ /l/ /a/ /n/ = plan."},
      {id:"pa-s10", tier:"silver", q:"Blend these sounds: /sh/ /r/ /i/ /m/ /p/. The word is…", opts:["ship","shrimp","strip","shrub"], a:1, explain:"Five phonemes — /sh/ is one sound — blend to \"shrimp.\""},
      {id:"pa-s11", tier:"silver", q:"Take \"black\" and remove the /l/. What word remains?", opts:["bake","back","beck","brack"], a:1, explain:"Medial phoneme deletion: /b/ /a/ /k/ = back."},
      {id:"pa-s12", tier:"silver", q:"How many phonemes are in \"queen\"?", opts:["3","4","5","2"], a:1, explain:"Four: /k/ /w/ /ē/ /n/. The letter Q represents two sounds, /k/ + /w/."},

      // ---------- GOLD — multi-step manipulation, real classroom situations ----------
      {id:"pa-g01", tier:"gold", q:"A kindergartener can clap each syllable in \"butterfly\" but can't tell you the first sound in \"bird.\" Which skill is missing?", opts:["syllable awareness","onset/phoneme isolation","rhyming","alphabet knowledge"], a:1, explain:"They have syllable awareness but not phoneme-level awareness yet. Phonemic awareness develops AFTER syllable awareness — they're on the right path."},
      {id:"pa-g02", tier:"gold", q:"Change the /a/ in \"cap\" to /u/, then add /s/ to the end. What word do you get?", opts:["cups","cusp","cubs","cap"], a:0, explain:"Step 1: cap → cup (substitute vowel). Step 2: cup → cups (add /s/). Two-step phoneme manipulation."},
      {id:"pa-g03", tier:"gold", q:"How many phonemes are in \"sphinx\"?", opts:["4","5","6","3"], a:2, explain:"Six: /s/ /f/ /i/ /n/ /k/ /s/. The \"ph\" makes /f/, and \"x\" makes /k/+/s/."},
      {id:"pa-g04", tier:"gold", q:"A child reads \"crisp\" as \"kip.\" Which phonemic awareness gap is most likely?", opts:["initial sound","final consonant blend","short vowel","syllable count"], a:1, explain:"They got the onset and vowel but dropped the /r/ and /s/ inside the blend. Hearing each phoneme in a consonant cluster is the gap."},
      {id:"pa-g05", tier:"gold", q:"Reverse the phonemes in \"top.\" What word do you say?", opts:["pot","pop","stop","tap"], a:0, explain:"\"Top\" = /t/ /o/ /p/. Reversed: /p/ /o/ /t/ = \"pot.\" Phoneme reversal is an advanced skill."},
      {id:"pa-g06", tier:"gold", q:"Two children are at the same reading level. Child A can rhyme but can't segment. Child B can segment but can't rhyme. Who is closer to decoding?", opts:["Child A — rhyming comes first","Child B — segmentation is closer to decoding","They're tied","Neither is ready"], a:1, explain:"Rhyming is a syllable-level skill. Segmenting individual phonemes is the bridge to decoding written words. Child B is closer to the goal."},
      {id:"pa-g07", tier:"gold", q:"Take \"snap\" and substitute the middle vowel with /i/. The word becomes…", opts:["snip","snap","snip","snub"], a:0, explain:"Medial vowel substitution: /s/ /n/ /i/ /p/ = snip."},
      {id:"pa-g08", tier:"gold", q:"How many phonemes are in the word \"throw\"?", opts:["3","4","5","2"], a:0, explain:"Three: /th/ /r/ /ō/. \"Th\" is one sound, \"r\" is one, and \"ow\" makes the long /ō/ — one sound."},
      {id:"pa-g09", tier:"gold", q:"A teacher says: /b/ /l/ /a/ /n/ /k/. A student responds: \"black.\" What did the student miss?", opts:["the initial /b/","the final /k/","substituted /k/ for /n/","ignored the second sound"], a:2, explain:"They heard 5 phonemes but blended /k/ where /n/ /k/ should be. The student needs more practice distinguishing /n/ from /k/ in final blends."},
      {id:"pa-g10", tier:"gold", q:"Which task is HARDEST for a young child?", opts:["clap syllables in 'banana'","tell which word rhymes with 'cat'","name the first sound in 'sun'","switch the first sound of 'mat' to make 'sat'"], a:3, explain:"Phoneme substitution is harder than rhyming, syllable counting, or onset isolation. Manipulation requires holding all the phonemes in mind while changing one."},
      {id:"pa-g11", tier:"gold", q:"In \"judge,\" how many phonemes do you hear?", opts:["3","4","5","2"], a:0, explain:"Three: /j/ /u/ /j/. The \"dge\" pattern is one sound — /j/ — even though it's three letters."},
      {id:"pa-g12", tier:"gold", q:"A reader stumbles on \"twist\" because they can't hear the /t/ before the /w/. Which drill helps most directly?", opts:["rhyming pairs","initial consonant blends segmentation","syllable clapping","alphabet song"], a:1, explain:"Their gap is hearing two consonants stacked at the onset. Drilling /t/+/w/, /s/+/p/, /s/+/k/ as separate phonemes targets exactly this."},

      // ---------- PLATINUM — diagnostic and instructional design ----------
      {id:"pa-p01", tier:"platinum", q:"A second-grader reads \"sprint\" as \"split.\" Their phonemic awareness assessment is strong. The most likely cause is…", opts:["weak phonemic awareness","weak phonics — specifically the /spr/ blend","poor vocabulary","poor comprehension"], a:1, explain:"Strong phonemic awareness rules out the auditory gap. The mismatch is in mapping the /spr/ sound to the spelling pattern — a phonics gap, not a phonemic gap."},
      {id:"pa-p02", tier:"platinum", q:"Why does phonemic awareness instruction usually need to happen orally, without print?", opts:["letters distract from the sound work","print isn't developed enough yet","both A and B","neither — print should always be present"], a:2, explain:"Both. Letters can fix a child's attention on visual symbols rather than the auditory phoneme. Early PA drills should be ear-only — no letters in sight."},
      {id:"pa-p03", tier:"platinum", q:"Which sequence reflects the typical developmental progression?", opts:["phonemes → onset-rime → syllables → words","words → syllables → onset-rime → phonemes","syllables → phonemes → words → onset-rime","random order — no fixed sequence"], a:1, explain:"Awareness moves from larger units (words, syllables) to smaller (onset-rime, then individual phonemes). Phonemic — single-phoneme — work comes LAST."},
      {id:"pa-p04", tier:"platinum", q:"A struggling reader scores high on syllable counting but low on phoneme segmentation. What does this profile suggest?", opts:["normal development — no intervention needed","they need intensive phoneme-level instruction before phonics will stick","they need more sight-word practice","they're advanced — give harder material"], a:1, explain:"Strong syllable awareness without phoneme awareness predicts decoding struggle. The phoneme layer is the bridge — without it, phonics rules don't map onto the right units."},
      {id:"pa-p05", tier:"platinum", q:"The Yopp-Singer phoneme segmentation task asks a child to break a spoken word into its sounds. A common error is breaking by syllable instead. What does this tell you?", opts:["the child is fine — same idea","the child has syllable awareness but not phoneme awareness","the child can't hear","the test is too hard"], a:1, explain:"Segmenting by syllable when asked for phonemes means the child operates at the larger unit but hasn't yet zoomed in to phonemes. Targeted phoneme drills are next."},
      {id:"pa-p06", tier:"platinum", q:"Phonemic awareness in kindergarten predicts reading achievement years later. This is true even controlling for IQ. Why?", opts:["it's a measure of intelligence","it captures the foundational auditory processing that decoding requires","it predicts vocabulary","none of the above"], a:1, explain:"PA is a specific auditory skill that decoding directly depends on. It's not a proxy for general intelligence — it predicts reading even when IQ is held constant."},
      {id:"pa-p07", tier:"platinum", q:"A child can do phoneme blending (combine sounds into a word) but not phoneme segmentation (break a word apart). What's the relationship?", opts:["blending is harder than segmentation","segmentation is harder than blending — the gap is normal","they're equally difficult","one rules out the other"], a:1, explain:"Segmentation is typically harder than blending. A child who can blend but not yet segment is on the normal trajectory — drill segmentation directly."},
      {id:"pa-p08", tier:"platinum", q:"Which is NOT a phonemic awareness task?", opts:["clap each sound in 'pat'","what sounds make 'frog'","what letter starts 'frog'","blend /f/ /r/ /o/ /g/"], a:2, explain:"Letter identification is print/alphabet knowledge — not phonemic awareness. PA is purely auditory; no letters involved."},
      {id:"pa-p09", tier:"platinum", q:"An adult learner can decode short words but struggles with multisyllabic words like \"interesting.\" Where would you start?", opts:["alphabet review","syllable segmentation + each syllable's phoneme breakdown","sight word lists","vocabulary"], a:1, explain:"Adult learners with this profile usually have phoneme awareness intact but haven't transferred it to longer words. Syllable-by-syllable phoneme work bridges the gap."},
      {id:"pa-p10", tier:"platinum", q:"A teacher drills /s/ /t/ /r/ /i/ /ng/ daily for a week. A student still segments \"string\" as four sounds, dropping the /r/. What's the most targeted next step?", opts:["more repetition of the same drill","explicit /str/ blend drill in different words: street, strong, strap","switch to comprehension","skip phonemic awareness"], a:1, explain:"The student's gap is in the /r/ within a 3-consonant blend. Drill the /str/ pattern across many words so the /r/ stops being absorbed by the other consonants."},
      {id:"pa-p11", tier:"platinum", q:"Phonemic awareness intervention shows the largest effect sizes for…", opts:["already strong readers","at-risk and dyslexic readers","ESL learners only","none of the above"], a:1, explain:"PA training produces the biggest gains for struggling and at-risk readers, including those with dyslexia. For strong readers, gains are smaller because they already have the skill."},
      {id:"pa-p12", tier:"platinum", q:"Why does \"phonemic\" awareness matter more than \"phonological\" awareness for reading instruction?", opts:["they're the same thing","phonological is broader (rhyme, syllable, etc.); phonemic is the specific phoneme-level skill that maps to letters","phonological matters more","neither matters"], a:1, explain:"Phonological is the umbrella (rhyming, syllables, onset-rime, phonemes). Phonemic is specifically phoneme-level. Decoding requires the phoneme level — the specific layer."}
    ]
  },
  {
    slug:"phonics", name:"Phonics", tag:"Foundation Five",
    lesson:"Phonics is the bridge from sound to print. Letters and letter-combinations stop being decorations and start being predictable signals. Once these patterns lock in, reading stops being a guessing game.",
    qs:[
      // ---------- BRONZE — common patterns and digraphs ----------
      {id:"ph-b01", tier:"bronze", q:"In \"phone,\" which letter combination makes the /f/ sound?", opts:["ph","hn","on","ne"], a:0, explain:"The digraph \"ph\" reliably says /f/ — phone, photo, phantom, graph."},
      {id:"ph-b02", tier:"bronze", q:"In \"made,\" what job does the silent \"e\" at the end do?", opts:["makes it past tense","makes the \"a\" long","adds a syllable","nothing"], a:1, explain:"Silent-e reaches back over the consonant and makes the vowel say its name. Mad becomes made."},
      {id:"ph-b03", tier:"bronze", q:"The letters \"tion\" at the end of a word are usually pronounced…", opts:["/tee-on/","/shun/","/tie-on/","/ton/"], a:1, explain:"\"Tion\" reliably says /shun/ — nation, action, fraction, attention."},
      {id:"ph-b04", tier:"bronze", q:"In \"knee,\" the letter \"k\" is…", opts:["pronounced","silent","aspirated","doubled"], a:1, explain:"\"Kn\" at the start of a word is a silent-k pattern: knee, know, knight, knot."},
      {id:"ph-b05", tier:"bronze", q:"In \"rain,\" the long /ā/ sound comes from…", opts:["the r","the i alone","the vowel team \"ai\"","the n"], a:2, explain:"Two vowels walking — the \"ai\" team makes one long /ā/ sound. Same in pain, mail, train."},
      {id:"ph-b06", tier:"bronze", q:"In \"city,\" the letter \"c\" is pronounced…", opts:["hard, like /k/","soft, like /s/","silent","like /ch/"], a:1, explain:"C before e, i, or y is usually soft (/s/). C before a, o, u is usually hard (/k/)."},
      {id:"ph-b07", tier:"bronze", q:"At the end of \"happy,\" the letter \"y\" sounds like…", opts:["long e","long i","short y","silent"], a:0, explain:"At the end of a multi-syllable word, y usually says long /ē/: happy, candy, jelly."},
      {id:"ph-b08", tier:"bronze", q:"In \"night,\" the letters \"igh\" are pronounced…", opts:["short i","long i","silent","like /g/"], a:1, explain:"The \"igh\" trigraph reliably says long /ī/: night, light, sight, bright."},
      {id:"ph-b09", tier:"bronze", q:"In \"car,\" the vowel sound is shaped by…", opts:["the c","the r (r-controlled)","silent e","an exception"], a:1, explain:"R-controlled vowels: when r follows a vowel, it bends the vowel's sound. Same in star, far, bar."},
      {id:"ph-b10", tier:"bronze", q:"In \"rabbit,\" the double-b…", opts:["is pronounced twice","keeps the first vowel short","makes the vowel long","is silent"], a:1, explain:"A doubled consonant after a vowel usually signals that the vowel stays short. Compare \"hopping\" (short o) with \"hoping\" (long o)."},
      {id:"ph-b11", tier:"bronze", q:"The \"sh\" in \"ship\" is a…", opts:["consonant blend","digraph","trigraph","silent letter"], a:1, explain:"A digraph is two letters that make one sound. Sh, ch, th, wh, ph, ng are all digraphs."},
      {id:"ph-b12", tier:"bronze", q:"Which word has a SHORT vowel sound?", opts:["bake","cap","time","bone"], a:1, explain:"Cap = /kăp/ with a short /a/. The other three have silent-e long vowels."},

      // ---------- SILVER — vowel teams, patterns, exceptions ----------
      {id:"ph-s01", tier:"silver", q:"In \"chocolate,\" the \"ch\" makes which sound?", opts:["/sh/","/k/","/ch/","/h/"], a:2, explain:"The \"ch\" digraph makes /ch/ here. (Sometimes ch says /k/, as in \"chorus\" or \"chemistry\" — Greek-origin words.)"},
      {id:"ph-s02", tier:"silver", q:"In \"boat,\" the vowel team \"oa\" sounds like…", opts:["short o","long o","/aw/","/oo/"], a:1, explain:"Two vowels walking again — \"oa\" reliably says long /ō/: boat, coat, goal, road."},
      {id:"ph-s03", tier:"silver", q:"What's the difference between \"cap\" and \"cape\"?", opts:["nothing — same word","silent-e in cape makes the a long","cape is plural","cap is older"], a:1, explain:"Silent-e is the marker. Without it, the vowel stays short (cap). With it, the vowel goes long (cape)."},
      {id:"ph-s04", tier:"silver", q:"In \"giant,\" the \"g\" is pronounced…", opts:["hard, like /g/","soft, like /j/","silent","like /h/"], a:1, explain:"G before e, i, or y is usually soft (/j/): giant, gentle, gym. G before a, o, u is usually hard: gate, go, gum."},
      {id:"ph-s05", tier:"silver", q:"In \"meal,\" the vowel team \"ea\" sounds like…", opts:["short e","long e","short a","silent"], a:1, explain:"\"Ea\" usually says long /ē/: meal, beach, team, read. (Sometimes short e — bread, head — but long e is the default.)"},
      {id:"ph-s06", tier:"silver", q:"The word \"sing\" ends in…", opts:["two consonants","one digraph (/ng/)","silent g","double n"], a:1, explain:"\"Ng\" is a single sound — one phoneme spelled with two letters. Same in ring, king, song, long."},
      {id:"ph-s07", tier:"silver", q:"In \"toy,\" the letters \"oy\" make…", opts:["long o","the diphthong /oi/","short o","silent oy"], a:1, explain:"/oi/ is a diphthong — a sliding vowel sound. Spelled \"oy\" at the end of a word, \"oi\" in the middle: toy/boy vs coin/foil."},
      {id:"ph-s08", tier:"silver", q:"In \"could,\" the letter pattern \"ould\" is pronounced…", opts:["/ōld/","/ood/ (short oo + d)","/uld/","/owld/"], a:1, explain:"Would, could, should — the \"l\" is silent and the \"ould\" pattern says /ood/. One of English's reliable irregular patterns."},
      {id:"ph-s09", tier:"silver", q:"What rule governs why we double the consonant in \"running\" but not in \"raining\"?", opts:["no rule","the 1-1-1 doubling rule: 1-syllable, 1 vowel, 1 final consonant","spelling preference","random"], a:1, explain:"Run is 1 syllable, 1 vowel, 1 final consonant → double the n before adding -ing. Rain has 2 vowels (ai) so no doubling needed."},
      {id:"ph-s10", tier:"silver", q:"In \"wrist,\" the letter pattern \"wr\" is pronounced…", opts:["/wr/","/r/ (w is silent)","/w/ (r is silent)","both silent"], a:1, explain:"\"Wr\" at the start of a word is silent-w: wrist, write, wrong, wrap, wreck."},
      {id:"ph-s11", tier:"silver", q:"In \"phone\" and \"laugh,\" both contain the /f/ sound. The patterns are…", opts:["different (ph vs gh)","same (both ph)","both silent","unrelated to /f/"], a:0, explain:"Both spell /f/ but use different patterns: \"ph\" in phone, \"gh\" in laugh. Both are common spellings for /f/ in English."},
      {id:"ph-s12", tier:"silver", q:"\"Stopping\" doubles the p; \"hoping\" doesn't. Why?", opts:["different roots","stop has a short vowel (needs protecting); hope has a long vowel (silent-e drops)","random spelling","one is older"], a:1, explain:"Doubling protects the short vowel. Stop → stopping (keeps short o). Hope → hoping (silent-e drops, long o remains)."},

      // ---------- GOLD — multi-pattern words, syllable types ----------
      {id:"ph-g01", tier:"gold", q:"Identify the syllable type in \"cab\":", opts:["closed","open","silent-e","vowel team"], a:0, explain:"Closed syllable: ends in a consonant, vowel is short. Cab, sit, pen, lock, bug — all closed."},
      {id:"ph-g02", tier:"gold", q:"Identify the syllable type in \"go\":", opts:["closed","open","r-controlled","consonant-le"], a:1, explain:"Open syllable: ends in a vowel, vowel says its name (long). Go, hi, be, me, so."},
      {id:"ph-g03", tier:"gold", q:"In the word \"reptile,\" how do you divide it into syllables?", opts:["re-ptile","rep-tile","rept-ile","reptil-e"], a:1, explain:"VCCV pattern (vowel-consonant-consonant-vowel) usually divides between the two consonants. \"Rep\" (closed, short e) + \"tile\" (silent-e, long i)."},
      {id:"ph-g04", tier:"gold", q:"\"Robot\" divides as ro-bot. What syllable type is \"ro\"?", opts:["closed","open (long o)","r-controlled","consonant-le"], a:1, explain:"Open syllable. The o ends the syllable and stays long. \"Bot\" is closed and short."},
      {id:"ph-g05", tier:"gold", q:"A child reads \"pilot\" as \"pillot.\" What syllable rule did they miss?", opts:["closed syllable rule","open syllable rule (VCV usually splits before the C)","silent-e rule","vowel team rule"], a:1, explain:"In VCV patterns, the syllable usually splits BEFORE the consonant: pi-lot. The first syllable is open (long i). The student split after, making it closed (short i)."},
      {id:"ph-g06", tier:"gold", q:"In \"little,\" the syllable \"tle\" is a…", opts:["closed syllable","consonant-le syllable","silent-e syllable","r-controlled"], a:1, explain:"Consonant-le is the sixth syllable type: a consonant + \"le\" forms a syllable. Little, table, candle, simple — all end in C-le."},
      {id:"ph-g07", tier:"gold", q:"In \"thirsty,\" how many syllables, and what types?", opts:["1 — closed","2 — r-controlled + open","2 — closed + closed","3 — closed + closed + open"], a:1, explain:"Two syllables: \"thirs\" (r-controlled — the r changes the vowel) + \"ty\" (open, y says long e). Two of the six syllable types together."},
      {id:"ph-g08", tier:"gold", q:"Why is \"said\" considered an irregular sight word in early phonics?", opts:["it's not — it's regular","\"ai\" is usually long /ā/ but here it says /e/","said is rare","said is archaic"], a:1, explain:"Said breaks the \"ai = long ā\" pattern, saying /sed/ instead. It's a common irregular that must be taught as a sight word until the pattern \"ai for short e\" is introduced (rare)."},
      {id:"ph-g09", tier:"gold", q:"A second-grader reads \"shape\" but not \"chape.\" Why?", opts:["shape is a real word; chape is not — they're using meaning","they don't know the silent-e pattern","they can't see well","random"], a:0, explain:"They've learned the silent-e pattern AND they're using word knowledge to confirm real words. \"Chape\" is decodable but isn't a real word, so it doesn't trigger recognition."},
      {id:"ph-g10", tier:"gold", q:"In \"action,\" the \"ction\" pattern is pronounced…", opts:["/k-shun/","/k-tion/","/shun/","/k-tee-on/"], a:0, explain:"\"Ction\" = /k/ + /shun/. The c keeps its /k/ sound; the \"tion\" makes /shun/. Same in fraction, fiction, action."},
      {id:"ph-g11", tier:"gold", q:"Why does \"pretzel\" divide as pret-zel rather than pre-tzel?", opts:["random","tz is treated as a single consonant team that stays together","both work","English is illogical"], a:1, explain:"\"Tz\" is a consonant team — both letters stick together when dividing. The split goes before tz: pret-zel."},
      {id:"ph-g12", tier:"gold", q:"In \"vacation,\" we have…", opts:["3 closed syllables","va (open) + ca (open) + tion","va (open) + ca (closed) + tion","3 open syllables"], a:1, explain:"Va-ca-tion. \"Va\" is open (long a). \"Ca\" is open (long a). \"Tion\" is the /shun/ ending. Two open syllables + the tion suffix."},

      // ---------- PLATINUM — diagnostic and instructional design ----------
      {id:"ph-p01", tier:"platinum", q:"A third-grader can read decodable single-syllable words but stumbles on multisyllabic words. The gap is most likely…", opts:["phonemic awareness","syllable division strategies","sight words","comprehension"], a:1, explain:"Single-syllable decoding intact, multisyllabic broken — the missing layer is syllable division. Teach the six syllable types and division rules."},
      {id:"ph-p02", tier:"platinum", q:"A teacher introduces silent-e using \"cap → cape, man → mane, hat → hate.\" What instructional principle is at work?", opts:["random examples","minimal pairs that isolate the silent-e variable","oldest words first","most-frequent words first"], a:1, explain:"Minimal pairs — words that differ by only the variable being taught — make the pattern visible. Cap vs cape isolates exactly the silent-e effect."},
      {id:"ph-p03", tier:"platinum", q:"\"Was\" and \"of\" are taught as sight words in K-1 because…", opts:["they're rare","they're high-frequency but contain unusual sound-spellings","they're new in English","children memorize them naturally"], a:1, explain:"High-frequency irregular words — \"of\" sounds /uv/, \"was\" sounds /wuz/. Both appear constantly in print but don't decode cleanly with K-1 phonics, so they're explicitly taught."},
      {id:"ph-p04", tier:"platinum", q:"In a structured literacy classroom, the sequence is typically: phonemic awareness → letter-sound correspondences → blending CVC words → digraphs → blends → silent-e → vowel teams → multisyllabic. Why this order?", opts:["random","simple to complex; each step relies on the previous","alphabetic","historical"], a:1, explain:"Cumulative scope-and-sequence. Each new pattern builds on what's already mastered. Skipping or scrambling the order leaves gaps that surface later."},
      {id:"ph-p05", tier:"platinum", q:"Why does explicit, systematic phonics outperform incidental phonics (\"phonics-when-needed\") in randomized trials?", opts:["it doesn't — they're equivalent","systematic instruction builds the code in a planned order; incidental leaves gaps","incidental is better","both are bad"], a:1, explain:"The National Reading Panel (2000) and subsequent meta-analyses show explicit systematic phonics produces larger and more durable gains than incidental approaches, especially for at-risk readers."},
      {id:"ph-p06", tier:"platinum", q:"A child who reads \"want\" as \"wahnt\" with a clear short-a sound is…", opts:["correct","using the regular short-a rule but missing the \"wa\" exception","mispronouncing","ESL"], a:1, explain:"After /w/, the letter a often says /ä/ or /aw/: want, was, watch, water. \"Wa\" is a reliable phonics exception worth teaching explicitly."},
      {id:"ph-p07", tier:"platinum", q:"Which is the strongest evidence that phonics instruction is working?", opts:["the child can read familiar words","the child can decode unfamiliar (\"nonsense\" or new) words by applying the rules","the child reads fast","the child reads with expression"], a:1, explain:"The acid test of phonics is whether the child can decode words they've NEVER seen. Familiar words could be memorized; novel-word decoding proves the patterns are internalized."},
      {id:"ph-p08", tier:"platinum", q:"The \"three-cueing system\" (meaning, syntax, visual) is widely criticized in science-of-reading literature because…", opts:["it's too hard to teach","it encourages guessing from pictures and context instead of decoding the letters","it's outdated terminology only","it works only for some children"], a:1, explain:"Three-cueing trains readers to guess from context or pictures when a word is unfamiliar — exactly the wrong instinct. Skilled readers decode the letters in order; they don't guess."},
      {id:"ph-p09", tier:"platinum", q:"A first-grader can decode \"cat,\" \"hop,\" \"dig\" but fails on \"fish,\" \"such,\" \"with.\" What's the most likely missing skill?", opts:["vowels","initial consonant blends","consonant digraphs (sh, ch, th, wh)","silent-e"], a:2, explain:"They have CVC down but the new layer (digraphs sh/ch/th/wh) hasn't been introduced or hasn't stuck. Targeted digraph instruction is the next step."},
      {id:"ph-p10", tier:"platinum", q:"In adult literacy work, why is phonics often resisted by learners?", opts:["it's too hard","adult learners often associate phonics with childhood embarrassment and prefer whole-word approaches","it doesn't work for adults","adults don't need it"], a:1, explain:"Many adult learners avoid phonics because of shame or prior failure. Skilled adult-literacy teachers reframe phonics as a code-cracking system — useful at any age, not a child's exercise."},
      {id:"ph-p11", tier:"platinum", q:"\"Decodable texts\" — books written using only patterns the student has been taught — exist because…", opts:["they're cheap","they let students practice newly-learned patterns without encountering words they can't decode","they're pretty","they're a marketing gimmick"], a:1, explain:"Decodables are practice runways. A student who just learned silent-e gets a book full of cape, name, time, bone — applying the new pattern without being tripped by unrelated patterns."},
      {id:"ph-p12", tier:"platinum", q:"Mississippi went from last in U.S. NAEP reading to mid-pack on the strength of which policy change?", opts:["smaller class sizes","mandatory science-of-reading aligned instruction K-3","more standardized testing","less standardized testing"], a:1, explain:"The Mississippi Literacy Improvement Act (2013) mandated phonics-based, science-of-reading aligned instruction K-3, plus teacher training. State NAEP scores rose substantially over the following decade — a real-world case study cited nationally."}
    ]
  }
,
  {
    slug:"decoding", name:"Decoding", tag:"Sovereign Seven",
    lesson:"Decoding is what you do when you meet a word you've never seen before. It's the moment of truth — applying every phonics pattern, every syllable rule, every blending instinct to read a stranger word aloud. Decoding is independence on every page.",
    qs:[
      // ---------- BRONZE ----------
      {id:"dc-b01", tier:"bronze", q:"To decode an unfamiliar word, the FIRST thing a reader should do is…", opts:["guess from the picture","look at the letters from left to right","skip it","ask someone"], a:1, explain:"Decoding starts with the letters in order. Pictures and context come AFTER you've tried the letters."},
      {id:"dc-b02", tier:"bronze", q:"Break the word \"cat\" into its sounds:", opts:["/c/ /a/ /t/","/ca/ /t/","/c/ /at/","/cat/"], a:0, explain:"Three letters, three sounds — one phoneme per letter. The simplest CVC pattern."},
      {id:"dc-b03", tier:"bronze", q:"Which word follows the CVC (consonant-vowel-consonant) pattern?", opts:["fish","stop","pig","tree"], a:2, explain:"Pig = consonant /p/, vowel /i/, consonant /g/. Three letters, CVC."},
      {id:"dc-b04", tier:"bronze", q:"When you see a word ending in silent-e (like \"cake\"), the vowel before it usually…", opts:["stays short","becomes long","is silent","is doubled"], a:1, explain:"Silent-e is the long-vowel signal: cake, time, hope, cute. The e isn't pronounced; it just changes the vowel."},
      {id:"dc-b05", tier:"bronze", q:"To read \"sunset,\" break it into…", opts:["s-unset","sun-set","suns-et","s-uns-et"], a:1, explain:"Two closed syllables: sun + set. The compound word splits between the two short-vowel chunks."},
      {id:"dc-b06", tier:"bronze", q:"Blend the sounds /p/ /a/ /n/ to read the word…", opts:["pan","pin","pen","pun"], a:0, explain:"The short-a sound in the middle gives you \"pan.\" Decoding = blending the sounds you see."},
      {id:"dc-b07", tier:"bronze", q:"In \"tap,\" the middle letter \"a\" sounds like…", opts:["long a (like in cake)","short a (like in apple)","silent","like e"], a:1, explain:"Closed syllable: vowel + consonant at the end = short vowel. The a in tap stays short."},
      {id:"dc-b08", tier:"bronze", q:"Which word has a SHORT vowel sound?", opts:["bake","fish","time","goat"], a:1, explain:"Fish has a short /i/. The other three are long vowels (silent-e in bake/time, vowel team in goat)."},
      {id:"dc-b09", tier:"bronze", q:"To decode \"hop,\" the reader blends…", opts:["/h/ /o/ /p/","/ho/ /p/","/h/ /op/","/hop/"], a:0, explain:"Three letters, three sounds, blended left-to-right: /h/-/o/-/p/ = hop."},
      {id:"dc-b10", tier:"bronze", q:"In \"stop,\" the first two letters \"st\" make…", opts:["one sound","a consonant blend (two sounds blended)","a digraph","silent letters"], a:1, explain:"A blend is two consonants you still hear separately: /s/ + /t/ blended together. Compare with a digraph (sh, ch) which is two letters but ONE sound."},
      {id:"dc-b11", tier:"bronze", q:"To decode \"chip,\" the first sound is…", opts:["/c/","/h/","/ch/","/p/"], a:2, explain:"\"Ch\" is a digraph — two letters, one sound. The word breaks as /ch/-/i/-/p/."},
      {id:"dc-b12", tier:"bronze", q:"Which word would a beginning reader find easiest to decode?", opts:["thought","cat","because","laughed"], a:1, explain:"Cat is a regular CVC word with one-to-one sound-letter mapping. The others contain digraphs, silent letters, or irregular patterns."},

      // ---------- SILVER ----------
      {id:"dc-s01", tier:"silver", q:"To decode \"napkin,\" divide it into…", opts:["na-pkin","nap-kin","napk-in","n-apkin"], a:1, explain:"VCCV pattern (vowel-consonant-consonant-vowel) usually divides BETWEEN the two consonants. Nap (closed) + kin (closed)."},
      {id:"dc-s02", tier:"silver", q:"To decode \"pilot,\" divide it into…", opts:["pil-ot","pi-lot","pilo-t","p-ilot"], a:1, explain:"VCV pattern usually divides BEFORE the consonant when the first vowel is long. Pi (open, long i) + lot (closed). Try the open-first split before the closed-first."},
      {id:"dc-s03", tier:"silver", q:"To decode \"table,\" identify the syllables:", opts:["tab-le","ta-ble","tabl-e","tab-le"], a:1, explain:"Consonant-le syllable: the \"ble\" stays together. Ta (open, long a) + ble. Same in fable, cable, maple, simple."},
      {id:"dc-s04", tier:"silver", q:"Which word contains an OPEN syllable?", opts:["dog","cat","go","mat"], a:2, explain:"Go ends in a vowel — open syllable, long /ō/. The others end in consonants — closed, short vowels."},
      {id:"dc-s05", tier:"silver", q:"In \"problem,\" the first syllable is…", opts:["pro (open, long o)","prob (closed, short o)","probl (no rule)","pr (consonant-only)"], a:1, explain:"VCCV pattern: prob-lem. \"Prob\" ends in a consonant (closed), keeping the o short."},
      {id:"dc-s06", tier:"silver", q:"To decode \"farmer,\" identify the syllable type of \"farm\":", opts:["closed","open","silent-e","r-controlled"], a:3, explain:"R-controlled vowel: when r follows a vowel, the r bends the vowel sound. Same in barn, star, park, bird, fern."},
      {id:"dc-s07", tier:"silver", q:"A reader sees \"misjudge\" for the first time. The smartest decoding approach is to…", opts:["sound out letter by letter","find familiar chunks: mis + judge","skip it","guess from context"], a:1, explain:"Recognize meaningful chunks. \"Mis\" and \"judge\" are both familiar units. Chunking beats letter-by-letter on multisyllabic words."},
      {id:"dc-s08", tier:"silver", q:"In \"bottle,\" the syllable \"ttle\" is…", opts:["closed","consonant-le","r-controlled","vowel team"], a:1, explain:"Consonant-le pattern. The doubled-t protects the short o in \"bot,\" and \"tle\" forms a consonant-le syllable."},
      {id:"dc-s09", tier:"silver", q:"To decode \"raincoat,\" break it into…", opts:["rain-coat","ra-incoat","rai-ncoat","r-aincoat"], a:0, explain:"Compound word. Look for familiar smaller words first: rain + coat. Decoding compounds is often easier than other multisyllabics."},
      {id:"dc-s10", tier:"silver", q:"The word \"thunder\" decodes most easily as…", opts:["thun-der","thu-nder","th-under","thund-er"], a:0, explain:"VCCV pattern: thun + der. \"Thun\" is closed (short u). \"Der\" is r-controlled. Two syllables, two known patterns."},
      {id:"dc-s11", tier:"silver", q:"In \"basic,\" the first syllable is…", opts:["bas (closed)","ba (open, long a)","basi (no rule)","b (consonant-only)"], a:1, explain:"VCV pattern with open-first split: ba-sic. The open syllable keeps the long /ā/. Try the open split FIRST when you see VCV."},
      {id:"dc-s12", tier:"silver", q:"To decode \"reptile,\" identify the syllable types:", opts:["rep (closed) + tile (silent-e)","re (open) + ptile (other)","rept (closed) + ile (other)","r-e-p-t-i-l-e"], a:0, explain:"VCCV split: rep-tile. \"Rep\" is closed (short e). \"Tile\" has silent-e (long i). Both are known patterns."},

      // ---------- GOLD ----------
      {id:"dc-g01", tier:"gold", q:"A reader tries \"pilot\" as \"pillot\" (short i). What rule should they try next?", opts:["give up","try the open-syllable split: pi-lot, with long i","double the i","change the consonant"], a:1, explain:"When the closed split doesn't make a real word, try the open split. VCV patterns can go either way, but English defaults to open-first."},
      {id:"dc-g02", tier:"gold", q:"To decode \"impossible,\" the reader recognizes…", opts:["all 10 letters separately","four chunks: im-pos-si-ble","two halves: impos-sible","one big sight word"], a:1, explain:"Chunking by syllable: im (closed) + pos (closed) + si (open) + ble (consonant-le). Four manageable units replace 10 separate letters."},
      {id:"dc-g03", tier:"gold", q:"In \"silent,\" why does \"si\" stay open (long i) rather than closed (short i)?", opts:["random","VCV pattern defaults to open-first; the i ends the syllable","silent words use long vowels","English exception"], a:1, explain:"VCV → open-first split: si-lent. Si is open (long i). Lent is closed (short e). The default works."},
      {id:"dc-g04", tier:"gold", q:"A student reads \"interesting\" letter-by-letter and stalls. What instructional move helps most?", opts:["more letter drill","teach them to scan for known chunks: in-ter-est-ing","make them memorize it","skip multisyllabic words"], a:1, explain:"They have the letter-sound knowledge but lack chunking strategy. Show how to find familiar units: in + ter + est + ing. Big word becomes four small ones."},
      {id:"dc-g05", tier:"gold", q:"In \"hopping\" vs \"hoping,\" the doubled-p signals…", opts:["plural","short vowel in 'hop'","an exception","past tense"], a:1, explain:"The doubled consonant protects the short vowel of the base word. Hop → hopping (short o stays). Hope → hoping (silent-e drops, long o remains). The spelling encodes the sound."},
      {id:"dc-g06", tier:"gold", q:"A reader successfully decodes \"refuse\" as \"re-FYOOZ\" (verb, to decline). What did they use?", opts:["only phonics","syllable division + stress placement based on meaning","memorization","guessing"], a:1, explain:"The same letters spell two words: REF-yoos (noun, garbage) and re-FYOOZ (verb, to decline). Stress shifts meaning, and the reader inferred the verb from context — sophisticated decoding."},
      {id:"dc-g07", tier:"gold", q:"To decode the unfamiliar word \"tumbleweed,\" the smartest first move is to…", opts:["sound out every letter","look for the compound: tumble + weed","skip it","guess from picture"], a:1, explain:"Compound recognition is the first scan on long words. Tumble + weed = two known words combined. Decoding finishes in seconds, not minutes."},
      {id:"dc-g08", tier:"gold", q:"The word \"music\" decodes as mu-sic. What syllable types?", opts:["closed + closed","open + closed","open + open","closed + open"], a:1, explain:"VCV → open-first: mu (open, long /yoo/) + sic (closed, short i). Same pattern in tulip, pilot, robot."},
      {id:"dc-g09", tier:"gold", q:"A reader keeps decoding \"prefer\" as \"PRE-fer\" rather than \"pre-FER.\" What's missing?", opts:["letters","stress/accent placement on multisyllabic words","vowels","blending"], a:1, explain:"Stress placement is part of accurate decoding. \"Prefer\" stresses the second syllable. Teaching stress patterns (which syllable carries the emphasis) is the next layer above letter-sound."},
      {id:"dc-g10", tier:"gold", q:"To decode \"prescription,\" the reader chunks as…", opts:["pre-scrip-tion","pres-crip-tion","p-res-crip-tion","prescrip-tion"], a:0, explain:"Pre (prefix) + scrip (root) + tion (suffix). Three meaningful chunks. Notice how morphology AND syllable division both help here."},
      {id:"dc-g11", tier:"gold", q:"In a structured literacy approach, decoding instruction usually progresses from…", opts:["multisyllabic to single-syllable","single-syllable patterns → multisyllabic","random","vocabulary first"], a:1, explain:"Build up. Master CVC, then digraphs, then blends, then silent-e, then vowel teams, then multisyllabic strategies. Each layer requires the previous."},
      {id:"dc-g12", tier:"gold", q:"A reader self-corrects \"pilot\" from \"pillot\" to \"pi-lot.\" What skill did they use?", opts:["luck","monitoring + alternative-pronunciation strategy","memorization","guessing"], a:1, explain:"Self-monitoring (\"that doesn't sound like a real word\") + flexibility (\"let me try the other vowel sound\") = mature decoding. Set 1 = wrong; set 2 = right; move on."},

      // ---------- PLATINUM ----------
      {id:"dc-p01", tier:"platinum", q:"A fluent fourth-grader still labors over multisyllabic words. Single-syllable decoding is fast. The most likely gap is…", opts:["phonemic awareness","syllable division strategies","sight words","vocabulary"], a:1, explain:"Single-syllable mastery without multisyllabic mastery = missing syllable-division layer. Teach the six syllable types + VCV/VCCV/VCCCV division rules explicitly."},
      {id:"dc-p02", tier:"platinum", q:"\"Flexible decoding\" means…", opts:["guessing","trying alternative pronunciations when the first attempt doesn't make a real word","skipping hard words","memorization"], a:1, explain:"Flexible decoding is the skill of trying Plan B when Plan A fails. Pi-lot (long i) didn't sound right? Try pil-ot (short i). Or vice versa. Mature decoders flex automatically."},
      {id:"dc-p03", tier:"platinum", q:"Which is the strongest evidence that decoding instruction is taking hold?", opts:["the child reads familiar words quickly","the child accurately decodes nonsense words like 'glop' or 'sprint'","the child reads with expression","the child memorizes sight words"], a:1, explain:"Nonsense-word decoding is the gold standard. Real words could be memorized; nonsense words can ONLY be decoded. If the child can read 'glop' and 'sprint' fresh, the system is internalized."},
      {id:"dc-p04", tier:"platinum", q:"A struggling reader reads each word in isolation correctly but loses meaning when reading sentences. The bottleneck is…", opts:["decoding","fluency — decoding is too effortful to allow simultaneous comprehension","comprehension","vocabulary"], a:1, explain:"Decoding intact but slow = cognitive load problem. All the brainpower goes to letters; nothing's left for meaning. Fluency practice (repeated reading) closes the gap."},
      {id:"dc-p05", tier:"platinum", q:"\"Set for variability\" is the term for…", opts:["reading at different speeds","trying alternative vowel sounds and stress placements when the first decoding attempt doesn't produce a real word","switching books","using flashcards"], a:1, explain:"Set for variability (David Share's term) = the reader's mental flexibility to try alternative pronunciations. Critical for decoding longer words where multiple readings are possible."},
      {id:"dc-p06", tier:"platinum", q:"The self-teaching hypothesis (Share, 1995) argues that…", opts:["children must memorize every word","successful decoding of new words IS the mechanism by which sight vocabulary builds","decoding is unnecessary","reading is innate"], a:1, explain:"Every successful decoding attempt strengthens the orthographic representation in memory. Decoding → recognition → fluency. The child literally teaches themself sight words by decoding."},
      {id:"dc-p07", tier:"platinum", q:"In English, multisyllabic words are best approached by…", opts:["letter-by-letter","breaking into morphemes (prefix-root-suffix) AND syllable units","memorization","skipping"], a:1, explain:"English is morphophonemic — both meaning units (morphemes) and sound units (syllables) help decode long words. Strong readers use both layers simultaneously."},
      {id:"dc-p08", tier:"platinum", q:"A reader can decode but exhibits very slow word recognition. What's the targeted next step?", opts:["more phonics","timed repeated reading + word-list drills to push toward automaticity","comprehension instruction","more sight words"], a:1, explain:"Accurate but slow decoding = automaticity gap. Targeted speed practice (repeated reading, timed word lists) builds the move from decoding-each-time to instant recognition."},
      {id:"dc-p09", tier:"platinum", q:"\"Orthographic mapping\" (Linnea Ehri) is the process by which…", opts:["children memorize whole-word shapes","letter-sound correspondences become bonded to specific word spellings, building a sight vocabulary","children guess from context","children skip unknown words"], a:1, explain:"Orthographic mapping = the cognitive process where phonemes connect to graphemes in stored memory for specific words. The mechanism by which decoded words become instantly recognized. Requires intact phonemic awareness + phonics."},
      {id:"dc-p10", tier:"platinum", q:"An older student (grade 5+) struggles with multisyllabic words despite years of intervention. What's typically missing?", opts:["more elementary phonics","explicit syllable-division strategies and morphology","reading volume","motivation"], a:1, explain:"Older struggling readers usually have basic phonics; they were never taught how to TACKLE LONG WORDS. Direct instruction in syllable division + morphology produces rapid gains at this stage."},
      {id:"dc-p11", tier:"platinum", q:"Why does \"three-cueing\" (guessing from picture / context / first letter) actively harm decoding development?", opts:["it doesn't","it trains the reader to AVOID decoding and to guess, blocking the orthographic mapping process","it teaches sight words","it's neutral"], a:1, explain:"Three-cueing rewards guessing over decoding. The reader never builds orthographic representations because they never carefully process the letters. Cognitive science (Adams, Seidenberg, Ehri) is consistent that this harms readers, especially struggling ones."},
      {id:"dc-p12", tier:"platinum", q:"A second-grader has strong PA, strong phonics on isolated words, but stumbles on the same words in connected text. The most likely cause is…", opts:["the words are different","cognitive load + working memory limits during sentence reading","they need glasses","random"], a:1, explain:"Decoding in connected text demands more — meaning-making, syntax, prosody all draw on the same working memory. Words decode fine in isolation but break under load. Repeated reading + decodable text bridges this."}
    ]
  }
,
  {
    slug:"fluency", name:"Fluency", tag:"Foundation Five",
    lesson:"Fluency is the difference between sounding out a sentence and actually hearing what it says. When decoding becomes effortless, the mind frees up to follow meaning. Reading turns from chore into conversation.",
    qs:[
      // ---------- BRONZE ----------
      {id:"fl-b01", tier:"bronze", q:"A fluent reader reads at a pace that…", opts:["is as fast as possible","supports understanding","sounds dramatic","matches a stopwatch"], a:1, explain:"Speed serves comprehension, not the other way around. Faster than you can think is just noise."},
      {id:"fl-b02", tier:"bronze", q:"Fluent readers recognize common words like \"the\" and \"and\"…", opts:["by sounding them out each time","on sight, without re-decoding","by skipping them","only with context"], a:1, explain:"High-frequency words become instantly recognized. That frees attention for the harder words."},
      {id:"fl-b03", tier:"bronze", q:"Fluent reading sounds most like…", opts:["a robot listing facts","natural conversation","a song","a whisper"], a:1, explain:"Prosody — the rise and fall of natural speech — is the signature of fluency."},
      {id:"fl-b04", tier:"bronze", q:"Reading aloud helps build fluency because…", opts:["you can hear your own pace and stumbles","it's louder","it impresses people","it's required"], a:0, explain:"Hearing yourself read catches the rough spots. Reading aloud is fluency feedback in real time."},
      {id:"fl-b05", tier:"bronze", q:"A \"sight word\" is one you…", opts:["have to sound out","recognize instantly without decoding","only see in textbooks","look up"], a:1, explain:"Sight words are stored as whole units. Fast recognition = more brainpower for meaning."},
      {id:"fl-b06", tier:"bronze", q:"Re-reading the same passage two or three times…", opts:["wastes time","builds fluency by smoothing the rhythm","is only for slow readers","is cheating"], a:1, explain:"Repeated reading is one of the most evidence-backed fluency strategies. Each pass smooths the next."},
      {id:"fl-b07", tier:"bronze", q:"When a fluent reader hits a word that sounds wrong, they…", opts:["keep going and ignore it","stop, fix it, then continue","start over","close the book"], a:1, explain:"Self-correction is a fluency hallmark. Catch the mismatch, fix the phrase, keep going."},
      {id:"fl-b08", tier:"bronze", q:"Reading \"The cat sat on the mat\" with proper phrasing means…", opts:["all words at the same volume","pausing at punctuation and grouping words naturally","reading as fast as possible","pronouncing each letter"], a:1, explain:"Fluent reading groups words into meaningful phrases — like talking, not like a list."},
      {id:"fl-b09", tier:"bronze", q:"Words per minute matters because…", opts:["faster is always better","it correlates with comprehension up to a point","slow readers can't understand","speed shows intelligence"], a:1, explain:"There's a sweet spot. Too slow and meaning falls apart between words. Too fast and meaning skips past."},
      {id:"fl-b10", tier:"bronze", q:"Punctuation marks tell the fluent reader…", opts:["how loud to read","where to pause and how to inflect","which words are important","when to skip"], a:1, explain:"Punctuation is sheet music for prose. Periods stop. Commas pause. Question marks lift."},
      {id:"fl-b11", tier:"bronze", q:"Choral reading (reading aloud together) helps because…", opts:["it's quieter","you match the group's pace and prosody","it makes words bigger","it's a drill"], a:1, explain:"The group carries the timing and the rhythm. Newer readers ride along until the pace becomes their own."},
      {id:"fl-b12", tier:"bronze", q:"When you stumble on a hard word, the best move is to…", opts:["give up","slow down, decode it, then re-read the phrase","skip it","ask someone"], a:1, explain:"Stop, decode, re-read the phrase to restore flow. Treat the stumble as information, not failure."},

      // ---------- SILVER ----------
      {id:"fl-s01", tier:"silver", q:"The three components of reading fluency are accuracy, rate, and…", opts:["volume","prosody (expression)","vocabulary","comprehension"], a:1, explain:"Accuracy (right words) + rate (appropriate speed) + prosody (expression and phrasing) = fluency. A reader can hit the words quickly but read in monotone — that's not yet fluent."},
      {id:"fl-s02", tier:"silver", q:"\"Prosody\" in reading means…", opts:["punctuation","the rhythm, stress, and intonation of speech","grammar","spelling"], a:1, explain:"Prosody is the music of language — how voice rises and falls, where stress lands, how phrases group. Fluent reading carries this music."},
      {id:"fl-s03", tier:"silver", q:"A reader who pauses awkwardly mid-phrase (e.g., \"The dog... ran across... the yard\") is showing weakness in…", opts:["accuracy","prosody and phrasing","comprehension","vocabulary"], a:1, explain:"Word-by-word reading reflects weak phrasing. The reader hits the words but doesn't group them into meaningful chunks."},
      {id:"fl-s04", tier:"silver", q:"Why does fluency support comprehension?", opts:["it doesn't","when decoding is automatic, working memory is freed for meaning-making","faster = smarter","none of the above"], a:1, explain:"Decoding consumes working memory. Automatic decoding leaves cognitive bandwidth for understanding what the text actually says — the comprehension gain comes from freed capacity."},
      {id:"fl-s05", tier:"silver", q:"Repeated reading typically uses…", opts:["different texts each time","the same short passage read 3-4 times","random texts","silent reading only"], a:1, explain:"The classic repeated-reading routine is one passage, multiple passes, with feedback. Each pass smooths the previous attempt's rough spots."},
      {id:"fl-s06", tier:"silver", q:"A second-grader reads 60 words per minute with many errors. A third-grader reads 60 wpm accurately. Who is more fluent?", opts:["the second-grader","the third-grader — accuracy first","tied","can't tell"], a:1, explain:"Speed without accuracy isn't fluency. The accurate reader is more fluent, even at the same rate."},
      {id:"fl-s07", tier:"silver", q:"\"Echo reading\" is when…", opts:["the teacher reads and the student repeats","two students alternate","silent reading","memorization"], a:0, explain:"Echo reading: teacher models a phrase with proper prosody, student echoes it back. Builds phrasing and expression through imitation."},
      {id:"fl-s08", tier:"silver", q:"Fluency norms (like Hasbrouck-Tindal) provide…", opts:["grade-level WCPM (words correct per minute) benchmarks","spelling lists","reading lists","comprehension tests"], a:0, explain:"Hasbrouck-Tindal norms give grade-by-grade expected reading rates measured in WCPM. Useful for identifying readers below the expected fluency band."},
      {id:"fl-s09", tier:"silver", q:"Why is silent reading less effective than oral reading for building fluency?", opts:["it's not","silent reading can mask decoding errors and weak prosody; oral reading exposes them","silent reading is harder","oral reading is for beginners"], a:1, explain:"You can't hear what isn't said. Silent reading hides stumbles. For fluency building, oral reading lets the teacher and the reader catch and fix what silent reading would mask."},
      {id:"fl-s10", tier:"silver", q:"A reader who hits every word accurately but in a monotone is…", opts:["fluent","accurate but not yet fluent (missing prosody)","comprehending well","slow"], a:1, explain:"Word-perfect monotone = accuracy without prosody. Fluency requires the third component — the meaningful expression that comes from grouping and inflecting."},
      {id:"fl-s11", tier:"silver", q:"What is \"automaticity\" in reading?", opts:["reading aloud","instant, effortless word recognition that doesn't require conscious decoding","reading fast","reading silently"], a:1, explain:"Automaticity = no conscious effort needed to recognize words. The reader's attention can fully go to meaning because word recognition runs in the background."},
      {id:"fl-s12", tier:"silver", q:"Why are decodable texts important for early fluency?", opts:["they're cheap","they let the reader practice newly-taught patterns with manageable text","they're short","they have pictures"], a:1, explain:"Decodables let beginning readers experience fluent reading on text matched to their phonics knowledge — building accuracy AND speed AND prosody at once, without ambush by untaught words."},

      // ---------- GOLD ----------
      {id:"fl-g01", tier:"gold", q:"A third-grader reads at 90 WCPM (words correct per minute). The grade-3 benchmark is 110 WCPM. What's the most efficient intervention?", opts:["new books","repeated reading of grade-appropriate passages, 3-4 passes each","silent reading time","vocabulary drill"], a:1, explain:"Reading rate below benchmark = fluency intervention. Repeated reading with feedback is the most evidence-backed targeted intervention for this profile."},
      {id:"fl-g02", tier:"gold", q:"A reader stumbles on the same word three times in a passage. What does this likely indicate?", opts:["random","an unmastered decoding pattern in that word, not a general fluency issue","poor memory","bad eyes"], a:1, explain:"Repeated stumble on the same word = specific decoding gap. Teach the pattern in that word, don't just reread the passage."},
      {id:"fl-g03", tier:"gold", q:"In the sentence \"Mary saw a man with binoculars,\" how would a fluent reader use prosody to clarify meaning?", opts:["all words equal stress","group \"with binoculars\" with \"saw\" or with \"man\" depending on meaning","read fast","ignore the ambiguity"], a:1, explain:"Prosody disambiguates. \"Mary | saw a man | with binoculars\" (Mary has binoculars) vs \"Mary | saw | a man with binoculars\" (the man has them). Fluent readers signal meaning through grouping."},
      {id:"fl-g04", tier:"gold", q:"\"Cold reading\" vs \"hot reading\" in fluency assessment refers to…", opts:["same thing","cold = first time seeing the passage; hot = after practice","temperature","speed of reading"], a:1, explain:"Cold-read WCPM measures the reader's baseline. Hot-read measures performance after repeated reading. The gap between them shows fluency-from-practice."},
      {id:"fl-g05", tier:"gold", q:"A reader has accurate slow decoding. The next intervention focus should be…", opts:["more phonics","building automaticity through timed word-list practice and repeated reading","comprehension","vocabulary"], a:1, explain:"Accuracy intact + slow = needs automaticity work. The targeted moves are timed word lists and repeated reading — both build the move from \"decoded each time\" to \"instantly recognized.\""},
      {id:"fl-g06", tier:"gold", q:"Why does \"Reader's Theater\" (rehearsed dramatic reading) build fluency effectively?", opts:["it's fun","it provides motivated repeated reading with focus on prosody for performance","it's loud","it teaches drama"], a:1, explain:"Reader's Theater = repeated reading with built-in prosody work. The performance goal motivates multiple practice runs AND focuses attention on expression."},
      {id:"fl-g07", tier:"gold", q:"A fourth-grader reads at grade-level rate but with no expression. The targeted intervention is…", opts:["more decoding","explicit prosody modeling: echo reading, phrase-marked text, attention to punctuation","new books","timed drills"], a:1, explain:"Speed and accuracy intact, prosody weak = direct prosody instruction. Echo reading shows them what fluent expression sounds like; phrase-marked text trains the eye to group words."},
      {id:"fl-g08", tier:"gold", q:"Two readers score the same WCPM. Reader A reads accurately with poor prosody; Reader B reads expressively with some errors. Who is closer to skilled reading?", opts:["A — accuracy first","B — prosody implies meaning-making is happening","they're tied","can't tell"], a:1, explain:"Prosody is downstream of meaning. A reader expressing the text shows they understand it as they go. Accuracy with poor prosody often means decoding without comprehension."},
      {id:"fl-g09", tier:"gold", q:"\"NIM (Neurological Impress Method)\" pairs a reader with a fluent partner reading…", opts:["before the student","simultaneously, slightly louder and slightly faster, with the student trying to match","after the student","silently"], a:1, explain:"NIM = the fluent partner reads slightly ahead of the student in unison. The student's eye and voice are pulled into a fluent pace. Surprisingly effective for very slow readers."},
      {id:"fl-g10", tier:"gold", q:"In a structured literacy classroom, fluency is built through…", opts:["independent silent reading","oral reading with feedback, repeated reading, modeling","comprehension drills","vocabulary games"], a:1, explain:"Oral reading with feedback is the engine. Silent reading is fine for skilled readers but doesn't BUILD fluency in developing ones — feedback can't happen without sound."},
      {id:"fl-g11", tier:"gold", q:"A reader who reads quickly but misses meaning is exhibiting…", opts:["fluency","speed without comprehension — sometimes called 'word-calling'","mastery","laziness"], a:1, explain:"Word-calling = saying words accurately and quickly without processing meaning. The decoding is fluent; the comprehension isn't. Often emerges when fluency is over-trained without comprehension instruction."},
      {id:"fl-g12", tier:"gold", q:"\"Wide reading\" (reading lots of varied text) builds fluency mainly because…", opts:["it's enjoyable","reading volume × time × varied content produces automaticity across word types","it's required","it impresses teachers"], a:1, explain:"Volume + variety = repeated exposure to thousands of words in many contexts. Most fluency growth in middle and upper grades comes from sheer reading volume, not isolated drill."},

      // ---------- PLATINUM ----------
      {id:"fl-p01", tier:"platinum", q:"WCPM (words correct per minute) is a robust fluency screener because…", opts:["it's easy to administer","it correlates strongly with overall reading comprehension at most grade levels","it measures intelligence","it's universal"], a:1, explain:"WCPM is a quick proxy for overall reading skill — strongly correlated with comprehension because it captures decoding automaticity, the bottleneck for understanding."},
      {id:"fl-p02", tier:"platinum", q:"A reader has WCPM at grade level but comprehension scores well below. The most likely cause is…", opts:["fluency problem","comprehension or vocabulary gap — fluency is intact","decoding problem","none of the above"], a:1, explain:"WCPM intact + comprehension weak = the bottleneck isn't fluency. The reader can lift the words off the page; they can't yet make meaning of them. Vocabulary, background knowledge, or comprehension strategies are the targets."},
      {id:"fl-p03", tier:"platinum", q:"The \"Matthew Effect\" in reading (Stanovich) describes…", opts:["a Bible story","the compounding gap where strong readers read more and grow faster while weak readers fall further behind","a teaching method","an assessment"], a:1, explain:"Keith Stanovich's term. Strong readers find reading easy → they read more → they get better. Weak readers struggle → they avoid reading → they fall further behind. The gap widens over time without intervention."},
      {id:"fl-p04", tier:"platinum", q:"A struggling adolescent reader has fluent oral reading on familiar topics but is dysfluent on academic text. The likely cause is…", opts:["fluency itself","vocabulary load — unfamiliar words slow decoding even with intact phonics","attention","motivation"], a:1, explain:"Decoding-rate drops on words the reader hasn't seen often. The phonics is fine; the orthographic mapping of academic words hasn't happened. Wide reading + vocabulary instruction closes this gap."},
      {id:"fl-p05", tier:"platinum", q:"Why does grade-level WCPM matter MORE in grades 2-4 than in grade 6+?", opts:["it doesn't","because automaticity is the active growth zone in early grades; by middle school, comprehension demands matter more","grades 6+ are silent reading","random"], a:1, explain:"Grades 2-4 = automaticity is being built; WCPM tracks that growth directly. By grade 6+, most readers have automaticity; the rate-comprehension link weakens because the bottleneck shifts to vocabulary and background knowledge."},
      {id:"fl-p06", tier:"platinum", q:"The strongest fluency intervention for struggling readers is…", opts:["sustained silent reading","repeated reading with corrective feedback","reading logs","more books"], a:1, explain:"Repeated reading with feedback has the strongest research base for struggling readers. SSR (sustained silent reading) shows weaker effects without modeling and feedback — the feedback is the active ingredient."},
      {id:"fl-p07", tier:"platinum", q:"A reader has high WCPM in isolated word lists but lower WCPM in connected text. What does this reveal?", opts:["nothing — random variation","weaker prosody or phrasing — they can identify words but struggle to group them","they can't read","they're tired"], a:1, explain:"Word-list WCPM measures isolated automaticity. Connected-text WCPM also taxes phrasing and prosody. A gap between them points to a phrasing weakness — they decode each word but don't bundle them efficiently."},
      {id:"fl-p08", tier:"platinum", q:"\"Curriculum-based measurement\" (CBM) for reading uses…", opts:["complex tests","short, frequent oral-reading fluency probes to track progress","standardized testing","comprehension tests"], a:1, explain:"CBM = brief (often 1-minute) oral-reading probes given regularly. The slope of growth across probes shows whether the current instruction is working — a tight feedback loop teachers can act on."},
      {id:"fl-p09", tier:"platinum", q:"For an adult literacy learner who decodes accurately but very slowly, what's the highest-leverage move?", opts:["vocabulary","massive volume of repeated, comfortable-level reading to build automaticity","silent reading","testing"], a:1, explain:"Adult learners with accurate but slow decoding need volume of practice on comfortable text to build orthographic mapping. The skill comes from the volume; the dignity comes from the comfort level."},
      {id:"fl-p10", tier:"platinum", q:"\"Hot-read minus cold-read\" gain in WCPM measures…", opts:["raw speed","the immediate benefit of repeated reading — useful for showing the student their own gains","total achievement","intelligence"], a:1, explain:"Cold (first attempt) vs hot (after practice) WCPM shows the student a concrete number that improved. Powerful for motivation and proof that practice works."},
      {id:"fl-p11", tier:"platinum", q:"Why does prosody develop AFTER accuracy and rate, typically?", opts:["random","prosody requires the cognitive bandwidth that's freed only when decoding becomes automatic","prosody is harder","tradition"], a:1, explain:"Prosody is downstream of automaticity. As long as decoding drains attention, there's nothing left for expression. Once decoding runs in the background, prosody can emerge."},
      {id:"fl-p12", tier:"platinum", q:"In a multi-tier reading intervention model, students with fluency-specific weakness are typically placed in…", opts:["Tier 1 (whole class)","Tier 2 (small group, structured repeated reading)","Tier 3 (intensive 1:1)","none"], a:1, explain:"Fluency-only deficits typically respond well to Tier 2: small-group repeated reading, partner reading, modeled fluent reading 3-4 times per week. Tier 3 is reserved for compounding deficits across phonics + fluency."}
    ]
  }
,
  {
    slug:"vocabulary", name:"Vocabulary", tag:"Foundation Five",
    lesson:"Every new word is a new room in the house of thought. Working vocabulary is what lets a citizen weigh a contract, follow a doctor, understand a ballot, and tell their own story in full. The Helix builds it deliberately, not by accident.",
    qs:[
      // ---------- BRONZE ----------
      {id:"vc-b01", tier:"bronze", q:"\"Benevolent\" most nearly means…", opts:["angry","kind and well-meaning","very smart","wealthy"], a:1, explain:"From Latin bene (well) + volent (wishing). A benevolent person wishes others well."},
      {id:"vc-b02", tier:"bronze", q:"Which word is closest in meaning to \"happy\"?", opts:["joyful","tired","busy","quiet"], a:0, explain:"Joyful and happy are synonyms — words with very similar meanings."},
      {id:"vc-b03", tier:"bronze", q:"The opposite of \"hot\" is…", opts:["warm","cold","wet","old"], a:1, explain:"Cold and hot are antonyms — words with opposite meanings."},
      {id:"vc-b04", tier:"bronze", q:"\"Enormous\" means about the same as…", opts:["small","huge","slow","loud"], a:1, explain:"Enormous = very large. Same family as: huge, gigantic, massive, vast."},
      {id:"vc-b05", tier:"bronze", q:"\"Frigid\" most nearly means…", opts:["warm","very cold","wet","scared"], a:1, explain:"Frigid = extremely cold. Same root family as refrigerator and refrigerate."},
      {id:"vc-b06", tier:"bronze", q:"A \"chef\" is a person who…", opts:["fixes cars","cooks professionally","drives a bus","sells houses"], a:1, explain:"Chef = a trained, often head cook in a professional kitchen. From French."},
      {id:"vc-b07", tier:"bronze", q:"Which word means the same as \"begin\"?", opts:["stop","finish","start","close"], a:2, explain:"Start and begin are synonyms. Stop and finish are antonyms."},
      {id:"vc-b08", tier:"bronze", q:"\"Curious\" most nearly means…", opts:["bored","wanting to know","afraid","angry"], a:1, explain:"A curious person is interested in knowing more. From Latin curiosus (taking pains)."},
      {id:"vc-b09", tier:"bronze", q:"A \"vehicle\" is something used to…", opts:["eat with","sleep on","carry people or things","write with"], a:2, explain:"Vehicle = a means of carrying or transporting. Cars, trucks, bikes, trains are all vehicles."},
      {id:"vc-b10", tier:"bronze", q:"\"Brave\" means about the same as…", opts:["afraid","tired","courageous","sleepy"], a:2, explain:"Brave and courageous are synonyms — both mean willing to face fear or danger."},
      {id:"vc-b11", tier:"bronze", q:"\"Cautious\" most nearly means…", opts:["reckless","careful","fast","loud"], a:1, explain:"A cautious person takes care to avoid danger or mistakes. The opposite is reckless."},
      {id:"vc-b12", tier:"bronze", q:"To \"observe\" something means to…", opts:["destroy it","watch it carefully","throw it away","sell it"], a:1, explain:"Observe = to watch carefully and notice details. Scientists observe; detectives observe."},

      // ---------- SILVER ----------
      {id:"vc-s01", tier:"silver", q:"\"Reluctant\" in \"She was reluctant to answer\" means…", opts:["eager","hesitant or unwilling","prepared","angry"], a:1, explain:"Reluctant = hesitating because of doubt or unwillingness. Context (not answering quickly) gives the word away."},
      {id:"vc-s02", tier:"silver", q:"\"Verbose\" most nearly means…", opts:["silent","using too many words","loud","poetic"], a:1, explain:"From Latin verbum (word). A verbose speaker uses more words than the meaning requires."},
      {id:"vc-s03", tier:"silver", q:"\"Frugal\" most nearly means…", opts:["wasteful","careful with money, thrifty","fragile","fast"], a:1, explain:"A frugal person spends carefully and avoids waste. Not stingy — disciplined."},
      {id:"vc-s04", tier:"silver", q:"\"Candid\" most nearly means…", opts:["hidden","honest and frank","sweet","quick"], a:1, explain:"A candid answer is direct and honest, with nothing concealed. Hence \"candid camera\" — caught being real."},
      {id:"vc-s05", tier:"silver", q:"\"Diligent\" most nearly means…", opts:["hardworking and careful","lazy","talkative","wealthy"], a:0, explain:"A diligent worker stays at the task and pays attention to it. Diligence is steady, focused effort."},
      {id:"vc-s06", tier:"silver", q:"\"Concise\" most nearly means…", opts:["long","brief and clear","quiet","decorative"], a:1, explain:"Concise writing says what it needs in the fewest words. Brief + clear, not just short."},
      {id:"vc-s07", tier:"silver", q:"In context: \"His response was ambiguous — we couldn't tell which side he was on.\" Ambiguous means…", opts:["clear","unclear, having multiple possible meanings","loud","short"], a:1, explain:"Ambiguous = open to more than one interpretation. The context (\"couldn't tell which side\") supplies the meaning."},
      {id:"vc-s08", tier:"silver", q:"\"Tenacious\" most nearly means…", opts:["weak","stubborn and persistent","tender","new"], a:1, explain:"Tenacious = holding firmly, refusing to give up. From Latin tenax (holding fast)."},
      {id:"vc-s09", tier:"silver", q:"\"Skeptical\" most nearly means…", opts:["believing easily","doubtful, questioning","silent","afraid"], a:1, explain:"A skeptical reader asks questions and doesn't accept claims without evidence."},
      {id:"vc-s10", tier:"silver", q:"In context: \"The hike was arduous — by the end, even the strongest were exhausted.\" Arduous means…", opts:["easy","extremely difficult, requiring effort","short","beautiful"], a:1, explain:"Arduous = difficult and demanding. Context (\"even the strongest were exhausted\") points to the meaning."},
      {id:"vc-s11", tier:"silver", q:"\"Meticulous\" most nearly means…", opts:["careless","extremely careful and precise","fast","large"], a:1, explain:"A meticulous worker pays attention to every detail. Same family as: thorough, painstaking, exacting."},
      {id:"vc-s12", tier:"silver", q:"\"Inevitable\" most nearly means…", opts:["avoidable","certain to happen","unlikely","unfair"], a:1, explain:"Inevitable = cannot be prevented. From Latin in- (not) + evitabilis (avoidable)."},

      // ---------- GOLD ----------
      {id:"vc-g01", tier:"gold", q:"Isabel Beck's three tiers of vocabulary classify words as Tier 1 (basic conversation), Tier 2 (high-utility academic), and Tier 3 (domain-specific technical). Which is Tier 2?", opts:["dog","sustain","mitochondria","run"], a:1, explain:"Tier 2 words appear across many subjects and texts: sustain, analyze, fundamental, perspective. Tier 1 = everyday (dog, run). Tier 3 = subject-specific (mitochondria)."},
      {id:"vc-g02", tier:"gold", q:"The phrase \"the silver lining\" is an example of…", opts:["literal language","an idiom — figurative language with a non-literal meaning","slang","a metaphor"], a:1, explain:"Idioms are figurative expressions whose meaning isn't derivable from the literal words. \"Silver lining\" means the good aspect of a bad situation."},
      {id:"vc-g03", tier:"gold", q:"In \"The classroom was a zoo,\" the word \"zoo\" is being used…", opts:["literally","as a metaphor for chaos","as a simile","as personification"], a:1, explain:"Metaphor: one thing said to BE another for descriptive effect. The classroom isn't literally a zoo — it's chaotic in a way that resembles one."},
      {id:"vc-g04", tier:"gold", q:"The word \"bank\" can mean a financial institution OR the side of a river. This is an example of…", opts:["a synonym","a homograph (same spelling, different meanings)","an antonym","an idiom"], a:1, explain:"Homograph: same spelling, different meaning. Context tells you which sense applies. Other examples: bat (animal / sports), spring (season / coil / water source)."},
      {id:"vc-g05", tier:"gold", q:"In context: \"The new policy was a panacea — a single solution we hoped would fix everything.\" Panacea most likely means…", opts:["a problem","a cure-all or universal remedy","a delay","an investigation"], a:1, explain:"Panacea = remedy for all ills. The em-dash definition (\"a single solution we hoped would fix everything\") IS the definition — context as direct teaching."},
      {id:"vc-g06", tier:"gold", q:"\"Connotation\" vs \"denotation\":", opts:["same thing","denotation = dictionary meaning; connotation = emotional/cultural associations","connotation = formal; denotation = informal","random"], a:1, explain:"Denotation is the literal definition. Connotation is what the word feels like / suggests. \"Childish\" and \"childlike\" share denotation but differ in connotation — one negative, one positive."},
      {id:"vc-g07", tier:"gold", q:"To learn a new word durably, research shows readers need…", opts:["one definition","approximately 4-12 meaningful encounters in different contexts","memorization drills","fewer encounters but longer ones"], a:1, explain:"Vocabulary research (Beck, McKeown, Nagy) converges: multiple varied encounters build durable knowledge. Single definitions don't stick. Wide reading is the engine of vocabulary growth."},
      {id:"vc-g08", tier:"gold", q:"A reader doesn't know the word \"obstinate\" but reads: \"The mule was obstinate and refused to move.\" The reader can infer obstinate means…", opts:["fast","stubborn","tired","clever"], a:1, explain:"Context inference: the second clause defines the first. \"Refused to move\" = stubborn. The text teaches the word."},
      {id:"vc-g09", tier:"gold", q:"Why does \"vocabulary word of the day\" instruction often fail to build durable vocabulary?", opts:["it doesn't fail","one-shot definition without multiple meaningful encounters doesn't produce durable learning","words are too easy","words are too hard"], a:1, explain:"Single-encounter learning is fragile. Vocabulary sticks through repeated meaningful exposure across many contexts — wide reading and integrated instruction beat isolated word-of-the-day lists."},
      {id:"vc-g10", tier:"gold", q:"The vocabulary gap between children from word-rich vs word-poor home environments…", opts:["doesn't exist","is measurable by kindergarten and predicts later reading achievement","appears only in adulthood","is genetic"], a:1, explain:"Documented since Hart & Risley's classic 1995 work, replicated since. Early vocabulary differences predict reading and academic outcomes. Closing the gap requires deliberate vocabulary instruction in school."},
      {id:"vc-g11", tier:"gold", q:"What is \"word consciousness\"?", opts:["a sleep state","an awareness and interest in words — curiosity about meaning and use","a vocabulary test","a phonics rule"], a:1, explain:"Word consciousness is the habit of noticing words, asking what they mean, and pursuing the answer. It's what turns vocabulary into a lifelong growth process rather than a school subject."},
      {id:"vc-g12", tier:"gold", q:"In \"The new evidence undermined the prosecutor's case,\" undermined means…", opts:["supported","weakened or damaged","ignored","praised"], a:1, explain:"From under + mine (to dig beneath). Literally: to dig beneath a structure to weaken it. Figuratively: to weaken something. Context (\"new evidence\" against \"the case\") confirms."},

      // ---------- PLATINUM ----------
      {id:"vc-p01", tier:"platinum", q:"\"Robust vocabulary instruction\" (Beck et al.) emphasizes which level of words?", opts:["Tier 1 — basic conversation","Tier 2 — high-utility academic words","Tier 3 — technical jargon","all equally"], a:1, explain:"Tier 2 words are most cost-effective to teach: high frequency in academic text, transferable across subjects, often missing from spoken vocabulary. Teaching Tier 2 yields the biggest comprehension dividends."},
      {id:"vc-p02", tier:"platinum", q:"Why does morphology instruction (Greek/Latin roots, prefixes, suffixes) accelerate vocabulary growth in middle and upper grades?", opts:["it doesn't","one root + several affixes can unlock hundreds of words at once","it's traditional","it's required"], a:1, explain:"English academic vocabulary is heavily Greek/Latin. Auto + bio + graph + y opens a family of words. Twenty common roots unlock thousands of derivatives. Morphology is vocabulary multiplication."},
      {id:"vc-p03", tier:"platinum", q:"The Simple View of Reading (Gough & Tunmer) holds that comprehension = decoding × language comprehension. Vocabulary is foundational to…", opts:["decoding","language comprehension","both equally","neither"], a:1, explain:"In SVR, vocabulary is the LARGEST contributor to language comprehension. A reader who decodes well but lacks vocabulary still can't comprehend — the second factor is zero, the product is zero."},
      {id:"vc-p04", tier:"platinum", q:"For an adult learner returning to literacy, vocabulary growth is best supported by…", opts:["dictionary memorization","wide reading in their actual interest areas + targeted Tier 2 instruction","random word lists","translation only"], a:1, explain:"Wide reading in motivating content delivers meaningful repeated encounters. Add deliberate Tier 2 instruction to extend academic-language reach. The two together beat either alone."},
      {id:"vc-p05", tier:"platinum", q:"\"Receptive\" vocabulary vs \"productive\" vocabulary:", opts:["same","receptive = words you understand; productive = words you can use in speech/writing","receptive = spoken; productive = written","random"], a:1, explain:"Receptive vocabulary (recognized in reading/listening) is typically larger than productive vocabulary (used in speech/writing). Both matter; teaching can target either."},
      {id:"vc-p06", tier:"platinum", q:"Why does reading volume predict vocabulary growth more strongly than direct vocabulary instruction in middle and upper grades?", opts:["it doesn't","print exposes readers to many rare words; conversation rarely does","reading is fun","testing is involved"], a:1, explain:"Print is denser in rare vocabulary than even adult conversation. Wide reading exposes the reader to thousands of rare-word encounters per year — more than any classroom drill can replicate."},
      {id:"vc-p07", tier:"platinum", q:"\"Frayer Model\" vocabulary instruction asks the student to record, for each word, the…", opts:["spelling and pronunciation only","definition, characteristics, examples, AND non-examples","translation","root etymology"], a:1, explain:"The Frayer Model (Frayer, Frederick, Klausmeier 1969) builds deep word knowledge by requiring the student to articulate what something IS and what it ISN'T. The non-examples sharpen the boundary."},
      {id:"vc-p08", tier:"platinum", q:"A struggling adolescent reader has intact decoding and weak comprehension. Vocabulary assessment shows below-grade scores. The targeted intervention is…", opts:["more phonics","direct Tier 2 vocabulary instruction + wide reading","fluency drills","writing practice"], a:1, explain:"Decoding intact + weak comprehension + weak vocabulary = the language-comprehension side of the Simple View. Vocabulary is the lever. Direct Tier 2 + volume = the standard intervention."},
      {id:"vc-p09", tier:"platinum", q:"In academic English, what proportion of unfamiliar words can a reader typically infer from context alone?", opts:["all of them","relatively few — context inference is unreliable when too many surrounding words are also unknown","most of them","none of them"], a:1, explain:"Context inference works when the surrounding text is well-known. When too many words are unfamiliar, context collapses. This is why direct vocabulary instruction matters — context alone isn't enough."},
      {id:"vc-p10", tier:"platinum", q:"What does \"word depth\" mean in vocabulary assessment?", opts:["spelling","how much a learner knows about a word's meanings, uses, connotations, related forms","speed of recognition","translation"], a:1, explain:"Word depth = quality of knowledge. A learner might recognize \"culture\" but not know its multiple senses (society's customs vs lab growth medium) or related forms (cultural, culturally, agriculture). Depth > breadth in many cases."},
      {id:"vc-p11", tier:"platinum", q:"A teacher introducing the word \"reluctant\" says: \"Reluctant — like when you don't want to do something but you might have to.\" Then she has students use it in a sentence about THEIR experiences. This combines…", opts:["definition only","student-friendly definition + personal application","translation only","testing"], a:1, explain:"Beck's \"robust vocabulary instruction\" approach: give a usable definition (not a dictionary one), then have students APPLY the word in their own contexts. Definition + use + integration."},
      {id:"vc-p12", tier:"platinum", q:"Why are cognates (English words sharing roots with Spanish, French, Latin, etc.) particularly powerful for English Learners (ELs)?", opts:["they aren't","approximately 40% of academic English vocabulary has Romance-language cognates ELs may already know","ELs avoid them","random"], a:1, explain:"Around 40% of academic English shares roots with Spanish (and other Romance languages). \"Información, fundamental, característica\" — ELs already know the meaning, just need the English form. Cognate instruction is high-leverage for EL vocabulary growth."}
    ]
  }
,
  {
    slug:"comprehension", name:"Comprehension", tag:"Sovereign Seven",
    lesson:"Comprehension is what reading is for. Every other pillar serves this one — the moment a sequence of words becomes a thought you can hold, weigh, argue with, and act on.",
    qs:[
      // ---------- BRONZE ----------
      {id:"cm-b01", tier:"bronze", q:"\"She forgot her umbrella, so she got soaked walking home.\" The cause of getting soaked was…", opts:["walking home","getting soaked","forgetting the umbrella","the weather"], a:2, explain:"\"So\" signals cause-and-effect. Cause comes before \"so,\" effect comes after."},
      {id:"cm-b02", tier:"bronze", q:"A good summary of a paragraph…", opts:["repeats every sentence","captures the main point in fewer words","quotes the last line","skips the boring parts"], a:1, explain:"Summarizing is compression with the main idea intact."},
      {id:"cm-b03", tier:"bronze", q:"To find the main idea of a passage, ask…", opts:["how long it is","what the author mostly wants me to understand","whether you agree","when it was written"], a:1, explain:"Main idea = the central point that everything else in the passage is serving."},
      {id:"cm-b04", tier:"bronze", q:"Words like \"first,\" \"then,\" \"next,\" and \"finally\" signal…", opts:["how the author feels","the order of events","cause and effect","contrast"], a:1, explain:"Sequence words map the timeline. They tell the reader what came when."},
      {id:"cm-b05", tier:"bronze", q:"\"Despite the rain, the picnic went well.\" The tone of this sentence is…", opts:["sad","positive and resilient","angry","confused"], a:1, explain:"\"Despite\" sets up an obstacle. \"Went well\" overcomes it. The sentence celebrates the good outcome."},
      {id:"cm-b06", tier:"bronze", q:"\"She slammed the door and stormed out without a word.\" The character is most likely…", opts:["amused","angry or upset","calm","tired"], a:1, explain:"Word choice — slammed, stormed — paints emotional intensity. We infer feeling without an explicit emotion word."},
      {id:"cm-b07", tier:"bronze", q:"An author's main purpose is usually one of three: to inform, to persuade, or to…", opts:["confuse","entertain","sell","repeat"], a:1, explain:"Inform, persuade, entertain — the classic three purposes. Many texts blend them, but one usually leads."},
      {id:"cm-b08", tier:"bronze", q:"\"The plan looked good on paper. However, the budget didn't allow it.\" The word \"however\" signals…", opts:["agreement","a contrasting idea","more of the same","a question"], a:1, explain:"Transition words like however, but, although, yet — all flag that the next idea pushes against the previous one."},
      {id:"cm-b09", tier:"bronze", q:"When a writer makes a claim and gives examples to back it up, the examples are…", opts:["decoration","supporting evidence","distractions","the main point"], a:1, explain:"Claim + evidence is the spine of a well-built paragraph."},
      {id:"cm-b10", tier:"bronze", q:"Predicting what happens next in a story uses…", opts:["clues already given in the text","random guessing","skipping ahead","the title only"], a:0, explain:"Good predictions ground themselves in patterns the text has already set up."},
      {id:"cm-b11", tier:"bronze", q:"After reading \"The thermometer dropped 30 degrees overnight. By morning, ice covered the puddles,\" we can infer that…", opts:["it rained","it got very cold","it was summer","the thermometer broke"], a:1, explain:"Neither sentence says \"cold\" outright — but the temperature drop plus ice on puddles makes the inference solid."},
      {id:"cm-b12", tier:"bronze", q:"To compare two characters in a story, you look at…", opts:["only what they share","only how they differ","both similarities and differences","just the main character"], a:2, explain:"Comparison and contrast work together. Two characters reveal each other through both."},

      // ---------- SILVER ----------
      {id:"cm-s01", tier:"silver", q:"The \"main idea\" of a paragraph is…", opts:["the first sentence","the central claim that the other sentences support","the longest sentence","the last sentence"], a:1, explain:"Main idea isn't always stated explicitly. It's the controlling thought the paragraph develops."},
      {id:"cm-s02", tier:"silver", q:"\"Although the team practiced for months, they lost the championship.\" This sentence is structured around…", opts:["sequence","contrast — practice should have led to winning, but didn't","cause-effect","listing"], a:1, explain:"\"Although\" sets up an expected outcome, then defeats it. The structure is contrast: setup + reversal."},
      {id:"cm-s03", tier:"silver", q:"In a nonfiction passage, the \"topic\" and the \"main idea\" differ in that…", opts:["they're the same","topic = what it's ABOUT (subject); main idea = what the author claims about that topic","topic is shorter","main idea is shorter"], a:1, explain:"Topic = subject (\"climate change\"). Main idea = author's central claim about it (\"climate change requires immediate policy action\"). One subject can have many possible main ideas."},
      {id:"cm-s04", tier:"silver", q:"A \"text structure\" of \"problem and solution\" can be recognized by signal words like…", opts:["first, second, third","problem, issue, solution, resolve","like, similar to","because, therefore"], a:1, explain:"Each text structure has its signal vocabulary. Problem/solution texts use: problem, issue, challenge, solve, resolve, fix, address."},
      {id:"cm-s05", tier:"silver", q:"What does \"making an inference\" require?", opts:["restating what the text says","combining what the text says with what you already know","ignoring the text","skipping ahead"], a:1, explain:"Inference = text + reader's knowledge. The text gives clues; the reader's prior knowledge fills the gaps."},
      {id:"cm-s06", tier:"silver", q:"A character thinks \"I shouldn't have said that\" right after a conversation. We can infer the character feels…", opts:["proud","regret","relieved","amused"], a:1, explain:"\"Shouldn't have\" expresses regret. Direct word choice from the character — no inference even needed beyond the literal meaning."},
      {id:"cm-s07", tier:"silver", q:"Why does background knowledge matter for comprehension?", opts:["it doesn't","texts assume the reader knows certain things; gaps in background knowledge produce comprehension gaps","background knowledge is for tests","random"], a:1, explain:"Even with perfect decoding, a reader without the relevant background knowledge can't fully comprehend. Schema theory: comprehension = text + reader's existing knowledge."},
      {id:"cm-s08", tier:"silver", q:"\"Annotating a text\" while reading helps comprehension because…", opts:["it slows you down","active marking forces deeper processing — questions, predictions, summaries lock in meaning","it makes books messy","it's required"], a:1, explain:"Annotation = active reading. Underlining, marginal notes, questions all force engagement with meaning. Passive reading rarely produces deep comprehension."},
      {id:"cm-s09", tier:"silver", q:"In \"Sarah grabbed her keys and ran out the door,\" we can infer Sarah is in a…", opts:["calm mood","hurry","sad mood","sleepy state"], a:1, explain:"Action verbs (\"grabbed,\" \"ran\") paint urgency. We infer hurry from the speed and decisiveness of the actions."},
      {id:"cm-s10", tier:"silver", q:"\"Tone\" in writing means…", opts:["how loud","the author's attitude toward the subject (e.g., serious, playful, critical)","spelling","grammar"], a:1, explain:"Tone is the emotional or attitudinal stance the author takes. Same facts can be presented with admiring tone or critical tone — completely different reader experiences."},
      {id:"cm-s11", tier:"silver", q:"\"Theme\" in literature means…", opts:["the topic","an underlying message or idea the work explores","the setting","the plot"], a:1, explain:"Topic = what (love, war, family). Theme = what the work SAYS about that topic (\"love costs more than it appears to,\" \"war shapes everything it touches\")."},
      {id:"cm-s12", tier:"silver", q:"\"The deeper meaning\" of a story is found through…", opts:["the title alone","reading carefully and inferring from patterns of detail","skipping descriptions","reading fast"], a:1, explain:"Themes emerge from patterns — repeated images, parallel scenes, recurring word choices. Careful reading finds the patterns; quick reading misses them."},

      // ---------- GOLD ----------
      {id:"cm-g01", tier:"gold", q:"The Simple View of Reading (Gough & Tunmer) holds that reading comprehension is the product of…", opts:["decoding alone","decoding × language comprehension","memorization","fluency × motivation"], a:1, explain:"SVR: Reading Comprehension = Decoding × Language Comprehension. If EITHER factor is zero, comprehension is zero. Strong decoding doesn't help if language comprehension is weak."},
      {id:"cm-g02", tier:"gold", q:"A student decodes perfectly but can't summarize what they just read. The likely cause is…", opts:["fluency","weak language comprehension — vocabulary, background knowledge, or comprehension strategies","poor decoding","fatigue"], a:1, explain:"SVR diagnosis. Decoding intact + weak summary = the language-comprehension factor. Target vocabulary, background knowledge, and explicit comprehension strategies."},
      {id:"cm-g03", tier:"gold", q:"\"Reading is thinking with someone else's words.\" Which strategy best operationalizes this?", opts:["speed reading","metacognitive monitoring + active questioning of the text as you read","silent reading","skimming"], a:1, explain:"Active comprehension = a continuous internal conversation with the text: predicting, questioning, summarizing, connecting. Reading without that mental activity produces little comprehension."},
      {id:"cm-g04", tier:"gold", q:"Reciprocal teaching (Palincsar & Brown) involves four comprehension strategies. Three of them are predicting, questioning, and clarifying. The fourth is…", opts:["spelling","summarizing","memorizing","skimming"], a:1, explain:"Reciprocal teaching = predict, question, clarify, summarize. Students take turns modeling each strategy, internalizing the comprehension routine."},
      {id:"cm-g05", tier:"gold", q:"\"Knowledge effects\" in reading comprehension refers to…", opts:["IQ","the finding that domain knowledge is one of the strongest predictors of comprehension on a given text","fluency","decoding"], a:1, explain:"Background knowledge specific to the topic of the text predicts comprehension powerfully. A baseball novice and a baseball fan will comprehend the same baseball article very differently — decoding equal."},
      {id:"cm-g06", tier:"gold", q:"A reader of \"The Lottery\" by Shirley Jackson finishes the story expecting a happy ending. The ending shocks them. This reveals a weakness in…", opts:["decoding","attending to foreshadowing — the story planted dark signals throughout","vocabulary","reading speed"], a:1, explain:"Skilled comprehension tracks signals: tone shifts, ominous details, character behavior. \"The Lottery\" foreshadows constantly. Missing the signals = missing meaning."},
      {id:"cm-g07", tier:"gold", q:"\"Close reading\" emphasizes…", opts:["fast reading","careful, slow reading of a text passage with attention to specific language and structure","skimming","memorization"], a:1, explain:"Close reading = slow, attentive analysis of a text's specific moves — word choice, sentence structure, transitions. Beloved of literary scholars and AP English."},
      {id:"cm-g08", tier:"gold", q:"\"Visualization\" as a comprehension strategy means…", opts:["watching a movie","creating mental images of what the text describes","drawing pictures","none"], a:1, explain:"Visualization = building a movie in your head as you read. Readers who don't visualize often comprehend less. Explicit visualization instruction improves comprehension for many readers."},
      {id:"cm-g09", tier:"gold", q:"In academic text, \"argument structure\" typically follows…", opts:["random","claim → evidence → reasoning that connects evidence to claim → counterargument → response","sequence","cause-effect"], a:1, explain:"Argumentative writing has a recognizable structure. Skilled readers track the claim, weigh the evidence, evaluate the reasoning, and assess how counterarguments are handled."},
      {id:"cm-g10", tier:"gold", q:"A reader who can summarize what a paragraph SAYS but not what the author IS DOING (e.g., \"introducing a counterexample\") is missing…", opts:["nothing — same thing","awareness of rhetorical moves — the WHY behind the WHAT","decoding","fluency"], a:1, explain:"Skilled readers track content AND function. \"Here the author concedes a point\" or \"this paragraph defines the central term\" — that meta-tracking is a hallmark of academic comprehension."},
      {id:"cm-g11", tier:"gold", q:"A struggling reader has weak comprehension on narrative AND nonfiction. Targeted intervention is…", opts:["random reading","explicit comprehension strategy instruction (e.g., reciprocal teaching) + vocabulary","decoding drills","silent reading"], a:1, explain:"Broad comprehension weakness usually responds to explicit strategy instruction PLUS vocabulary growth. Both pieces matter."},
      {id:"cm-g12", tier:"gold", q:"\"Text-dependent questions\" in comprehension instruction prioritize…", opts:["personal opinion","questions that require evidence from the specific text to answer","general knowledge","speed"], a:1, explain:"Text-dependent questions pull the reader back into the text. \"How does the author show…\" requires citing text evidence, not summarizing prior beliefs."},

      // ---------- PLATINUM ----------
      {id:"cm-p01", tier:"platinum", q:"The \"knowledge gap\" research (Hirsch and others) argues that reading comprehension in school depends MORE on…", opts:["decoding skill","domain-specific background knowledge built across the curriculum","comprehension strategies alone","native intelligence"], a:1, explain:"Hirsch's argument: comprehension strategies have ceiling effects without rich knowledge. Texts assume readers know things. Building broad knowledge across history, science, and the arts is reading instruction."},
      {id:"cm-p02", tier:"platinum", q:"The 4th-grade slump (Chall) describes the pattern where…", opts:["students get worse at school","decoding-fluent readers begin struggling around grade 4 as texts demand more background knowledge and vocabulary","summer regression","fluency loss"], a:1, explain:"Jeanne Chall: many readers who decode adequately through grade 3 begin to fall behind in grade 4+ as texts shift from learning-to-read to reading-to-learn. Vocabulary and background knowledge become the bottleneck."},
      {id:"cm-p03", tier:"platinum", q:"\"Schema theory\" in reading argues that…", opts:["all readers are equal","comprehension is the integration of new text with the reader's existing knowledge structures (schemas)","decoding is comprehension","random"], a:1, explain:"Schema theory: meaning isn't IN the text; it's constructed by integrating text with the reader's prior schemas. A baseball schema makes baseball articles comprehensible; lack of schema makes them opaque."},
      {id:"cm-p04", tier:"platinum", q:"Research on comprehension strategies (NRP 2000, IES Practice Guides) supports which conclusion?", opts:["strategies don't work","explicit, modeled instruction in a small set of strategies (questioning, summarizing, monitoring) improves comprehension","one strategy is best","strategies replace knowledge"], a:1, explain:"Explicit strategy instruction has good evidence. The strategies work as scaffolds, internalized over time. Best practice is small set + explicit modeling + gradual release of responsibility."},
      {id:"cm-p05", tier:"platinum", q:"Why does \"knowledge-rich curriculum\" tend to produce better comprehension than \"strategy-rich, content-light\" curriculum?", opts:["it doesn't","strategies are useful but ceiling without knowledge; knowledge builds the schemas that strategies operate on","strategies are wrong","knowledge replaces reading"], a:1, explain:"Strategies are scaffolds for knowledge. Without rich content, students have nothing to apply strategies to. Curricula that build deep knowledge over years tend to outperform skill-only curricula."},
      {id:"cm-p06", tier:"platinum", q:"\"Construction-Integration\" (Kintsch) describes comprehension as…", opts:["a single step","two phases: building a surface representation, then integrating it with prior knowledge into a coherent mental model","fluency-based","decoding-based"], a:1, explain:"Walter Kintsch's CI model: comprehension = construct a propositional surface from the text, then integrate with prior knowledge to form a situation model. Both phases must succeed."},
      {id:"cm-p07", tier:"platinum", q:"A struggling adolescent comprehender shows intact decoding, strong vocabulary, but weak inference-making. The targeted approach is…", opts:["more decoding","explicit instruction in inference: recognizing implicit information, integrating across paragraphs, generating questions","more vocabulary","reading silently"], a:1, explain:"Inference-specific weakness with intact decoding and vocabulary = a strategy gap. Direct teaching of inferential thinking (with worked examples) is the high-leverage move."},
      {id:"cm-p08", tier:"platinum", q:"\"Reading to learn\" (vs \"learning to read\") becomes the dominant demand around…", opts:["kindergarten","grade 4","grade 8","high school"], a:1, explain:"Grade 4 is the conventional pivot. Earlier grades focus on developing decoding and fluency. From grade 4 onward, text becomes the primary source of new content knowledge."},
      {id:"cm-p09", tier:"platinum", q:"In an oral language assessment, a child shows weak listening comprehension (poor recall of stories read aloud). What does this predict for reading comprehension once decoding develops?", opts:["nothing","reading comprehension will likely also be weak — listening and reading comprehension overlap heavily","reading will be strong","random"], a:1, explain:"Listening comprehension is reading comprehension minus the decoding load. Children with weak listening comprehension will face the same struggles in reading once decoding is in place. Early oral-language intervention prevents downstream reading problems."},
      {id:"cm-p10", tier:"platinum", q:"\"Metacognition\" in reading means…", opts:["fast reading","the reader's awareness of their own comprehension: monitoring, noticing breakdowns, repairing","memorization","decoding"], a:1, explain:"Metacognition = thinking about thinking. Skilled readers notice when comprehension breaks down and deploy fix-up strategies (reread, look up, ask). Struggling readers often don't notice the breakdown."},
      {id:"cm-p11", tier:"platinum", q:"Why are content-rich units of study (history of the Civil War, ecosystems of the wetland) more powerful for reading comprehension than disconnected weekly themes?", opts:["they aren't","sustained immersion in a topic builds the vocabulary and schemas that successive texts on that topic require","they're traditional","they're required"], a:1, explain:"Content-rich curricula build deep schemas. Each week reinforces and extends. Disconnected themes leave knowledge shallow, making each new text equally hard. Knowledge compounds; disconnection wastes the compounding."},
      {id:"cm-p12", tier:"platinum", q:"In adult literacy work, what's the highest-leverage comprehension intervention for someone who decodes adequately but comprehends weakly?", opts:["more phonics","wide reading on topics the learner cares about + explicit teaching of inference and main-idea identification","silent reading","testing"], a:1, explain:"Adult comprehension intervention combines authentic reading (motivation + volume + meaningful encounters with vocabulary) with explicit strategy instruction (inference, main idea, summary). The dual approach beats either alone."}
    ]
  }
,
  {
    slug:"critical-reading", name:"Critical Reading", tag:"Sovereign Seven",
    lesson:"This is the apostle's pillar — the one that lets a citizen weigh a claim, name a fallacy, follow the money, and teach the next reader to do the same. A reader who can decode but can't judge is half literate. Critical reading finishes the climb.",
    qs:[
      // ---------- BRONZE ----------
      {id:"cr-b01", tier:"bronze", q:"An article claims \"Studies show this product works,\" but cites no studies. This is…", opts:["acceptable shorthand","unverified — weak evidence","a primary source","peer-reviewed"], a:1, explain:"Without a citation, \"studies show\" is just an assertion. Always ask: which studies, by whom, where published?"},
      {id:"cr-b02", tier:"bronze", q:"An author who profits from selling a product writes that the product is the best on the market. This is…", opts:["unbiased","a conflict of interest","peer review","investigative journalism"], a:1, explain:"Profit motive doesn't automatically make the claim false — but it gives you a reason to verify it elsewhere."},
      {id:"cr-b03", tier:"bronze", q:"\"Everyone agrees that this is the right answer.\" This is an example of…", opts:["a strong argument","a bandwagon appeal","a primary source","a factual claim"], a:1, explain:"Popularity isn't proof. Bandwagon fallacy: substituting \"many believe X\" for \"X is true.\""},
      {id:"cr-b04", tier:"bronze", q:"Two sources disagree on a basic fact. The best response is to…", opts:["pick the source you like","split the difference","find a primary source and check the original","ignore both"], a:2, explain:"Go upstream. Primary sources (original documents, raw data) beat secondary sources (someone's report on the data)."},
      {id:"cr-b05", tier:"bronze", q:"Reading only the headline of a news article and forming a strong opinion is…", opts:["efficient","often misleading — headlines simplify or sensationalize","best practice","the same as reading the article"], a:1, explain:"Headlines are written to attract clicks. The article usually qualifies, complicates, or contradicts what the headline suggests."},
      {id:"cr-b06", tier:"bronze", q:"A \"straw man\" fallacy is when someone…", opts:["agrees with the other side","misrepresents the other side's argument so it's easier to attack","cites too many sources","refuses to argue"], a:1, explain:"Build a flimsy version of your opponent's case, knock it down, claim victory. Look for arguments that don't match what the other side actually said."},
      {id:"cr-b07", tier:"bronze", q:"Ice cream sales and drowning deaths both rise in summer. The most accurate reading is…", opts:["ice cream causes drowning","they're correlated because of a shared cause (summer heat)","unrelated","drowning causes ice cream sales"], a:1, explain:"Correlation vs causation. Two things rising together doesn't mean one causes the other. Look for the third variable."},
      {id:"cr-b08", tier:"bronze", q:"An article repeatedly calls a politician \"radical\" and \"extremist\" without showing what they actually said. This is…", opts:["clear evidence","loaded language — rhetorical, not factual","peer-reviewed","balanced reporting"], a:1, explain:"Loaded labels do emotional work, not informational work. Watch for adjectives that score points without earning them."},
      {id:"cr-b09", tier:"bronze", q:"A famous doctor goes on TV to give economic advice. We should…", opts:["trust them automatically","check whether their expertise actually applies — credentials don't transfer across fields","reject everything they say","trust them only if we agree"], a:1, explain:"\"Appeal to authority\" becomes a fallacy when the authority is outside their area of expertise."},
      {id:"cr-b10", tier:"bronze", q:"Which is generally STRONGER evidence about a public-health trend?", opts:["one personal story","data from a large peer-reviewed study","a viral social media post","an opinion column"], a:1, explain:"Anecdotes are vivid but limited. Peer-reviewed studies are designed to filter out the noise of any single case."},
      {id:"cr-b11", tier:"bronze", q:"A big claim is supported only by \"an anonymous source close to the situation.\" That…", opts:["proves the claim","weakens credibility unless other evidence supports it","is required for journalism","doesn't matter"], a:1, explain:"Anonymity has legitimate uses but shifts more burden of proof onto other evidence. One anonymous source alone isn't usually enough."},
      {id:"cr-b12", tier:"bronze", q:"A viral claim is sweeping social media. The best way to verify is to…", opts:["share quickly","check whether reputable independent sources have confirmed","trust the most-liked comment","wait for others"], a:1, explain:"Verification is upstream and lateral. Find independent reporting from sources that don't share the original's incentives."},

      // ---------- SILVER ----------
      {id:"cr-s01", tier:"silver", q:"An ad-hominem attack is when someone…", opts:["argues the position","attacks the person making the argument instead of the argument itself","cites sources","stays silent"], a:1, explain:"Ad hominem (\"to the person\") fallacy: dismissing an argument by attacking the speaker's character or motives rather than addressing what they actually said."},
      {id:"cr-s02", tier:"silver", q:"A \"slippery slope\" argument claims that…", opts:["all change is good","one small action will inevitably lead to a catastrophic chain of events, without showing the causal chain","arguments use steps","change is gradual"], a:1, explain:"Slippery slope: \"If we do A, then B, then C, then disaster.\" The fallacy is asserting the chain without showing each step is actually likely or causal."},
      {id:"cr-s03", tier:"silver", q:"\"False dilemma\" is when someone…", opts:["uses two examples","presents only two options when more exist (\"You're either with us or against us\")","picks a side","describes a problem"], a:1, explain:"False dilemma forecloses thinking by collapsing many options into two extremes. Reality usually offers more than two paths."},
      {id:"cr-s04", tier:"silver", q:"Which question best tests an article's reliability?", opts:["who agrees with it","who is the author, what is their expertise, what are their sources, who funded it","how popular is it","when was it written"], a:1, explain:"The CRAAP framework (Currency, Relevance, Authority, Accuracy, Purpose) and lateral reading both emphasize: author + expertise + sources + funding. These four answer most reliability questions."},
      {id:"cr-s05", tier:"silver", q:"\"Lateral reading\" means…", opts:["reading sideways","leaving a source to check it against other independent sources before deciding what to think","reading quickly","reading aloud"], a:1, explain:"Lateral reading (the strategy of professional fact-checkers): instead of evaluating a source by reading it more carefully, OPEN OTHER TABS and check what other sources say about it. Often more revealing than the source itself."},
      {id:"cr-s06", tier:"silver", q:"\"Confirmation bias\" is the tendency to…", opts:["confirm what you already know","seek and remember information that confirms your existing beliefs, while discounting contradicting information","read widely","change your mind"], a:1, explain:"We naturally weight evidence to favor what we already believe. Critical readers consciously seek disconfirming evidence."},
      {id:"cr-s07", tier:"silver", q:"A study finds that towns with more firefighters have more fires. The most likely interpretation is…", opts:["firefighters cause fires","reverse causation: more fires require more firefighters","random","fires prevent firefighters"], a:1, explain:"Reverse causation. The direction of the arrow matters. More fires → more firefighters, not the other way around."},
      {id:"cr-s08", tier:"silver", q:"A graph shows \"unemployment dropped 50%.\" The starting unemployment rate is hidden. This is potentially misleading because…", opts:["graphs are always misleading","the absolute size matters: 50% of 8% = 4 points; 50% of 2% = 1 point","graphs lie","random"], a:1, explain:"Percentage changes hide the base. \"Fell 50%\" could be a huge change or a small one. Always ask: 50% of WHAT starting number?"},
      {id:"cr-s09", tier:"silver", q:"An article says \"experts disagree\" but quotes 15 experts on one side and 1 on the other. This is potentially misleading because…", opts:["expert opinion doesn't matter","\"disagreement\" implies more parity than 15-to-1 reflects; the framing distorts the actual consensus","experts are biased","random"], a:1, explain:"\"Experts disagree\" can mask a near-consensus. False balance — giving equal weight to vastly unequal positions — is a common distortion in science reporting."},
      {id:"cr-s10", tier:"silver", q:"Which is the strongest evidence for a causal claim about a medical treatment?", opts:["personal testimonial","randomized controlled trial (RCT) with adequate sample size","one news story","one doctor's opinion"], a:1, explain:"RCTs randomize participants between treatment and control, controlling for confounders. They're the gold standard for causal medical claims."},
      {id:"cr-s11", tier:"silver", q:"\"Cherry-picking\" data means…", opts:["choosing good fruit","selectively presenting evidence that supports your view while ignoring evidence that contradicts it","picking randomly","picking the best evidence"], a:1, explain:"Cherry-picking is selective presentation. The cherries don't lie individually; the omitted basket is the problem. Honest analysis presents the full picture."},
      {id:"cr-s12", tier:"silver", q:"In evaluating a source, \"motivated reasoning\" refers to…", opts:["working hard","drawing conclusions that align with what you want to be true, rather than what the evidence supports","skipping evidence","trusting authorities"], a:1, explain:"Motivated reasoning: the brain works backward from a desired conclusion. Critical readers notice when they want a claim to be true and lean harder on evidence rather than less."},

      // ---------- GOLD ----------
      {id:"cr-g01", tier:"gold", q:"A study claims a 30% reduction in heart attacks from a drug. The \"30%\" is relative risk; the absolute risk reduction is 0.1% (from 0.3% to 0.2%). Why does this distinction matter?", opts:["it doesn't","relative numbers can dramatize tiny absolute effects","absolute is dramatic","they're identical"], a:1, explain:"Relative risk reductions sound enormous; absolute reductions reveal the real-world effect. Critical readers ask for both. \"Reduces heart attacks by 30%\" and \"reduces heart attacks by 0.1 percentage points\" describe the SAME study."},
      {id:"cr-g02", tier:"gold", q:"A news story reports a poll. The strongest critical-reading question to ask FIRST is…", opts:["who paid for the poll","what was the sample size and how was it selected","what's the headline","who answered first"], a:1, explain:"Sample size and selection method determine whether the poll generalizes to the claimed population. A poll of 100 people in one neighborhood doesn't tell you what \"Americans think.\""},
      {id:"cr-g03", tier:"gold", q:"A meta-analysis combines results from 30 studies. Why is it generally stronger than any single study?", opts:["it isn't","by pooling data across studies, random noise tends to wash out and real effects become more detectable","more pages","more authors"], a:1, explain:"Meta-analysis aggregates evidence. Single studies vary because of sampling noise; pooling smooths the noise. The Cochrane Collaboration meta-analyses are gold standards in medicine."},
      {id:"cr-g04", tier:"gold", q:"\"P-hacking\" in research refers to…", opts:["typing fast","running many statistical tests until one reaches significance by chance, then reporting only that one","peer review","careful methodology"], a:1, explain:"P-hacking exploits statistics. If you test 20 hypotheses, on average one reaches p<0.05 by pure chance. Reporting only the significant one without disclosure is a form of cherry-picking that produces false discoveries."},
      {id:"cr-g05", tier:"gold", q:"A think tank publishes a report. The strongest first move is to…", opts:["read the report","check who funds the think tank — sources of funding often shape conclusions","trust it","ignore it"], a:1, explain:"Funding influences output, often subtly. A tobacco-funded study of tobacco harms; an oil-funded study of climate change. Check funding, then read with that lens — not to dismiss, but to weigh."},
      {id:"cr-g06", tier:"gold", q:"\"Publication bias\" in science means…", opts:["scientists are biased","studies showing positive results are more likely to be published than null results, distorting the published record","peer review is biased","journals are corrupt"], a:1, explain:"Null results often languish unpublished. The published literature can over-represent the \"hits\" of a research area, exaggerating effect sizes. Pre-registration of studies helps counteract publication bias."},
      {id:"cr-g07", tier:"gold", q:"A reporter quotes \"sources familiar with the matter\" with no named sources. The article should be…", opts:["dismissed","read with caution — anonymous sourcing has legitimate uses but raises the bar for corroboration","trusted fully","ignored"], a:1, explain:"Anonymous sources protect whistleblowers and sensitive intelligence. But they also lower accountability. Strong journalism uses anonymous sources sparingly and corroborates with other evidence."},
      {id:"cr-g08", tier:"gold", q:"An infographic shows a chart with the y-axis starting at 70% instead of 0%. What's the effect?", opts:["clearer presentation","small differences appear visually huge — a 4% gap can look like 50%","more accurate","random"], a:1, explain:"Truncated axes dramatize small differences. A 70%-to-100% axis makes a 4-point gap look like a chasm. Always check axis ranges on charts."},
      {id:"cr-g09", tier:"gold", q:"\"Stacked deck\" reporting is when…", opts:["every card matters","selectively interviewing only sources supporting one view, while framing the piece as balanced","using card metaphors","using polls"], a:1, explain:"Sources are evidence. Choosing all from one side and presenting the result as a fair survey of the field is misleading. Compare sourcing across articles on the same topic to spot the pattern."},
      {id:"cr-g10", tier:"gold", q:"A statement is technically true but designed to mislead by omission. This is…", opts:["honesty","a half-truth — uses literal truth as a vehicle for false impression","peer review","fair reporting"], a:1, explain:"Half-truths exploit our default trust in literal accuracy. \"The drug works for some patients\" might omit \"in 2% of cases with severe side effects in 30%.\" Both sentences could be true; only one is honest."},
      {id:"cr-g11", tier:"gold", q:"\"Burden of proof\" in argument refers to…", opts:["a heavy book","the responsibility to provide evidence falls on the one MAKING a claim, not on those questioning it","both sides equally","the listener"], a:1, explain:"\"Russell's teapot.\" If I claim there's a teapot orbiting Mars, the burden is on me to prove it, not on you to disprove it. Extraordinary claims require extraordinary evidence."},
      {id:"cr-g12", tier:"gold", q:"\"Whataboutism\" deflects criticism by…", opts:["asking questions","redirecting to a different (often unrelated) wrong elsewhere rather than addressing the criticism","admitting fault","explaining context"], a:1, explain:"\"What about THEIR misdeeds?\" is a deflection. Even if the comparison is true, it doesn't address the original criticism. Whataboutism changes the subject."},

      // ---------- PLATINUM ----------
      {id:"cr-p01", tier:"platinum", q:"In media literacy, what's the difference between misinformation and disinformation?", opts:["same thing","misinformation = false claims spread without malicious intent; disinformation = deliberately deceptive","one is online","one is in print"], a:1, explain:"The intent distinguishes them. Misinformation = error or honest mistake. Disinformation = deliberate, often strategic deception. Both spread, but they require different interventions."},
      {id:"cr-p02", tier:"platinum", q:"\"Epistemic humility\" in critical reading means…", opts:["being quiet","acknowledging the limits of one's own knowledge and reasoning, including the possibility of being wrong","modesty","being shy"], a:1, explain:"Epistemic humility = knowing what you don't know. Includes resistance to confirmation bias, openness to disconfirming evidence, and willingness to revise. The opposite of motivated reasoning."},
      {id:"cr-p03", tier:"platinum", q:"\"Bayesian reasoning\" in evidence evaluation involves…", opts:["fast judgment","updating one's beliefs in proportion to the strength of new evidence, given prior probabilities","ignoring evidence","one type of statistics"], a:1, explain:"Bayesian thinking: a claim's credibility depends on prior plausibility AND the strength of new evidence. Strong evidence for a low-prior claim moves the needle less than the same evidence for a moderate-prior claim. Slow, deliberate, mathematical reasoning at its best."},
      {id:"cr-p04", tier:"platinum", q:"Fact-checking organizations (PolitiFact, Snopes, AP Fact Check) operate by…", opts:["personal opinion","tracing claims to primary sources and applying transparent methodology with citations","random verification","political bias"], a:1, explain:"Reputable fact-checkers cite primary sources, show their work, and publish methodology. Critical readers can evaluate the fact-checking the same way they evaluate any other source — by examining the process."},
      {id:"cr-p05", tier:"platinum", q:"The replication crisis in social science revealed that…", opts:["all studies are wrong","many studies — especially in psychology — don't replicate when other researchers attempt to reproduce them","fact-checkers are wrong","none of the above"], a:1, explain:"Open Science Collaboration (2015) attempted to replicate 100 psychology studies; ~36% replicated. The replication crisis transformed how critical readers should weigh single studies, especially in social science."},
      {id:"cr-p06", tier:"platinum", q:"\"Pre-registration\" in scientific research means…", opts:["pre-paying for journals","publicly committing to a study's hypotheses, methods, and analysis plan BEFORE collecting data","registering authors","random"], a:1, explain:"Pre-registration locks in the analysis plan before seeing the data. It eliminates the temptation of p-hacking, hypothesis-fishing, and outcome-switching. Pre-registered studies are stronger evidence than post-hoc analyses."},
      {id:"cr-p07", tier:"platinum", q:"In digital media, the \"firehose of falsehood\" propaganda strategy works by…", opts:["high quality","high volume, multiple channels, lack of commitment to consistency or accuracy — overwhelming critical filtering","slow careful argument","peer review"], a:1, explain:"RAND analysis: high-volume, fast, multi-channel, contradictory propaganda overwhelms normal information-processing. Counters: stable trusted sources, taking time to verify, lateral reading. Speed favors the propagandist."},
      {id:"cr-p08", tier:"platinum", q:"A reader sees a chart citing \"Source: study, 2024\" with no further detail. The strongest move is to…", opts:["trust it","treat the citation as insufficient — vague sourcing makes verification impossible","reject it","ignore the chart"], a:1, explain:"Citation that cannot be verified isn't citation; it's decoration. Real sourcing names the author, the journal, and ideally the year and DOI. Vague citations are red flags."},
      {id:"cr-p09", tier:"platinum", q:"In journalism, the \"both-sides\" framing can be problematic when…", opts:["never","one \"side\" is a fringe position vastly underweighted in expert consensus — false balance distorts the actual epistemic landscape","always","random"], a:1, explain:"Equal coverage of unequal positions misleads. 97% of climate scientists agree on anthropogenic climate change; presenting climate-denial as one of two equal sides distorts the consensus. Balance must reflect evidence, not be applied algorithmically."},
      {id:"cr-p10", tier:"platinum", q:"\"Steel-manning\" an opposing argument means…", opts:["attacking it","stating the strongest possible version of the argument before responding to it","ignoring it","weakening it"], a:1, explain:"Steel-manning = the opposite of straw-manning. Present the opposing case at its strongest, then engage with that. The discipline forces honest consideration AND produces more durable counter-arguments. A hallmark of intellectually serious discourse."},
      {id:"cr-p11", tier:"platinum", q:"\"Information laundering\" describes…", opts:["cleaning data","passing a dubious claim through progressively more reputable-seeming outlets until it appears credible","peer review","editing"], a:1, explain:"Information laundering: a fringe blog → a partisan outlet → a mid-tier news site → a major paper. Each link cites the previous as \"source.\" By the time it reaches the top, it looks legitimate. Trace claims to original sources, not the most recent citation."},
      {id:"cr-p12", tier:"platinum", q:"The strongest practice for critical reading at scale (i.e., on the internet daily) is…", opts:["read more","develop trusted-source lists, use lateral reading for unfamiliar claims, slow down for high-stakes decisions","ignore everything","trust major outlets"], a:1, explain:"At scale, you can't verify everything. The sustainable practice: cultivate a small set of trusted, transparent sources; use lateral reading to spot-check unfamiliar claims; slow down deliberately on high-stakes claims. Speed-reading propaganda is how propaganda wins."}
    ]
  }
,
  {
    slug:"morphology", name:"Morphology", tag:"Sovereign Seven",
    lesson:"Morphology is the architecture of meaning inside words. Prefixes, roots, suffixes — meaning units that combine like Lego pieces. Knowing twenty Greek and Latin roots unlocks thousands of English words. Morphology is vocabulary multiplication.",
    qs:[
      // ---------- BRONZE ----------
      {id:"mo-b01", tier:"bronze", q:"The prefix \"un-\" means…", opts:["very","not","again","before"], a:1, explain:"\"Un-\" negates the root: unhappy (not happy), unfair (not fair), unsafe (not safe)."},
      {id:"mo-b02", tier:"bronze", q:"The prefix \"re-\" means…", opts:["before","not","again","under"], a:2, explain:"\"Re-\" signals repetition: retry, redo, revisit, return, replay."},
      {id:"mo-b03", tier:"bronze", q:"The prefix \"mis-\" means…", opts:["before","wrongly","across","again"], a:1, explain:"\"Mis-\" signals error: misread, mistake, misjudge, misunderstand."},
      {id:"mo-b04", tier:"bronze", q:"The prefix \"pre-\" means…", opts:["after","before","not","again"], a:1, explain:"\"Pre-\" signals before-in-time: preheat, preview, predict, prevent."},
      {id:"mo-b05", tier:"bronze", q:"Adding \"-er\" to \"teach\" gives \"teacher.\" The suffix \"-er\" here means…", opts:["one who does the action","more of something","past tense","the opposite"], a:0, explain:"\"-er\" on a verb often means \"one who does\": teacher, runner, baker, builder, writer."},
      {id:"mo-b06", tier:"bronze", q:"The suffix \"-able\" usually means…", opts:["full of","without","capable of","more than"], a:2, explain:"\"-able\" means capable of being: readable, breakable, washable, fixable, drinkable."},
      {id:"mo-b07", tier:"bronze", q:"Break \"preheating\" into its parts.", opts:["pre + heat + ing","pre + heating","preh + eating","p + reheating"], a:0, explain:"Three parts: prefix (pre = before) + root (heat) + suffix (ing = ongoing action)."},
      {id:"mo-b08", tier:"bronze", q:"The Greek root \"tele\" means…", opts:["sound","far","picture","write"], a:1, explain:"Tele = far. Telephone (far sound), telegraph (far writing), telescope (far sight), television (far vision)."},
      {id:"mo-b09", tier:"bronze", q:"The Greek root \"auto\" means…", opts:["sound","self","car","writing"], a:1, explain:"Auto = self. Autobiography (writing about self), automatic (self-acting), autonomy (self-rule), automobile (self-moving)."},
      {id:"mo-b10", tier:"bronze", q:"The Latin root \"port\" means…", opts:["water","carry","door","place"], a:1, explain:"Port = carry. Transport (carry across), import (carry in), export (carry out), portable (able to be carried)."},
      {id:"mo-b11", tier:"bronze", q:"\"Biography\" comes from bio (life) + graphy (writing). It means…", opts:["a science book","a written account of a life","a long story","a portrait"], a:1, explain:"Roots carry meaning. Bio = life, graphy = writing — a written life. Biology + geography crack open the same way."},
      {id:"mo-b12", tier:"bronze", q:"The root \"dict\" means…", opts:["write","say or speak","heavy","read"], a:1, explain:"Dict = say/speak. Dictate (say aloud), predict (say beforehand), contradict (speak against), dictionary (book of words)."},

      // ---------- SILVER ----------
      {id:"mo-s01", tier:"silver", q:"The prefix \"trans-\" means…", opts:["under","against","across","beyond time"], a:2, explain:"Trans = across. Transport (carry across), transmit (send across), translate (carry across languages), transparent (light goes across)."},
      {id:"mo-s02", tier:"silver", q:"The Greek root \"phon\" means…", opts:["sight","sound","write","life"], a:1, explain:"Phon = sound. Phone, microphone (small sound), symphony (sounds together), phonics (sound-letter relationships), telephone (far sound)."},
      {id:"mo-s03", tier:"silver", q:"The Greek root \"graph\" means…", opts:["see","write or record","speak","measure"], a:1, explain:"Graph = write/record. Autograph (self-writing), photograph (light-writing), telegraph (far-writing), graph (a written record), paragraph (written beside)."},
      {id:"mo-s04", tier:"silver", q:"The Latin root \"scribe\" / \"script\" means…", opts:["see","write","carry","speak"], a:1, explain:"Scribe/script = write. Manuscript (hand-written), prescribe (write before), describe (write about), inscription, transcript."},
      {id:"mo-s05", tier:"silver", q:"The prefix \"sub-\" means…", opts:["over","under or below","near","without"], a:1, explain:"Sub = under/below. Submarine (under-sea), subway (under-way), subtract (take from under), subtitle, submerge."},
      {id:"mo-s06", tier:"silver", q:"The prefix \"super-\" means…", opts:["below","above or beyond","not","again"], a:1, explain:"Super = above/beyond. Supermarket (large market), superhuman (beyond human), supervise (oversee), superficial (above the surface)."},
      {id:"mo-s07", tier:"silver", q:"\"Bicycle\" breaks into bi + cycle. The prefix \"bi-\" means…", opts:["three","two","one","half"], a:1, explain:"Bi = two. Bicycle (two wheels), bilingual (two languages), binary (two states), bisect (cut in two)."},
      {id:"mo-s08", tier:"silver", q:"\"Triangle\" breaks into tri + angle. The prefix \"tri-\" means…", opts:["two","three","four","big"], a:1, explain:"Tri = three. Triangle (three angles), tripod (three feet), trio (three musicians), trilogy, tricycle."},
      {id:"mo-s09", tier:"silver", q:"The suffix \"-less\" usually means…", opts:["small","without","very","old"], a:1, explain:"-less = without. Hopeless (without hope), fearless (without fear), useless, careless, harmless, breathless."},
      {id:"mo-s10", tier:"silver", q:"The suffix \"-ful\" usually means…", opts:["full of or characterized by","empty of","new","old"], a:0, explain:"-ful = full of. Joyful (full of joy), hopeful, careful, beautiful, powerful. Often paired in opposites: care-FUL vs care-LESS."},
      {id:"mo-s11", tier:"silver", q:"The Latin root \"manu\" means…", opts:["foot","hand","head","heart"], a:1, explain:"Manu = hand. Manual (done by hand), manufacture (originally hand-made), manuscript (hand-written), manipulate, maneuver."},
      {id:"mo-s12", tier:"silver", q:"The Greek root \"chron\" means…", opts:["color","time","sound","place"], a:1, explain:"Chron = time. Chronological (in time order), chronic (lasting in time), synchronize (same time), anachronism (out of time)."},

      // ---------- GOLD ----------
      {id:"mo-g01", tier:"gold", q:"To decode \"unbelievable\" by morphology, the parts are…", opts:["un + believe + able","unbe + liev + able","un + believa + ble","unbel + ievable"], a:0, explain:"Three meaningful parts: prefix (un = not) + root (believe) + suffix (able = capable of). Meaning: not capable of being believed."},
      {id:"mo-g02", tier:"gold", q:"The Greek root \"bio\" (life) and the root \"logy\" (study of) combine to form…", opts:["geology","biology — the study of life","ecology","theology"], a:1, explain:"Bio + logy = study of life. The \"-logy\" suffix produces dozens of academic disciplines: biology, geology (earth), psychology (mind), sociology (society), theology (god/divine)."},
      {id:"mo-g03", tier:"gold", q:"A reader meets the unfamiliar word \"hydrophobic.\" Knowing hydro = water and phobic = fearing, they infer…", opts:["loves water","fears or repels water","drinks water","random"], a:1, explain:"Hydro (water) + phobic (fearing/avoiding) = water-avoiding. Materials that repel water are called hydrophobic. Morphological inference unlocks a technical term from common roots."},
      {id:"mo-g04", tier:"gold", q:"\"Inflectional\" morphemes (like -s, -ed, -ing) differ from \"derivational\" morphemes (like un-, -tion, -ful) in that…", opts:["they don't","inflectional change grammatical form without changing the core word; derivational change meaning or part of speech","they're identical","one is more important"], a:1, explain:"Cat → cats (inflectional plural; same word, different number). Happy → unhappy (derivational; new meaning). Happy → happiness (derivational; noun from adjective)."},
      {id:"mo-g05", tier:"gold", q:"The Latin root \"spect\" means…", opts:["hear","look","carry","write"], a:1, explain:"Spect = look. Inspect (look into), prospect (look ahead), respect (look again), spectator (one who looks), spectacles (things to look through)."},
      {id:"mo-g06", tier:"gold", q:"In \"misanthrope,\" the parts are mis + anthrope. Anthrope means \"person/human.\" So misanthrope means…", opts:["lover of people","one who hates people","traveler","scientist"], a:1, explain:"Mis (here from Greek miso = hate, not Latin mis = wrongly) + anthropos (human) = one who hates humans. Same anthropos appears in anthropology (study of humans)."},
      {id:"mo-g07", tier:"gold", q:"\"Polymath\" breaks into poly (many) + math (learning). It means…", opts:["mathematician","one who has learned in many fields","one who counts","new student"], a:1, explain:"Poly (many) + math (from mathema, learning) = many-learned. Da Vinci is the archetypal polymath. The \"math\" in mathematics and polymath share the root."},
      {id:"mo-g08", tier:"gold", q:"The suffix \"-ology\" combined with the Greek root \"path\" (suffering) yields \"pathology.\" Pathology is the study of…", opts:["happiness","disease and suffering","speech","mathematics"], a:1, explain:"Path (suffering, disease) + ology (study of) = study of disease. Same path appears in sympathy (feeling-with), empathy (feeling-into), apathy (without feeling)."},
      {id:"mo-g09", tier:"gold", q:"In academic English, why does morphology instruction multiply vocabulary so efficiently?", opts:["it doesn't","one root learned unlocks an entire family of related words; one prefix transfers across dozens of stems","random","tradition"], a:1, explain:"Learning \"spect\" gives you access to inspect, prospect, respect, spectator, spectacle, perspective, retrospect, suspect, expect, introspect. One root → ten+ words. Morphology is vocabulary multiplication."},
      {id:"mo-g10", tier:"gold", q:"The Greek root \"democ\" / \"demos\" means…", opts:["king","people","money","earth"], a:1, explain:"Demos = people. Democracy (people-rule), demographic (people-description), epidemic (upon-the-people), pandemic (across all people)."},
      {id:"mo-g11", tier:"gold", q:"To decode \"international,\" the parts are…", opts:["in + ter + national","inter + nation + al","int + er + national","internat + ional"], a:1, explain:"Inter (between) + nation (root) + al (suffix making an adjective) = between-nations. Same inter- appears in interrupt, interact, intervene, interface."},
      {id:"mo-g12", tier:"gold", q:"\"Antibiotic\" breaks into anti (against) + bio (life) + tic. It means…", opts:["pro-life","working against living organisms (e.g., bacteria)","ancient","artificial"], a:1, explain:"Anti (against) + bio (life) + tic (adjective suffix) = against living things. Antibiotics work against bacteria. Same anti- in anti-aircraft, antibody, antiseptic, antifreeze."},

      // ---------- PLATINUM ----------
      {id:"mo-p01", tier:"platinum", q:"In English, what proportion of academic vocabulary in middle and upper grades has Greek or Latin origins?", opts:["~10%","approximately 60-80%","none","all"], a:1, explain:"English academic vocabulary is heavily Greco-Latin. By middle school, the texts students encounter are dense with Greek/Latin morphemes. Morphology instruction in grades 3-8 yields outsized vocabulary growth."},
      {id:"mo-p02", tier:"platinum", q:"\"Morphological awareness\" is a strong predictor of…", opts:["spelling only","reading comprehension AND vocabulary growth, especially in grades 4+","decoding only","speed"], a:1, explain:"Children with strong morphological awareness understand more of what they read and acquire new words faster. The skill is especially predictive in upper elementary and middle school, when academic vocabulary explodes."},
      {id:"mo-p03", tier:"platinum", q:"Why is morphology often taught poorly in American schools?", opts:["it isn't","systematic morphology instruction is missing from most elementary curricula above grade 3","it's too hard","random"], a:1, explain:"Henry, Carlisle, Bowers, and others document this gap. Phonics receives explicit attention K-2; morphology is often absent or incidental K-12. Closing this gap is one of the cheapest high-leverage moves in reading instruction."},
      {id:"mo-p04", tier:"platinum", q:"\"Word matrix\" or \"word sum\" instruction (Pete Bowers) involves…", opts:["math","showing the morphological structure of a base word and the affixes that combine with it","spelling tests","reading aloud"], a:1, explain:"Word matrix: a visual showing a base + the prefixes and suffixes that combine with it. Sign + un-, -er, -ed, -ing, -al, -ature, -ify, re-, de-, con- = unsign, signer, signed, signal, signature, signify, resign, consign, etc. One base, dozens of words made visible."},
      {id:"mo-p05", tier:"platinum", q:"Why does morphology instruction support spelling AND vocabulary AND comprehension simultaneously?", opts:["coincidence","morphemes are stable units of meaning AND spelling — understanding 'sign' explains its spelling across signal, signature, etc., AND its meaning, AND its appearance in unfamiliar words","just spelling","just vocabulary"], a:1, explain:"Morphemes are units of meaning that preserve spelling across derivations. Sign keeps its s-i-g-n in signal, signature, design (even though pronunciations vary). Knowing the morpheme explains the spelling pattern AND the meaning connection across words."},
      {id:"mo-p06", tier:"platinum", q:"Why are cognates between English and Spanish (or other Romance languages) particularly valuable for EL students?", opts:["they aren't","approximately 40% of English academic vocabulary has Romance-language cognates — ELs already know these words in their L1","ELs avoid them","tradition"], a:1, explain:"Información-information, fundamental-fundamental, característica-characteristic, importante-important. ELs often already know the meaning; they need the English form. Cognate instruction is high-leverage for EL vocabulary."},
      {id:"mo-p07", tier:"platinum", q:"The principle that English spelling represents MEANING (morphemes) rather than just SOUND is called…", opts:["phonics","the morphophonemic principle of English spelling","irregular","random"], a:1, explain:"English spelling is morphophonemic: it represents both sound AND meaning. Same morpheme keeps its spelling across pronunciation changes (sign / signature; nation / national). Once you see this, English spelling becomes more predictable, not less."},
      {id:"mo-p08", tier:"platinum", q:"For a struggling adolescent reader with intact decoding but weak vocabulary, what's the highest-leverage morphology intervention?", opts:["spelling drill","explicit teaching of 20-30 high-frequency Greek/Latin roots + common prefixes/suffixes + practice with unfamiliar word inference","translate to Spanish","skip morphology"], a:1, explain:"A small set of high-utility morphemes (anti-, inter-, sub-, trans-, -tion, -able, port, dict, spec, scrib, etc.) opens thousands of academic words. Direct instruction + application practice = rapid growth at this age."},
      {id:"mo-p09", tier:"platinum", q:"Why is morphology more valuable for adult literacy learners than for K-2 students?", opts:["it isn't","K-2 vocabulary is mostly Anglo-Saxon and monosyllabic; adult and academic vocabulary is heavily Greek/Latin and morphologically rich","adults learn faster","tradition"], a:1, explain:"Early reading vocabulary (the, dog, run, jump, ball) is mostly Anglo-Saxon. Academic, technical, and professional vocabulary is heavily Greek/Latin. Adult learners targeting workplace literacy benefit enormously from morphology — it unlocks the words their lives demand."},
      {id:"mo-p10", tier:"platinum", q:"Knowing the root \"scribe/script\" unlocks how many common English words approximately?", opts:["2-3","at least 20-30 high-frequency words (manuscript, transcribe, prescribe, describe, scripture, inscription, conscription, subscriber, scribble, etc.)","100+","just one"], a:1, explain:"Roots branch productively. Scribe/script appears in dozens of common words. Twenty well-chosen roots open hundreds of academic words. The leverage is enormous."},
      {id:"mo-p11", tier:"platinum", q:"\"Structured Word Inquiry\" (Bowers) approaches morphology by…", opts:["memorization","investigating the etymology and morphological structure of words as inquiry — asking what a word means, how it's spelled, what its root is, what related words exist","spelling tests","memorizing lists"], a:1, explain:"SWI treats words as objects of investigation, like science. Students ask: what does it mean? what's its base? what affixes? what other words come from this base? It builds morphological awareness through curiosity rather than drill."},
      {id:"mo-p12", tier:"platinum", q:"In the Simple View of Reading framework, morphological knowledge contributes to…", opts:["decoding only","decoding (especially of multisyllabic words) AND language comprehension (vocabulary) — both factors","language comprehension only","neither"], a:1, explain:"Morphology helps decode big words (recognize chunks: pre-scrip-tion) AND understand their meaning (pre + scribe + tion = something written before). It boosts BOTH sides of the SVR equation — unusually high-leverage."}
    ]
  }
];

// ============== STATE ==============================================
const state = {
  user:null, isAnonymous:true, syncing:false,
  // scores: { slug: { points, attempts, tier, questionTier, highestTier, bestPoints } }
  //   tier          = medal earned in the most recent session (none|bronze|silver|gold|platinum)
  //   questionTier  = which difficulty tier the player is currently drawing from
  //   highestTier   = highest difficulty tier the player has UNLOCKED on this pillar
  //   bestPoints    = best session points on the current questionTier
  scores:{},
  // seen: { slug: ["pa-b01","pa-s05",...] } — resets within tier when that tier's pool exhausts
  seen:{},
  view:"picker", activeIdx:null,
  sessionQs:[], sessionQIdx:0, sessionPoints:0, sessionCorrect:0,
  currentQShuffled:null,
};

function tierFor(points){
  const max = POINTS_PER_Q * SESSION_LEN; // 60
  const pct = (points / max) * 100;
  if (pct === 100) return "platinum";
  if (pct >= 85)  return "gold";
  if (pct >= 70)  return "silver";
  if (pct >= 50)  return "bronze";
  return "none";
}

function totalScore(){
  return Object.values(state.scores).reduce((s,p)=> s + (p.bestPoints || p.points || 0), 0);
}

function questionTierFor(slug){
  return state.scores[slug]?.questionTier || "bronze";
}

function highestTierFor(slug){
  return state.scores[slug]?.highestTier || "none";
}

// ============== FIREBASE ===========================================
let app, auth, db; let firebaseReady = false;
try {
  app  = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(app);
  db   = getFirestore(app);
  firebaseReady = true;
} catch(e){
  console.error("[HelixClimb] Firebase init failed:", e);
  setAuthState("Setup needed: replace Firebase config", "error");
}

async function loadUserDoc(uid){
  try {
    const snap = await getDoc(doc(db,"users",uid));
    if (snap.exists()){
      const d = snap.data();
      if (d.helixClimb){
        if (d.helixClimb.pillars) state.scores = d.helixClimb.pillars;
        if (d.helixClimb.seen)    state.seen   = d.helixClimb.seen;
      }
    }
  } catch(e){ console.error("[HelixClimb] Firestore load failed:", e); }
}

async function saveUserDoc(){
  if (!state.user) return;
  state.syncing = true;
  setAuthState(authLabel(),"syncing");
  try {
    await setDoc(doc(db,"users",state.user.uid),{
      helixClimb:{
        pillars: state.scores,
        seen:    state.seen,
        totalScore: totalScore(),
        lastUpdated: serverTimestamp(),
      }
    },{ merge:true });
    setAuthState(authLabel(),"synced");
  } catch(e){
    console.error("[HelixClimb] Firestore save failed:", e);
    setAuthState("Save failed — check connection","error");
  } finally { state.syncing = false; }
}

function authLabel(){
  if (!state.user) return "Connecting…";
  if (state.isAnonymous) return "Playing as guest · synced";
  return `Signed in · ${state.user.displayName||state.user.email||"synced"}`;
}

function setAuthState(text, kind){
  const el = document.getElementById("hc-auth-state");
  if (!el) return;
  const textEl = document.getElementById("hc-auth-text");
  if (textEl) textEl.textContent = text;
  el.className = "hc-auth-state " + (kind||"");
  const btn = document.getElementById("hc-banner-signin");
  if (!btn) return;
  if (state.user && !state.isAnonymous){
    btn.textContent = "Signed in";
    btn.disabled = true;
  } else if (state.user && state.isAnonymous){
    btn.textContent = "Sign in to sync";
    btn.disabled = false;
  }
}

async function googleSignIn(){
  if (!state.user || !state.isAnonymous) return;
  const provider = new GoogleAuthProvider();
  try {
    await linkWithPopup(state.user, provider);
    setAuthState(authLabel(),"synced");
  } catch(e){
    console.warn("[HelixClimb] Link failed, trying signIn:", e.code);
    try { await signInWithPopup(auth, provider); }
    catch(e2){
      console.error("[HelixClimb] Google sign-in failed:", e2);
      setAuthState("Sign-in cancelled","error");
    }
  }
}

if (firebaseReady){
  onAuthStateChanged(auth, async (user)=>{
    if (user){
      state.user = user;
      state.isAnonymous = user.isAnonymous;
      await loadUserDoc(user.uid);
      setAuthState(authLabel(),"synced");
      render();
    } else {
      try { await signInAnonymously(auth); }
      catch(e){
        console.error("[HelixClimb] Anon auth failed:", e);
        setAuthState("Sign-in failed","error");
      }
    }
  });
  const signinBtn = document.getElementById("hc-banner-signin");
  if (signinBtn) signinBtn.addEventListener("click", googleSignIn);
}

// ============== QUESTION SELECTION (tier-progressive, no-repeat) ====
function pickSessionQuestions(slug){
  const pillar = PILLARS.find(p => p.slug === slug);
  const playerTier = questionTierFor(slug);
  // Filter pillar's questions to the player's current tier
  const tierPool = pillar.qs.filter(q => q.tier === playerTier);
  // Apply seen filter
  const seenIds = new Set(state.seen[slug] || []);
  let fresh = tierPool.filter(q => !seenIds.has(q.id));
  // If pool exhausted within this tier, reset seen for that tier only
  if (fresh.length < SESSION_LEN){
    const tierIds = new Set(tierPool.map(q => q.id));
    state.seen[slug] = (state.seen[slug] || []).filter(id => !tierIds.has(id));
    fresh = tierPool.slice();
  }
  // Random sample of SESSION_LEN
  const session = fresh.slice().sort(()=> Math.random() - 0.5).slice(0, SESSION_LEN);
  if (!state.seen[slug]) state.seen[slug] = [];
  session.forEach(q => state.seen[slug].push(q.id));
  return session;
}

function shuffleQuestion(q){
  const indexed = q.opts.map((opt,i) => ({ opt, isCorrect: i === q.a }));
  indexed.sort(()=> Math.random() - 0.5);
  const opts = indexed.map(x => x.opt);
  const a = indexed.findIndex(x => x.isCorrect);
  return { ...q, opts, a };
}

// ============== RENDER =============================================
const stage = document.getElementById("hc-stage");

function render(){
  drawHelix();
  const scoreEl = document.getElementById("hc-total-score");
  if (scoreEl) scoreEl.textContent = totalScore();
  if (state.view === "picker") return renderPicker();
  if (state.view === "lesson") return renderLesson();
  if (state.view === "quiz")   return renderQuiz();
  if (state.view === "result") return renderResult();
}

function renderPicker(){
  const tiles = PILLARS.map((p,i)=>{
    const score = state.scores[p.slug];
    const playerTier = questionTierFor(p.slug);
    const highest = highestTierFor(p.slug);
    const badge = highest !== "none" ? `<span class="tile-tier ${highest}">${highest}</span>` : "";
    const bestOnTier = score?.bestPoints || 0;
    const tierLabel = playerTier.charAt(0).toUpperCase() + playerTier.slice(1);
    const note = score
      ? `${tierLabel} questions · best ${bestOnTier}/60`
      : `Bronze questions · 50+ in the bank`;
    return `<button class="hc-tile" data-idx="${i}" type="button">
      <div class="tile-num">Element ${String(i+1).padStart(2,"0")} · ${p.tag}</div>
      <div class="tile-name">${p.name}</div>
      <div class="tile-tag">${note}</div>
      ${badge}
    </button>`;
  }).join("");
  stage.innerHTML = `<div class="hc-picker">
    <div class="hc-picker-eyebrow">Pick your pillar</div>
    <h3>Where do you want to climb today?</h3>
    <p class="lead">Any element, any order. Six questions per session, drawn fresh from your current difficulty tier. Earn Silver or better to advance — Bronze → Silver → Gold → Platinum.</p>
    <div class="hc-tiles">${tiles}</div>
  </div>`;
  stage.querySelectorAll(".hc-tile").forEach(t=>{
    t.addEventListener("click",()=>{
      state.activeIdx = +t.dataset.idx;
      state.view = "lesson";
      render();
    });
  });
}

function renderLesson(){
  const p = PILLARS[state.activeIdx];
  const playerTier = questionTierFor(p.slug);
  const tierLabel = playerTier.charAt(0).toUpperCase() + playerTier.slice(1);
  stage.innerHTML = `<div class="hc-lesson">
    <div class="crumb"><a id="hc-back" style="cursor:pointer;color:var(--teal);text-decoration:underline;">← All pillars</a> · Element ${String(state.activeIdx+1).padStart(2,"0")} · <strong style="color:var(--gold);">${tierLabel} Tier</strong></div>
    <h3>${p.name}</h3>
    <div class="lesson-body" style="color:#E5E5E5;font-size:16px;line-height:1.7;margin:16px 0 28px;">${p.lesson}</div>
    <div class="hc-lesson-actions" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
      <button class="hc-next" type="button" id="hc-start">Begin the quiz · ${SESSION_LEN} questions</button>
      <a class="hc-geno-mini" href="${GENO_URL}" target="_blank" rel="noopener">🎙️ Talk this pillar through with GENO</a>
    </div>
  </div>`;
  document.getElementById("hc-back").addEventListener("click",()=>{
    state.view="picker"; render();
  });
  document.getElementById("hc-start").addEventListener("click",()=>{
    state.sessionQs = pickSessionQuestions(p.slug);
    state.sessionQIdx = 0;
    state.sessionPoints = 0;
    state.sessionCorrect = 0;
    state.view = "quiz";
    render();
  });
}

function renderQuiz(){
  const p = PILLARS[state.activeIdx];
  const rawQ = state.sessionQs[state.sessionQIdx];
  state.currentQShuffled = shuffleQuestion(rawQ);
  const q = state.currentQShuffled;
  const pct = (state.sessionQIdx / SESSION_LEN) * 100;
  const opts = q.opts.map((opt,i)=>
    `<button class="hc-opt" data-i="${i}" type="button" style="display:block;width:100%;text-align:left;background:#000;border:1px solid var(--line);border-radius:6px;padding:14px 18px;margin-bottom:10px;color:var(--text);font-family:inherit;font-size:15px;cursor:pointer;transition:all 0.2s;position:relative;">${opt}</button>`
  ).join("");
  stage.innerHTML = `<div class="hc-quiz">
    <div class="hc-progress" style="display:flex;align-items:center;gap:16px;margin-bottom:24px;font-size:13px;color:var(--muted);">
      <span>${p.name} · ${q.tier.charAt(0).toUpperCase()+q.tier.slice(1)}</span>
      <div class="hc-progress-bar" style="flex:1;height:4px;background:var(--line);border-radius:2px;overflow:hidden;">
        <div class="fill" style="width:${pct}%;height:100%;background:var(--gold);transition:width 0.3s;"></div>
      </div>
      <span>Q${state.sessionQIdx+1} / ${SESSION_LEN}</span>
    </div>
    <div class="hc-question" style="font-size:20px;font-weight:600;color:var(--text);margin-bottom:24px;line-height:1.4;">${q.q}</div>
    <div class="hc-options" id="hc-options">${opts}</div>
    <div id="hc-explain-slot"></div>
    <div class="hc-quiz-actions">
      <a class="hc-geno-mini" id="hc-geno-q" href="${GENO_URL}" target="_blank" rel="noopener">🎙️ Ask GENO to explain</a>
      <button class="hc-next" id="hc-next" type="button" style="display:none;">${state.sessionQIdx === SESSION_LEN-1 ? "See your tier →" : "Next question →"}</button>
    </div>
  </div>`;
  document.querySelectorAll("#hc-options .hc-opt").forEach(btn=>{
    btn.addEventListener("mouseenter",()=>{ if (!btn.disabled) btn.style.borderColor = "var(--teal)"; });
    btn.addEventListener("mouseleave",()=>{ if (!btn.disabled) btn.style.borderColor = "var(--line)"; });
    btn.addEventListener("click",()=> handleAnswer(+btn.dataset.i, btn));
  });
}

function handleAnswer(chosen, btn){
  const q = state.currentQShuffled;
  const correct = chosen === q.a;
  document.querySelectorAll("#hc-options .hc-opt").forEach((el,i)=>{
    el.disabled = true;
    if (i === q.a) el.classList.add("correct");
    else if (i === chosen) el.classList.add("wrong");
  });
  if (correct){
    state.sessionCorrect++;
    state.sessionPoints += POINTS_PER_Q;
    burstParticles(btn);
  } else {
    btn.classList.add("hc-shake");
  }
  document.getElementById("hc-explain-slot").innerHTML =
    `<div class="hc-explain"><strong style="color:${correct?'var(--correct)':'var(--gold)'};">${correct?"Right.":"Not quite."}</strong> ${q.explain}</div>`;
  const nextBtn = document.getElementById("hc-next");
  nextBtn.style.display = "inline-block";
  nextBtn.addEventListener("click", advance, { once:true });
}

function advance(){
  state.sessionQIdx++;
  if (state.sessionQIdx >= SESSION_LEN){
    const slug = PILLARS[state.activeIdx].slug;
    const newPoints = state.sessionPoints;
    const medal = tierFor(newPoints);
    const prev = state.scores[slug] || { questionTier:"bronze", highestTier:"none", bestPoints:0, attempts:0 };

    // Tier advancement: Silver+ medal on current tier unlocks next tier
    const currentTierIdx = TIER_ORDER.indexOf(prev.questionTier);
    const medalIdx = TIER_ORDER.indexOf(medal);
    const earnedAdvance = medalIdx >= 1; // silver or better
    let newQuestionTier = prev.questionTier;
    if (earnedAdvance && currentTierIdx < TIER_ORDER.length - 1){
      newQuestionTier = TIER_ORDER[currentTierIdx + 1];
    }

    // Highest tier earned on this pillar (for badge display)
    const prevHighestIdx = TIER_ORDER.indexOf(prev.highestTier);
    const newHighestIdx = Math.max(prevHighestIdx, medalIdx);
    const newHighest = newHighestIdx >= 0 ? TIER_ORDER[newHighestIdx] : "none";

    // Best points on the tier just played
    const isSameTier = prev.questionTier === newQuestionTier; // didn't advance
    const newBestPoints = isSameTier ? Math.max(prev.bestPoints||0, newPoints) : newPoints;

    state.scores[slug] = {
      points: newPoints,
      bestPoints: newBestPoints,
      tier: medal,
      questionTier: newQuestionTier,
      highestTier: newHighest,
      correct: state.sessionCorrect,
      total: SESSION_LEN,
      attempts: (prev.attempts||0) + 1,
    };

    state.view = "result";
    saveUserDoc();
    render();
    if (medal === "platinum") fireConfetti();
  } else {
    render();
  }
}

function renderResult(){
  const p = PILLARS[state.activeIdx];
  const slug = p.slug;
  const result = state.scores[slug];
  const medal = result.tier;
  const playedTier = TIER_ORDER[Math.max(0, TIER_ORDER.indexOf(result.questionTier) - (medal !== "none" && TIER_ORDER.indexOf(medal) >= 1 ? 1 : 0))];
  const advanced = playedTier !== result.questionTier;
  const tierCopy = {
    platinum: advanced
      ? `A perfect climb on ${playedTier} questions. You've unlocked ${result.questionTier} — the hardest tier.`
      : "A perfect climb. You're at the top of this pillar.",
    gold: advanced
      ? `Mastery on ${playedTier} questions. You've unlocked ${result.questionTier}.`
      : "Mastery. One or two retries away from a perfect climb.",
    silver: advanced
      ? `Solid footing on ${playedTier}. You've unlocked ${result.questionTier}.`
      : "Solid footing. Take it again and push for gold.",
    bronze:   "You're on the page. Run the lesson again and the score will move.",
    none:     "Below tier. Re-read the lesson, ask GENO to walk through the tough ones, and try again."
  }[medal];
  const medalLabel = medal === "none" ? "Keep Climbing" : medal;
  stage.innerHTML = `<div class="hc-result">
    <div class="tier-medal ${medal}">${medalLabel}</div>
    <h3>${p.name}</h3>
    <div class="score-line">${state.sessionPoints} / ${POINTS_PER_Q * SESSION_LEN} this round · best ${result.bestPoints} / ${POINTS_PER_Q * SESSION_LEN}</div>
    <p class="note">${tierCopy}</p>
    <div class="actions">
      <button class="btn-primary" type="button" id="hc-next-pillar">${nextPillarLabel()}</button>
      <button class="btn-secondary" type="button" id="hc-retry">Play again — fresh questions</button>
      <button class="btn-secondary" type="button" id="hc-back-to-picker">All pillars</button>
      <a class="btn-secondary" style="text-decoration:none;display:inline-block;" href="${GENO_URL}" target="_blank" rel="noopener">🎙️ Review with GENO</a>
    </div>
  </div>`;
  document.getElementById("hc-retry").addEventListener("click",()=>{ state.view="lesson"; render(); });
  document.getElementById("hc-back-to-picker").addEventListener("click",()=>{ state.view="picker"; render(); });
  document.getElementById("hc-next-pillar").addEventListener("click",()=>{
    const nextIdx = nextUnfinishedIdx();
    if (nextIdx === null){ state.view = "picker"; render(); return; }
    state.activeIdx = nextIdx; state.view = "lesson"; render();
  });
}

function nextUnfinishedIdx(){
  for (let offset=1; offset<=PILLARS.length; offset++){
    const idx = (state.activeIdx + offset) % PILLARS.length;
    const s = state.scores[PILLARS[idx].slug];
    if (!s || s.highestTier !== "platinum") return idx;
  }
  return null;
}
function nextPillarLabel(){
  const idx = nextUnfinishedIdx();
  if (idx === null) return "🏆 You've platinumed the Helix";
  return `Next pillar: ${PILLARS[idx].name} →`;
}

// ============== HELIX SVG (8 nodes for 8 pillars) ===================
function drawHelix(){
  const g = document.getElementById("hc-rings");
  if (!g) return;
  // 8 positions along the helix spine — alternating left/center/right pattern
  // SVG viewBox is 0 0 280 560; we extend below 560 by ~30px for the 8th node
  const positions = [
    { x:140, y:50  },{ x:80,  y:115 },{ x:200, y:180 },{ x:140, y:245 },
    { x:80,  y:310 },{ x:200, y:375 },{ x:140, y:440 },{ x:80,  y:505 }
  ];
  let html = "";
  PILLARS.forEach((p,i)=>{
    const score = state.scores[p.slug];
    const highest = score ? score.highestTier : "none";
    const isCurrent = state.activeIdx === i && state.view !== "picker";
    const cls = isCurrent ? "current" : (highest === "none" ? "" : highest);
    const pos = positions[i];
    html += `<g class="node">
      <circle class="ring ${cls}" cx="${pos.x}" cy="${pos.y}" r="22"></circle>
      <text x="${pos.x}" y="${pos.y+4}" text-anchor="middle">${i+1}</text>
    </g>`;
  });
  g.innerHTML = html;
}

// ============== PARTICLES & CONFETTI ===============================
const pcv = document.getElementById("hc-particles");
const pctx = pcv ? pcv.getContext("2d") : null;
function sizeCanvas(c){
  if (!c || !c.parentElement) return;
  const r = c.parentElement.getBoundingClientRect();
  c.width = r.width; c.height = r.height;
}
window.addEventListener("resize",()=>{
  sizeCanvas(pcv);
  sizeCanvas(document.getElementById("hc-confetti"));
});
setTimeout(()=>{
  sizeCanvas(pcv);
  sizeCanvas(document.getElementById("hc-confetti"));
}, 200);

let particles = [];
function burstParticles(originEl){
  if (!pctx) return;
  const panel = document.getElementById("hc-panel").getBoundingClientRect();
  const rect  = originEl.getBoundingClientRect();
  const ox = rect.left - panel.left + rect.width/2;
  const oy = rect.top  - panel.top  + rect.height/2;
  for (let i=0;i<32;i++){
    const a = Math.random()*Math.PI*2;
    const s = 2 + Math.random()*4;
    particles.push({
      x:ox, y:oy,
      vx:Math.cos(a)*s, vy:Math.sin(a)*s,
      life:1,
      color: Math.random() < 0.5 ? "#C9A84C" : "#1A8B7F"
    });
  }
  if (particles.length === 32) requestAnimationFrame(animateParticles);
}
function animateParticles(){
  if (!pctx) return;
  pctx.clearRect(0,0,pcv.width,pcv.height);
  particles = particles.filter(p=>{
    p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.life-=0.018;
    if (p.life<=0) return false;
    pctx.globalAlpha = p.life;
    pctx.fillStyle = p.color;
    pctx.beginPath();
    pctx.arc(p.x,p.y,3,0,Math.PI*2);
    pctx.fill();
    return true;
  });
  pctx.globalAlpha = 1;
  if (particles.length) requestAnimationFrame(animateParticles);
}

const ccv = document.getElementById("hc-confetti");
const cctx = ccv ? ccv.getContext("2d") : null;
let confetti = [];
function fireConfetti(){
  if (!cctx) return;
  const colors = ["#C9A84C","#1A8B7F","#E5E4E2","#FFFFFF"];
  for (let i=0;i<140;i++){
    confetti.push({
      x: Math.random()*ccv.width,
      y: -20 - Math.random()*200,
      vx: -2 + Math.random()*4,
      vy: 2 + Math.random()*3,
      rot: Math.random()*Math.PI,
      vr: -0.1 + Math.random()*0.2,
      size: 4 + Math.random()*6,
      color: colors[Math.floor(Math.random()*colors.length)]
    });
  }
  requestAnimationFrame(animateConfetti);
}
function animateConfetti(){
  if (!cctx) return;
  cctx.clearRect(0,0,ccv.width,ccv.height);
  confetti = confetti.filter(p=>{
    p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.vy*=0.995;
    if (p.y > ccv.height + 40) return false;
    cctx.save();
    cctx.translate(p.x,p.y);
    cctx.rotate(p.rot);
    cctx.fillStyle = p.color;
    cctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
    cctx.restore();
    return true;
  });
  if (confetti.length) requestAnimationFrame(animateConfetti);
}

// ============== BOOTSTRAP ==========================================
render();
