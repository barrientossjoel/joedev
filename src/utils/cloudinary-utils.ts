


const CLOUD_NAME = "joedev-cloud";
const UPLOAD_PRESET = "joedev";

/**
 * Uploads a file or a URL to Cloudinary.
 * If a URL is provided, it tries to fetch it client-side first (to bypass some server-side blocks like Reddit),
 * convert it to a Blob, and upload the Blob.
 * If client-side fetch fails (e.g. CORS), it falls back to passing the URL directly to Cloudinary.
 */
export const uploadToCloudinary = async (fileOrUrl: File | string): Promise<string> => {
    const formData = new FormData();
    formData.append("upload_preset", UPLOAD_PRESET);

    let uploadSource: File | Blob | string = fileOrUrl;

    // Case 1: Input is a URL string
    if (typeof fileOrUrl === "string") {
        // If it's already a Cloudinary URL, valid data URI, or empty, return as is (or handle empty)
        if (!fileOrUrl || fileOrUrl.includes("res.cloudinary.com") || fileOrUrl.startsWith("data:")) {
            return fileOrUrl;
        }

        try {
            // Try Client-Side Fetch (Bypass "Server-Side" blocks like Reddit 403)
            // This works if the source allows CORS (Reddit does for localhost, hopefully for prod too)
            const response = await fetch(fileOrUrl);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            uploadSource = blob;
        } catch (error) {
            console.warn("Client-side fetch failed (likely CORS), falling back to Cloudinary Remote Upload:", error);
            // Fallback: Let Cloudinary fetch it
            uploadSource = fileOrUrl;
        }
    }

    // Append the source
    formData.append("file", uploadSource);

    try {
        // Determine strict resource type or let it auto-detect?
        // auto is safer for mixed content
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Upload failed");
        }

        const data = await response.json();

        // Optimize the returned URL immediately
        let secureUrl = data.secure_url;

        // Ensure we use https
        if (secureUrl.startsWith("http:")) {
            secureUrl = secureUrl.replace("http:", "https:");
        }

        // Add optimization flags if not present
        // Note: Cloudinary upload response usually gives a clean URL like .../upload/v123.../id.jpg
        const uploadIndex = secureUrl.indexOf("/upload/");
        if (uploadIndex !== -1 && !secureUrl.includes("/f_auto,q_auto/")) {
            const prefix = secureUrl.substring(0, uploadIndex + 8);
            const suffix = secureUrl.substring(uploadIndex + 8);
            return `${prefix}f_auto,q_auto/${suffix}`;
        }

        return secureUrl;

    } catch (error: any) {
        console.error("Cloudinary Upload Error:", error);
        throw new Error(`Upload failed: ${error.message}`);
    }
};
