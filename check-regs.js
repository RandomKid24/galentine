const { createClient } = require('@supabase/supabase-js');
async function check() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: regs, error } = await supabase.from('registrations').select('*');
    if (error) console.error('ERROR:', error);
    console.log('REGS:', regs);
}
check();
