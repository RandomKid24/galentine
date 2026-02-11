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

        // 1b. Fetch pass details for the email
        const { data: passData } = await supabase
            .from('passes')
            .select('title')
            .eq('id', parseInt(registration.ticketId))
            .single();

        // 2. Fetch SMTP settings
        const { data: configData, error: configError } = await supabase
            .from('config')
            .select('value')
            .eq('key', 'smtp_settings')
            .single();

        if (configError || !configData?.value) {
            return NextResponse.json({ success: false, message: 'SMTP settings not configured' }, { status: 500 });
        }

        const settings = configData.value;
        
        // 3. Update status in database
        // Use supabaseAdmin if available to bypass RLS
        const { supabaseAdmin } = await import('../../../lib/supabaseAdmin');
        const db = supabaseAdmin || supabase;
        
        const { data: updateData, error: updateError } = await db
            .from('registrations')
            .update({ status: 'confirmed' })
            .eq('id', registrationId)
            .select();

        if (updateError) {
            console.error('Failed to update status:', updateError);
            return NextResponse.json({ success: false, message: 'Failed to update registration status: ' + updateError.message }, { status: 500 });
        }

        // If no rows were updated, it's likely an RLS permission issue
        if (!updateData || updateData.length === 0) {
            console.error('Update failed: No rows affected. Likely RLS policy issue.');
            return NextResponse.json({ 
                success: false, 
                message: 'Database update restricted. Please ensure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file.' 
            }, { status: 500 });
        }

        // 4. Send Confirmation Email
        if (settings.host && settings.username && settings.password) {
            const transporter = nodemailer.createTransport({
                host: settings.host,
                port: parseInt(settings.port),
                secure: settings.port === 465,
                auth: {
                    user: settings.username,
                    pass: settings.password,
                }
            });

            // Force IPv4
            (transporter as any).options.family = 4;

            // Generate a unique key (Deterministic based on ID to match export)
            const idStr = registrationId.toString().padStart(4, '0');
            const hash = ((registrationId * 7531 + 12345) % 46656).toString(36).padStart(3, '0').toUpperCase();
            const uniqueKey = `GAL26-${idStr}-${hash}`;

            await transporter.sendMail({
                from: `"${settings.fromName}" <${settings.fromEmail || settings.username}>`,
                to: registration.email,
                subject: `SEAT CONFIRMED - Galentine's 2026 💖`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 2px solid #be123c; border-radius: 16px; background-color: #ffffff; color: #4c0519;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">💖</div>
                            <h1 style="color: #be123c; font-size: 26px; margin-bottom: 8px; font-family: serif;">Your Seat is Confirmed!</h1>
                            <p style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; color: #db2777; font-weight: bold;">Galentine's Day 2026</p>
                        </div>
                        
                        <p style="font-size: 16px; line-height: 1.6; text-align: center;">Hello <strong>${registration.fullName}</strong>,</p>
                        
                        <p style="font-size: 16px; line-height: 1.6; text-align: center;">Great news! Your payment has been verified and your seat for the Galentine's 2026 event is now officially <strong>CONFIRMED</strong>.</p>
                        
                        <div style="text-align: center; margin: 10px 0;">
                            <span style="background: #fff1f2; color: #be123c; padding: 5px 15px; rounded: 20px; font-size: 13px; font-weight: bold; border: 1px solid #fecdd3;">
                                ${passData?.title || 'General Entry'}
                            </span>
                        </div>
                        
                        <div style="background-color: #fff1f2; border: 2px dashed #fecdd3; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #9f1239; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Your Unique Confirmation Key</p>
                            <div style="font-family: monospace; font-size: 24px; color: #be123c; font-weight: bold; letter-spacing: 2px; background: white; padding: 10px; border-radius: 8px; display: inline-block;">
                                ${uniqueKey}
                            </div>
                            <p style="margin: 15px 0 0 0; color: #db2777; font-size: 11px;">Please keep this key safe. You will need it for entry at the venue.</p>
                            
                            ${registration.additionalNames && (Array.isArray(registration.additionalNames) ? registration.additionalNames.length > 0 : JSON.parse(registration.additionalNames).length > 0) ? `
                            <div style="margin-top: 15px; border-top: 1px solid #fecdd3; padding-top: 15px;">
                                <p style="margin: 0; color: #be123c; font-size: 11px; font-weight: bold;">Confirmed Guests:</p>
                                <p style="margin: 5px 0 0 0; color: #4c0519; font-size: 11px;">
                                    ${registration.fullName}<br/>
                                    ${(Array.isArray(registration.additionalNames) ? registration.additionalNames : JSON.parse(registration.additionalNames)).join('<br/>')}
                                </p>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div style="font-size: 14px; line-height: 1.6; color: #881337; background: #fff9fb; padding: 15px; border-radius: 8px;">
                            <strong>Note:</strong> We are preparing a magical evening for you. Expect soft indulgence, powerful connections, and an atmosphere filled with love and friendship.
                        </div>

                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ffe4e6; text-align: center;">
                            <p style="font-size: 13px; color: #be123c; font-weight: bold;">With Love,</p>
                            <p style="font-size: 13px; color: #be123c; font-weight: bold;">sharedsmilesco</p>
                            <p style="font-size: 10px; color: #9ca3af; margin-top: 10px;">If you have any questions, please reply to this email.</p>
                        </div>
                    </div>
                `,
            });
        }

        return NextResponse.json({ success: true, message: 'Registration confirmed and email sent.' });

    } catch (error: any) {
        console.error('Confirmation Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Failed to confirm registration' }, { status: 500 });
    }
}
