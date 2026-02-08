/**
 * Utility to optimize images and videos via Cloudinary.
 * Handles both direct Cloudinary uploads and external URLs via the 'Fetch' API.
 */

const CLOUD_NAME = "joedev-cloud";

export const getOptimizedUrl = (url: string | null | undefined, type: 'image' | 'video' = 'image') => {
    if (!url) return "";

    // If it's already a Cloudinary URL from our cloud, ensure it has optimization parameters
    if (url.includes(`res.cloudinary.com/${CLOUD_NAME}`)) {
        if (url.includes("/upload/") && !url.includes("/f_auto,q_auto/")) {
            const parts = url.split("/upload/");
            return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
        }
        return url;
    }

    // If it's an external URL, use Cloudinary Fetch API to optimize it on the fly
    // Format: https://res.cloudinary.com/<cloud_name>/<asset_type>/fetch/<transformations>/<url>
    const assetType = type === 'video' ? 'video' : 'image';

    // We encode the URL to ensure it's handled correctly as a parameter
    const encodedUrl = encodeURIComponent(url);

    return `https://res.cloudinary.com/${CLOUD_NAME}/${assetType}/fetch/f_auto,q_auto/${url}`;
};
