import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "http://supabasekong-ksk8o0040o4c0g004c8cw0oc.217.15.175.69.sslip.io";
const SUPABASE_ANON_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTM2OTY4MCwiZXhwIjo0OTIxMDQzMjgwLCJyb2xlIjoiYW5vbiJ9.hFRWcPthrhrFcLPsRpiKCQtpFtXk_zapexv4Bt7wBCw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { SUPABASE_URL, SUPABASE_ANON_KEY };
