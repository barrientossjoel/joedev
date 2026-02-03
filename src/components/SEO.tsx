import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    name?: string;
    type?: string;
    url?: string;
    image?: string;
}

export default function SEO({
    title,
    description,
    name = 'Joel Barrientos',
    type = 'website',
    url,
    image
}: SEOProps) {
    const siteUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{title}</title>
            <meta name='description' content={description} />

            {/* Facebook / Open Graph */}
            <meta property='og:type' content={type} />
            <meta property='og:title' content={title} />
            <meta property='og:description' content={description} />
            <meta property='og:url' content={siteUrl} />
            {name && <meta property='og:site_name' content={name} />}
            {image && <meta property='og:image' content={image} />}

            {/* Twitter */}
            <meta name='twitter:creator' content={name} />
            <meta name='twitter:card' content={image ? 'summary_large_image' : 'summary'} />
            <meta name='twitter:title' content={title} />
            <meta name='twitter:description' content={description} />
            {image && <meta name='twitter:image' content={image} />}
        </Helmet>
    );
}
