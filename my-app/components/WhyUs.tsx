const items = [
  {
    title: "No MSG, ever",
    desc: "Every broth and marinade is built from whole spices, not shortcuts.",
    link: "Learn more",
    grad: "from-[#c1442d] to-[#7c2418]"
  },
  {
    title: "Kathmandu Valley sourced",
    desc: "Vegetables and herbs arrive daily from growers we know by name.",
    link: "Meet our farms",
    grad: "from-[#7c8058] to-[#4a4d33]"
  },
  {
    title: "Handmade, daily",
    desc: "Momo are folded by hand each morning, never frozen or pre-made.",
    link: "See the kitchen",
    grad: "from-[#e8a33d] to-[#a8681e]"
  }
];

export default function WhyUs() {
  return (
    <section className="relative py-8 text-center">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">Cooked fresh, no shortcuts</h2>
      <p className="mx-auto mt-2.5 mb-8 max-w-lg text-sm leading-relaxed text-[#6b5f52]">
        No preservatives, no MSG, and no exceptions. Every dish is prepared the way it&apos;s been made in Kathmandu
        Valley kitchens for generations.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="text-left">
            <div className={`mb-3.5 flex aspect-[4/3] items-center justify-center rounded-lg bg-gradient-to-br ${it.grad} font-mono text-[11px] text-white`}>
              image placeholder
            </div>
            <h3 className="mb-1.5 font-display text-base font-semibold">{it.title}</h3>
            <p className="mb-2.5 text-[12.5px] leading-relaxed text-[#6b5f52]">{it.desc}</p>
            <span className="border-b border-charcoal pb-0.5 text-[11px] font-semibold">{it.link}</span>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
