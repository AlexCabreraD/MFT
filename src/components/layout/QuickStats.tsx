import { ProgressStats } from '@/lib/types';

interface QuickStatsProps {
  progress: ProgressStats;
}

export const QuickStats = ({ progress }: QuickStatsProps) => {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-pink-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-600">{progress.totalClinicalHours.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Total Clinical Hours</div>
          <div className="text-xs text-gray-500">
            {Math.max(0, 4000 - progress.totalClinicalHours).toFixed(0)} remaining
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{progress.directMftHours.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Direct MFT Hours</div>
          <div className="text-xs text-gray-500">
            {Math.max(0, 1000 - progress.directMftHours).toFixed(0)} remaining
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{progress.totalSupervisionHours.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Supervision Hours</div>
          <div className="text-xs text-gray-500">
            {Math.max(0, 100 - progress.totalSupervisionHours).toFixed(0)} remaining
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{progress.ceCycleHours.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Total CE Hours</div>
          <div className="text-xs text-gray-500">
            {Math.max(0, 40 - progress.ceCycleHours).toFixed(0)} remaining
          </div>
        </div>
      </div>

      {/* Supervision Breakdown */}
      <div className="border-t border-pink-200 pt-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Supervision Requirements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center bg-emerald-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-emerald-700">{progress.totalSupervisionHours.toFixed(1)} / 100</div>
            <div className="text-sm text-emerald-600">Total Supervision Hours</div>
            <div className="w-full bg-emerald-200 rounded-full h-2 mt-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, progress.supervisionProgress)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center bg-teal-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-teal-700">{progress.videoAudioSupervisionHours.toFixed(1)} / 25</div>
            <div className="text-sm text-teal-600">Video/Audio Review Hours</div>
            <div className="w-full bg-teal-200 rounded-full h-2 mt-2">
              <div 
                className="bg-teal-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, progress.videoAudioSupervisionProgress)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* CE Breakdown */}
      <div className="border-t border-pink-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-3">CE Category Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{progress.ethicsLawTechHours.toFixed(1)}</div>
            <div className="text-xs text-gray-600">Ethics/Law/Tech</div>
            <div className="text-xs text-gray-500">{Math.max(0, 6 - progress.ethicsLawTechHours).toFixed(1)} needed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">{progress.suicidePreventionHours.toFixed(1)}</div>
            <div className="text-xs text-gray-600">Suicide Prevention</div>
            <div className="text-xs text-gray-500">{Math.max(0, 2 - progress.suicidePreventionHours).toFixed(1)} needed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-indigo-600">{progress.mftSpecificHours.toFixed(1)}</div>
            <div className="text-xs text-gray-600">MFT-Specific</div>
            <div className="text-xs text-gray-500">{Math.max(0, 15 - progress.mftSpecificHours).toFixed(1)} needed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">{progress.generalCeHours.toFixed(1)}</div>
            <div className="text-xs text-gray-600">General CE</div>
            <div className="text-xs text-gray-500">{Math.max(0, 17 - progress.generalCeHours).toFixed(1)} available</div>
          </div>
        </div>
      </div>
    </div>
  );
};