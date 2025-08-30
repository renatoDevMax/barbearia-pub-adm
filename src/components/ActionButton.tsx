import { IconType } from 'react-icons';

interface ActionButtonProps {
  title: string;
  icon: IconType;
  onClick?: () => void;
}

export default function ActionButton({ 
  title, 
  icon: Icon, 
  onClick 
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 text-white hover:text-gray-200 transition-all duration-300 group w-full text-left"
    >
      <Icon className="text-2xl text-white group-hover:text-gray-200 transition-colors" />
      <span className="text-lg font-medium">{title}</span>
    </button>
  );
}
