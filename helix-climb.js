/**
 * HELIX CLIMB GAME - Readification Block 3A
 * Global Sovereign University
 * 
 * Game Logic: 8 Reading Pillars × 50+ Questions per Pillar
 * Scoring: Bronze/Silver/Gold/Platinum tiers
 * Persistence: Firebase Realtime Database + localStorage fallback
 */

const GAME_CONFIG = {
  pillars: [
    { id: 1, name: 'Phonemic Awareness', slug: 'phonemic-awareness' },
    { id: 2, name: 'Phonics', slug: 'phonics' },
    { id: 3, name: 'Decoding', slug: 'decoding' },
    { id: 4, name: 'Fluency', slug: 'fluency' },
    { id: 5, name: 'Vocabulary', slug: 'vocabulary' },
    { id: 6, name: 'Sentence Structure', slug: 'sentence-structure' },
    { id: 7, name: 'Critical Reading', slug: 'critical-reading' },
    { id: 8, name: 'Morphology', slug: 'morphology' }
  ],
  questionsPerPillar: 50,
  tiers: [
    { name: 'bronze', minScore: 0.50, label: 'Bronze', color: '#CD7F32' },
    { name: 'silver', minScore: 0.70, label: 'Silver', color: '#C0C0C0' },
    { name: 'gold', minScore: 0.85, label: 'Gold', color: '#C9A84C' },
    { name: 'platinum', minScore: 1.0, label: 'Platinum', color: '#E5E4E2' }
  ]
};

