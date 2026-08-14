"use client";

import Image from "next/image";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import "@uploadcare/react-uploader/core.css";

interface ImageUploadFieldProps {
  label: string;
  aspectClass: string;
  currentImage: string | null;
  onRemove: () => void;
  onUploaded: (url: string) => void;
}

const FileUploader = dynamic(() => import("@uploadcare/react-uploader").then(mod => mod.FileUploaderRegular), {
  ssr: false,
});

export default function ImageUploadField({
  label,
  aspectClass,
  currentImage,
  onRemove,
  onUploaded,
}: ImageUploadFieldProps) {

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      {currentImage ? (
        <div className={`relative ${aspectClass} overflow-hidden rounded-xl border border-gray-200 bg-gray-100`}>
          <Image src={currentImage} alt={label} fill className="object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 hover:bg-black/30 hover:opacity-100">
            <button
              type="button"
              onClick={onRemove}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-500 shadow-sm backdrop-blur-sm transition hover:bg-white"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <div className={`${aspectClass} overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-center`}>
          <FileUploader
            pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || ""}
            imgOnly
            multiple={false}
            sourceList="local, camera, url"
            classNameUploader="uc-light"
            onFileUploadSuccess={(file: any) => {
              if (file?.cdnUrl) {
                onUploaded(file.cdnUrl);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

