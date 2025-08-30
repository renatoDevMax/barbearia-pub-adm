interface SubListItemProps {
  title: string;
  onClick?: () => void;
}

export default function SubListItem({ title, onClick }: SubListItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center px-4 py-2 text-white hover:text-gray-200 transition-all duration-300 group w-full text-left text-sm"
    >
      <span className="font-medium">{title}</span>
    </button>
  );
}
