import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Villa del Sol RMS - POS</title>
        <meta name="description" content="Point of Sale System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Villa del Sol</h1>
            <p className="mt-2 text-xl text-gray-600">Point of Sale System</p>
          </div>

          <div className="space-y-4">
            <Link
              href="/pos/login"
              className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              Point of Sale
            </Link>
            <Link
              href="/pos/orders"
              className="block w-full rounded-lg bg-green-600 px-6 py-3 text-center font-semibold text-white hover:bg-green-700"
            >
              Create Order
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
