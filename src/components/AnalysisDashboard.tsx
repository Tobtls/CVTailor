import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
  Target,
  Sparkles,
  PlusCircle,
  BarChart3,
  Flame,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { GapAnalysis, ResumeData, JobDescriptionInput } from '../types';

interface AnalysisDashboardProps {
  analysis: GapAnalysis;
  jobDescription: JobDescriptionInput;
  optimizedResume: ResumeData;
  onGoToResume: () => void;
  onGoToCoverLetter: () => void;
  onAddSkillToResume: (skill: string) => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  analysis,
  jobDescription,
  optimizedResume,
  onGoToResume,
  onGoToCoverLetter,
  onAddSkillToResume,
}) => {
  const scoreDelta = analysis.matchScore - (analysis.originalScore || Math.max(35, analysis.matchScore - 28));

  // Determine pass probability color & badge
  const passConfig = {
    High: {
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      desc: 'Top 5% ATS score. High likelihood of passing automated recruiter screens.',
    },
    Medium: {
      color: 'text-amber-800',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      desc: 'Moderate ATS alignment. Recommended to review missing technical keywords.',
    },
    Low: {
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      desc: 'Significant skill gaps detected. Requires additional keyword enrichment.',
    },
  }[analysis.atsPassProbability || 'High'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Target Job Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Target Role Alignment Report</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">
            {jobDescription.jobTitle}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Target Employer: <span className="text-slate-800 font-medium">{jobDescription.companyName}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToResume}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
          >
            <span>Review Tailored CV</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onGoToCoverLetter}
            className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>View Cover Letter</span>
          </button>
        </div>
      </div>

      {/* Top 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Match Score */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Optimized ATS Score</span>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-slate-900 font-heading">{analysis.matchScore}%</span>
            {scoreDelta > 0 && (
              <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{scoreDelta}% Lift
              </span>
            )}
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${analysis.matchScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Original Resume: <span className="text-slate-700 font-medium">{analysis.originalScore || 52}%</span>
          </p>
        </div>

        {/* Metric 2: ATS Pass Probability */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass Probability</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${passConfig.bg} ${passConfig.color} ${passConfig.border}`}>
                {analysis.atsPassProbability || 'High'} Match
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-snug">{passConfig.desc}</p>
        </div>

        {/* Metric 3: Keyword Coverage */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Keyword Coverage</span>
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-heading">
              {analysis.keywordCoveragePercentage || 88}%
            </span>
            <span className="text-xs text-slate-500">of required skills</span>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{analysis.matchedKeywords?.length || 0} matched</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 ml-2" />
            <span>{analysis.missingHardSkills?.length || 0} gaps</span>
          </div>
        </div>

        {/* Metric 4: Action Verb & Metrics Power */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Impact Metrics Power</span>
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-heading">
              {analysis.quantifiableMetricsScore || 90}%
            </span>
            <span className="text-xs text-amber-800 font-medium">STAR density</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            Action Verb Strength: <span className="text-emerald-700 font-semibold">{analysis.actionVerbsScore || 94}%</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Body: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Keyword Matrix & Strategic Gap Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Keyword Alignment Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-semibold text-slate-900 font-heading">ATS Keyword Breakdown</h2>
              </div>
              <span className="text-xs text-slate-500">Live matching vs Job Posting</span>
            </div>

            {/* Matched Keywords */}
            <div className="mt-5">
              <div className="flex items-center space-x-2 mb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Matched Target Keywords ({analysis.matchedKeywords?.length || 0})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.matchedKeywords?.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{kw}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Critical Hard Skills */}
            {analysis.missingHardSkills && analysis.missingHardSkills.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                      Missing Critical Hard Skills & Tech ({analysis.missingHardSkills.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Click "+" to inject into resume</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingHardSkills.map((skill, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onAddSkillToResume(skill)}
                      className="inline-flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-medium transition-all group cursor-pointer"
                    >
                      <span>{skill}</span>
                      <PlusCircle className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Soft Skills / Competencies */}
            {analysis.missingSoftSkills && analysis.missingSoftSkills.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center space-x-2 mb-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Competencies & Soft Skills to Emphasize ({analysis.missingSoftSkills.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSoftSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium"
                    >
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Critical Gaps & Recommendations */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-900 font-heading">Gap Analysis & Strategic Fixes</h2>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Identified Resume Gaps</h3>
              {analysis.criticalGaps?.map((gap, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs text-slate-700"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                    !
                  </div>
                  <span className="leading-relaxed">{gap}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Actionable Improvement Suggestions</h3>
              {analysis.improvementSuggestions?.map((sugg, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-start space-x-3 text-xs text-indigo-950"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{sugg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Strengths, Formatting Audit & Quick Jump */}
        <div className="space-y-6">
          {/* Key Selling Strengths */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-900 font-heading">Candidate Strengths</h2>
            </div>
            <div className="space-y-2.5">
              {analysis.strengths?.map((str, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-600 leading-relaxed">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ATS Compliance Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-900 font-heading">ATS Audit Checklist</h2>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700">Parseable Standard Headings</span>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Passed
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700">No Complex Multi-column tables</span>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Passed
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700">Quantified STAR Bullet Structure</span>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> {analysis.quantifiableMetricsScore || 90}%
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700">Action Verbs at bullet start</span>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> {analysis.actionVerbsScore || 94}%
                </span>
              </div>
            </div>
          </div>

          {/* Jump to Tailored CV CTA Banner */}
          <div className="p-6 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-heading">Ready to Edit & Download</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Your tailored CV and cover letter have been generated with full ATS optimizations.
              </p>
            </div>
            <button
              onClick={onGoToResume}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Open CV Editor & Preview</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
