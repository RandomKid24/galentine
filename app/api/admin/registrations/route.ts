import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const registrationId = searchParams.get('id');

        if (!registrationId) {
            return NextResponse.json(
                { success: false, message: 'Registration ID is required' },
                { status: 400 }
            );
        }

        // 1. Fetch the registration to get ticket info
        console.log('Admin Delete: Fetching registration ID:', registrationId);
        const { data: registration, error: fetchError } = await supabase
            .from('registrations')
            .select('ticketId')
            .eq('id', parseInt(registrationId))
            .single();

        if (fetchError || !registration) {
            console.error('Admin Delete: Registration not found or error:', fetchError);
            return NextResponse.json(
                { success: false, message: 'Registration not found' },
                { status: 404 }
            );
        }

        console.log('Admin Delete: Found registration. TicketId:', registration.ticketId);

        // 2. Fetch the pass to determine if it's early bird and max_people
        const { data: passData, error: passError } = await supabase
            .from('passes')
            .select('is_early_bird, max_people')
            .eq('id', parseInt(registration.ticketId))
            .single();

        if (passError) {
            console.error('Admin Delete: Pass data error (non-critical for delete):', passError);
        }

        // 3. Delete the registration
        console.log('Admin Delete: Deleting registration table entry...');
        const { supabaseAdmin } = await import('../../../lib/supabaseAdmin');
        const db = supabaseAdmin || supabase;

        const { data: deleteData, error: deleteError } = await db
            .from('registrations')
            .delete()
            .eq('id', parseInt(registrationId))
            .select();

        if (deleteError) {
            console.error('Delete error:', deleteError);
            return NextResponse.json(
                { 
                    success: false, 
                    message: `Internal Database Error: ${deleteError.message}. This is likely a permission issue in Supabase.`,
                    error: deleteError 
                },
                { status: 500 }
            );
        }

        // If no rows were deleted but no error, it's likely RLS
        if (!deleteData || deleteData.length === 0) {
            console.error('Delete failed: No rows affected. Likely RLS policy issue.');
            return NextResponse.json({ 
                success: false, 
                message: 'Database delete restricted. Please add SUPABASE_SERVICE_ROLE_KEY to your env.' 
            }, { status: 500 });
        }

        // 4. Update seat count if pass data exists
        if (!passError && passData) {
            const configKey = passData.is_early_bird ? 'early_bird' : 'general';
            const maxPeople = passData.max_people;

            // Get current seat config
            const { data: seatConfig, error: seatError } = await supabase
                .from('seat_config')
                .select('used_seats')
                .eq('config_key', configKey)
                .single();

            if (!seatError && seatConfig) {
                // Decrement the used seats
                const newUsedSeats = Math.max(0, seatConfig.used_seats - maxPeople);
                
                await supabase
                    .from('seat_config')
                    .update({
                        used_seats: newUsedSeats,
                        updated_at: new Date().toISOString()
                    })
                    .eq('config_key', configKey);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Registration deleted successfully' 
        });

    } catch (error: any) {
        console.error('Delete registration error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Operation failed' },
            { status: 500 }
        );
    }
}
