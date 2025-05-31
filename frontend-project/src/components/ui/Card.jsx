function Card({ children, title, className = '', footer, variant = 'default' }) {
  const baseClasses = 'overflow-hidden shadow-instagram-card rounded-instagram transition-shadow duration-200';

  const variantClasses = {
    default: 'bg-white border border-primary-100',
    secondary: 'bg-secondary-50 border border-primary-100',
    gradient: 'bg-gradient-to-br from-secondary-50 to-white border border-primary-100',
    primary: 'bg-primary-50 border border-primary-200',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} hover:shadow-instagram-hover ${className}`}>
      {title && (
        <div className="px-6 py-5 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-secondary-50">
          <h3 className="text-lg leading-6 font-semibold text-primary-900">{title}</h3>
        </div>
      )}
      <div className="px-6 py-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-secondary-50 border-t border-primary-100">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
