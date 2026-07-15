import { LucideIcon, ArrowUpRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  footer?: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  footer,
  icon: Icon,
  highlight = false,
}: StatsCardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 shadow-sm ${
        highlight
          ? "bg-[#F97316] border-[#F97316] text-white"
          : "bg-white border-[#E8C7B4]"
      }`}
    >
      <div className="p-5">
        {/* Top */}
        <div className="flex items-start justify-between">
          <h4
            className={`uppercase tracking-[0.22em] text-[10px] font-medium leading-4 ${
              highlight ? "text-white/90" : "text-[#6B5B53]"
            }`}
          >
            {title}
          </h4>

          <Icon
            size={18}
            className={
              highlight ? "text-white" : "text-[#B54A00]"
            }
          />
        </div>

        {/* Value */}
        <h2
          className={`mt-3 text-[44px] leading-none font-bold ${
            highlight ? "text-white" : "text-[#222]"
          }`}
        >
          {value}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p
            className={`mt-2 text-sm ${
              highlight ? "text-white/90" : "text-gray-500"
            }`}
          >
            {subtitle}
          </p>
        )}

        {/* Footer */}
        {footer && (
          <div
            className={`mt-4 flex items-center gap-1 text-sm ${
              highlight
                ? "text-white underline"
                : "text-[#B54A00]"
            }`}
          >
            {footer}
            <ArrowUpRight size={15} />
          </div>
        )}
      </div>
    </div>
  );
}