import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

function Alert({ type = 'info', message, dismissible = true, className = '' }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const typeClasses = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-accent-50 text-accent-800 border-accent-200',
    warning: 'bg-secondary-100 text-secondary-800 border-secondary-300',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div
      className={`p-4 mb-6 border rounded-instagram shadow-instagram-card ${typeClasses[type]} ${className}`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 font-medium">{message}</div>
        {dismissible && (
          <button
            type="button"
            className="ml-4 p-1 rounded-instagram-sm hover:bg-black hover:bg-opacity-10 transition-colors duration-200"
            onClick={() => setIsVisible(false)}
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Alert;
