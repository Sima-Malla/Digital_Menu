"use client";

import Image from "next/image";
import Sidebar from "@/components/HotelAdmin/Sidebar";
import {
  Store,
  Receipt,
  Eye,
  Phone,
  Upload,
  X,
  Camera,
  Globe,
} from "lucide-react";
import { useState } from "react";

/* ─── Social Brand SVG Icons ──────────────────────────────── */

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

/* ─── Reusable Toggle ─────────────────────────────────────── */

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
        enabled ? "bg-orange-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ─── Input Field ─────────────────────────────────────────── */

function InputField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-800 shadow-sm transition-all duration-150 placeholder:text-gray-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}

/* ─── Image Upload Area ───────────────────────────────────── */

function ImageUpload({
  label,
  aspectClass,
  currentImage,
  onRemove,
  onUpload,
}: {
  label: string;
  aspectClass: string;
  currentImage: string | null;
  onRemove: () => void;
  onUpload: () => void;
}) {
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
              onClick={onUpload}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white"
            >
              <Camera className="h-4 w-4" strokeWidth={2} />
            </button>
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
        <button
          type="button"
          onClick={onUpload}
          className={`flex ${aspectClass} flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-gray-400 transition-all duration-150 hover:border-orange-300 hover:bg-orange-50/30 hover:text-orange-500`}
        >
          <Upload className="h-5 w-5" strokeWidth={1.8} />
          <span className="text-[11px] font-semibold">Upload Image</span>
        </button>
      )}
    </div>
  );
}

/* ─── Social Input ────────────────────────────────────────── */

