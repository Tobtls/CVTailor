import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Briefcase,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileUp,
  Sliders,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { ResumeData, JobDescriptionInput } from '../types';
import { SAMPLE_SCENARIOS, SampleScenario } from '../data/samples';
import { safeFetchJson } from '../lib/api';

interface InputStepProps {
  onAnalyze: (resumeData: ResumeData | null, rawCvText: string, jobInput: JobDescriptionInput, tone: string) => Promise<void>;
  isLoading: boolean;
  loadingStepText: string;
  appError?: string | null;
  onDismissError?: () => void;
}

export const InputStep: React.FC<InputStepProps> = ({
  onAnalyze,
  isLoading,
  loadingStepText,
  appError,
  onDismissError,
}) => {
  // Resume Input State
  const [cvInputMode, setCvInputMode] = useState<'upload' | 'paste'>('upload');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');
  const [rawCvText, setRawCvText] = useState<string>('');
  const [parsedResume, setParsedResume] = useState<ResumeData | null>(null);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Job Description Input State
  const [jobTitle, setJobTitle] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('confident-metrics');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load a sample scenario
  const handleLoadScenario = (scenario: SampleScenario) => {
    setParsedResume(scenario.resume);
    setRawCvText(scenario.rawResumeText);
    setUploadedFileName(`${scenario.resume.contactInfo.fullName.replace(' ', '_')}_Resume.pdf`);
    setUploadedFileSize('145 KB');
    setJobTitle(scenario.jobDescription.jobTitle);
    setCompanyName(scenario.jobDescription.companyName);
    setJobDescriptionText(scenario.jobDescription.rawText);
    setErrorMsg(null);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const processUploadedFile = async (file: File) => {
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setParseError(null);
    setIsParsingFile(true);

    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // Read file as base64
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          await parseWithServer(null, base64Data, 'application/pdf');
        };
        reader.readAsDataURL(file);
      } else {
        // Text file or markdown
        const text = await file.text();
        setRawCvText(text);
        await parseWithServer(text, null, null);
      }
    } catch (err: any) {
      console.error('File reading error:', err);
      setParseError('Unable to read the file. You can paste the plain text directly.');
      setIsParsingFile(false);
    }
  };

  const parseWithServer = async (text: string | null, base64: string | null, mimeType: string | null) => {
    try {
      const data = await safeFetchJson<{ success: boolean; resume?: ResumeData; error?: string }>('/api/parse-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: text,
          fileBase64: base64,
          mimeType: mimeType,
        }),
      });

      if (!data?.success || !data.resume) {
        throw new Error(data?.error || 'Failed to parse resume');
      }

      setParsedResume(data.resume);
      if (!jobTitle && data.resume.targetJobTitle) {
        setJobTitle(data.resume.targetJobTitle);
      }
    } catch (err: any) {
      console.error('Parse server error:', err);
      setParseError('Could not automatically structure all resume sections. The optimizer will still analyze the text content.');
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cvContent = parsedResume || rawCvText.trim();
    if (!cvContent) {
      setErrorMsg('Please upload a CV or paste your current resume text.');
      return;
    }

    if (!jobDescriptionText.trim()) {
      setErrorMsg('Please paste the target job description to run ATS analysis.');
      return;
    }

    onAnalyze(
      parsedResume,
      rawCvText,
      {
        jobTitle: jobTitle.trim() || 'Target Position',
        companyName: companyName.trim() || 'Target Employer',
        rawText: jobDescriptionText.trim(),
      },
      selectedTone
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Hero Intro */}
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tailored ATS Alignment & Bullet Rewriting</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
          Optimize Your CV for Any Job Description
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
          Upload your resume and paste the target job posting. Our ATS intelligence engine identifies critical skill gaps, rewrites experience bullets with high-impact metrics, and drafts a tailored cover letter.
        </p>

        {/* Quick Scenario Shortcuts */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-slate-500">Quick Test Scenarios:</span>
          {SAMPLE_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleLoadScenario(s)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 transition-all flex items-center space-x-1.5 shadow-xs font-medium"
            >
              <span>{s.role}</span>
              <span className="text-[11px] text-indigo-600 font-mono font-semibold">({s.company})</span>
            </button>
          ))}
        </div>
      </div>

      {(errorMsg || appError) && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between space-x-3 max-w-4xl mx-auto shadow-xs">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-900">Optimization Notice</div>
              <div className="text-xs text-rose-700 mt-0.5">{errorMsg || appError}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              onDismissError?.();
            }}
            className="text-xs text-rose-600 hover:text-rose-900 font-medium px-2 py-1 rounded hover:bg-rose-100 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Dual-Panel Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Current CV */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                1
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 font-heading">Your Current CV</h2>
                <p className="text-xs text-slate-500">Upload PDF, Word document, or paste text</p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setCvInputMode('upload')}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  cvInputMode === 'upload' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setCvInputMode('paste')}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  cvInputMode === 'paste' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          <div className="mt-5 flex-1 flex flex-col">
            {cvInputMode === 'upload' ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/20 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px] group"
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Click to upload or drag & drop CV
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Supports PDF, DOCX, TXT formats (Max 15MB)
                  </span>
                </div>

                {isParsingFile && (
                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center space-x-3 text-xs text-indigo-800">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Extracting resume structure and experience details...</span>
                  </div>
                )}

                {parseError && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
                    {parseError}
                  </div>
                )}

                {/* File Status & Content Summary */}
                {(uploadedFileName || parsedResume) && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{uploadedFileName || 'Loaded Resume'}</div>
                          {uploadedFileSize && <div className="text-[10px] text-slate-500">{uploadedFileSize}</div>}
                        </div>
                      </div>
                      <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Parsed Ready</span>
                      </span>
                    </div>

                    {parsedResume && (
                      <div className="text-xs text-slate-600 border-t border-slate-200 pt-2.5 space-y-1">
                        <div className="text-slate-900 font-semibold">{parsedResume.contactInfo.fullName}</div>
                        <div className="truncate text-slate-600 text-xs">{parsedResume.careerSummary}</div>
                        <div className="text-[11px] font-medium text-indigo-600">
                          {parsedResume.experiences?.length || 0} Work Positions • {parsedResume.skillCategories?.reduce((acc, c) => acc + c.skills.length, 0) || 0} Skills Detected
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 flex-1 flex flex-col">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Paste Resume Plain Text</span>
                  <span className="text-slate-400 text-[11px] font-mono">{rawCvText.length} characters</span>
                </label>
                <textarea
                  rows={11}
                  value={rawCvText}
                  onChange={(e) => setRawCvText(e.target.value)}
                  placeholder="Paste your full CV text here (Contact, Experience, Skills, Education)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono resize-y flex-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Target Job Description & Optimization Parameters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                2
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 font-heading">Target Job Posting</h2>
                <p className="text-xs text-slate-500">Paste the job requirements and role description</p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4 flex-1 flex flex-col">
            {/* Role & Company Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target Role Title</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Company Name</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Google, Spotify"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Job Description Textarea */}
            <div className="flex-1 flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Job Description & Requirements</span>
                <span className="text-slate-400 text-[11px]">
                  {jobDescriptionText.length > 0 ? `${jobDescriptionText.length} chars` : 'Include Responsibilities & Requirements'}
                </span>
              </label>
              <textarea
                rows={7}
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the full job description, role summary, key responsibilities, and required qualifications..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-sans leading-relaxed resize-y flex-1"
              />
            </div>

            {/* Optimization Tone Selector */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Optimization Strategy & Tone</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'confident-metrics', label: 'Metrics-First', desc: 'STAR quantified impact' },
                  { id: 'executive', label: 'Executive', desc: 'Strategic leadership' },
                  { id: 'technical', label: 'Technical ATS', desc: 'Dense keyword alignment' },
                  { id: 'concise', label: 'Direct & Punchy', desc: 'High-clarity bullets' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTone(t.id)}
                    className={`p-2.5 rounded-lg text-left border transition-all ${
                      selectedTone === t.id
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-1 ring-indigo-400 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">{t.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA: Action Button */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[340px] px-8 py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base shadow-md transition-all flex items-center justify-center space-x-3 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>{loadingStepText || 'Analyzing ATS Gaps & Rewriting CV...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
                <span>Analyze & Optimize</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <p className="text-xs text-slate-500 mt-2 flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Generates side-by-side gap report, rewritten STAR bullets, and tailored cover letter</span>
          </p>
        </div>
      </form>
    </div>
  );
};
