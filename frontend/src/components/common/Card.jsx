import React from "react";

const Card = ({
  children,
  title = "",
  subtitle = "",
  footer = null,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  noPadding = false,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      {(title || subtitle) && (
        <div className={`border-b px-6 py-4 ${headerClassName}`}>
          {title && (
            <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          )}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      <div className={`${noPadding ? "" : "p-6"} ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className={`border-t px-6 py-4 ${footerClassName}`}>{footer}</div>
      )}
    </div>
  );
};

export default Card;
