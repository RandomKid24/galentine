import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { host, port, username, password, enableSsl, fromName, fromEmail, testEmail } = body;

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: host,
            port: parseInt(port),
            secure: port === 465, // Only true for port 465
            auth: {
                user: username,
                pass: password,
            },
            tls: {
                // Do not fail on invalid certs
                rejectUnauthorized: false
            }
        } as any); // Cast as any to avoid type issues with family property in some versions if required, 
        // but usually it's supported. Actually, let's just add it.

        (transporter as any).options.family = 4; // More robust way for some nodemailer versions

        // Verify connection configuration
        if (!testEmail) {
            await transporter.verify();
            return NextResponse.json({ success: true, message: 'Connection Successful!' });
        }

        // Send actual test email if recipient is provided
        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: testEmail,
            subject: "Galentine's 2026 - SMTP Test Email 📧",
            text: "Hello! This is a test email from your Galentine's 2026 Admin Panel. Your SMTP configuration is working perfectly!",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fecdd3; border-radius: 12px; background-color: #fff9fb;">
                    <h2 style="color: #9d174d; font-style: italic;">Galentine's 2026</h2>
                    <p style="color: #4c0519; font-size: 16px;">This is a test email to confirm your SMTP settings are correct.</p>
                    <div style="padding: 15px; background-color: #fff1f2; border-radius: 8px; border-left: 4px solid #db2777;">
                        <p style="margin: 0; color: #be123c; font-weight: bold;">Configuration Verified!</p>
                        <p style="margin: 5px 0 0 0; color: #9f1239; font-size: 14px;">Your admin panel can now send digital invites to your guests.</p>
                    </div>
                    <p style="color: #9d174d; font-size: 12px; margin-top: 20px; text-transform: uppercase; letter-spacing: 0.1em;">Sent with love from your Admin Dashboard</p>
                </div>
            `,
        });

        console.log("Message sent: %s", info.messageId);
        return NextResponse.json({ success: true, message: 'Test email sent successfully!' });

    } catch (error: any) {
        console.error('SMTP Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to connect to SMTP server.' },
            { status: 500 }
        );
    }
}
