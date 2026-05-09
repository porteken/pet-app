import Link from "next/link";

export default function LocationNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="glass-panel w-full rounded-4xl p-8 text-center sm:p-10">
        <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
          Location not found
        </h1>
        <p className="text-muted-foreground mt-3 text-sm sm:text-base">
          We couldn&apos;t find a location matching that URL.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition hover:brightness-95"
            href="/"
          >
            Back to home
          </Link>
        </div>
      </section>
    </div>
  );
}
