
import * as admin from 'firebase-admin';


if (!admin.apps.length) {
  try {
    // Attempt to initialize using GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_CONFIG first
    // These are standard ways the Admin SDK tries to auto-configure.
    admin.initializeApp();
    console.log('[Firebase Admin] Initialized using default credentials (GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_CONFIG).');
  } catch (e) {
    console.warn(`[Firebase Admin] Default initialization failed (Error: ${e instanceof Error ? e.message : String(e)}). Attempting fallback to individual environment variables.`);
    // Fallback to constructing Admin SDK config from individual environment variables
    // This is less common for App Hosting if secrets are used for GOOGLE_APPLICATION_CREDENTIALS,
    // but provided as a comprehensive fallback.
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (projectId && privateKey && clientEmail) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: projectId,
            privateKey: privateKey,
            clientEmail: clientEmail,
          }),
        });
        console.log('[Firebase Admin] Initialized using individual Firebase Admin environment variables.');
      } catch (initErr) {
        console.error('[Firebase Admin] CRITICAL: Failed to initialize Admin SDK using individual environment variables.', initErr);
      }
    } else {
      let missingVars = [];
      if (!projectId) missingVars.push("FIREBASE_PROJECT_ID");
      if (!privateKey) missingVars.push("FIREBASE_PRIVATE_KEY");
      if (!clientEmail) missingVars.push("FIREBASE_CLIENT_EMAIL");
      
      console.error(`[Firebase Admin] SDK NOT INITIALIZED. Default initialization failed, and not all required individual Firebase Admin environment variables were found. Missing: ${missingVars.join(', ') || 'Unknown (ensure GOOGLE_APPLICATION_CREDENTIALS or individual Firebase admin vars are set)'}.`);
    }
  }
}

export const firebaseAdmin = admin;
// Example exports if you use these services:
// export const dbAdmin = admin.firestore();
// export const authAdmin = admin.auth();

