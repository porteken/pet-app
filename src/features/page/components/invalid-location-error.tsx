interface InvalidLocationErrorProperties {
  readonly message: string;
  readonly title: string;
}

export const InvalidLocationError = ({
  message,
  title,
}: InvalidLocationErrorProperties) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};
