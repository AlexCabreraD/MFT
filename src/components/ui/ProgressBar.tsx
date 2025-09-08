interface ProgressBarProps {
  progress: number;
  color: 'pink' | 'purple' | 'blue' | 'green' | 'orange' | 'indigo';
  className?: string;
}

export const ProgressBar = ({ progress, color, className = '' }: ProgressBarProps) => {
  const colorClasses = {
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};