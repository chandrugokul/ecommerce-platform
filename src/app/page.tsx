export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <h1 className="text-2xl font-black">
            Nasreen<span className="text-blue-600">Decor</span>
          </h1>

          <div className="flex gap-4 text-xl">
            <span>♡</span>
            <span>🛒</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl bg-blue-600 px-6 py-16 text-white">
          <p className="font-semibold">NEW COLLECTION</p>

          <h2 className="mt-3 text-4xl font-black md:text-6xl">
            Everything you need.
            <br />
            All in one place.
          </h2>

          <p className="mt-5 text-blue-100">
            Discover amazing products at great prices.
          </p>

          <button className="mt-7 rounded-xl bg-white px-6 py-3 font-bold text-blue-600">
            Shop Now →
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-5 text-2xl font-bold">Shop by Category</h2>

        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {[
            ["👕", "Men"],
            ["👗", "Women"],
            ["👟", "Shoes"],
            ["📱", "Electronics"],
            ["💄", "Beauty"],
            ["🏠", "Home"],
          ].map(([icon, name]) => (
            <div
              key={name}
              className="rounded-2xl bg-white p-5 text-center shadow-sm"
            >
              <div className="text-4xl">{icon}</div>
              <p className="mt-2 font-semibold">{name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-5 text-2xl font-bold">Featured Products</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["👕", "Classic T-Shirt", "₹499"],
            ["👟", "Running Shoes", "₹1,499"],
            ["⌚", "Smart Watch", "₹1,999"],
            ["🎧", "Wireless Earbuds", "₹999"],
          ].map(([icon, name, price]) => (
            <div
              key={name}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="flex aspect-square items-center justify-center bg-gray-100 text-7xl">
                {icon}
              </div>

              <div className="p-4">
                <h3 className="font-bold">{name}</h3>
                <p className="mt-2 text-lg font-black">{price}</p>

                <button className="mt-4 w-full rounded-xl bg-black py-3 font-semibold text-white">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-10 bg-gray-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-black">
            Shop<span className="text-blue-400">Hub</span>
          </h2>
          <p className="mt-2 text-gray-400">
            Your modern e-commerce platform.
          </p>
        </div>
      </footer>
    </main>
  );
}
