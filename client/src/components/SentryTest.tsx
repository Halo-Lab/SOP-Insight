import * as Sentry from "@sentry/react";

export function SentryTest() {
  const handleErrorClick = () => {
    try {
      throw new Error("Test Sentry Error");
    } catch (error) {
      Sentry.captureException(error);
      alert("Error sent to Sentry!");
    }
  };

  const handleTraceClick = () => {
    Sentry.startSpan({ op: "test", name: "Test Transaction" }, () => {
      setTimeout(() => {
        alert("Transaction sent to Sentry!");
      }, 500);
    });
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <h2 className="text-lg font-bold mb-4">Sentry Testing</h2>
      <div className="space-x-4">
        <button
          onClick={handleErrorClick}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Test Error
        </button>
        <button
          onClick={handleTraceClick}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Test Performance
        </button>
      </div>
    </div>
  );
}
