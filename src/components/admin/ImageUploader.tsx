import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
    onUpload: (url: string) => void;
    currentValue?: string;
    cloudName: string;
    uploadPreset: string;
}

export const ImageUploader = ({ onUpload, currentValue, cloudName, uploadPreset }: ImageUploaderProps) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File size must be less than 5MB");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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

            // Construct optimized URL
            // We inject transformation parameters before the /v<version>/ part or before the filename
            // Standard Cloudinary URL: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<format>
            // Optimized: https://res.cloudinary.com/<cloud_name>/image/upload/f_auto,q_auto/v<version>/<public_id>.<format>

            let secureUrl = data.secure_url;
            const uploadIndex = secureUrl.indexOf("/upload/");
            if (uploadIndex !== -1) {
                const prefix = secureUrl.substring(0, uploadIndex + 8); // include "/upload/"
                const suffix = secureUrl.substring(uploadIndex + 8);
                secureUrl = `${prefix}f_auto,q_auto/${suffix}`;
            }

            onUpload(secureUrl);
            toast.success("Image uploaded & optimized!");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <input
                    type="file"
                    id="cloudinary-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById("cloudinary-upload")?.click()}
                    className="gap-2"
                >
                    {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload Image"}
                </Button>
            </div>

            {!uploading && currentValue && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <ImageIcon size={12} />
                    <span>Deployed directly to Edge</span>
                </div>
            )}
        </div>
    );
};
