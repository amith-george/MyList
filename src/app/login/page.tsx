import Image from 'next/image';
import FormSwitcher from '@/components/LoginFormSwitcher'; // A new component that toggles forms client-side

export default function LoginPage() {
  return (
    <div className="flex min-h-screen relative bg-black">
      {/* Logo & Title */}
      <div className="absolute top-6 left-6 flex items-center gap-4 z-10">
        <Image src="/logo4.svg" alt="Logo" width={48} height={48} />
        <h1 className="text-2xl lg:text-4xl font-bold tracking-wide text-[oklch(0.725_0.25_25)]">MyList</h1>
      </div>

      {/* Left Section - Hidden on small screens */}
      <div className="hidden lg:flex w-[55%] text-white flex-col px-6 py-6">
        <div className="flex-1 flex items-center justify-center">
          <ul className="space-y-13 text-base text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-xl">🎥</span>
              <div>
                <h3 className="text-base font-semibold">Explore & Organize</h3>
                <p className="mt-1">Save and manage your favorite movies and TV shows in personalized watchlists.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">🔍</span>
              <div>
                <h3 className="text-base font-semibold">Quick Search</h3>
                <p className="mt-1">Find detailed information on any movie or TV show instantly.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">⭐</span>
              <div>
                <h3 className="text-base font-semibold">Rate & Review</h3>
                <p className="mt-1">Add ratings and reviews to remember your favorites and share your thoughts.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">📢</span>
              <div>
                <h3 className="text-base font-semibold">Trending & New Releases</h3>
                <p className="mt-1">Stay updated with the latest hits, top-rated movies, and curated recommendations.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-[45%] bg-black lg:bg-white flex items-center justify-center px-6">
        <FormSwitcher />
      </div>
    </div>
  );
}
