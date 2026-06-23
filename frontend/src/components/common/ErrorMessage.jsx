const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-12">
    <div className="text-red-400 text-5xl">⚠</div>
    <p className="text-red-400 font-medium">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-sm">
        Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage;