export function LoadingSkeleton() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gray-600/20 via-transparent to-transparent"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-red-950/30 to-black/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-red-950/30 to-black/20 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative w-full max-w-[480px] animate-pulse">
        {/* Main Card */}
        <div className="bg-gradient-to-b from-[#2e2e2e] via-[#131313] to-black backdrop-blur-xl rounded-[28px] sm:rounded-[36px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-red-900/40 overflow-hidden">
          {/* Top bar */}
          <div className="h-1.5 sm:h-2 bg-gradient-to-r from-red-900 via-red-700 to-red-900"></div>
          
          <div className="p-6 sm:p-8 md:p-10">
            {/* Logo skeleton */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-800/50 rounded-[20px] sm:rounded-[24px]"></div>
            </div>

            {/* Title skeleton */}
            <div className="space-y-3 mb-6 sm:mb-8">
              <div className="h-8 bg-gray-800/50 rounded-lg w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-800/30 rounded-lg w-1/2 mx-auto"></div>
            </div>

            {/* Form fields skeleton */}
            <div className="space-y-4 sm:space-y-5">
              {/* Field 1 */}
              <div>
                <div className="h-4 bg-gray-800/30 rounded w-20 mb-2"></div>
                <div className="h-12 sm:h-14 bg-gray-800/50 rounded-xl sm:rounded-2xl"></div>
              </div>

              {/* Field 2 */}
              <div>
                <div className="h-4 bg-gray-800/30 rounded w-24 mb-2"></div>
                <div className="h-12 sm:h-14 bg-gray-800/50 rounded-xl sm:rounded-2xl"></div>
              </div>

              {/* Remember me / options */}
              <div className="flex items-center justify-between pt-1">
                <div className="h-4 bg-gray-800/30 rounded w-24"></div>
                <div className="h-4 bg-gray-800/30 rounded w-28"></div>
              </div>

              {/* Button skeleton */}
              <div className="mt-4 sm:mt-6">
                <div className="h-12 sm:h-14 bg-gradient-to-r from-red-900/50 via-red-800/50 to-red-900/50 rounded-xl sm:rounded-2xl"></div>
              </div>
            </div>

            {/* Footer text skeleton */}
            <div className="mt-6 sm:mt-8">
              <div className="h-12 bg-gray-900/50 rounded-xl sm:rounded-2xl border border-gray-800 flex items-center justify-center">
                <div className="h-4 bg-gray-800/30 rounded w-48"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom text skeleton */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <div className="h-4 bg-gray-800/30 rounded w-56"></div>
        </div>
      </div>
    </div>
  );
}

export function RegistrationLoadingSkeleton() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#2e2e2e] via-[#111827] to-black flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gray-600/20 via-transparent to-transparent"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-red-950/30 to-black/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-red-950/30 to-black/20 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative w-full max-w-2xl animate-pulse my-8">
        {/* Main Card */}
        <div className="bg-gradient-to-b from-[#2e2e2e] via-[#131313] to-black backdrop-blur-xl rounded-3xl shadow-2xl border border-red-900/40 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-red-900 via-red-700 to-red-900"></div>
          
          <div className="p-6 sm:p-8">
            {/* Logo skeleton */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gray-800/50 rounded-2xl"></div>
            </div>

            {/* Title skeleton */}
            <div className="space-y-3 mb-6">
              <div className="h-8 bg-gray-800/50 rounded-lg w-2/3 mx-auto"></div>
              <div className="h-4 bg-gray-800/30 rounded-lg w-1/2 mx-auto"></div>
            </div>

            {/* Form fields skeleton */}
            <div className="space-y-5">
              {/* Multiple fields */}
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-800/30 rounded w-32 mb-2"></div>
                  <div className="h-12 bg-gray-800/50 rounded-xl"></div>
                </div>
              ))}

              {/* Gender buttons skeleton */}
              <div>
                <div className="h-4 bg-gray-800/30 rounded w-32 mb-2"></div>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 bg-gray-800/50 rounded-xl"></div>
                  <div className="flex-1 h-12 bg-gray-800/50 rounded-xl"></div>
                </div>
              </div>

              {/* Size selectors skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="h-4 bg-gray-800/30 rounded w-28 mb-2"></div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-12 bg-gray-800/50 rounded-xl"></div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-4 bg-gray-800/30 rounded w-32 mb-2"></div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-12 bg-gray-800/50 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Club sets skeleton */}
              <div className="space-y-4">
                <div className="h-6 bg-gray-800/30 rounded w-32"></div>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="bg-[#1a1a1a]/40 border-2 border-gray-800/60 rounded-xl p-4">
                    <div className="h-4 bg-gray-800/30 rounded w-24 mb-3"></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-10 bg-gray-800/50 rounded-lg"></div>
                      <div className="h-10 bg-gray-800/50 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit button skeleton */}
              <div className="mt-2">
                <div className="h-14 bg-gradient-to-r from-red-900/50 via-red-800/50 to-red-900/50 rounded-xl"></div>
              </div>
            </div>

            {/* Footer skeleton */}
            <div className="mt-6">
              <div className="h-16 bg-gray-900/50 rounded-xl border border-gray-800 flex items-center justify-center">
                <div className="h-4 bg-gray-800/30 rounded w-48"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom text skeleton */}
        <div className="mt-6 flex justify-center">
          <div className="h-4 bg-gray-800/30 rounded w-56"></div>
        </div>
      </div>
    </div>
  );
}
