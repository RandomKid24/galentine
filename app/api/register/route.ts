import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '../../lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fullName, email, phone, ticketId, additionalNames, wantsUpdates } = body;

        // 1. Insert into Supabase
        const { data: regData, error: regError } = await supabase
            .from('registrations')
            .insert([
                {
                    fullName,
                    email,
                    phone,
                    ticketId,
                    additionalNames,
                    wantsUpdates
                }
            ])
            .select()
            .single();

        if (regError) throw regError;

        // 2. Fetch SMTP settings from Supabase
        const { data: configData, error: configError } = await supabase
            .from('config')
            .select('value')
            .eq('key', 'smtp_settings')
            .single();

        if (!configError && configData) {
            const settings = configData.value;

            // 3. Send Email
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

                const ticketEmojiMap: Record<string, string> = {
                    'early-bird': '🌸',
                    'regular-pass': '🌷',
                    'premium-pass': '💖',
                    'duo-regular': '👯‍♀️',
                    'premium-duo': '💖',
                };

                const emoji = ticketEmojiMap[ticketId] || '✨';

                await transporter.sendMail({
                    from: `"${settings.fromName}" <${settings.fromEmail || settings.username}>`,
                    to: email,
                    subject: `Registration Confirmed - Galentine's 2026 ${emoji}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #fecdd3; border-radius: 16px; background-color: #ffffff; color: #4c0519;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #be123c; font-size: 24px; margin-bottom: 8px;">Registration Confirmed</h1>
                                <p style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; color: #db2777;">Galentine's Day 2026</p>
                            </div>
                            
                            <p style="font-size: 16px; line-height: 1.5;">Hello <strong>${fullName}</strong>,</p>
                            
                            <p style="font-size: 16px; line-height: 1.5;">Thank you for registering. This email confirms that we have successfully received your information and your spot is reserved.</p>
                            
                            <div style="background-color: #fff9fb; border: 1px solid #ffe4e6; border-radius: 12px; padding: 20px; margin: 30px 0;">
                                <h3 style="margin-top: 0; color: #be123c; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 15px; border-bottom: 1px solid #ffe4e6; padding-bottom: 10px;">Event Details</h3>
                                
                                <div style="margin-bottom: 10px;">
                                    <span style="color: #db2777; font-weight: bold; font-size: 13px;">Ticket Type:</span>
                                    <span style="font-size: 13px; margin-left: 10px;">${ticketId.replace('-', ' ').toUpperCase()}</span>
                                </div>
                                
                                ${additionalNames && additionalNames.length > 0 ? `
                                <div style="margin-bottom: 10px;">
                                    <span style="color: #db2777; font-weight: bold; font-size: 13px;">Additional Guests:</span>
                                    <div style="font-size: 13px; margin-top: 5px; color: #4c0519; padding-left: 10px;">
                                        ${additionalNames.map((name: string) => `• ${name}`).join('<br/>')}
                                    </div>
                                </div>
                                ` : ''}

                                <div>
                                    <span style="color: #db2777; font-weight: bold; font-size: 13px;">Status:</span>
                                    <span style="font-size: 13px; margin-left: 10px; color: #059669; font-weight: bold;">Confirmed ✅</span>
                                </div>
                            </div>

                            <p style="font-size: 16px; line-height: 1.5;">We look forward to seeing you at the event.</p>
                            
                            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center;">
                                <p style="font-size: 12px; color: #9f1239; font-weight: bold;">Ananya & Co.</p>
                                <p style="font-size: 10px; color: #9ca3af; margin-top: 5px;">2026 Event Team</p>
                            </div>
                        </div>
                    `,
                });
            }
        }

        return NextResponse.json({ success: true, registration: regData });

    } catch (error: any) {
        console.error('Registration/Email Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Operation failed.' },
            { status: 500 }
        );
    }
}
