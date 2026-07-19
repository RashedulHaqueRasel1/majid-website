export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-hero-canvas">
      <div className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-hero-glow-lime blur-3xl sm:h-[28rem] sm:w-[28rem]" />
      <div className="absolute -right-24 top-28 h-80 w-80 rounded-full bg-hero-glow-blue blur-3xl sm:h-[30rem] sm:w-[30rem]" />
      <div className="hero-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
