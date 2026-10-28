
import { LoaderCircle } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "កំពុងផ្ទុក... / Loading...",
}: LoadingScreenProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-white"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center px-6 text-center">
        {/* Academy Logo */}
        <img
          src="/logo.png"
          alt="Police Academy of Cambodia"
          className="mb-5 h-24 w-24 animate-pulse object-contain sm:h-28 sm:w-28"
        />

        {/* Academy Name */}
        <h1 className="font-moul text-xl font-bold text-blue-950 sm:text-2xl">
          បណ្ឌិត្យសភានគរបាលកម្ពុជា
        </h1>

        <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-blue-800 sm:text-sm">
          POLICE ACADEMY OF CAMBODIA
        </p>

        {/* Loading Animation */}
        <div className="mt-8 flex flex-col items-center">
          <LoaderCircle
            className="h-9 w-9 animate-spin text-blue-800"
            aria-hidden="true"
          />

          <p className="mt-4 text-sm text-gray-500">{message}</p>

          {/* Progress Indicator */}
          <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-1/2 animate-loading-bar rounded-full bg-blue-800" />
          </div>
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-gray-400">
          Serving the Community. Protecting the Future.
        </p>
      </div>
    </div>
  );
}

