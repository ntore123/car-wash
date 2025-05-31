function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-instagram focus:outline-none transition-all duration-200 ease-in-out shadow-instagram';

  const variantClasses = {
    primary: 'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 hover:shadow-instagram-hover focus:ring-2 focus:ring-primary-500',
    secondary: 'bg-secondary-100 text-primary-800 border border-primary-200 hover:bg-secondary-200 hover:border-primary-300 focus:ring-2 focus:ring-primary-500',
    accent: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 hover:shadow-instagram-hover focus:ring-2 focus:ring-accent-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 hover:shadow-instagram-hover focus:ring-2 focus:ring-red-500',
    success: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 hover:shadow-instagram-hover focus:ring-2 focus:ring-accent-500',
    outline: 'bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-2 focus:ring-primary-500',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline shadow-none',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:shadow-instagram' : 'cursor-pointer';

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
