import { useState, useEffect } from 'react';
import { CheckCircle, Clock, BookOpen, Users, GraduationCap, FileText, Edit3, Check, X } from 'lucide-react';
import { ProgressStats } from '@/lib/types';

interface RequirementsViewProps {
  progress: ProgressStats;
  trainingStartDate?: string;
  onUpdateTrainingStartDate?: (date: string) => void;
}

export const RequirementsView = ({ progress, trainingStartDate, onUpdateTrainingStartDate }: RequirementsViewProps) => {
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(trainingStartDate || '');

  // Update temp state when trainingStartDate prop changes
  useEffect(() => {
    if (!isEditingStartDate) {
      setTempStartDate(trainingStartDate || '');
    }
  }, [trainingStartDate, isEditingStartDate]);

  const getStatusIcon = (current: number, required: number) => {
    return current >= required ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <Clock className="w-5 h-5 text-orange-500" />
    );
  };

  const getStatusColor = (current: number, required: number) => {
    return current >= required ? 'text-green-700 bg-green-50 border-green-200' : 'text-orange-700 bg-orange-50 border-orange-200';
  };

  const handleStartEdit = () => {
    setTempStartDate(trainingStartDate || '');
    setIsEditingStartDate(true);
  };

  const handleSaveStartDate = () => {
    if (onUpdateTrainingStartDate && tempStartDate) {
      onUpdateTrainingStartDate(tempStartDate);
    }
    setIsEditingStartDate(false);
  };

  const handleCancelEdit = () => {
    setTempStartDate(trainingStartDate || '');
    setIsEditingStartDate(false);
  };

  // Helper function to format date string as local date (avoiding timezone issues)
  const formatLocalDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    // Split the date string and create a date using local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    return localDate.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MFT Requirements Tracker</h1>
        <p className="text-gray-600">Utah Marriage and Family Therapist Licensing Requirements</p>
      </div>

      {/* Full Licensure Requirements */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <GraduationCap className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Full Licensure Requirements</h2>
          <span className="ml-2 text-sm text-gray-500">(Associate MFT → Licensed MFT)</span>
        </div>

        <div className="grid gap-4">
          {/* Clinical Hours */}
          <div className={`border rounded-lg p-4 ${getStatusColor(progress.totalClinicalHours, 3000)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {getStatusIcon(progress.totalClinicalHours, 3000)}
                <div className="ml-3">
                  <h3 className="font-semibold">Supervised Clinical Training</h3>
                  <p className="text-sm opacity-90">3,000 hours total (post-master&apos;s degree)</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{progress.totalClinicalHours.toFixed(1)} / 3,000</div>
                <div className="text-sm opacity-75">{Math.max(0, 3000 - progress.totalClinicalHours).toFixed(0)} remaining</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2">
              <div 
                className="bg-current h-2 rounded-full opacity-60" 
                style={{ width: `${Math.min(100, progress.clinicalProgress)}%` }}
              ></div>
            </div>
          </div>

          {/* Mental Health Therapy Hours */}
          <div className={`border rounded-lg p-4 ${getStatusColor(progress.directMftHours, 1000)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {getStatusIcon(progress.directMftHours, 1000)}
                <div className="ml-3">
                  <h3 className="font-semibold">Mental Health Therapy</h3>
                  <p className="text-sm opacity-90">1,000 hours minimum mental health therapy</p>
                  <p className="text-xs opacity-75 mt-1">Individual, family, and couple therapy sessions</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{progress.directMftHours.toFixed(1)} / 1,000</div>
                <div className="text-sm opacity-75">{Math.max(0, 1000 - progress.directMftHours).toFixed(0)} remaining</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2">
              <div 
                className="bg-current h-2 rounded-full opacity-60" 
                style={{ width: `${Math.min(100, progress.directMftProgress)}%` }}
              ></div>
            </div>
          </div>

          {/* Supervision Hours */}
          <div className={`border rounded-lg p-4 ${getStatusColor(progress.totalSupervisionHours, 100)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {getStatusIcon(progress.totalSupervisionHours, 100)}
                <div className="ml-3">
                  <h3 className="font-semibold">Face-to-Face Supervision</h3>
                  <p className="text-sm opacity-90">100 hours minimum (individual or small group)</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{progress.totalSupervisionHours.toFixed(1)} / 100</div>
                <div className="text-sm opacity-75">{Math.max(0, 100 - progress.totalSupervisionHours).toFixed(0)} remaining</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2">
              <div 
                className="bg-current h-2 rounded-full opacity-60" 
                style={{ width: `${Math.min(100, progress.supervisionProgress)}%` }}
              ></div>
            </div>
          </div>

          {/* Two-Year Minimum Timeline */}
          <div className={`border rounded-lg p-4 ${progress.timeProgress >= 100 ? 'text-green-700 bg-green-50 border-green-200' : 'text-orange-700 bg-orange-50 border-orange-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {getStatusIcon(progress.timeProgress, 100)}
                <div className="ml-3">
                  <h3 className="font-semibold">Two-Year Minimum Requirement</h3>
                  <p className="text-sm opacity-90">Training must span at least 2 years</p>
                  {trainingStartDate && (
                    <p className="text-xs opacity-75 mt-1">
                      Started: {formatLocalDate(trainingStartDate)}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{progress.timeProgress.toFixed(1)}%</div>
                <div className="text-sm opacity-75">
                  {progress.timeRemaining > 0 ? `${progress.timeRemaining} days remaining` : 'Requirement met'}
                </div>
              </div>
            </div>
            <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2">
              <div 
                className="bg-current h-2 rounded-full opacity-60" 
                style={{ width: `${Math.min(100, progress.timeProgress)}%` }}
              ></div>
            </div>
            
            {/* Training Start Date Configuration */}
            {onUpdateTrainingStartDate && (
              <div className="mt-4 pt-3 border-t border-current opacity-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium opacity-90">
                      Training Start Date:
                    </label>
                    {!isEditingStartDate ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {formatLocalDate(trainingStartDate || '')}
                        </span>
                        <button
                          onClick={handleStartEdit}
                          className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors"
                          title="Edit training start date"
                        >
                          <Edit3 className="w-3 h-3 opacity-75" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={tempStartDate}
                          onChange={(e) => setTempStartDate(e.target.value)}
                          className="px-2 py-1 text-sm border border-current rounded bg-white bg-opacity-50 focus:outline-none focus:ring-1 focus:ring-current"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveStartDate}
                          className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors text-green-600"
                          title="Save"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors text-red-600"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs opacity-75 mt-1">
                  {isEditingStartDate 
                    ? 'Select when you began your supervised clinical training'
                    : 'Click the edit icon to change your training start date'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Additional Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Additional Requirements</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Must be W-2 employee of mental health agency (no independent practice)</li>
              <li>• Supervision ratio: 1 hour per 40 clinical hours (typical)</li>
              <li>• Pass AMFTRB national exam</li>
              <li>• May require Utah jurisprudence exam</li>
              <li>• Master&apos;s/doctoral degree in MFT from accredited program</li>
              <li>• 2 hours of suicide prevention training by Board-approved provider</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Licensure by Endorsement Requirements */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Licensure by Endorsement (Portability)</h2>
          <span className="ml-2 text-sm text-gray-500">(Licensed in another state)</span>
        </div>

        <div className="grid gap-4">
          {/* Endorsement Clinical Hours */}
          <div className={`border rounded-lg p-4 ${getStatusColor(progress.totalClinicalHours, 4000)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {getStatusIcon(progress.totalClinicalHours, 4000)}
                <div className="ml-3">
                  <h3 className="font-semibold">Marriage and Family Therapy Practice</h3>
                  <p className="text-sm opacity-90">4,000 hours minimum practice experience</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{progress.totalClinicalHours.toFixed(1)} / 4,000</div>
                <div className="text-sm opacity-75">{Math.max(0, 4000 - progress.totalClinicalHours).toFixed(0)} remaining</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2">
              <div 
                className="bg-current h-2 rounded-full opacity-60" 
                style={{ width: `${Math.min(100, progress.endorsementProgress)}%` }}
              ></div>
            </div>
          </div>

          {/* Endorsement Direct MFT Hours */}
          <div className={`border rounded-lg p-4 ${getStatusColor(progress.directMftHours, 1000)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {getStatusIcon(progress.directMftHours, 1000)}
                <div className="ml-3">
                  <h3 className="font-semibold">Mental Health Therapy</h3>
                  <p className="text-sm opacity-90">1,000 hours minimum within total practice</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{progress.directMftHours.toFixed(1)} / 1,000</div>
                <div className="text-sm opacity-75">{Math.max(0, 1000 - progress.directMftHours).toFixed(0)} remaining</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2">
              <div 
                className="bg-current h-2 rounded-full opacity-60" 
                style={{ width: `${Math.min(100, progress.directMftProgress)}%` }}
              ></div>
            </div>
          </div>

          {/* Endorsement Additional Requirements */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Additional Endorsement Requirements</h3>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Currently licensed as MFT in another state</li>
              <li>• State licensing standards substantially equivalent to Utah</li>
              <li>• Verification from employer required</li>
              <li>• Meet all current Utah MFT requirements</li>
            </ul>
          </div>
        </div>
      </section>

      {/* License Renewal Requirements */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <BookOpen className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">License Renewal Requirements</h2>
          <span className="ml-2 text-sm text-gray-500">(Every 2 years, Oct 1 even years)</span>
        </div>

        <div className="grid gap-4">
          {/* Total CE Hours */}
          <div className={`border rounded-lg p-4 ${getStatusColor(progress.ceCycleHours, 40)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {getStatusIcon(progress.ceCycleHours, 40)}
                <div className="ml-3">
                  <h3 className="font-semibold">Total CE Hours</h3>
                  <p className="text-sm opacity-90">40 hours per 2-year cycle</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{progress.ceCycleHours.toFixed(1)} / 40</div>
                <div className="text-sm opacity-75">{Math.max(0, 40 - progress.ceCycleHours).toFixed(1)} remaining</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2">
              <div 
                className="bg-current h-2 rounded-full opacity-60" 
                style={{ width: `${Math.min(100, progress.ceProgress)}%` }}
              ></div>
            </div>
          </div>

          {/* CE Category Breakdown */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Ethics/Law/Tech */}
            <div className={`border rounded-lg p-4 ${getStatusColor(progress.ethicsLawTechHours, 6)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {getStatusIcon(progress.ethicsLawTechHours, 6)}
                  <div className="ml-3">
                    <h4 className="font-medium">Ethics/Law/Technology</h4>
                    <p className="text-xs opacity-75">6 hrs min (3 must be MFT-specific)</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{progress.ethicsLawTechHours.toFixed(1)} / 6</div>
                </div>
              </div>
            </div>

            {/* MFT-Specific */}
            <div className={`border rounded-lg p-4 ${getStatusColor(progress.mftSpecificHours, 15)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {getStatusIcon(progress.mftSpecificHours, 15)}
                  <div className="ml-3">
                    <h4 className="font-medium">MFT-Specific</h4>
                    <p className="text-xs opacity-75">15 hrs min (can overlap)</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{progress.mftSpecificHours.toFixed(1)} / 15</div>
                </div>
              </div>
            </div>

            {/* Suicide Prevention */}
            <div className={`border rounded-lg p-4 ${getStatusColor(progress.suicidePreventionHours, 2)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {getStatusIcon(progress.suicidePreventionHours, 2)}
                  <div className="ml-3">
                    <h4 className="font-medium">Suicide Prevention</h4>
                    <p className="text-xs opacity-75">2 hrs required each cycle</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{progress.suicidePreventionHours.toFixed(1)} / 2</div>
                </div>
              </div>
            </div>

            {/* Non-Interactive Warning */}
            <div className={`border rounded-lg p-4 ${progress.nonInteractiveHours > 15 ? 'text-red-700 bg-red-50 border-red-200' : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <div>
                    <h4 className="font-medium">Non-Interactive Limit</h4>
                    <p className="text-xs opacity-75">Max 15 hrs distance learning</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{progress.nonInteractiveHours.toFixed(1)} / 15</div>
                </div>
              </div>
            </div>
          </div>

          {/* CE Rules */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">CE Rules & Guidelines</h3>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• Renewal cycle: Oct 1 of even-numbered years (e.g., 2024-2026)</li>
              <li>• Carryover: Up to 10 hours can be carried to next cycle</li>
              <li>• Documentation: Keep all CE records for 2 years after each cycle</li>
              <li>• Interactive vs Non-interactive: Live/real-time counts as interactive</li>
              <li>• MFT-specific hours can overlap with other categories</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Users className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Quick Reference</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Session Types (Direct MFT)</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Individual Therapy</li>
              <li>• Family Therapy</li>
              <li>• Couple/Marriage Therapy</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Other Clinical Activities</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Assessment/Evaluation</li>
              <li>• Consultation</li>
              <li>• Documentation/Case Notes</li>
              <li>• Other Clinical Activities</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};