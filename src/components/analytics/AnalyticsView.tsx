import { Target } from 'lucide-react';
import { EntriesData, ProgressStats } from '@/lib/types';
import { ProgressCard } from './ProgressCard';
import { RecentActivity } from './RecentActivity';

interface AnalyticsViewProps {
  entries: EntriesData;
  progress: ProgressStats;
}

export const AnalyticsView = ({ entries, progress }: AnalyticsViewProps) => {
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-6 h-6 text-pink-600" />
        <h2 className="text-xl font-semibold text-gray-900">Progress Overview</h2>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProgressCard
          title="Session Hours"
          currentValue={progress.totalSessionHours}
          targetValue={3000}
          progress={progress.sessionProgress}
          color="pink"
          subtitle="Total Progress"
        />

        <ProgressCard
          title="Relational Hours"
          currentValue={progress.relationalHours}
          targetValue={500}
          progress={progress.relationalProgress}
          color="purple"
          subtitle="Required Minimum"
        />

        <ProgressCard
          title="Supervision Hours"
          currentValue={progress.totalSupervisionHours}
          targetValue={100}
          progress={progress.supervisionProgress}
          color="green"
          subtitle="Total Required"
        />

        <ProgressCard
          title="Video/Audio Supervision"
          currentValue={progress.videoAudioSupervisionHours}
          targetValue={25}
          progress={progress.videoAudioSupervisionProgress}
          color="blue"
          subtitle="Review Hours Required"
        />

        <ProgressCard
          title="Total CE Hours"
          currentValue={progress.ceCycleHours}
          targetValue={40}
          progress={progress.ceProgress}
          color="indigo"
          subtitle="Current Cycle"
        />

        <ProgressCard
          title="Ethics, Law, or Technology"
          currentValue={progress.ethicsLawTechHours}
          targetValue={6}
          progress={progress.ethicsLawTechProgress}
          color="orange"
          subtitle="CE Required"
        />

        <ProgressCard
          title="Suicide Prevention"
          currentValue={progress.suicidePreventionHours}
          targetValue={2}
          progress={progress.suicidePreventionProgress}
          color="blue"
          subtitle="CE Required"
        />

        <ProgressCard
          title="MFT-Specific"
          currentValue={progress.mftSpecificHours}
          targetValue={15}
          progress={progress.mftSpecificProgress}
          color="green"
          subtitle="CE Required (MFT Only)"
        />
      </div>

      {/* MFT Note */}
      {progress.mftSpecificHours > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-700">
            <strong>Note:</strong> MFT-Specific hours are only required for Marriage & Family Therapists. 
            If you&apos;re not an MFT, these hours will count toward your general CE requirement.
          </p>
        </div>
      )}

      {/* Recent Activity */}
      <RecentActivity entries={entries} />
    </div>
  );
};