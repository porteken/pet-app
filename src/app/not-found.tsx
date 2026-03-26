export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900">404 - Not Found</h1>
        <p className="text-base text-gray-600">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}
