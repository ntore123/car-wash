function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-instagram p-6 shadow-instagram-card border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">{title}</h1>
            {description && (
              <p className="text-primary-700 font-medium">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex space-x-3">{actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