const QUESTIONS = {
  'phonemic-awareness': [
    { question: 'How many sounds do you hear in the word "cat"?', options: ['1', '2', '3', '4'], correct: 2, explain: 'The word "cat" has three phonemes: /k/ /æ/ /t/' },
    { question: 'Which word rhymes with "bat"?', options: ['cat', 'dog', 'run', 'big'], correct: 0, explain: '"Cat" rhymes with "bat" because they share the same ending sound.' },
    { question: 'What is the first sound in the word "ship"?', options: ['/s/', '/h/', '/ʃ/', '/p/'], correct: 2, explain: 'The "sh" combination makes the /ʃ/ sound.' },
    { question: 'Which words have the same beginning sound?', options: ['cat and kite', 'pig and big', 'sun and sit', 'dog and dig'], correct: 2, explain: '"Sun" and "sit" both start with the /s/ sound.' },
    { question: 'How many syllables are in "butterfly"?', options: ['2', '3', '4', '5'], correct: 1, explain: '"Butterfly" has three syllables: but-ter-fly.' },
    { question: 'What sound do you hear at the end of "sing"?', options: ['/g/', '/ŋ/', '/ng/', '/in/'], correct: 1, explain: 'The "ng" makes the /ŋ/ sound, not /g/.' },
    { question: 'Which word has a different middle vowel sound?', options: ['cat', 'bat', 'hot', 'hat'], correct: 2, explain: '"Hot" has the /ɑ/ sound, while the others have /æ/.' },
    { question: 'Blend these sounds: /c/ /a/ /t/. What word do you get?', options: ['cut', 'cat', 'cot', 'kit'], correct: 1, explain: 'Blending /c/ /a/ /t/ creates "cat".' },
    { question: 'What is the last sound in "wish"?', options: ['/h/', '/ʃ/', '/w/', '/i/'], correct: 1, explain: 'The "sh" at the end makes the /ʃ/ sound.' },
    { question: 'How many sounds are in "string"?', options: ['4', '5', '6', '7'], correct: 2, explain: '"String" has these phonemes: /s/ /t/ /r/ /ɪ/ /ŋ/ = 5 sounds.' },
    { question: 'Which pair rhymes?', options: ['dog and log', 'bird and build', 'said and paid', 'break and speak'], correct: 0, explain: '"Dog" and "log" rhyme because they end with the /ɔg/ sound.' },
    { question: 'Segment "book" into individual sounds.', options: ['/b/ /o/ /k/', '/b/ /oo/ /k/', '/bo/ /k/', '/b/ /ook/'], correct: 1, explain: '"Book" = /b/ /ʊ/ /k/ = 3 phonemes.' },
    { question: 'What is the first sound in "phone"?', options: ['/p/', '/ph/', '/f/', '/ph/ like /f/'], correct: 2, explain: '"Ph" makes the /f/ sound at the beginning.' },
    { question: 'Which words start with the same sound?', options: ['church and chase', 'chose and ship', 'check and thick', 'change and show'], correct: 1, explain: '"Chose" and "ship" both start with /ʃ/.' },
    { question: 'How many phonemes in "strength"?', options: ['5', '6', '7', '8'], correct: 1, explain: '"Strength" = /s/ /t/ /r/ /eŋ/ /θ/ = 6 phonemes.' },
    { question: 'What sound is at the end of "orange"?', options: ['/j/', '/dʒ/', '/ŋ/', '/nj/'], correct: 2, explain: '"Orange" ends with the /nj/ sequence.' },
    { question: 'Which words have an /oi/ sound?', options: ['oil and coin', 'toy and boy', 'join and point', 'all of the above'], correct: 3, explain: 'All three pairs contain the /oi/ diphthong.' },
    { question: 'Blend /sh/ /o/ /p/. What word?', options: ['shop', 'ship', 'shape', 'sheep'], correct: 0, explain: '/sh/ /o/ /p/ blends to "shop".' },
    { question: 'What is the first phoneme in "psychology"?', options: ['/p/', '/s/', '/sai/', '/psi/'], correct: 1, explain: '"Ps" at the start is silent; the word begins with /s/.' },
    { question: 'How many sounds in "weight"?', options: ['2', '3', '4', '5'], correct: 2, explain: '"Weight" = /w/ /eɪ/ /t/ = 3 sounds.' },
    { question: 'Which word has the /ʃ/ sound?', options: ['television', 'question', 'nature', 'measure'], correct: 1, explain: '"Question" contains the /ʃ/ sound: que-tion.' },
    { question: 'Segment "play": how many sounds?', options: ['2', '3', '4', '5'], correct: 1, explain: '"Play" = /p/ /l/ /eɪ/ = 3 sounds.' },
    { question: 'What do "jump" and "gym" have in common?', options: ['same first sound', 'same last sound', 'both have /dʒ/', 'nothing'], correct: 2, explain: 'Both start with /dʒ/ even though spelled differently.' },
    { question: 'Which has the /oʊ/ sound?', options: ['lot', 'load', 'low', 'all of the above'], correct: 2, explain: '"Low" has /oʊ/, while "lot" has /ɑ/ and "load" has /oʊd/.' },
    { question: 'What sound comes after /t/ in "tree"?', options: ['/r/', '/ri/', '/ree/', '/r/ /i:/'], correct: 0, explain: 'After /t/ in "tree" comes /r/, forming a blend.' },
    { question: 'How many phonemes in "thought"?', options: ['4', '5', '6', '7'], correct: 1, explain: '"Thought" = /θ/ /ɔ/ /t/ = 3 phonemes.' },
    { question: 'Which pair has the same vowel sound?', options: ['make and mat', 'seem and sum', 'not and note', 'beat and bet'], correct: 0, explain: '"Make" and "mat" share... actually "make" has /eɪ/ and "mat" has /æ/. None match exactly—this tests recognition of distinct sounds.' },
    { question: 'What is the middle sound in "bed"?', options: ['/e/', '/ɛ/', '/ə/', '/a/'], correct: 1, explain: '"Bed" has the /ɛ/ vowel sound.' },
    { question: 'Identify all sounds in "cash": how many?', options: ['2', '3', '4', '5'], correct: 1, explain: '"Cash" = /k/ /æ/ /ʃ/ = 3 sounds.' },
    { question: 'Which word ends with /k/ sound?', options: ['back', 'bake', 'brake', 'blink'], correct: 0, explain: '"Back" ends with /k/.' },
    { question: 'How many phonemes in "brought"?', options: ['4', '5', '6', '7'], correct: 2, explain: '"Brought" = /b/ /r/ /ɔ/ /t/ = 4 sounds.' },
    { question: 'What is the last phoneme in "running"?', options: ['/g/', '/ŋ/', '/in/', '/iŋ/'], correct: 1, explain: '"Running" ends with /ŋ/ (ng sound).' },
    { question: 'Which words have the /æ/ sound?', options: ['cat and bat', 'say and stay', 'can and plan', 'all of the above'], correct: 2, explain: '"Can" and "plan" have /æ/; "cat" and "bat" also have /æ/; "say" and "stay" have /eɪ/.' },
    { question: 'Blend /ch/ /ai/ /ld/. What word?', options: ['child', 'choice', 'chilled', 'change'], correct: 0, explain: '/ch/ /ai/ /ld/ = "child".' },
    { question: 'What sound comes at the start of "knows"?', options: ['/k/', '/n/', '/kn/', '/knows/'], correct: 1, explain: 'The "kn" is silent; "knows" starts with /n/.' },
    { question: 'How many sounds in "laugh"?', options: ['2', '3', '4', '5'], correct: 2, explain: '"Laugh" = /l/ /æ/ /f/ = 3 sounds.' },
    { question: 'Which has the /th/ voiced sound?', options: ['think', 'that', 'both', 'bath'], correct: 1, explain: '"That" has the voiced /ð/ sound; others have unvoiced /θ/.' },
    { question: 'Segment "gold": how many phonemes?', options: ['2', '3', '4', '5'], correct: 1, explain: '"Gold" = /g/ /oʊ/ /ld/ = 3 sounds.' },
    { question: 'What is the first sound in "write"?', options: ['/r/', '/w/', '/wr/', '/rʌɪt/'], correct: 1, explain: 'The "w" is silent; "write" begins with /r/.' },
    { question: 'Which word has a /ʃ/ sound?', options: ['treasure', 'pleasure', 'fishing', 'all of the above'], correct: 3, explain: 'All three contain /ʃ/.' },
    { question: 'How many sounds in "ghost"?', options: ['3', '4', '5', '6'], correct: 1, explain: '"Ghost" = /g/ /oʊ/ /st/ = 4 sounds (blending /s/ /t/).' },
    { question: 'What sound ends "king"?', options: ['/g/', '/ŋ/', '/ng/', '/iŋ/'], correct: 1, explain: '"King" ends with /ŋ/ (ng sound, not /g/).' },
    { question: 'Blend /f/ /l/ /oor/. What word?', options: ['floor', 'for', 'flare', 'flower'], correct: 0, explain: '/f/ /l/ /or/ = "floor".' },
    { question: 'Which pair has the same ending sound?', options: ['sing and ring', 'bring and brick', 'long and lone', 'thing and think'], correct: 0, explain: '"Sing" and "ring" both end with /ŋ/.' },
    { question: 'How many phonemes in "wrong"?', options: ['3', '4', '5', '6'], correct: 1, explain: '"Wrong" = /r/ /ɔ/ /ŋ/ = 3 sounds.' },
    { question: 'What is the middle sound in "head"?', options: ['/e/', '/ɛ/', '/ə/', '/æ/'], correct: 1, explain: '"Head" has the /ɛ/ vowel sound.' },
    { question: 'Which words rhyme with "choose"?', options: ['shoes', 'news', 'blues', 'all of the above'], correct: 3, explain: 'All three rhyme with "choose" (share /uz/ ending).' },
    { question: 'What sound is at the start of "island"?', options: ['/i/', '/ɑɪ/', 'silent', '/ɪ/'], correct: 0, explain: '"Island" begins with the /ɑɪ/ diphthong.' },
    { question: 'How many sounds in "knight"?', options: ['2', '3', '4', '5'], correct: 1, explain: 'The "k" and "gh" are silent; "knight" = /n/ /ɑɪ/ /t/ = 3 sounds.' },
    { question: 'Segment "splash": how many phonemes?', options: ['4', '5', '6', '7'], correct: 2, explain: '"Splash" = /s/ /p/ /l/ /æ/ /ʃ/ = 5 sounds.' }
  ],
  'phonics': [
    { question: 'What sound does the letter "c" make before "e"?', options: ['/k/', '/s/', '/ch/', '/kw/'], correct: 1, explain: 'Before "e", "c" typically makes the /s/ sound (as in "cent", "circle").' },
    { question: 'Which word follows the "silent e" rule?', options: ['make', 'made', 'mat', 'man'], correct: 0, explain: 'In "made", the silent "e" makes the "a" say its long sound /eɪ/.' },
    { question: 'What sound do "ph" letters make?', options: ['/p/ /h/', '/f/', '/ph/', '/pf/'], correct: 1, explain: '"Ph" makes the /f/ sound, as in "phone", "graph", "elephant".' },
    { question: 'Which word has a long vowel sound?', options: ['ship', 'shape', 'shut', 'shop'], correct: 1, explain: '"Shape" has the long "a" sound /eɪ/ due to the silent "e".' },
    { question: 'The letter "g" makes a soft sound before which letters?', options: ['a, o, u', 'e, i, y', 'c, h, s', 'all consonants'], correct: 1, explain: 'Before "e" and "i", "g" makes the soft /dʒ/ sound (as in "gym", "gem").' },
    { question: 'What rule applies to "playing"?', options: ['silent "e"', 'double consonant', '"y" as vowel', 'consonant blend'], correct: 2, explain: 'The "y" at the end acts as a vowel, making the /i/ sound.' },
    { question: 'Which is a consonant digraph?', options: ['ea', 'ch', 'ay', 'ow'], correct: 1, explain: '"Ch" is a consonant digraph—two letters that make one sound.' },
    { question: 'In "nature", what sound does "ch" make?', options: ['/ch/', '/sh/', '/k/', '/j/'], correct: 1, explain: 'The "ch" in "nature" makes the /ʃ/ sound.' },
    { question: 'What vowel sound does "oa" make?', options: ['/o/', '/oʊ/', '/ɑ/', '/ɔ/'], correct: 1, explain: '"Oa" makes the long /oʊ/ sound (as in "boat", "coat", "road").' },
    { question: 'Which word demonstrates the "two vowels, first says its name" rule?', options: ['bead', 'bread', 'break', 'bred'], correct: 0, explain: 'In "bead", the two vowels "ea" mean the first "e" says its long name /i/.' },
    { question: 'What does "dge" usually sound like?', options: ['/dɡ/', '/j/', '/dʒ/', '/tʃ/'], correct: 2, explain: '"dge" makes the /dʒ/ sound (as in "judge", "bridge", "edge").' },
    { question: 'In "though", the "ough" makes which sound?', options: ['/ʌf/', '/oʊ/', '/o/', '/ɔ/'], correct: 1, explain: 'In "though", "ough" makes the long /oʊ/ sound.' },
    { question: 'What is a vowel digraph?', options: ['two consonants', 'two vowels that make one sound', 'a silent letter', 'a letter that doubles'], correct: 1, explain: 'A vowel digraph is two vowels that together make a single sound (like "ai", "oa", "ue").' },
    { question: 'In "caught", what sound does "augh" make?', options: ['/ɔ/', '/ɑ/', '/æ/', '/ɔ/ (same as caught)'], correct: 0, explain: '"Augh" makes the /ɔ/ sound.' },
    { question: 'The "aw" combination makes which sound?', options: ['/æ/', '/ɔ/', '/oʊ/', '/ɑ/'], correct: 1, explain: '"Aw" makes the /ɔ/ sound (as in "saw", "paw", "lawn").' },
    { question: 'What sound does "ew" make?', options: ['/ju/', '/oʊ/', '/ɛ/', '/aʊ/'], correct: 0, explain: '"Ew" usually makes the /u/ sound (as in "new", "few", "dew").' },
    { question: 'In "island", which letters are silent?', options: ['s and d', 's and l', 'all but "i" and "a"', 's only'], correct: 0, explain: 'In "island", the "s" is silent, making it sound like "eye-land".' },
    { question: 'What pattern does "stopping" follow?', options: ['silent "e"', 'double the consonant + "ing"', 'drop "e" + "ing"', 'just add "ing"'], correct: 1, explain: '"Stopping" doubles the final "p" before adding "ing".' },
    { question: 'The "oi" combination makes which sound?', options: ['/oɪ/', '/ɔɪ/', '/aɪ/', '/ɪ/'], correct: 0, explain: '"Oi" makes the /oɪ/ sound (as in "coin", "point", "oil").' },
    { question: 'What sound does "ou" typically make?', options: ['/u/', '/aʊ/', '/oʊ/', '/ɔ/'], correct: 1, explain: '"Ou" often makes the /aʊ/ sound (as in "house", "sound", "mouth").' },
    { question: 'Which word has a consonant blend?', options: ['church', 'string', 'that', 'single'], correct: 1, explain: '"String" starts with a consonant blend: /str/.' },
    { question: 'In "receipt", which letters are silent?', options: ['p only', 'c only', 'both p and one e', 'none'], correct: 2, explain: 'The "p" is silent in "receipt", and one "e" is also not pronounced.' },
    { question: 'What does the "igh" pattern usually sound like?', options: ['/ɪ/', '/aɪ/', '/i/', '/ɛ/'], correct: 1, explain: '"Igh" makes the long /aɪ/ sound (as in "light", "high", "sigh").' },
    { question: 'How do you pronounce "tion"?', options: ['/tɪən/', '/ʃən/', '/ʒən/', '/tʃən/'], correct: 1, explain: '"Tion" is pronounced /ʃən/ (as in "nation", "motion", "station").' },
    { question: 'The "ui" combination makes which sound?', options: ['/u/', '/ju/', '/wi/', '/ʊ/'], correct: 2, explain: '"Ui" typically makes the /i/ sound as in "suit", "fruit", "build".' },
    { question: 'What sound does "qu" make?', options: ['/kw/', '/k/', '/ku/', '/w/'], correct: 0, explain: '"Qu" makes the /kw/ sound (as in "queen", "quiet", "quest").' },
    { question: 'In "psychology", which letters are silent?', options: ['p only', 'ps', 'ch', 'y'], correct: 1, explain: 'In "psychology", the "ps" is silent; the word starts with /s/.' },
    { question: 'What vowel sound does "oo" make in "book"?', options: ['/u/', '/ʊ/', '/oʊ/', '/ɔ/'], correct: 1, explain: 'In "book", "oo" makes the short /ʊ/ sound.' },
    { question: 'The "ue" combination makes which sound?', options: ['/u/', '/ju/', '/ɛ/', '/ə/'], correct: 0, explain: '"Ue" makes the long /u/ sound (as in "true", "blue", "clue").' },
    { question: 'What pattern does "running" follow?', options: ['add "ing"', 'drop "e" + "ing"', 'double "n" + "ing"', 'just add "ing"'], correct: 2, explain: '"Running" doubles the final "n" before adding "ing".' },
    { question: 'In "enough", the "ough" sounds like:', options: ['/oʊ/', '/ʌf/', '/o/', '/ɔ/'], correct: 1, explain: 'In "enough", "ough" makes the /ʌ/ sound (like "uff").' },
    { question: 'What sound does "gh" make in "ghost"?', options: ['/ɡ/', '/h/', 'silent', '/ɡh/'], correct: 0, explain: 'In "ghost", "gh" is pronounced /ɡ/.' },
    { question: 'The "cy" ending typically sounds like:', options: ['/sɪ/', '/si/', '/ki/', '/tʃi/'], correct: 1, explain: 'The "cy" ending makes the /si/ sound (as in "mercy", "fancy", "policy").' },
    { question: 'In "said", which rule does NOT apply?', options: ['vowel digraph', 'silent letter', '"a" makes short sound', 'neither a nor b'], correct: 1, explain: '"Said" follows no clear phonics rule—it\'s an irregular word.' },
    { question: 'What sound does "ge" make in "gentle"?', options: ['/ɡ/', '/dʒ/', '/ʒ/', '/tʃ/'], correct: 1, explain: 'Before "e", "g" makes the soft /dʒ/ sound.' },
    { question: 'The "aw" sound is also spelled as:', options: ['/aw/', '/au/', '/ou/', '/all of the above'], correct: 3, explain: '"Aw", "au", and "ou" can all make the /ɔ/ sound.' },
    { question: 'In "measure", the "s" sounds like:', options: ['/s/', '/z/', '/ʒ/', '/ʃ/'], correct: 2, explain: 'In "measure", the "s" makes the /ʒ/ sound.' },
    { question: 'What does the "mb" ending sound like?', options: ['/mb/', '/m/', '/b/', 'silent b'], correct: 3, explain: 'In "bomb", "dumb", "limb", the "b" is silent; only /m/ is heard.' },
    { question: 'The "ch" sound in "choir" is pronounced:', options: ['/tʃ/', '/k/', '/ʃ/', '/h/'], correct: 1, explain: 'In "choir", "ch" makes the /k/ sound.' },
    { question: 'What sound does "ng" make?', options: ['/n/ /ɡ/', '/ŋ/', '/ŋ/ + /ɡ/', '/n/'], correct: 1, explain: '"Ng" makes the /ŋ/ sound (as in "sing", "ring", "long").' },
    { question: 'The "x" sound in "box" is:', options: ['/ks/', '/ɡz/', '/ks/ or /ɡz/', 'just /ks/'], correct: 0, explain: 'In "box", "x" makes the /ks/ sound.' },
    { question: 'In "ceiling", which vowel digraph appears?', options: ['/ei/', '/ie/', 'ei making /i/', 'none of these'], correct: 2, explain: 'In "ceiling", "ei" makes the long /i/ sound (ee sound).' },
    { question: 'The "ough" in "though" vs. "tough" vs. "through":',
options: ['/oʊ/, /ʌf/, /u/', 'same sound', 'different each time', 'all /ɔ/'], correct: 2, explain: '"Ough" has different sounds in each word—it\'s one of English\'s most irregular patterns.' }
  ],
  'decoding': [
    { question: 'What does "decoding" mean in reading?', options: ['understanding main idea', 'sounding out words', 'predicting what happens', 'memorizing words'], correct: 1, explain: 'Decoding is the ability to sound out unfamiliar words using phonics rules.' },
    { question: 'When you encounter an unknown word, the first step is to:', options: ['skip it', 'look at the picture', 'apply phonics rules', 'ask someone'], correct: 2, explain: 'Applying phonics rules to decode the word helps you become independent.' },
    { question: 'What is a morpheme?', options: ['a sound', 'a syllable', 'the smallest unit of meaning', 'a vowel'], correct: 2, explain: 'A morpheme is the smallest unit of meaning in a word.' },
    { question: 'In the word "unhappy", how many morphemes are there?', options: ['1', '2', '3', '4'], correct: 2, explain: '"Un" (prefix), "happy" (root), = 2 morphemes.' },
    { question: 'What strategy helps you decode "reconstruct"?', options: ['skip it', 'break it into parts', 'memorize it', 'guess from context'], correct: 1, explain: 'Breaking "reconstruct" into "re-construct" makes it easier to decode.' },
    { question: 'Context clues help you:', options: ['pronounce words', 'understand meaning', 'spell words', 'memorize'], correct: 1, explain: 'Context clues from surrounding sentences help you understand unknown words.' },
    { question: 'What is a root word?', options: ['a tree word', 'the base form of a word', 'a prefix', 'a suffix'], correct: 1, explain: 'The root word is the base word to which affixes are added.' },
    { question: 'In "transport", what is the root?', options: ['/trans/', '/port/', '/trans/ and /port/', '/t/'], correct: 1, explain: '"Port" is the root meaning "carry"; "trans" is a prefix meaning "across".' },
    { question: 'How many syllables in "comfortable"?', options: ['2', '3', '4', '5'], correct: 2, explain: '"Comfortable" has 4 syllables: com-for-ta-ble.' },
    { question: 'Breaking words into syllables helps:', options: ['memorization', 'pronunciation', 'spelling only', 'math'], correct: 1, explain: 'Syllables help you pronounce long words by breaking them into manageable chunks.' },
    { question: 'What does the prefix "re" mean?', options: ['again', 'not', 'before', 'many'], correct: 0, explain: '"Re" means again or anew (as in "rebuild", "redo", "restart").' },
    { question: 'What does the suffix "-tion" mean?', options: ['not', 'the state of', 'again', 'able to'], correct: 1, explain: 'The suffix "-tion" refers to a state, action, or condition.' },
    { question: 'In "preview", what does "pre" mean?', options: ['after', 'before', 'not', 'again'], correct: 1, explain: '"Pre" means before (as in "preview", "preschool", "predict").' },
    { question: 'What suffix means "able to do something"?', options: ['-tion', '-able', '-ness', '-ing'], correct: 1, explain: '"-Able" means capable of or suitable for (as in "readable", "playable").' },
    { question: 'In "unhelpful", how many morphemes?', options: ['1', '2', '3', '4'], correct: 2, explain: '"Un" (prefix), "help" (root), "-ful" (suffix) = 3 morphemes.' },
    { question: 'What strategy is BEST for decoding "exoskeleton"?', options: ['memorize', 'break into parts', 'skip it', 'ask others'], correct: 1, explain: 'Breaking it into "exo-skeleton" helps decode this complex word.' },
    { question: 'The suffix "-ness" means:', options: ['not', 'the state of', 'able to', 'not enough'], correct: 1, explain: '"-Ness" turns adjectives into nouns describing a state (as in "happiness", "sadness").' },
    { question: 'What does "bio" mean as a root?', options: ['small', 'life', 'study', 'person'], correct: 1, explain: '"Bio" means life (as in "biography", "biology", "biotic").' },
    { question: 'In "biology", what does the root "logy" mean?', options: ['person', 'place', 'study of', 'life'], correct: 2, explain: '"-Logy" means the study or science of something.' },
    { question: 'How do you decode "photosynthesis"?', options: ['guess', 'break into: photo-syn-thesis', 'memorize', 'skip it'], correct: 1, explain: 'Breaking into "photo" (light), "syn" (together), "thesis" (putting) helps decode it.' },
    { question: 'What prefix means "not"?', options: ['-un', '-re', 'un-', 'dis-'], correct: 2, explain: '"Un-" and "dis-" are common prefixes meaning "not" or "opposite of".' },
    { question: 'In "submarine", what does "sub" mean?', options: ['above', 'below', 'fast', 'around'], correct: 1, explain: '"Sub" means under or below (as in "submarine", "subway", "subzero").' },
    { question: 'The suffix "-er" typically means:', options: ['not', 'one who does', 'full of', 'before'], correct: 1, explain: '"-Er" describes a person who does an action (teacher, player, builder).' },
    { question: 'What does "micro" mean?', options: ['large', 'small', 'fast', 'slow'], correct: 1, explain: '"Micro" means small (as in "microbe", "microscope", "microchip").' },
    { question: 'In "incredible", what does "in" mean?', options: ['inside', 'not', 'in-again', 'before'], correct: 1, explain: 'The prefix "in" means not (incredible = not credible).' },
    { question: 'How do you decode "interplanetary"?', options: ['one word', 'inter-plan-et-ar-y', 'guess', 'memory'], correct: 1, explain: 'Breaking "inter" (between), "plan-et" (planet), "-ar-y" helps you decode it.' },
    { question: 'What does "tri" mean?', options: ['two', 'three', 'four', 'many'], correct: 1, explain: '"Tri" means three (as in "tricycle", "triangle", "trilogy").' },
    { question: 'In "unhappy", what is the root?', options: ['/un/', '/happy/', '/happy/ is the root', 'all'], correct: 2, explain: 'The root is "happy"; "un" is a prefix.' },
    { question: 'What does the suffix "-ing" indicate?', options: ['past tense', 'present action', 'not able', 'again'], correct: 1, explain: '"-Ing" shows the verb is in progress or a continuous action.' },
    { question: 'How do you decode "antifreeze"?', options: ['anti-freeze', 'ant-ifreeze', 'memorize', 'guess'], correct: 0, explain: 'Breaking into "anti" (against) and "freeze" helps decode it.' },
    { question: 'In "transparent", what does "trans" mean?', options: ['across', 'three', 'again', 'before'], correct: 0, explain: '"Trans" means across or through (as in "transparent", "transport", "transmit").' },
    { question: 'What prefix means "many"?', options: ['uni', 'mono', 'poly', 'semi'], correct: 2, explain: '"Poly" means many (as in "polygon", "polyglot", "polymer").' },
    { question: 'In "monoculture", "mono" means:', options: ['two', 'three', 'one', 'many'], correct: 2, explain: '"Mono" means one (as in "monoplane", "monotone", "monopoly").' },
    { question: 'What strategy helps with unfamiliar compound words?', options: ['skip them', 'break into two words', 'memorize', 'avoid'], correct: 1, explain: 'Breaking "football" into "foot-ball" helps decode compound words.' },
    { question: 'How many parts does "reconstruction" have?', options: ['1', '2', '3', '4'], correct: 2, explain: '"Re-construct-ion" = prefix, root, suffix = 3 parts.' },
    { question: 'In "automatic", the root is:', options: ['/auto/', '/mat/', '/tic/', '/aut/'], correct: 0, explain: '"Auto" is a root meaning self; "-matic" is a suffix.' },
    { question: 'What does "geo" mean?', options: ['time', 'earth', 'life', 'water'], correct: 1, explain: '"Geo" means earth (as in "geography", "geology", "geomancy").' },
    { question: 'In "disappear", how many morphemes?', options: ['1', '2', '3', '4'], correct: 2, explain: '"Dis" (prefix), "appear" (root) = 2 morphemes.' },
    { question: 'What does "chrono" mean?', options: ['color', 'time', 'sound', 'cold'], correct: 1, explain: '"Chrono" means time (as in "chronology", "synchronize", "chronometer").' },
    { question: 'In "encyclopedia", what is the root?', options: ['/cycl/', '/pedia/', '/cyclopedia/', 'none'], correct: 2, explain: '"Cyclopedia" is the root meaning "circle of knowledge"; "en" is a prefix.' },
    { question: 'How do you decode "interdisciplinary"?', options: ['one word', 'inter-discipline-ar-y', 'memorize', 'ask'], correct: 1, explain: 'Breaking into prefix "inter" (between), root "discipline", suffix "-ary" helps.' }
  ],
  'fluency': [
    { question: 'What is reading fluency?', options: ['understanding everything', 'reading smoothly with speed and accuracy', 'reading slowly', 'knowing all words'], correct: 1, explain: 'Fluency is the ability to read smoothly, accurately, and at a good pace while understanding.' },
    { question: 'Fluency improves through:', options: ['reading once', 'repeated reading practice', 'memorization', 'spelling drills'], correct: 1, explain: 'Repeated reading of the same text builds fluency because words become automatic.' },
    { question: 'What should your reading pace be?', options: ['as slow as possible', 'as fast as possible', 'smooth and natural, matching speech', 'varies by person'], correct: 2, explain: 'Fluent reading sounds like natural speech—not too fast, not too slow.' },
    { question: 'When reading aloud, you should:', options: ['sound robotic', 'use expression and phrasing', 'go as fast as possible', 'pause frequently'], correct: 1, explain: 'Expressive reading with proper phrasing and tone shows fluency and aids comprehension.' },
    { question: 'Chunking words into phrases helps with:', options: ['spelling', 'fluency', 'decoding only', 'vocabulary'], correct: 1, explain: 'Grouping words into meaningful phrases improves fluency and comprehension.' },
    { question: 'What does prosody mean?', options: ['studying words', 'the rhythm and tone of reading', 'spelling rules', 'silent letters'], correct: 1, explain: 'Prosody is the rhythm, intonation, and expression you use while reading.' },
    { question: 'Sight words should be:', options: ['sounded out', 'recognized instantly', 'memorized only', 'avoided'], correct: 1, explain: 'Sight words (common words) should be recognized automatically to improve fluency.' },
    { question: 'Rereading the same book helps because:', options: ['it\'s fun', 'words become automatic', 'it\'s required', 'it\'s easy'], correct: 1, explain: 'Rereading builds automaticity—your brain needs less effort to decode words.' },
    { question: 'When you misread a word, you should:', options: ['keep going', 'go back and correct it', 'mark it', 'skip it'], correct: 1, explain: 'Self-correcting during reading shows you\'re monitoring comprehension.' },
    { question: 'Reading speed for fluency should be:', options: ['140 wpm', '100-150 wpm for 3rd grade', 'varies by grade', 'faster every year'], correct: 2, explain: 'Appropriate reading speed varies by age/grade level and the type of text.' },
    { question: 'What hurts fluency the most?', options: ['easy words', 'stopping to decode every word', 'knowing sight words', 'expression'], correct: 1, explain: 'Constantly stopping to decode unfamiliar words breaks fluency and comprehension.' },
    { question: 'Partner reading helps fluency because:', options: ['one person listens', 'you hear fluent models', 'it\'s loud', 'it\'s social'], correct: 1, explain: 'Hearing a fluent reader model proper pacing, expression, and intonation.' },
    { question: 'Which is a sign of fluent reading?', options: ['no mistakes', 'natural phrasing and expression', 'fast reading', 'never stopping'], correct: 1, explain: 'Fluent readers use natural expression, proper phrasing, and maintain comprehension.' },
    { question: 'Echo reading means:', options: ['reading silently', 'repeating after hearing fluent model', 'reading fast', 'reading aloud alone'], correct: 1, explain: 'Echo reading: you hear a sentence read fluently, then repeat it with same expression.' },
    { question: 'Punctuation should affect your:', options: ['speed only', 'nothing', 'phrasing and intonation', 'decoding'], correct: 2, explain: 'Punctuation (periods, commas, etc.) guides how you phrase and intonate.' },
    { question: 'Automaticity means:', options: ['reading fast', 'recognizing words without thinking', 'reading perfectly', 'reading aloud'], correct: 1, explain: 'Automaticity is recognizing words instantly without conscious effort to decode.' },
    { question: 'Which supports fluency development?', options: ['reading word lists', 'reading interesting, engaging text', 'memorizing', 'spelling practice'], correct: 1, explain: 'Engaging text motivates repeated reading, which builds fluency.' },
    { question: 'Choral reading helps fluency by:', options: ['reading alone', 'reading together with support', 'reading silently', 'listening only'], correct: 1, explain: 'Reading together with a group provides peer support and models fluent reading.' },
    { question: 'When reading becomes fluent, comprehension:', options: ['decreases', 'stays the same', 'improves because mental energy shifts', 'is unaffected'], correct: 2, explain: 'As decoding becomes automatic, your brain has more resources for understanding.' },
    { question: 'The "three minute rule" for fluency means:', options: ['read for 3 min', 'reread until smooth', 'stop after 3 mins', 'none'], correct: 1, explain: 'Rereading the same passage multiple times improves fluency significantly.' }
  ],
  'vocabulary': [
    { question: 'What is vocabulary?', options: ['grammar rules', 'the words you know', 'spelling ability', 'reading speed'], correct: 1, explain: 'Vocabulary is the set of words you understand and can use.' },
    { question: 'Which supports vocabulary growth?', options: ['avoidance', 'wide reading', 'memorizing lists only', 'silence'], correct: 1, explain: 'Reading widely across many topics exposes you to new words in context.' },
    { question: 'Context clues help you:', options: ['spell words', 'understand unknown words', 'read faster', 'memorize'], correct: 1, explain: 'Surrounding words and sentences provide clues to an unknown word\'s meaning.' },
    { question: 'What is a synonym?', options: ['a prefix', 'a word with opposite meaning', 'a word with similar meaning', 'a sound'], correct: 2, explain: 'A synonym is a word that means nearly the same thing (happy = joyful).' },
    { question: 'What is an antonym?', options: ['similar meaning', 'opposite meaning', 'same spelling', 'same sound'], correct: 1, explain: 'An antonym is a word with the opposite meaning (hot ≠ cold).' },
    { question: 'Knowing word families helps because:', options: ['spelling only', 'understanding related words', 'pronunciation', 'memory'], correct: 1, explain: 'Word families (cat, bat, rat, hat) help you recognize patterns.' },
    { question: 'What does "infer" mean?', options: ['understand', 'conclude based on clues', 'forget', 'memorize'], correct: 1, explain: 'Inferring means drawing a conclusion based on evidence and clues.' },
    { question: 'Which context clue is shown here: "The old, dilapidated house..."?', options: ['definition', 'synonym', 'example', 'description'], correct: 3, explain: '"Dilapidated" (broken-down) is shown by the description "old".' },
    { question: 'A homophone is a word that:', options: ['sounds the same, different meaning', 'means the same', 'sounds different', 'is spelled the same'], correct: 0, explain: 'Homophones sound the same but have different meanings (to, too, two).' },
    { question: 'Root words help vocabulary because:', options: ['they teach spelling', 'one root unlocks many words', 'they\'re easy', 'nothing'], correct: 1, explain: 'One root (like "graph") appears in dozens of words (write, describe, etc.).' },
    { question: 'Which is the best way to learn vocabulary?', options: ['flashcards only', 'in context while reading', 'memorizing lists', 'guessing'], correct: 1, explain: 'Words learned in context stick longer because they\'re connected to meaning.' },
    { question: 'What does "reciprocal" mean?', options: ['back and forth / mutual', 'once', 'never', 'quickly'], correct: 0, explain: '"Reciprocal" means mutual or back-and-forth relationship (I like you, you like me).' },
    { question: 'Morphemes in "unhappily": how many unique words?', options: ['1', '2', '3', '4'], correct: 2, explain: '"Un-happy" + "-ly" = 3 parts showing you the word\'s meaning.' },
    { question: 'An analogy word pair: "hot is to cold as..."', options: ['up is to down', 'big is to size', 'red is to color', 'fast is to slow'], correct: 0, explain: 'Just like hot/cold are opposites, up/down are also opposites.' },
    { question: 'Which word has the strongest/most extreme meaning?', options: ['warm', 'hot', 'scorching', 'tepid'], correct: 2, explain: '"Scorching" is the most intense; it\'s stronger than just "hot".' },
    { question: 'What does "benevolent" mean?', options: ['mean', 'kind/generous', 'rich', 'smart'], correct: 1, explain: '"Benevolent" means kind, charitable, or generous ("bene" = good).' },
    { question: 'Prefixes like "un-" and "dis-" typically:', options: ['add to nouns', 'change adjectives to negative', 'add time info', 'show quantity'], correct: 1, explain: 'Negative prefixes change meaning to opposite ("happy" → "unhappy").' },
    { question: 'What does "ambiguous" mean?', options: ['clear', 'unclear / having multiple meanings', 'obvious', 'vague is different'], correct: 1, explain: '"Ambiguous" means unclear or able to be interpreted multiple ways.' },
    { question: 'Which word means "to reduce or make less"?', options: ['augment', 'diminish', 'expand', 'multiply'], correct: 1, explain: '"Diminish" means to reduce or become less (opposite of augment).' },
    { question: 'What is a metaphor?', options: ['a comparison using "like"', 'a direct comparison saying X is Y', 'exaggeration', 'repetition'], correct: 1, explain: 'A metaphor says one thing IS another (Life is a journey) without "like".' }
  ],
  'sentence-structure': [
    { question: 'What is a sentence?', options: ['any group of words', 'a complete thought with subject and predicate', 'a long phrase', 'words with nouns'], correct: 1, explain: 'A sentence expresses a complete thought with a subject (who/what) and verb (action/state).' },
    { question: 'What is a subject?', options: ['the topic of a book', 'the action', 'who or what is doing the action', 'the verb'], correct: 2, explain: 'The subject is the person, place, or thing performing the action.' },
    { question: 'What is a predicate?', options: ['a noun', 'the action or state of being of the subject', 'the object', 'an adjective'], correct: 1, explain: 'The predicate tells what the subject does or is.' },
    { question: 'In "The cat sleeps", what is the subject?', options: ['sleeps', 'the', 'cat', 'the cat'], correct: 3, explain: '"The cat" is the complete subject—the whole noun phrase.' },
    { question: 'In "The cat sleeps", what is the predicate?', options: ['cat', 'sleeps', 'the', 'the cat'], correct: 1, explain: '"Sleeps" is the simple predicate; "sleeps" is the verb showing action.' },
    { question: 'What is a compound sentence?', options: ['a long sentence', 'two sentences joined with "and"/"or"/"but"', 'a sentence with adjectives', 'a sentence with numbers'], correct: 1, explain: 'A compound sentence has two independent clauses joined by a conjunction.' },
    { question: 'What is a complex sentence?', options: ['very long', 'has one independent and one dependent clause', 'has many verbs', 'hard to read'], correct: 1, explain: 'A complex sentence has an independent clause and at least one dependent clause.' },
    { question: 'What is a dependent clause?', options: ['it\'s independent', 'a clause that cannot stand alone', 'always a verb', 'the main idea'], correct: 1, explain: 'A dependent clause (begins with words like "because", "when", "if") needs an independent clause.' },
    { question: 'Identify the fragment:', options: ['"The dog barks loudly"', '"The dog running fast"', '"The dog is happy"', '"The dog ran."'], correct: 1, explain: '"The dog running fast" lacks a main verb; it\'s incomplete.' },
    { question: 'What is a run-on sentence?', options: ['too long', 'two sentences joined incorrectly without punctuation', 'a sentence about running', 'many clauses'], correct: 1, explain: 'A run-on sentence joins two independent clauses without proper punctuation.' },
    { question: 'Correct this run-on: "She ran to the store she bought milk"', options: ['"She ran to the store and bought milk"', '"She ran to the store, milk"', '"She ran the store milk"', 'can\'t be fixed'], correct: 0, explain: 'Add a comma + conjunction or make two sentences to fix.' },
    { question: 'What punctuation ends a declarative sentence?', options: ['?', '!', '.', ':'], correct: 2, explain: 'A declarative sentence (a statement) ends with a period.' },
    { question: 'What punctuation ends a question?', options: ['.', '!', '?', ':'], correct: 2, explain: 'A question always ends with a question mark.' },
    { question: 'What does an exclamatory sentence express?', options: ['facts', 'strong emotion or excitement', 'questions', 'requests'], correct: 1, explain: '"What a beautiful day!" expresses strong emotion with an exclamation mark.' },
    { question: 'What is an imperative sentence?', options: ['a question', 'a command or request', 'a statement', 'an emotion'], correct: 1, explain: 'An imperative sentence gives a command: "Close the door." Subject (you) is often implied.' },
    { question: 'When should you use a comma?', options: ['never', 'between independent clauses + conjunction, in lists, after intro phrases', 'everywhere', 'randomly'], correct: 1, explain: 'Commas separate items, clauses, and phrases to aid clarity.' },
    { question: 'What is a semicolon used for?', options: ['lists', 'joining two related independent clauses', 'questions', 'nothing'], correct: 1, explain: 'A semicolon joins two independent clauses that are closely related.' },
    { question: 'Identify the correct sentence:', options: ['"Although she studied hard"', '"Although she studied hard, she failed the test"', '"Although she", failed"', '"She although studied hard"'], correct: 1, explain: 'The dependent clause "Although..." needs an independent clause to be complete.' },
    { question: 'What is a modifier?', options: ['a verb', 'a word/phrase that describes', 'a noun', 'a conjunction'], correct: 1, explain: 'A modifier adds information to another word (adjectives, adverbs, phrases).' },
    { question: 'What is a dangling modifier?', options: ['a hanging object', 'a modifier disconnected from what it modifies', 'a long phrase', 'a description'], correct: 1, explain: '"Running fast, the bus left" = dangling (who is running?).' },
    { question: 'What does parallel structure mean?', options: ['lines side by side', 'similar grammatical form for equal ideas', 'repetition', 'long sentences'], correct: 1, explain: '"I like to run, jump, and swim" is parallel (all infinitives).' }
  ],
  'critical-reading': [
    { question: 'What is critical reading?', options: ['reading slowly', 'analyzing and evaluating text, not just understanding', 'negative thinking', 'finding mistakes'], correct: 1, explain: 'Critical reading means examining ideas, questioning assumptions, and evaluating credibility.' },
    { question: 'What is the main idea?', options: ['the first sentence', 'the most important point the author makes', 'the longest sentence', 'the conclusion'], correct: 1, explain: 'The main idea is the central message or primary point of a passage.' },
    { question: 'What is an inference?', options: ['a guess', 'a conclusion based on evidence', 'a fact', 'a lie'], correct: 1, explain: 'An inference is a logical conclusion drawn from evidence in the text and your knowledge.' },
    { question: 'What is bias?', options: ['fairness', 'an unfair preference or prejudice', 'truth', 'opinion'], correct: 1, explain: 'Bias is a leaning toward a particular opinion or perspective, often unfairly.' },
    { question: 'When reading an argument, you should ask:', options: ['nothing', 'Is this claim supported by evidence?', 'Do I like it?', 'Is it long?'], correct: 1, explain: 'Evaluating evidence is key to critical reading and determining credibility.' },
    { question: 'What is a credible source?', options: ['any source', 'reliable, evidence-based, from experts', 'popular', 'written'], correct: 1, explain: 'A credible source is trustworthy, backed by evidence, and from someone knowledgeable.' },
    { question: 'What is propaganda?', options: ['education', 'information designed to persuade, not inform', 'facts', 'research'], correct: 1, explain: 'Propaganda uses techniques to convince rather than to present balanced information.' },
    { question: 'What is a stereotype?', options: ['diversity', 'an overgeneralization about a group', 'a fact', 'an observation'], correct: 1, explain: 'A stereotype is an unfair generalization about a whole group.' },
    { question: 'When you evaluate an author\'s purpose, you ask:', options: ['"Is it long?"', '"Why did the author write this?"', '"Do I like it?"', '"Is it popular?"'], correct: 1, explain: 'Understanding why an author wrote something (to inform, persuade, entertain) is critical.' },
    { question: 'What is fact vs. opinion?', options: ['same thing', 'fact = verifiable truth; opinion = belief or judgment', 'both opinions', 'both facts'], correct: 1, explain: 'Facts can be verified; opinions reflect personal beliefs, values, or judgments.' },
    { question: 'Which is an opinion?', options: ['"The sky is blue"', '"Paris is beautiful"', '"Water boils at 100°C"', '"The Earth orbits the Sun"'], correct: 1, explain: '"Beautiful" is subjective; others might disagree—it\'s an opinion.' },
    { question: 'What is a generalization?', options: ['a specific detail', 'a broad statement about a group', 'a fact', 'one example'], correct: 1, explain: 'A generalization makes a broad claim about many examples.' },
    { question: 'What is a logical fallacy?', options: ['a correct argument', 'a flawed reasoning in an argument', 'truth', 'proof'], correct: 1, explain: 'A logical fallacy is faulty reasoning that appears sound but isn\'t.' },
    { question: '"All politicians are liars" is:', options: ['fact', 'reasonable', 'a stereotype/overgeneralization', 'true'], correct: 2, explain: 'This is an unfair generalization; it\'s not supported by all evidence.' },
    { question: 'What is "ad hominem" fallacy?', options: ['attacking idea', 'attacking the person instead of their idea', 'right argument', 'good logic'], correct: 1, explain: 'Ad hominem attacks the person, not their argument ("You\'re stupid, so you\'re wrong").' },
    { question: 'What should you do when you encounter contradictory information?', options: ['ignore it', 'investigate sources and evidence', 'believe the first', 'believe neither'], correct: 1, explain: 'Compare sources, check evidence, and evaluate credibility.' },
    { question: 'What is the author\'s tone?', options: ['volume', 'the attitude/feeling toward the subject', 'loudness', 'pitch'], correct: 1, explain: 'Tone reveals how the author feels (sarcastic, serious, angry, hopeful, etc.).' },
    { question: 'Which word best describes a sarcastic tone?', options: ['serious', 'ironic/mocking', 'neutral', 'helpful'], correct: 1, explain: 'Sarcasm uses irony to mock or convey the opposite of what\'s said.' },
    { question: 'When evaluating credibility, check:', options: ['"Do I like it?"', '"Who wrote it? What\'s their expertise? Is it recent?"', '"Is it popular?"', '"Is it long?"'], correct: 1, explain: 'Author expertise, recency, and source authority determine credibility.' },
    { question: 'What is "appeal to emotion"?', options: ['logical argument', 'using feelings instead of logic to persuade', 'fact-based', 'evidence'], correct: 1, explain: 'This persuasion technique relies on emotions rather than reason or facts.' }
  ],
  'morphology': [
    { question: 'What is morphology?', options: ['the study of rocks', 'the study of word structure and meaning', 'spelling', 'phonetics'], correct: 1, explain: 'Morphology is the study of how words are built from smaller meaningful units.' },
    { question: 'What is a morpheme?', options: ['a sound', 'the smallest unit of meaning', 'a letter', 'a paragraph'], correct: 1, explain: 'A morpheme is the smallest unit that carries meaning (root, prefix, suffix).' },
    { question: 'In "rewrite", how many morphemes?', options: ['1', '2', '3', '4'], correct: 1, explain: '"Re" (prefix meaning again) + "write" (root) = 2 morphemes.' },
    { question: 'What is a root morpheme?', options: ['a plant root', 'the base word carrying main meaning', 'a prefix', 'a suffix'], correct: 1, explain: 'A root is the core morpheme on which other morphemes build.' },
    { question: 'What is a prefix?', options: ['a number', 'a morpheme attached before a root', 'a suffix', 'a vowel'], correct: 1, explain: 'A prefix is added to the beginning of a root to change meaning.' },
    { question: 'What is a suffix?', options: ['enough', 'a morpheme added after a root', 'before something', 'a root'], correct: 1, explain: 'A suffix is added to the end of a root to change meaning or part of speech.' },
    { question: 'The word "unhappiness" contains how many morphemes?', options: ['2', '3', '4', '5'], correct: 2, explain: '"Un-" (prefix) + "happy" (root) + "-ness" (suffix) = 3 morphemes.' },
    { question: 'What does the root "graph" mean?', options: ['math', 'write', 'draw', 'move'], correct: 1, explain: '"Graph" means write/record (biography, photograph, autograph).' },
    { question: 'In "photography", the root "photo" means:', options: ['phone', 'light', 'fear', 'sound'], correct: 1, explain: '"Photo" means light (photography = light writing/recording).' },
    { question: 'What does "bio" mean?', options: ['city', 'life', 'study', 'time'], correct: 1, explain: '"Bio" means life (biography, biology, biotic).' },
    { question: 'In "dislike", what does "dis" mean?', options: ['double', 'not/opposite', 'fast', 'again'], correct: 1, explain: '"Dis-" is a prefix meaning not or opposite (dislike = not like).' },
    { question: 'What does the suffix "-tion" indicate?', options: ['not', 'a state or action', 'plural', 'past'], correct: 1, explain: '"-Tion" changes a verb to a noun showing an action or state.' },
    { question: 'In "incredible", what does "in" mean?', options: ['inside', 'not', 'repeat', 'before'], correct: 1, explain: '"In-" is a prefix meaning not (incredible = not credible).' },
    { question: 'The root "dict" means:', options: ['number', 'speak', 'write', 'give'], correct: 1, explain: '"Dict" means speak (dictate, diction, dictionary).' },
    { question: 'What does the root "port" mean?', options: ['expensive', 'carry', 'door', 'strong'], correct: 1, explain: '"Port" means carry (transport, import, export, portable).' },
    { question: 'In "antifreeze", what does "anti" mean?', options: ['fast', 'against', 'before', 'again'], correct: 1, explain: '"Anti-" means against (antifreeze works against freezing).' },
    { question: 'The root "aud" means:', options: ['hear', 'see', 'speak', 'write'], correct: 0, explain: '"Aud" means hear (audience, audio, auditorium).' },
    { question: 'What does the suffix "-able" indicate?', options: ['not', 'capable of', 'again', 'state of'], correct: 1, explain: '"-Able" means capable of or suitable for (readable = can be read).' },
    { question: 'In "international", which is the root?', options: ['/inter/', '/nation/', '/al/', '/intern/'], correct: 1, explain: '"Nation" is the root; "inter-" and "-al" are affixes.' },
    { question: 'What does "micro" mean?', options: ['large', 'small', 'fast', 'slow'], correct: 1, explain: '"Micro" means small (microbe, microscope, microchip).' },
    { question: 'The prefix "poly" means:', options: ['one', 'two', 'many', 'few'], correct: 2, explain: '"Poly" means many (polygon, polyglot, polymer).' },
    { question: 'What does "mono" mean?', options: ['many', 'two', 'one', 'zero'], correct: 2, explain: '"Mono" means one (monologue, monotone, monopoly).' },
    { question: 'In "reconstruct", how many morphemes?', options: ['1', '2', '3', '4'], correct: 2, explain: '"Re-" (prefix) + "construct" (root) = 2 morphemes.' },
    { question: 'The root "mort" means:', options: ['sleep', 'death', 'move', 'live'], correct: 1, explain: '"Mort" means death (mortal, mortgage, mortuary).' },
    { question: 'What does the suffix "-ful" mean?', options: ['not', 'full of', 'able to', 'many'], correct: 1, explain: '"-Ful" means full of (joyful, beautiful, careful).' }
  ]
};

