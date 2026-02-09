/**
 * Utility to optimize images and videos via Cloudinary.
 * Handles both direct Cloudinary uploads and external URLs via the 'Fetch' API.
 */

const CLOUD_NAME = "joedev-cloud";

export const getOptimizedUrl = (url: string | null | undefined) => {
    if (!url) return "";

    // If it's already a Cloudinary URL from our cloud, ensure it has optimization parameters
    if (url.includes(`res.cloudinary.com/${CLOUD_NAME}`)) {
        if (url.includes("/upload/") && !url.includes("/f_auto,q_auto/")) {
            const parts = url.split("/upload/");
            return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
        }
        return url;
    }

    // External URL Optimization via Cloudinary Fetch
    // We only optimize if it's NOT a localhost URL, not an SVG, and not already optimized
    if (url.startsWith('http')) {
        // Exclude specific domains if needed (e.g. tracking pixels, analytics)
        if (url.includes('google-analytics.com')) return url;
        if (url.endsWith('.svg')) return url;

        // Don't attempt to optimize videos with image/fetch
        if (/\.(mp4|webm|mov|mkv|avi)(\?|$|#)/i.test(url)) {
            return url;
        }

        // Use Cloudinary fetch to resize and optimize
        // f_auto: auto format (webp/avif)
        // q_auto: auto quality
        // w_800: resize to max width 800px (covers most card/hero use cases)
        // c_limit: resize without cropping (maintain aspect ratio)
        return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto,w_800,c_limit/${url}`;
    }

    return url;
};
