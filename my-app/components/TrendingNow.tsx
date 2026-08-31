import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";
import type { TrendingBusiness } from "@/lib/queries/trending";
import { toValidImageSrc } from "@/lib/image-utils";

const FALLBACK_IMG = "/Container.png";

export default function TrendingNow({
  businesses,
}: {
  businesses: TrendingBusiness[];
}) {
  if (businesses.length === 0) {
    return null; // nothing to show yet — no businesses at all
  }

  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold tracking-wide text-orange-500">
            RIGHT NOW
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
            Trending Now
          </h2>
          <p className="mt-2 text-neutral-600">
            The most-ordered kitchens on MenuTap this month
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {businesses.map((business, index) => (
            <TrendingCard key={business.id} business={business} rank={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrendingCard({
  business,
  rank,
}: {
  business: TrendingBusiness;
  rank: number;
}) {
  const tag =
    rank === 0 && business.orderCount > 0
      ? "Most Popular"
      : rank <= 2 && business.orderCount > 0
      ? "Trending"
      : null;

  const imageSrc = toValidImageSrc(business.imageUrl);

  return (
    <div className="group overflow-hidden rounded-xl bg-neutral-50 transition-all hover:shadow-lg hover:ring-1 hover:ring-orange-500/20">
      <div className="relative h-32 w-full overflow-hidden bg-neutral-800">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={business.name}
            fill
            sizes="(max-width: 640px) 100vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-700 via-orange-600 to-stone-900 p-3 text-center">
            <span className="text-xs font-black uppercase tracking-wider text-white/90 drop-shadow">
              {business.name}
            </span>
          </div>
        )}
        {tag && (
          <div className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
            {tag}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-neutral-900 line-clamp-1">
          {business.name}
        </h3>
        <p className="mt-0.5 text-xs text-neutral-600">{business.cuisine}</p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600">
          <Flame className="h-3 w-3 flex-shrink-0 text-orange-500" />
          <span>
            {business.orderCount > 0
              ? `${business.orderCount} order${business.orderCount === 1 ? "" : "s"} this month`
              : "New on MenuTap"}
          </span>
        </div>

        <Link
          href={`/kitchens/${business.id}`}
          className="mt-3 block w-full rounded-lg bg-orange-500 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-orange-600"
        >
          View Menu
        </Link>
      </div>
    </div>
  );
}