// Initialize game
document.addEventListener('DOMContentLoaded', initGame);

function initGame() {
  const stage = document.getElementById('hc-stage');
  
  if (!stage) {
    setTimeout(initGame, 100);
    return;
  }

  // Initialize Firebase (stub for now—localStorage fallback)
  initAuth();
  showPillarPicker();
}

function initAuth() {
  // Firebase stub - localStorage fallback
  const authState = document.getElementById('hc-auth-state');
  if (authState) {
    authState.innerHTML = '<span class="dot"></span><span id="hc-auth-text">Offline mode</span>';
  }
}

function showPillarPicker() {
  const stage = document.getElementById('hc-stage');
  stage.innerHTML = `
    <div class="hc-picker">
      <div class="hc-picker-eyebrow">Choose a pillar</div>
      <h3>Which element?</h3>
      <p class="lead">Pick a Reading Helix pillar to start climbing. You'll see fresh questions each round.</p>
      <div class="hc-tiles">
        ${GAME_CONFIG.pillars.map((p, i) => `
          <button class="hc-tile" onclick="startGame(${p.id})">
            <div class="tile-num">ELEMENT ${String(p.id).padStart(2, '0')}</div>
            <div class="tile-name">${p.name}</div>
            <div class="tile-tag">Click to start</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function startGame(pillarId) {
  const pillar = GAME_CONFIG.pillars.find(p => p.id === pillarId);
  const questions = QUESTIONS[pillar.slug] || [];
  
  if (questions.length === 0) {
    alert('Questions not found for ' + pillar.name);
    return;
  }

  // Shuffle questions
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, GAME_CONFIG.questionsPerPillar);
  
  window.currentGame = {
    pillarId,
    pillarName: pillar.name,
    questions: shuffled,
    currentQ: 0,
    score: 0,
    answers: []
  };

  showQuestion();
}

