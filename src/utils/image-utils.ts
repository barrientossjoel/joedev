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

    // If it's an external URL, do not use Cloudinary Fetch API as it can cause performance issues or be blocked
    return url;
};
