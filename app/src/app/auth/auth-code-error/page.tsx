import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              We couldn&apos;t complete your sign-in request. This could be due
              to:
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside">
              <li>Invalid or expired authentication code</li>
              <li>Redirect URI mismatch in Google Cloud Console</li>
              <li>Missing or incorrect Supabase configuration</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Link href="/sign-in" className="flex-1">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                Try Again
              </button>
            </Link>
            <Link href="/" className="flex-1">
              <button className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                Go Home
              </button>
            </Link>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            If this problem persists, please check the setup guide or contact
            support.
          </p>
        </div>
      </div>
    </div>
  );
}
