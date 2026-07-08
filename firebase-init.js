const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDvrWFj-M0vHIqLMDwnOSJVCP3KLXuBCKw",
  authDomain: "dola-e171a.firebaseapp.com",
  projectId: "dola-e171a",
  storageBucket: "dola-e171a.firebasestorage.app",
  messagingSenderId: "400532787033",
  appId: "1:400532787033:web:1d5c2614e4fe8d7679c648",
  measurementId: "G-3M5WGD1XFJ"
};

firebase.initializeApp(FIREBASE_CONFIG);
const FIRESTORE_DB = firebase.firestore();

const FB_COLLECTIONS = ['users','wallets','deposits','orders','products','content','events','contacts','ads','settings'];

async function fbSync(key) {
  try {
    const raw = localStorage.getItem('neon_' + key);
    if (raw !== null) {
      await FIRESTORE_DB.collection('neon_data').doc(key).set({ items: JSON.parse(raw) });
    }
  } catch (e) {}
}

async function fbPushAll() {
  await Promise.all(FB_COLLECTIONS.map(key => fbSync(key)));
}

async function fbPullAll() {
  const promises = FB_COLLECTIONS.map(async (key) => {
    try {
      const snap = await FIRESTORE_DB.collection('neon_data').doc(key).get();
      if (snap.exists) {
        localStorage.setItem('neon_' + key, JSON.stringify(snap.data().items));
      }
    } catch (e) {}
  });
  await Promise.all(promises);
}

function fbPoll(key, fn, ms) {
  ms = ms || 3000;
  const id = setInterval(async () => {
    try {
      const snap = await FIRESTORE_DB.collection('neon_data').doc(key).get();
      if (!snap.exists) return;
      const server = JSON.stringify(snap.data().items);
      const local = localStorage.getItem('neon_' + key);
      if (server !== local) {
        localStorage.setItem('neon_' + key, server);
        if (fn) fn();
      }
    } catch (e) {}
  }, ms);
  return id;
}

function fbPollAll(fn) {
  FB_COLLECTIONS.forEach(key => fbPoll(key, () => { if (fn) fn(key); }));
}

function DBwrap(origSet) {
  return function(key, val) {
    origSet(key, val);
    fbSync(key).catch(() => {});
  };
}
