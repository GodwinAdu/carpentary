import { Metadata } from 'next';

const title = 'GML Roofing';
const description = 'GML Roofing - Professional roofing services and building management system';

const metadata: Metadata = {
    title: {
        default: title,
        template: '%s · GML Roofing',
    },
    description,
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title,
    },
    icons: {
        icon: '/next.svg',
        apple: '/next.svg',
    },
    openGraph: {
        title,
        description,
        type: 'website',
        locale: 'en-US',
        siteName: title,
    },
};

export default metadata;