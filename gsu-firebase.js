/**
 * GSU Firebase Module — v1.0.0
 * 
 * Shared module for Global Sovereign University. Provides:
 *   • Anonymous authentication (auto-assigned uid per browser session)
 *   • BookGame score persistence
 *   • Sovereign Handshake form submission
 *   • Wisdom Bridge checkpoint progress
 *
 * Usage:
 *   <script type="module" src="https://read.globalsovereignuniversity.org/gsu-firebase.js"></script>
 *
 * Then in any subsequent <script type="module">:
 *   import { GSU } from 'https://read.globalsovereignuniversity.org/gsu-firebase.js';
 *   await GSU.ready();
 *   await GSU.saveScore({ game: 'amnesty-protocol', score: 87, badge: 'gold' });
 *
 * Or use the global on non-module pages:
 *   window.GSU.saveScore({ ... })
 *
 * Project: gsu-handshake (Firebase)
 * Auth model: anonymous, no signup required
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// ============================================================
// CONFIGURATION
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyARIAF3fVoGReq27aY9u5SgNq6mlrw7SKc",
  authDomain: "gsu-handshake.firebaseapp.com",
  projectId: "gsu-handshake",
  storageBucket: "gsu-handshake.firebasestorage.app",
  messagingSenderId: "301089416765",
  appId: "1:301089416765:web:dff926a7aa52191e9a6c54",
  measurementId: "G-LZDRK48TL7"
};

// ============================================================
// INITIALIZE
// ============================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Promise that resolves when anonymous auth is complete
let _userResolve;
let _userReject;
const _userReady = new Promise((resolve, reject) => {
  _userResolve = resolve;
  _userReject = reject;
});

let _currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    _currentUser = user;
    _userResolve(user);
  } else {
    signInAnonymously(auth).catch((err) => {
      console.error('[GSU] Anonymous sign-in failed:', err);
      _userReject(err);
    });
  }
});

// ============================================================
// API
// ============================================================

export const GSU = {
  
  /**
   * Resolves to the authenticated (anonymous) user object.
   * Always await this before any Firestore operation.
   */
  async ready() {
    return _userReady;
  },
  
  /** Current authenticated user (anonymous). null until ready() resolves. */
  get user() {
    return _currentUser;
  },
  
  /** Current user's anonymous uid. null until ready() resolves. */
  get uid() {
    return _currentUser ? _currentUser.uid : null;
  },
  
  // --------------------------------------------------------
  // SCOREKEEPING — for BookGames
  // --------------------------------------------------------
  
  /**
   * Save a game score. Stored at users/{uid}/scores/{auto-id}.
   * @param {Object} payload
   * @param {string} payload.game             - Game slug (e.g. 'amnesty-protocol')
   * @param {number} payload.score            - Numeric score
   * @param {string} [payload.badge]          - 'bronze' | 'silver' | 'gold' | 'platinum'
   * @param {number} [payload.questionsCorrect]
   * @param {number} [payload.questionsTotal]
   * @param {number} [payload.durationSec]    - How long the play session lasted
   * @param {Object} [payload.meta]           - Free-form extra data
   * @returns {Promise<Object>} Saved score record with id
   */
  async saveScore({ game, score, badge, questionsCorrect, questionsTotal, durationSec, meta } = {}) {
    if (!game) throw new Error('GSU.saveScore: game is required');
    const user = await _userReady;
    const data = {
      game: String(game),
      score: Number(score) || 0,
      badge: badge || null,
      questionsCorrect: Number(questionsCorrect) || 0,
      questionsTotal: Number(questionsTotal) || 0,
      durationSec: Number(durationSec) || 0,
      meta: meta || {},
      timestamp: serverTimestamp(),
      userId: user.uid
    };
    const ref = await addDoc(collection(db, `users/${user.uid}/scores`), data);
    return { id: ref.id, ...data };
  },
  
  /** Get the user's best score for a specific game. */
  async getBestScore(game) {
    if (!game) throw new Error('GSU.getBestScore: game is required');
    const user = await _userReady;
    const q = query(
      collection(db, `users/${user.uid}/scores`),
      where('game', '==', String(game)),
      orderBy('score', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  },
  
  /** Get the user's recent score history for a specific game (newest first). */
  async getScoreHistory(game, max = 10) {
    if (!game) throw new Error('GSU.getScoreHistory: game is required');
    const user = await _userReady;
    const q = query(
      collection(db, `users/${user.uid}/scores`),
      where('game', '==', String(game)),
      orderBy('timestamp', 'desc'),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  
  // --------------------------------------------------------
  // SOVEREIGN HANDSHAKE — intake form submission
  // --------------------------------------------------------
  
  /**
   * Submit a Sovereign Handshake intake form. Stored at handshakes/{auto-id}.
   * Only admins can read submissions; users cannot read other users' data.
   * @param {Object} payload - Form data with at minimum: role, name, email
   * @returns {Promise<{id: string}>}
   */
  async submitHandshake(payload) {
    if (!payload || !payload.role || !payload.name || !payload.email) {
      throw new Error('GSU.submitHandshake: role, name, email required');
    }
    const user = await _userReady;
    const data = {
      ...payload,
      role: String(payload.role).toLowerCase(),
      name: String(payload.name).trim(),
      email: String(payload.email).trim().toLowerCase(),
      submittedAt: serverTimestamp(),
      anonymousUid: user.uid,
      matched: false,
      matchedTo: null,
      status: 'pending',
      userAgent: navigator.userAgent || '',
      referrer: document.referrer || ''
    };
    const ref = await addDoc(collection(db, 'handshakes'), data);
    return { id: ref.id };
  },
  
  // --------------------------------------------------------
  // WISDOM BRIDGE CHECKPOINTS — persistent learning progress
  // --------------------------------------------------------
  
  /**
   * Save a checkpoint completion. Stored at users/{uid}/checkpoints/{book__chapter}.
   * Subsequent saves merge into the same document (last write wins per field).
   * @param {Object} payload
   * @param {string} payload.book              - Book slug (e.g. 'wisdom-bridge')
   * @param {string} payload.chapter           - Chapter slug (e.g. 'chapter-1')
   * @param {boolean} payload.completed        - Whether checkpoint passed
   * @param {number} [payload.score]
   * @param {Object} [payload.meta]
   * @returns {Promise<Object>}
   */
  async saveCheckpoint({ book, chapter, completed, score, meta } = {}) {
    if (!book || !chapter) throw new Error('GSU.saveCheckpoint: book and chapter required');
    const user = await _userReady;
    const id = `${book}__${chapter}`;
    const data = {
      book: String(book),
      chapter: String(chapter),
      completed: !!completed,
      score: Number(score) || 0,
      meta: meta || {},
      updatedAt: serverTimestamp(),
      userId: user.uid
    };
    await setDoc(doc(db, `users/${user.uid}/checkpoints/${id}`), data, { merge: true });
    return data;
  },
  
  /** Get a single checkpoint by book + chapter. Returns null if not started. */
  async getCheckpoint(book, chapter) {
    if (!book || !chapter) throw new Error('GSU.getCheckpoint: book and chapter required');
    const user = await _userReady;
    const id = `${book}__${chapter}`;
    const snap = await getDoc(doc(db, `users/${user.uid}/checkpoints/${id}`));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
  
  /** Get all checkpoints, optionally filtered by book. */
  async getAllCheckpoints(book = null) {
    const user = await _userReady;
    const col = collection(db, `users/${user.uid}/checkpoints`);
    const q = book ? query(col, where('book', '==', String(book))) : col;
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

// Expose globally for non-module pages
if (typeof window !== 'undefined') {
  window.GSU = GSU;
  console.log('[GSU Firebase] Module loaded. Anonymous auth in progress...');
  _userReady.then(u => console.log(`[GSU Firebase] Auth ready. Anonymous uid: ${u.uid}`));
}
