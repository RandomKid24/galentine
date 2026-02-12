import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '../../../lib/supabase';

export async function POST(request: Request) {
    try {
        const { registrationId } = await request.json();

        if (!registrationId) {
            return NextResponse.json({ success: false, message: 'Registration ID is required' }, { status: 400 });
        }

        // 1. Fetch registration details
        const { data: registration, error: regError } = await supabase
            .from('registrations')
            .select('*')
            .eq('id', registrationId)
            .single();

        if (regError || !registration) {
            return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
        }

        // 2. Fetch the pass to determine if it's early bird and max_people
        const { data: passData, error: passError } = await supabase
            .from('passes')
            .select('is_early_bird, max_people, title')
            .eq('id', parseInt(registration.ticketId))
            .single();

        if (passError || !passData) {
            return NextResponse.json({ success: false, message: 'Pass not found' }, { status: 404 });
        }

        const seatPool = passData.is_early_bird ? 'early_bird' : 'general';
        const maxPeople = passData.max_people || 1;

        // 3. Restore seats by decrementing used_seats
        const { data: seatConfig, error: seatError } = await supabase
            .from('seat_config')
            .select('*')
            .eq('config_key', seatPool)
            .single();

        if (seatError || !seatConfig) {
            return NextResponse.json({ success: false, message: 'Seat configuration not found' }, { status: 404 });
        }

        // Decrement used_seats (restore seats)
        const newUsedSeats = Math.max(0, seatConfig.used_seats - maxPeople);
        
        const { error: updateSeatError } = await supabase
            .from('seat_config')
            .update({ used_seats: newUsedSeats })
            .eq('config_key', seatPool);

        if (updateSeatError) {
            console.error('Failed to restore seats:', updateSeatError);
            return NextResponse.json({ success: false, message: 'Failed to restore seats' }, { status: 500 });
        }

        // 4. Update registration status to 'rejected'
        const { supabaseAdmin } = await import('../../../lib/supabaseAdmin');
        const db = supabaseAdmin || supabase;
        
        const { data: updateData, error: updateError } = await db
            .from('registrations')
            .update({ status: 'rejected' })
            .eq('id', registrationId)
            .select();

        if (updateError) {
            console.error('Failed to update status:', updateError);
            return NextResponse.json({ success: false, message: 'Failed to update registration status: ' + updateError.message }, { status: 500 });
        }

        if (!updateData || updateData.length === 0) {
            console.error('Update failed: No rows affected. Likely RLS policy issue.');
            return NextResponse.json({ 
                success: false, 
                message: 'Database update restricted. Please ensure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file.' 
            }, { status: 500 });
        }

        // No email sent on rejection - just return success
        return NextResponse.json({ 
            success: true, 
            message: 'Registration rejected and seats restored.',
            seatsRestored: maxPeople,
            seatPool: seatPool
        });

    } catch (error: any) {
        console.error('Rejection Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Failed to reject registration' }, { status: 500 });
    }
}
