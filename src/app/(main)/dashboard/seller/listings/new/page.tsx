'use client'

import { createListing } from '../actions'
import { Upload, DollarSign, Tag, FileText, Loader2, CheckCircle2, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, Variants } from 'framer-motion'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function NewListingPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFilePath, setUploadedFilePath] = useState('');
    const [uploadedFileSize, setUploadedFileSize] = useState(0);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const isSubmittedRef = useRef(false);
    const uploadedFileRef = useRef(uploadedFilePath);

    // Keep ref in sync for the unmount closure
    useEffect(() => {
        uploadedFileRef.current = uploadedFilePath;
    }, [uploadedFilePath]);

    // Cleanup orphan files on navigation away or tab close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (uploadedFileRef.current && !isSubmittedRef.current) {
                const data = JSON.stringify({ fileKey: uploadedFileRef.current });
                navigator.sendBeacon('/api/delete-asset-file', data);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // Handle Next.js soft navigations
            if (uploadedFileRef.current && !isSubmittedRef.current) {
                const data = JSON.stringify({ fileKey: uploadedFileRef.current });
                navigator.sendBeacon('/api/delete-asset-file', data);
            }
        };
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setImagePreview(null);

        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Prevent heavy files > 500MB on frontend? Or just allow anything up to a few GBs.
        // B2 handles large files easily via presigned, but keep it sane for now.
        setIsUploading(true);

        try {
            // 1. Get the Ticket
            const res = await fetch('/api/upload-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream' })
            });

            if (!res.ok) throw new Error("Failed to get upload ticket");
            const { url, key } = await res.json();

            // 2. Upload directly to B2 securely
            const uploadRes = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type || 'application/octet-stream'
                }
            });

            if (!uploadRes.ok) throw new Error("Failed to upload file to storage");

            setUploadedFilePath(key);
            setUploadedFileSize(file.size);
        } catch (err) {
            console.error(err);
            alert("Upload failed. Please ensure your connection is stable and try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full pt-24 pb-12 px-4 flex justify-center">
            <div className="max-w-2xl w-full">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white text-center">Create New Listing</h1>

                <form
                    action={createListing}
                    onSubmit={() => { isSubmittedRef.current = true; }}
                    className="space-y-8"
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="glass-card p-8 rounded-xl border border-white/10 space-y-8"
                    >

                        {/* Title */}
                        <motion.div variants={itemVariants} className="group">
                            <label className="block text-sm font-medium mb-2 text-white" htmlFor="title">
                                Asset Title
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all group-focus-within:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                placeholder="e.g., Sci-Fi Weapon Pack"
                            />
                        </motion.div>

                        {/* Category & Price */}
                        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-sm font-medium mb-2 text-white" htmlFor="category">
                                    Category
                                </label>
                                <div className="relative">

                                    <Select name="category" required>
                                        <SelectTrigger className="w-full pl-10 pr-4 h-[50px] rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all group-focus-within:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                            <SelectItem value="MODEL">3D Model</SelectItem>
                                            <SelectItem value="SCRIPT">Script</SelectItem>
                                            <SelectItem value="UI">UI Kit</SelectItem>
                                            <SelectItem value="AUDIO">Audio</SelectItem>
                                            <SelectItem value="MAP">Map</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium mb-2 text-white" htmlFor="price">
                                    Price (USD)
                                </label>
                                <div className="relative">
                                    <input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/50 border border-none text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all group-focus-within:shadow-[0_0_20px_rgba(255,255,255,0.05)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Product Image */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium mb-2 text-white" htmlFor="image">
                                Product Image
                            </label>
                            <div className="relative border-2 border-dashed border-white/20 rounded-xl overflow-hidden p-8 text-center hover:border-white/40 hover:bg-white/5 transition-all group">
                                <input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {imagePreview ? (
                                    <div className="absolute inset-0 w-full h-full">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <p className="text-white font-medium">Click to change image</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500 hover:text-white text-neutral-300 rounded-full backdrop-blur-sm transition-all z-20 group-hover:opacity-100 opacity-0"
                                            title="Remove image"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <Upload className="w-10 h-10 text-neutral-400 mb-4 group-hover:text-primary transition-colors" />
                                        <p className="text-sm text-neutral-300 font-medium">
                                            Click or drag to upload cover image
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            PNG, JPG up to 5MB
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.div variants={itemVariants} className="group">
                            <label className="block text-sm font-medium mb-2 text-white" htmlFor="description">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all resize-none"
                                placeholder="Describe your asset..."
                            />
                        </motion.div>

                        {/* Asset File Upload (B2 Integration) */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium mb-2 text-white">
                                Asset File (The actual product)
                            </label>

                            {/* Hidden inputs to pass the B2 data down to the Server Action */}
                            <input type="hidden" name="b2_file_path" value={uploadedFilePath} />
                            <input type="hidden" name="b2_file_size" value={uploadedFileSize} />

                            {!uploadedFilePath ? (
                                <div className="relative border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 hover:bg-white/5 transition-all group overflow-hidden">
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <div className="flex flex-col items-center pointer-events-none">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-10 h-10 text-primary mb-4 animate-spin" />
                                                <p className="text-sm text-white font-medium">Uploading securely to cloud...</p>
                                                <p className="text-xs text-neutral-400 mt-1">Please keep this page open</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-10 h-10 text-neutral-400 mb-4 group-hover:text-primary transition-colors" />
                                                <p className="text-sm text-neutral-300 font-medium">
                                                    Click or drag to upload asset file
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-1">
                                                    ZIP, RAR, RBXL file, etc.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 flex flex-col items-center text-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
                                    <p className="text-white font-medium">Asset uploaded successfully!</p>
                                    <p className="text-xs text-neutral-400 mt-1">Size: {(uploadedFileSize / (1024 * 1024)).toFixed(2)} MB</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (uploadedFilePath) {
                                                fetch('/api/delete-asset-file', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ fileKey: uploadedFilePath })
                                                }).catch(err => console.error("Failed to delete replacing file:", err));
                                            }
                                            setUploadedFilePath('');
                                            setUploadedFileSize(0);
                                        }}
                                        className="mt-4 text-xs text-neutral-400 underline hover:text-white transition-colors"
                                    >
                                        Replace File
                                    </button>
                                </div>
                            )}
                        </motion.div>

                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        type="submit"
                        disabled={isUploading || !uploadedFilePath}
                        className="w-full py-4 bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-500 text-black font-bold text-lg rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                        {isUploading ? 'Uploading Please Wait...' : (!uploadedFilePath ? 'Upload File to Continue' : 'Publish Listing')}
                    </motion.button>
                </form>
            </div>
        </div>
    )
}
