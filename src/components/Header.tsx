import React from 'react';
import { Sparkles, FileText, CheckCircle2, RotateCcw, Zap, Award } from 'lucide-react';
import { SAMPLE_SCENARIOS, SampleScenario } from '../data/samples';

interface HeaderProps {
  currentStep: 'input' | 'analysis' | 'resume' | 'cover-letter';
  onStepChange: (step: 'input' | 'analysis' | 'resume' | 'cover-letter') => void;
  hasOptimized: boolean;
  onSelectSample: (scenario: SampleScenario) => void;
  onReset: () => void;
  matchScore?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onStepChange,
  hasOptimized,
  onSelectSample,
  onReset,
  matchScore,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm text-white font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-lg tracking-tight text-slate-900">
                CV<span className="text-indigo-600">tailor</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                ATS Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Tailor resumes & cover letters to any job description</p>
          </div>
        </div>

        {/* Navigation Steps */}
        {hasOptimized && (
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onStepChange('analysis')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentStep === 'analysis'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>ATS Gap Analysis</span>
              {matchScore !== undefined && (
                <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {matchScore}%
                </span>
              )}
            </button>

            <button
              onClick={() => onStepChange('resume')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentStep === 'resume'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tailored CV & Editor</span>
            </button>

            <button
              onClick={() => onStepChange('cover-letter')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentStep === 'cover-letter'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Cover Letter</span>
            </button>
          </nav>
        )}

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Sample Preset Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Try Sample:</span>
              <span className="text-indigo-600 font-bold">Pre-loaded Roles</span>
            </button>
            <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 hidden group-hover:block transition-all animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select test scenario:
              </div>
              {SAMPLE_SCENARIOS.map(s => (
                <button
                  key={s.id}
                  onClick={() => onSelectSample(s)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex flex-col transition-colors border-t border-slate-100"
                >
                  <span className="font-semibold text-slate-900">{s.name}</span>
                  <span className="text-[11px] text-slate-500 truncate">Target: {s.company}</span>
                </button>
              ))}
            </div>
          </div>

          {hasOptimized && (
            <button
              onClick={onReset}
              title="Start with new CV & Job Description"
              className="flex items-center space-x-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Analysis</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
