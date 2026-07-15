"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Star, Utensils, Wifi, Sparkles, Camera, X } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/* ─── Star picker ─────────────────────────────────────── */
function StarPicker({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const active = hovered || value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${i} star`}
        >
          <Star
            className={`${sz} transition-colors ${
              i <= active ? "fill-orange-400 text-orange-400" : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Category row ────────────────────────────────────── */
function CategoryRating({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Icon className="h-4 w-4 text-gray-400" />
        {label}
      </div>
      <StarPicker value={value} onChange={onChange} size="sm" />
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────── */
export default function ReviewPage() {
  const [overall, setOverall] = useState(0);
  const [ratings, setRatings] = useState({ food: 0, service: 0, ambiance: 0 });
  const [photos, setPhotos] = useState<string[]>([]);
  const [thoughts, setThoughts] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setCategory = (key: keyof typeof ratings) => (v: number) =>
    setRatings((prev) => ({ ...prev, [key]: v }));

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => {
      const url = URL.createObjectURL(f);
      setPhotos((prev) => [...prev, url]);
    });
  };

  const removePhoto = (i: number) =>
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Nav />

      <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <Star className="h-8 w-8 fill-orange-500 text-orange-500" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Thank you for your review!</h2>
            <p className="mt-2 text-sm text-gray-500">Your feedback helps us improve our service.</p>
            <button
              onClick={() => { setSubmitted(false); setOverall(0); setRatings({ food: 0, service: 0, ambiance: 0 }); setPhotos([]); setThoughts(""); }}
              className="mt-6 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Write Another Review
            </button>
          </div>
        ) : (
          <div className="w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Header */}
              <div>
                <h1 className="text-xl font-bold text-gray-900">How was your meal?</h1>
                <p className="mt-1 text-xs text-gray-500">Your feedback helps us perfect our flow.</p>
              </div>

              {/* Restaurant info card */}
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  <Image src="/vegmomo.jpg" alt="Restaurant" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">GourmetHub Restaurant</p>
                  <p className="text-xs text-gray-400">Order #8829 · Today, 3:45 PM</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Left column */}
                <div className="flex flex-col gap-4">
                  {/* Overall rating */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-center">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-orange-500">Overall Rating</p>
                    <div className="flex justify-center">
                      <StarPicker value={overall} onChange={setOverall} size="lg" />
                    </div>
                  </div>

                  {/* Category ratings */}
                  <div className="rounded-2xl border border-gray-100 bg-white px-5 shadow-sm">
                    <CategoryRating icon={Utensils} label="Food Quality" value={ratings.food} onChange={setCategory("food")} />
                    <CategoryRating icon={Wifi} label="Service" value={ratings.service} onChange={setCategory("service")} />
                    <CategoryRating icon={Sparkles} label="Ambiance" value={ratings.ambiance} onChange={setCategory("ambiance")} />
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-4">
                  {/* Add photos */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="mb-3 text-sm font-semibold text-gray-900">Add Photos</p>
                    <div className="flex flex-wrap gap-2">
                      {photos.map((src, i) => (
                        <div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl">
                          <Image src={src} alt="upload" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 text-orange-400 transition hover:bg-orange-100"
                      >
                        <Camera className="h-5 w-5" />
                        <span className="text-[9px] font-semibold">Add</span>
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
                    </div>
                  </div>

                  {/* Share thoughts */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="mb-3 text-sm font-semibold text-gray-900">Share your thoughts</p>
                    <textarea
                      value={thoughts}
                      onChange={(e) => setThoughts(e.target.value)}
                      placeholder="Tell us about your favorite dish or how we can improve..."
                      rows={5}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-full bg-orange-500 py-3.5 text-sm font-bold text-white shadow transition hover:bg-orange-600"
              >
                Submit Review
              </button>

            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
