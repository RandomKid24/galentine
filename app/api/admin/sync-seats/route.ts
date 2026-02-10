import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
    try {
        // 1. Fetch all registrations
        const { data: registrations, error: regError } = await supabase
            .from('registrations')
            .select('ticketId');

        if (regError) throw regError;

        // 2. Fetch all passes to map ticketId to seats/early_bird
        const { data: passes, error: passError } = await supabase
            .from('passes')
            .select('id, is_early_bird, max_people');

        if (passError) throw passError;

        // 3. Calculate used seats
        let earlyBirdUsed = 0;
        let generalUsed = 0;

        registrations.forEach(reg => {
            const pass = passes.find(p => p.id === parseInt(reg.ticketId));
            if (pass) {
                if (pass.is_early_bird) {
                    earlyBirdUsed += pass.max_people;
                } else {
                    generalUsed += pass.max_people;
                }
            }
        });

        // 4. Update seat_config table
        await supabase
            .from('seat_config')
            .update({ used_seats: earlyBirdUsed, updated_at: new Date().toISOString() })
            .eq('config_key', 'early_bird');

        await supabase
            .from('seat_config')
            .update({ used_seats: generalUsed, updated_at: new Date().toISOString() })
            .eq('config_key', 'general');

        return NextResponse.json({
            success: true,
            counts: {
                early_bird: earlyBirdUsed,
                general: generalUsed
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
