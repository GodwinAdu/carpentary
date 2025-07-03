import { Metadata } from 'next';



const title = 'LobeChat';

const metadata: Metadata = {
    appleWebApp: {
        statusBarStyle: 'black-translucent',
        title,
    },
    icons: {
        apple:
            'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/apple-touch-icon.png',
        icon: 'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/favicon-32x32.png',
        shortcut:
            'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/favicon.ico',
    },
    manifest: '/manifest.json',
    openGraph: {
        description: "",
        images: [
            {
                alt: title,
                height: 360,
                url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/og-480x270.png',
                width: 480,
            },
            {
                alt: title,
                height: 720,
                url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/og-960x540.png',
                width: 960,
            },
        ],
        locale: 'en-US',
        siteName: title,
        title: title,
        type: 'website',
    },

    title: {
        default: title,
        template: '%s · GML Roofing',
    },
};

export default metadata;