import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

// Inline compiled CSS statically during SSG build to eliminate render-blocking requests
const getCssContent = () => {
    try {
        const cssPath = path.resolve(process.cwd(), 'library/dist/style.css');
        return fs.readFileSync(cssPath, 'utf8');
    } catch (e) {
        return '';
    }
};
const cssContent = getCssContent();

export const metadata: Metadata = {
    metadataBase: new URL('https://annotate.mngo.in'),
    title: 'React Image Annotate by MNgo | Aditya Suman',
    description: 'React Image Annotate | Annotation React library | NPM Package | Developer: Aditya Suman',
    keywords: 'React, Annotate, Annotation, Image, Markup, Canvas, MNgo, Library, Package, npm, react library, npm package, Aditya Suman',
    authors: [{ name: 'Aditya Suman', url: 'https://adityas.site' }],
    creator: 'Aditya Suman',
    alternates: {
        canonical: '/',
    },
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: '/xxxs.png',
        shortcut: '/xxxs.png',
        apple: '/xxxs.png',
    },
};

export const viewport = {
    themeColor: '#f1f1f1',
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <style dangerouslySetInnerHTML={{ __html: cssContent }} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            "name": "react-image-annotate-mngo",
                            "operatingSystem": "All",
                            "applicationCategory": "DeveloperApplication",
                            "author": {
                                "@type": "Person",
                                "name": "Aditya Suman",
                                "url": "https://adityas.site"
                            },
                            "description": "A JavaScript React Library for image annotation, markup, sketch, and drawing."
                        })
                    }}
                />
            </head>
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    );
}
