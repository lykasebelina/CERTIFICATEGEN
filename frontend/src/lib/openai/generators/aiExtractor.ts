// src/lib/openai/generators/aiExtractor.ts (FIXED)

export async function extractCertificateDetailsAI(prompt: string): Promise<AIDetails> {
  
  // 1. Get the base URL from the environment variable (VITE_API_BASE_URL).
  // 2. If the variable is not set (i.e., local development), default to the relative path '/'.
  //    NOTE: Using a relative path '/' for the base URL is the safest method for Vercel,
  //    as it directs the request back to the Vercel app's own domain.
  const baseURL = import.meta.env.VITE_API_BASE_URL || ''; 
  
  const res = await fetch(${baseURL}/extract, { // <--- Changed here
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) throw new Error("Failed to extract certificate details");
  return res.json();
}