
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = '', variant = 'primary' }) => {
  const baseStyles = "px-6 py-3 font-bold rounded-lg transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-yellow-400 hover:bg-yellow-500 text-black border-b-4 border-yellow-600",
    secondary: "bg-blue-500 hover:bg-blue-600 text-white border-b-4 border-blue-700",
    danger: "bg-red-500 hover:bg-red-600 text-white border-b-4 border-red-700",
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
