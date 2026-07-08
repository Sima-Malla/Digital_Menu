import { DataBadge } from "./DataLabels";

export default function StoryBanner() {
  return (
    <section
      className="relative flex min-h-[280px] items-center justify-center px-5 py-16 text-center text-white"
      style={{
        background:
          "linear-gradient(rgba(20,15,10,0.55),rgba(20,15,10,0.55)), linear-gradient(135deg,#3a4a2c,#22301c 60%,#1b1512)"
      }}
    >
      
      <div>
        <h2 className="mx-auto mb-3.5 max-w-xl font-display text-2xl font-semibold sm:text-3xl">
          Why we cook only from Kathmandu Valley recipes
        </h2>
        <p className="mx-auto max-w-lg text-[13px] leading-relaxed opacity-85">
          Our founder learned these recipes at home before ever running a kitchen. Every set menu on GHAR traces
          back to a family table.
        </p>
      </div>
    </section>
  );
}
