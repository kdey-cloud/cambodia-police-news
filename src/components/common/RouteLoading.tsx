
import { LoaderCircle } from "lucide-react";

interface RouteLoadingProps {
  message?: string;
}

export default function RouteLoading({
  message = "កំពុងផ្ទុក...",
}: RouteLoadingProps) {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        <LoaderCircle
          className="h-9 w-9 animate-spin text-blue-800"
          aria-hidden="true"
        />

        <p className="mt-4 text-sm text-gray-500">{message}</p>

        <div className="mt-4 h-1 w-40 overflow-hidden rounded-full bg-blue-100">
          <div className="animate-loading-bar h-full w-1/2 rounded-full bg-blue-800" />
        </div>
      </div>
    </div>
  );
}

