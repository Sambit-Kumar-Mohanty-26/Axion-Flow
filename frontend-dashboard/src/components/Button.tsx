import React from 'react';
type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
};

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  if (variant === 'primary') {
    return (
      <button
        className={`relative inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-blue-600 rounded-lg overflow-hidden group transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${className}`}
        {...props}
      >
        <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 transition-all duration-500 ease-in-out transform -translate-x-full group-hover:translate-x-0 group-hover:opacity-20 skew-x-[-15deg]"></span>
        <span className="relative">{children}</span>
      </button>
    );
  }

  return (
    <button
      className={`relative inline-flex p-1 rounded-lg overflow-hidden group transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-400 ${className}`}
      {...props}
    >
      <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00c2ff_0%,#0052cc_50%,#00c2ff_100%)]"></span>
      <div className="relative inline-flex items-center justify-center w-full px-6 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-md">
        {children}
      </div>
    </button>
  );
};