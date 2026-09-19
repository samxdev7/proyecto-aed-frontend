import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-deep px-6 pt-16 text-center">
      <Image
        src="/Presentaciones/hero/BannerEnAlgunLado.jpg"
        alt="Atardecer en las montañas de Nicaragua"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-deep/40" />
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-40 w-full text-deep md:h-56"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0 200 L180 96 L330 152 L520 44 L700 138 L880 64 L1080 154 L1250 84 L1440 162 L1440 200 Z" />
      </svg>

      <div className="relative z-10 max-w-3xl">
        <div
          aria-hidden="true"
          className="mx-auto h-1 w-12 rounded-full bg-ochre"
        />
        <h1 className="mt-5 font-serif text-4xl font-black uppercase leading-tight tracking-tight text-sand sm:text-5xl md:text-6xl">
          Club Nicaragüense de Montañismo
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-sand/75 md:text-lg">
          Exploramos, cuidamos y disfrutamos las montañas y volcanes. Únete a
          la próxima expedición.
        </p>
        <a
          href="/viajes"
          className="mt-9 inline-flex items-center gap-2 rounded-md bg-clay px-7 py-3 text-sm font-medium text-white transition hover:bg-[#a9582f]"
        >
          Explorar viajes
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </a>
      </div>
    </section>
  );
}