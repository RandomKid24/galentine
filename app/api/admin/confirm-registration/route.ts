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

            // Calculate number of attendees
            const additionalNamesArray = registration.additionalNames && Array.isArray(registration.additionalNames) 
                ? registration.additionalNames 
                : (registration.additionalNames ? JSON.parse(registration.additionalNames) : []);
            const totalAttendees = 1 + additionalNamesArray.length;

            // Build guest names list
            let guestNamesHtml = '';
            if (additionalNamesArray.length > 0) {
                const allGuests = [registration.fullName, ...additionalNamesArray];
                guestNamesHtml = `
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff9fb; border-left: 4px solid #db2777; border-radius: 8px; margin: 25px 0;">
                        <tr>
                            <td style="padding: 20px;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #be123c; font-weight: bold;">👥 Guest Names:</p>
                                ${allGuests.map((name, index) => `<p style="margin: 5px 0; font-size: 14px; color: #333333;">• ${name}</p>`).join('')}
                            </td>
                        </tr>
                    </table>
                `;
            }

            await transporter.sendMail({
                from: `"${settings.fromName}" <${settings.fromEmail || settings.username}>`,
                to: registration.email,
                subject: `🎉 Registration Confirmed – Galentine's: A Curated Experience Celebrating Womanhood`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #fef2f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                        
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #be123c 0%, #db2777 100%); padding: 40px 30px; text-align: center;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Registration Confirmed</h1>
                                                <p style="margin: 10px 0 0 0; color: #fecdd3; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">GALENTINE'S DAY 2026</p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Body -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                
                                                <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">Hello <strong>${registration.fullName}</strong> ✨,</p>
                                                
                                                <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">We're so excited to let you know that your registration for <strong>Galentine's – A Curated Experience Celebrating Womanhood</strong> has been successfully confirmed! 💖</p>
                                                
                                                <p style="margin: 0 0 25px 0; font-size: 16px; color: #333333; line-height: 1.6;">Here are the event details for your reference:</p>
                                                
                                                <!-- Event Details Box -->
                                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff1f2; border-left: 4px solid #be123c; border-radius: 8px; margin: 25px 0;">
                                                    <tr>
                                                        <td style="padding: 25px;">
                                                            <p style="margin: 0 0 15px 0; font-size: 16px; color: #be123c; font-weight: bold;">👤 Registered Name: ${registration.fullName}</p>
                                                            <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong style="color: #be123c;">📅 Date:</strong> 20th February 2026</p>
                                                            <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong style="color: #be123c;">⏰ Time:</strong> 11:00 AM onwards</p>
                                                            <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong style="color: #be123c;">🚪 Entry Open Till:</strong> 11:30 AM</p>
                                                            <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong style="color: #be123c;">📍 Venue:</strong> Elo Cafe, Gangapur Road, Nashik</p>
                                                            <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong style="color: #be123c;">👯 Number of Attendees:</strong> ${totalAttendees}</p>
                                                            <p style="margin: 0; font-size: 15px; color: #333333;"><strong style="color: #be123c;">🎫 Unique ID:</strong> <span style="font-family: 'Courier New', monospace; color: #be123c; font-weight: bold; background-color: #ffffff; padding: 6px 12px; border-radius: 6px; border: 2px solid #fecdd3; display: inline-block; margin-top: 5px; letter-spacing: 1px;">${uniqueKey}</span></p>
                                                        </td>
                                                    </tr>
                                                </table>
                                                
                                                ${guestNamesHtml}
                                                
                                                <p style="margin: 25px 0; font-size: 16px; color: #333333; line-height: 1.6;">Get ready for a thoughtfully curated experience filled with warmth, connection, creativity, and celebration of womanhood 🤍</p>
                                                
                                                <p style="margin: 25px 0; font-size: 16px; color: #333333; line-height: 1.6; font-weight: 600;">We can't wait to share this beautiful day with you!</p>
                                                
                                                <p style="margin: 25px 0; font-size: 15px; color: #666666; line-height: 1.6;">If you have any questions or need assistance, feel free to reach out to us anytime.</p>
                                                
                                                <p style="margin: 30px 0 10px 0; font-size: 16px; color: #333333;">See you soon ✨</p>
                                                
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 30px; background-color: #fef2f2; border-top: 1px solid #fecdd3;">
                                                <p style="margin: 0 0 5px 0; font-size: 15px; color: #be123c; font-weight: 600;">With love,</p>
                                                <p style="margin: 0 0 15px 0; font-size: 15px; color: #be123c; font-weight: 600;">Team SharedSmilesCo.</p>
                                                <p style="margin: 0; font-size: 13px; color: #9ca3af; font-style: italic;">Creating moments. Sharing smiles. 💫</p>
                                            </td>
                                        </tr>
                                        
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `,
            });
        }

        return NextResponse.json({ success: true, message: 'Registration confirmed and email sent.' });

    } catch (error: any) {
        console.error('Confirmation Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Failed to confirm registration' }, { status: 500 });
    }
}