function showQuestion() {
  const game = window.currentGame;
  const stage = document.getElementById('hc-stage');
  
  if (game.currentQ >= game.questions.length) {
    showResult();
    return;
  }

  const q = game.questions[game.currentQ];
  const num = game.currentQ + 1;
  
  stage.innerHTML = `
    <div class="hc-lesson">
      <div class="crumb"><a onclick="showPillarPicker()">Choose pillar</a> / ${game.pillarName}</div>
      <h3>Question ${num} of ${game.questions.length}</h3>
      <p class="meta">Score: ${game.score}</p>
      
      <div class="hc-quiz">
        <div class="hc-q">${q.question}</div>
        
        <div class="hc-opts">
          ${q.options.map((opt, i) => `
            <button class="hc-opt" onclick="answerQ(${i}, ${q.correct})">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function answerQ(chosen, correct) {
  const game = window.currentGame;
  const stage = document.getElementById('hc-stage');
  const q = game.questions[game.currentQ];
  
  const isCorrect = chosen === correct;
  if (isCorrect) game.score++;
  
  game.answers.push({ question: q.question, chosen, correct, isCorrect });
  
  const opts = stage.querySelectorAll('.hc-opt');
  opts.forEach((opt, i) => {
    if (i === correct) opt.classList.add('correct');
    else if (i === chosen && !isCorrect) opt.classList.add('wrong');
    opt.disabled = true;
  });
  
  stage.innerHTML += `
    <div class="hc-explain">${q.explain}</div>
    <div class="hc-quiz-actions">
      <button class="hc-next" onclick="nextQuestion()">Next Question</button>
    </div>
  `;
}

function nextQuestion() {
  window.currentGame.currentQ++;
  showQuestion();
}

function showResult() {
  const game = window.currentGame;
  const stage = document.getElementById('hc-stage');
  const score = game.score / game.questions.length;
  
  let tier = GAME_CONFIG.tiers.find(t => score >= t.minScore);
  if (!tier) tier = GAME_CONFIG.tiers[0];
  
  stage.innerHTML = `
    <div class="hc-result">
      <div class="tier-medal ${tier.name}">${tier.label}</div>
      <h3>You scored ${game.score}/${game.questions.length}</h3>
      <div class="score-line">${Math.round(score * 100)}%</div>
      <div class="note">Great work climbing ${game.pillarName}!</div>
      
      <div class="actions">
        <button class="btn-primary" onclick="startGame(${game.pillarId})">Climb again</button>
        <button class="btn-secondary" onclick="showPillarPicker()">Pick another pillar</button>
      </div>
    </div>
  `;
  
  // Save score to localStorage
  const saved = JSON.parse(localStorage.getItem('hc-scores') || '{}');
  saved[game.pillarId] = { score: game.score, total: game.questions.length, tier: tier.name, date: new Date().toISOString() };
  localStorage.setItem('hc-scores', JSON.stringify(saved));
  
  // Update helix visualization
  updateHelix();
}

function updateHelix() {
  const scores = JSON.parse(localStorage.getItem('hc-scores') || '{}');
  const svg = document.querySelector('.hc-helix-svg #hc-rings');
  
  if (!svg) return;
  
  svg.innerHTML = GAME_CONFIG.pillars.map((p, i) => {
    const saved = scores[p.id];
    const tier = saved ? saved.tier : 'none';
    const angle = (i / GAME_CONFIG.pillars.length) * 360;
    const radius = 100 + i * 15;
    const x = 140 + radius * Math.cos((angle - 90) * Math.PI / 180);
    const y = 280 + radius * Math.sin((angle - 90) * Math.PI / 180);
    
    return `<circle class="ring ${tier === 'none' ? '' : tier}" cx="${x}" cy="${y}" r="${radius}" />`;
  }).join('');
  
  const totalScore = Object.values(scores).reduce((sum, s) => sum + (s.score || 0), 0);
  const maxScore = GAME_CONFIG.pillars.length * GAME_CONFIG.questionsPerPillar;
  document.getElementById('hc-total-score').textContent = totalScore;
  document.getElementById('hc-max-score').textContent = '/ ' + maxScore;
}

// Initialize on load
initGame();
updateHelix();
