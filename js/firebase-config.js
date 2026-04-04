// firebase-config.js
// Lazily loads Firebase SDK modules on first use and re-exports helpers.

const firebaseConfig = {
	apiKey: 'AIzaSyDSYKNGXQTY-Zr3NkgLVIfRd0md9eTaNVE',
	authDomain: 'jwel369.firebaseapp.com',
	projectId: 'jwel369',
	storageBucket: 'jwel369.firebasestorage.app',
	messagingSenderId: '483619642721',
	appId: '1:483619642721:web:59d579d8410bd9d08ab920',
	measurementId: 'G-SNECGK387P'
};

let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;

let collection = null;
let getDocs = null;
let addDoc = null;
let updateDoc = null;
let deleteDoc = null;
let docRef = null;
let getDocRef = null;
let setDocRef = null;
let onSnapshotRef = null;
let queryRef = null;
let orderByRef = null;
let whereRef = null;
let limitRef = null;
let serverTimestampRef = null;

let storageRef = null;
let uploadBytesRef = null;
let getDownloadURLRef = null;

let signInWithEmailAndPasswordRef = null;
let signOutRef = null;
let onAuthStateChangedRef = null;
let getAnalyticsRef = null;
let isAnalyticsSupportedRef = null;

let initPromise = null;

async function importFirebase(version) {
	const [appMod, authMod, fsMod, storageMod, analyticsMod] = await Promise.all([
		import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
		import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
		import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`),
		import(`https://www.gstatic.com/firebasejs/${version}/firebase-storage.js`),
		import(`https://www.gstatic.com/firebasejs/${version}/firebase-analytics.js`).catch((err) => {
			console.warn(`[firebase-config] Failed to load analytics SDK v${version}`, err);
			return null;
		})
	]);
	return { appMod, authMod, fsMod, storageMod, analyticsMod };
}

async function ensureInitialized() {
	if (app) {
		return { app, auth, db, storage, analytics };
	}

	if (!initPromise) {
		initPromise = (async () => {
			let mods;
			try {
				mods = await importFirebase('11.0.1');
			} catch (err) {
				mods = await importFirebase('10.12.5');
			}

			const { appMod, authMod, fsMod, storageMod, analyticsMod } = mods;
			app = appMod.initializeApp(firebaseConfig);
			auth = authMod.getAuth(app);
			db = fsMod.getFirestore(app);
			storage = storageMod.getStorage(app);

			collection = fsMod.collection;
			getDocs = fsMod.getDocs;
			addDoc = fsMod.addDoc;
			updateDoc = fsMod.updateDoc;
			deleteDoc = fsMod.deleteDoc;
			docRef = fsMod.doc;
			getDocRef = fsMod.getDoc || null;
			setDocRef = fsMod.setDoc || null;
			onSnapshotRef = fsMod.onSnapshot || null;
			queryRef = fsMod.query || null;
			orderByRef = fsMod.orderBy || null;
			whereRef = fsMod.where || null;
			limitRef = fsMod.limit || null;
			serverTimestampRef = fsMod.serverTimestamp || null;

			storageRef = storageMod.ref;
			uploadBytesRef = storageMod.uploadBytes;
			getDownloadURLRef = storageMod.getDownloadURL;

			signInWithEmailAndPasswordRef = authMod.signInWithEmailAndPassword || null;
			signOutRef = authMod.signOut || null;
			onAuthStateChangedRef = authMod.onAuthStateChanged || null;

			getAnalyticsRef = analyticsMod ? analyticsMod.getAnalytics || null : null;
			isAnalyticsSupportedRef = analyticsMod ? analyticsMod.isSupported || null : null;
			if (analyticsMod && analyticsMod.isSupported && analyticsMod.getAnalytics) {
				try {
					if (await analyticsMod.isSupported()) {
						analytics = analyticsMod.getAnalytics(app);
					}
				} catch (analyticsErr) {
					console.warn('[firebase-config] Analytics initialization skipped', analyticsErr);
				}
			}

			return { app, auth, db, storage, analytics };
		})();
	}

	return initPromise;
}

async function initFirebaseIfNeeded() {
	return ensureInitialized();
}

// Prime the initialization in the background but don't block importers.
const _initPromise = ensureInitialized().catch((err) => {
	console.warn('[firebase-config] Lazy initialization failed', err);
	return { app: null, auth: null, db: null, storage: null };
});

export {
	app,
	auth,
	db,
	storage,
	analytics,
	collection,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	docRef as doc,
	getDocRef as getDoc,
	setDocRef as setDoc,
	onSnapshotRef as onSnapshot,
	queryRef as query,
	orderByRef as orderBy,
	whereRef as where,
	limitRef as limit,
	serverTimestampRef as serverTimestamp,
	storageRef as ref,
	uploadBytesRef as uploadBytes,
	getDownloadURLRef as getDownloadURL,
	signInWithEmailAndPasswordRef as signInWithEmailAndPassword,
	signOutRef as signOut,
	onAuthStateChangedRef as onAuthStateChanged,
	getAnalyticsRef as getAnalytics,
	isAnalyticsSupportedRef as isAnalyticsSupported,
	initFirebaseIfNeeded,
	_initPromise as initPromise
};
