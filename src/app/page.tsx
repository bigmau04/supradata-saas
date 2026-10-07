export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-blue-600">
          SupraData SaaS
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          El sistema operativo integral para tu gimnasio. Multi-tenant, rápido y seguro.
        </p>
      </main>
    </div>
  );
}
