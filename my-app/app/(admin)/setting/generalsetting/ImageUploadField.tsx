"use client";

import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { uploadGeneralSettingImageAction } from "@/app/actions/adminsetting/generalsetting";

interface ImageUploadFieldProps {
  label: string;
  aspectClass: string;
  currentImage: string | null;
  onRemove: () => void;
  onUploaded: (url: string) => void;
}

export default function ImageUploadField({
  label,
  aspectClass,
  currentImage,
  onRemove,
  onUploaded,
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadGeneralSettingImageAction(formData);
      if (res.success && res.url) {
        onUploaded(res.url);
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const result = evt.target?.result as string;
          if (result) onUploaded(result);
        };
        reader.readAsDataURL(file);
        if (res.error) {
          setErrorMsg(res.error);
        }
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        if (result) onUploaded(result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      {currentImage ? (
        <div className={`relative ${aspectClass} w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100`}>
          <Image src={currentImage} alt={label} fill className="object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-all duration-200 hover:opacity-100">
            <label className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-white/90 px-3 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white">
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {isUploading ? "Uploading…" : "Change"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
            <button
              type="button"
              onClick={onRemove}
              disabled={isUploading}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-500 shadow-sm backdrop-blur-sm transition hover:bg-white disabled:opacity-50"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <div className={`${aspectClass} w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-4 text-center transition hover:border-orange-300 hover:bg-orange-50/30`}>
          <label className="flex cursor-pointer flex-col items-center gap-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              {isUploading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Upload className="h-4.5 w-4.5" />
              )}
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {isUploading ? "Uploading image…" : "Click to upload image"}
            </span>
            <span className="text-[10px] text-gray-400">PNG, JPG, WEBP up to 5MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
      {errorMsg && (
        <span className="text-[11px] font-medium text-red-500">{errorMsg}</span>
      )}
    </div>
  );
}

