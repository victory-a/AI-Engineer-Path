import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { checkEnvironment } from './utils.js';

checkEnvironment();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const privateKey = process.env.SUPABASE_API_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_API_KEY`);
const url = process.env.SUPABASE_URL;
if (!url) throw new Error(`Expected env var SUPABASE_URL`);
const supabase = createClient(url, privateKey);

export { openai, supabase };
