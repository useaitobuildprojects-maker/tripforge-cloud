import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uypsjomkikkvbmutsjkt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHNqb21raWtrdmJtdXRzamt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTIwOTYsImV4cCI6MjA4OTA2ODA5Nn0.lX6kOF-uFOa903Z0ksG2tJ4xW2AspSnJjdjWjet6Heo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
