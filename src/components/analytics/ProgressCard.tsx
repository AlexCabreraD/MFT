import { ProgressBar } from '@/components/ui/ProgressBar';

interface ProgressCardProps {
  title: string;
  currentValue: number;
  targetValue: number;
  progress: number;
  color: 'pink' | 'purple' | 'blue' | 'green' | 'orange' | 'indigo';
  subtitle?: string;
}

export const ProgressCard = ({ 
  title, 
  currentValue, 
  targetValue, 
  progress, 
  color,
  subtitle 
}: ProgressCardProps) => {
  const colorClasses = {
    pink: 'text-pink-600 border-pink-200',
    purple: 'text-purple-600 border-purple-200',
    blue: 'text-blue-600 border-blue-200',
    green: 'text-green-600 border-green-200',
    orange: 'text-orange-600 border-orange-200',
    indigo: 'text-indigo-600 border-indigo-200'
  };

  return (
    <div className={`bg-white border rounded-lg p-6 shadow-sm ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <div className={`text-2xl font-bold ${colorClasses[color].split(' ')[0]}`}>
          {currentValue.toFixed(1)}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{subtitle || 'Progress'}</span>
          <span>{currentValue.toFixed(1)} / {targetValue} hours</span>
        </div>
        <ProgressBar progress={progress} color={color} />
        <div className="text-xs text-gray-600">
          {progress.toFixed(1)}% complete
        </div>
      </div>
    </div>
  );
};