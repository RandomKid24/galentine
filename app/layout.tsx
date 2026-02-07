import type { Metadata } from 'next';
import { Inter, Playfair_Display, Outfit } from 'next/font/google';
import Background from './components/Background';
import './globals.css';

// Initialize fonts
const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Galentine's | A Celebration of Friendship",
    description: "Join us for an evening of soft indulgence dedicated to the luminous power of enduring friendship.",
};

/**
 * RootLayout
 * The main layout for the application associated with the 'app' directory (App Router).
 * Includes global fonts, styles, and background.
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable} ${outfit.variable}`}>
            <body className="font-sans antialiased text-rose-900 bg-[var(--canvas)] overflow-x-hidden">
                <Background />
                {children}
            </body>
        </html>
    );
}
