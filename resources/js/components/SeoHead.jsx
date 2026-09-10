import { Head } from '@inertiajs/react';

const SITE_NAME = 'Mushaf';
const SITE_URL = 'https://mushaf.app';

export default function SeoHead({ title, description, path = '/', type = 'website', image, schema }) {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    const url = `${SITE_URL}${path}`;

    return (
        <Head>
            <title>{fullTitle}</title>
            {description && <meta name="description" content={description} />}
            <link rel="canonical" href={url} />

            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:url" content={url} />
            {description && <meta property="og:description" content={description} />}
            {image && <meta property="og:image" content={image} />}
            <meta property="og:site_name" content={SITE_NAME} />

            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={fullTitle} />
            {description && <meta name="twitter:description" content={description} />}
            {image && <meta name="twitter:image" content={image} />}

            {schema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            )}
        </Head>
    );
}