function SocialInput({
  icon: Icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-[13px] font-medium text-gray-800 shadow-sm transition-all duration-150 placeholder:text-gray-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

export default function GeneralSettingsPage() {
  const [restaurantName, setRestaurantName] = useState("GourmetFlow Kitchen");
  const [logoImage, setLogoImage] = useState<string | null>("/hotel.png");
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const [language, setLanguage] = useState("English (US)");
  const [currency, setCurrency] = useState("USD ($)");
  const [timezone, setTimezone] = useState("EST (UTC-5)");

  const [taxId, setTaxId] = useState("US-987654321");
  const [taxRegistration, setTaxRegistration] = useState("REG-2024-0847");

  const [listInMarketplace, setListInMarketplace] = useState(true);
  const [showOnMap, setShowOnMap] = useState(true);
  const [allowReviews, setAllowReviews] = useState(true);

  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [email, setEmail] = useState("contact@gourmetflow.com");
  const [website, setWebsite] = useState("www.gourmetflow.com");
  const [instagram, setInstagram] = useState("@gourmetflow");
  const [facebook, setFacebook] = useState("GourmetFlow Kitchen");
  const [twitter, setTwitter] = useState("@gourmetflow");

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-8 py-8">
          {/* Page Header — same style as Payment Settings */}
          <div className="mb-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-200/60">
                <Store className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  General Settings
                </h1>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Manage your restaurant profile and preferences
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* ── Business Profile ──────────────────────── */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-[14px] font-bold text-gray-900">
                Business Profile
              </h2>
              <p className="text-[12px] text-gray-400 mt-1 mb-5">
                Your restaurant&apos;s public-facing information
              </p>

              <div className="flex flex-col gap-5">
                <InputField
                  label="Restaurant Name"
                  value={restaurantName}
                  onChange={setRestaurantName}
                  placeholder="Enter restaurant name"
                />
                <div className="grid grid-cols-2 gap-5">
                  <ImageUpload
                    label="Brand Logo"
                    aspectClass="h-[140px]"
                    currentImage={logoImage}
                    onRemove={() => setLogoImage(null)}
                    onUpload={() => {}}
                  />
                  <ImageUpload
                    label="Banner Image"
                    aspectClass="h-[140px]"
                    currentImage={bannerImage}
                    onRemove={() => setBannerImage(null)}
                    onUpload={() => {}}
                  />
                </div>
              </div>
            </section>

            {/* ── Localization ──────────────────────────── */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-[14px] font-bold text-gray-900">
                Localization
              </h2>
              <p className="text-[12px] text-gray-400 mt-1 mb-5">
                Set your regional preferences for display
              </p>

              <div className="grid grid-cols-3 gap-4">
                <InputField
                  label="Language"
                  value={language}
                  onChange={setLanguage}
                  placeholder="e.g. English (US)"
                />
                <InputField
                  label="Currency"
                  value={currency}
                  onChange={setCurrency}
                  placeholder="e.g. USD ($)"
                />
                <InputField
                  label="Timezone"
                  value={timezone}
                  onChange={setTimezone}
                  placeholder="e.g. EST (UTC-5)"
                />
              </div>
            </section>

            {/* ── Financial & Tax ───────────────────────── */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-[14px] font-bold text-gray-900">
                Financial &amp; Tax
              </h2>
              <p className="text-[12px] text-gray-400 mt-1 mb-5">
                Tax identification for invoicing and compliance
              </p>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Tax ID / VAT Number"
                  value={taxId}
                  onChange={setTaxId}
                  placeholder="e.g. US-123456789"
                />
                <InputField
                  label="Tax Registration Number"
                  value={taxRegistration}
                  onChange={setTaxRegistration}
                  placeholder="e.g. REG-2024-XXXX"
                />
              </div>
            </section>

            {/* ── Marketplace Visibility ────────────────── */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-[14px] font-bold text-gray-900">
                Marketplace Visibility
              </h2>
              <p className="text-[12px] text-gray-400 mt-1 mb-5">
                Control how your restaurant appears to customers
              </p>

              <div className="flex flex-col gap-3">
                {[
                  {
                    label: "List in Marketplace",
                    desc: "Appear in the public restaurant directory and search results",
                    enabled: listInMarketplace,
                    onToggle: () => setListInMarketplace(!listInMarketplace),
                  },
                  {
                    label: "Show on Map",
                    desc: "Display your restaurant location on the interactive map",
                    enabled: showOnMap,
                    onToggle: () => setShowOnMap(!showOnMap),
                  },
                  {
                    label: "Allow Customer Reviews",
                    desc: "Let customers leave ratings and reviews on your profile",
                    enabled: allowReviews,
                    onToggle: () => setAllowReviews(!allowReviews),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3.5"
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <Toggle enabled={item.enabled} onToggle={item.onToggle} />
                  </div>
                ))}
              </div>
            </section>

            {/* ── Contact & Social Presence ─────────────── */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-[14px] font-bold text-gray-900">
                Contact &amp; Social Presence
              </h2>
              <p className="text-[12px] text-gray-400 mt-1 mb-5">
                How customers and visitors can reach you
              </p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <InputField
                    label="Phone Number"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                  <InputField
                    label="Email Address"
                    value={email}
                    onChange={setEmail}
                    placeholder="email@example.com"
                    type="email"
                  />
                  <InputField
                    label="Website"
                    value={website}
                    onChange={setWebsite}
                    placeholder="www.example.com"
                  />
                </div>

                <div className="border-t border-gray-100" />

                <div>
                  <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Social Media Links
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <SocialInput
                      icon={InstagramIcon}
                      placeholder="@handle"
                      value={instagram}
                      onChange={setInstagram}
                    />
                    <SocialInput
                      icon={FacebookIcon}
                      placeholder="Page name"
                      value={facebook}
                      onChange={setFacebook}
                    />
                    <SocialInput
                      icon={TwitterIcon}
                      placeholder="@handle"
                      value={twitter}
                      onChange={setTwitter}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Action Buttons ────────────────────────── */}
            <div className="flex items-center justify-end gap-3 pt-3 pb-10">
              <button
                type="button"
                className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[13px] font-semibold text-gray-600 transition-all duration-150 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
              >
                Discard Changes
              </button>
              <button
                type="button"
                className="rounded-xl bg-orange-500 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-orange-200/60 transition-all duration-150 hover:bg-orange-600 hover:shadow-md hover:shadow-orange-200/60"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}