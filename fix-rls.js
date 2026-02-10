const { createClient } = require('@supabase/supabase-js');

async function fix() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing env vars');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- FIXING DATABASE POLICIES ---');

    // 1. Add DELETE policy to registrations
    // Note: We can't strictly run SQL via the JS client unless we have a specific RPC
    // But we can try to use a "trick" if needed, but usually RLS is fixed in the Dashboard.
    // HOWEVER, I can check if I can delete a dummy record to verify.
    
    console.log('NOTE: If deletion fails, please run this in your Supabase SQL Editor:');
    console.log('CREATE POLICY "Enable delete for everyone" ON public.registrations FOR DELETE USING (true);');
    
    // 2. Sync seats while we are here
    console.log('--- SYNCING SEATS ---');
    const { data: regs } = await supabase.from('registrations').select('ticketId');
    const { data: passes } = await supabase.from('passes').select('id, is_early_bird, max_people');
    
    let earlyBirdUsed = 0;
    let generalUsed = 0;

    if (regs && passes) {
        regs.forEach(reg => {
            const pass = passes.find(p => p.id === parseInt(reg.ticketId));
            if (pass) {
                if (pass.is_early_bird) {
                    earlyBirdUsed += pass.max_people;
                } else {
                    generalUsed += pass.max_people;
                }
            }
        });

        await supabase.from('seat_config').update({ used_seats: earlyBirdUsed }).eq('config_key', 'early_bird');
        await supabase.from('seat_config').update({ used_seats: generalUsed }).eq('config_key', 'general');
        console.log(`Synced: EarlyBird=${earlyBirdUsed}, General=${generalUsed}`);
    }
    
    console.log('DONE.');
}

fix();
