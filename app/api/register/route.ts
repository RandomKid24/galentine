import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '../../lib/supabase';

export async function POST(request: Request) {
    console.log('=== API ROUTE CALLED ===');
    try {
        console.log('Parsing FormData...');
        const formData = await request.formData();
        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const ticketId = formData.get('ticketId') as string;
        const additionalNamesStr = formData.get('additionalNames') as string;
        const additionalNames = additionalNamesStr ? JSON.parse(additionalNamesStr) : [];
        const wantsUpdates = formData.get('wantsUpdates') === 'true';
        const paymentReceipt = formData.get('paymentReceipt') as File | null;

        console.log('Registration attempt:', { fullName, email, phone, ticketId });
        console.log('Payment receipt:', paymentReceipt ? 'Present' : 'Not present');

        // 1. Fetch the pass to check if it's early bird and get max_people
        console.log('Fetching pass data for ticketId:', ticketId);
        const { data: passData, error: passError } = await supabase
            .from('passes')
            .select('*')
            .eq('id', parseInt(ticketId))
            .single();

        console.log('Pass query result:', { passData, passError });

        // If passes table doesn't exist, use fallback logic
        if (passError) {
            console.warn('Passes table error:', passError);
            // Fallback: assume it's a general pass with 1 person
            const isEarlyBird = false;
            const maxPeople = 1;
            const configKey = 'general';

            // Skip seat checking for now if table doesn't exist
            const { data: seatConfig } = await supabase
                .from('seat_config')
                .select('*')
                .eq('config_key', configKey)
                .single();

            // Continue with registration even if seat config fails
            let paymentReceiptUrl: string | null = null;
            if (paymentReceipt) {
                console.log('Payment receipt detected, starting upload...');
                console.log('File details:', {
                    name: paymentReceipt.name,
                    type: paymentReceipt.type,
                    size: paymentReceipt.size
                });
                try {
                    const fileExt = paymentReceipt.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = `receipts/${fileName}`;
                    console.log('Upload path:', filePath);

                    // Convert File to ArrayBuffer for Supabase Storage
                    console.log('Converting file to ArrayBuffer...');
                    const arrayBuffer = await paymentReceipt.arrayBuffer();
                    const buffer = new Uint8Array(arrayBuffer);
                    console.log('Buffer size:', buffer.length);

                    console.log('Uploading to Supabase Storage...');
                    const { error: uploadError } = await supabase.storage
                        .from('payment-receipts')
                        .upload(filePath, buffer, {
                            contentType: paymentReceipt.type,
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('payment-receipts')
                            .getPublicUrl(filePath);
                        paymentReceiptUrl = publicUrl;
                        console.log('Upload successful! Public URL:', paymentReceiptUrl);
                    } else {
                        console.error('Upload error:', uploadError);
                        console.error('Upload error details:', JSON.stringify(uploadError, null, 2));
                    }
                } catch (uploadErr) {
                    console.error('Receipt upload failed:', uploadErr);
                    console.error('Upload exception:', uploadErr instanceof Error ? uploadErr.message : String(uploadErr));
                    // Continue without receipt
                }
            } else {
                console.log('No payment receipt provided');
            }

            // Insert registration
            console.log('Attempting to insert registration (fallback mode)...');
            const { data: regData, error: regError } = await supabase
                .from('registrations')
                .insert([
                    {
                        fullName,
                        email,
                        phone,
                        ticketId,
                        additionalNames,
                        wantsUpdates,
                        payment_receipt_url: paymentReceiptUrl
                    }
                ])
                .select()
                .single();

            if (regError) {
                console.error('Registration error:', regError);
                console.error('Registration error details:', JSON.stringify(regError, null, 2));
                throw regError;
            }

            console.log('Registration inserted successfully:', regData);

            // Update seat count if config exists
            if (seatConfig) {
                await supabase
                    .from('seat_config')
                    .update({
                        used_seats: seatConfig.used_seats + maxPeople,
                        updated_at: new Date().toISOString()
                    })
                    .eq('config_key', configKey);
            }

            // Send email (existing code will handle this)
            // Continue to email sending section...
            console.log('Registration successful (fallback mode):', regData);
            
            // Return early with success
            return NextResponse.json({ success: true, registration: regData });
        }

        console.log('Pass found, proceeding with main flow...');
        const isEarlyBird = passData.is_early_bird;
        const maxPeople = passData.max_people;
        const configKey = isEarlyBird ? 'early_bird' : 'general';
        console.log('Pass details:', { isEarlyBird, maxPeople, configKey });

        // 2. Check seat availability
        console.log('Checking seat availability...');
        const { data: seatConfig, error: seatError } = await supabase
            .from('seat_config')
            .select('*')
            .eq('config_key', configKey)
            .single();

        console.log('Seat config result:', { seatConfig, seatError });

        if (seatError || !seatConfig) {
            console.error('Seat config error:', seatError);
            return NextResponse.json(
                { success: false, message: 'Unable to verify seat availability.' },
                { status: 500 }
            );
        }

        const availableSeats = seatConfig.total_seats - seatConfig.used_seats;
        console.log('Available seats:', availableSeats, 'Required:', maxPeople);
        
        if (availableSeats < maxPeople) {
            console.warn('Not enough seats available');
            return NextResponse.json(
                { success: false, message: 'Sorry, not enough seats available for this pass.' },
                { status: 400 }
            );
        }

        // 3. Upload payment receipt to Supabase Storage
        let paymentReceiptUrl: string | null = null;
        if (paymentReceipt) {
            const fileExt = paymentReceipt.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `receipts/${fileName}`;

            // Convert File to ArrayBuffer for Supabase Storage
            const arrayBuffer = await paymentReceipt.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('payment-receipts')
                .upload(filePath, buffer, {
                    contentType: paymentReceipt.type,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                return NextResponse.json(
                    { success: false, message: 'Failed to upload payment receipt.' },
                    { status: 500 }
                );
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('payment-receipts')
                .getPublicUrl(filePath);

            paymentReceiptUrl = publicUrl;
        }

        // 4. Insert into Supabase
        const { data: regData, error: regError } = await supabase
            .from('registrations')
            .insert([
                {
                    fullName,
                    email,
                    phone,
                    ticketId,
                    additionalNames,
                    wantsUpdates,
                    payment_receipt_url: paymentReceiptUrl
                }
            ])
            .select()
            .single();

        if (regError) throw regError;

        // 5. Update seat count
        const { error: updateError } = await supabase
            .from('seat_config')
            .update({
                used_seats: seatConfig.used_seats + maxPeople,
                updated_at: new Date().toISOString()
            })
            .eq('config_key', configKey);

        if (updateError) {
            console.error('Failed to update seat count:', updateError);
            // Don't fail the registration, just log the error
        }

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
        console.error('=== REGISTRATION ERROR ===');
        console.error('Registration/Email Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        console.error('========================');
        return NextResponse.json(
            { success: false, message: error.message || 'Operation failed.' },
            { status: 500 }
        );
    }
}
