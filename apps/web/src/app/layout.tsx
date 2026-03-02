import "./globals.css";

export const metadata = {
    title: "B2B Marketplace",
    description: "A compliance-first digital asset marketplace platform.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
