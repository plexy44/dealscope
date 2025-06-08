
// Ensure this file can run server-side, good practice though often implicit for .ts files here
// 'use server'; directive removed as it was causing issues with exporting the 'ai' object.
// This file's primary purpose is to initialize and export the genkit instance.

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let initializedAI;

try {
  if (!process.env.GOOGLE_API_KEY) {
    console.warn(
      '[Genkit Init] GOOGLE_API_KEY environment variable is NOT SET. ' +
      'Genkit will attempt to use Application Default Credentials if available in this environment. ' +
      'If running locally and not using ADC, ensure GOOGLE_API_KEY is in your .env file. ' +
      'If deployed, ensure it is configured in your hosting environment (e.g., via Secret Manager and apphosting.yaml).'
    );
  } else {
    // console.log('[Genkit Init] GOOGLE_API_KEY is set.'); // Avoid logging this in production unless for very specific debugging
  }

  initializedAI = genkit({
    plugins: [
      googleAI(), // This is where it might fail if key is missing & ADC also fails
    ],
    model: 'googleai/gemini-2.0-flash', // Default model for the app if googleAI plugin loads
  });
  console.log('[Genkit Init] Genkit initialized successfully with googleAI plugin.');

} catch (error) {
  console.error('[Genkit Init] CRITICAL: Failed to initialize Genkit with googleAI plugin. AI features will likely fail or be unavailable.', error);
  // Fallback: Initialize Genkit without the googleAI plugin if critical initialization fails.
  // This allows the app to potentially run without AI features instead of a hard crash on module import.
  initializedAI = genkit({
    plugins: [], // Initialize with no plugins
    // Do NOT specify a model here that depends on a plugin that failed to load
  });
  console.warn('[Genkit Init] Genkit initialized with a FALLBACK configuration (NO GoogleAI plugin). Google AI models will NOT be available.');
}

export const ai = initializedAI;

