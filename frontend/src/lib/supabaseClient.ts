// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vusdhnuwunesusxgopow.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1c2RobnV3dW5lc3VzeGdvcG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzQwNDMsImV4cCI6MjA3NjY1MDA0M30.C6pDK_KIaFBGTsrwBudW7lrPBH7htRuUaYKuitzgEQo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
