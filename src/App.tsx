import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputStep } from './components/InputStep';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ResumeEditor } from './components/ResumeEditor';
import { CoverLetterEditor } from './components/CoverLetterEditor';
import { ResumeData, JobDescriptionInput, GapAnalysis, CoverLetterData } from './types';
import { SAMPLE_SCENARIOS, SampleScenario } from './data/samples';
import { safeFetchJson } from './lib/api';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentStep, setCurrentStep] = useState<'input' | 'analysis' | 'resume' | 'cover-letter'>('input');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>('');
  const [appError, setAppError] = useState<string | null>(null);

  // Main Data States
  const [jobDescription, setJobDescription] = useState<JobDescriptionInput | null>(null);
  const [originalResume, setOriginalResume] = useState<ResumeData | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(null);

  // Trigger analysis and optimization
  const handleAnalyze = async (
    parsedResume: ResumeData | null,
    rawCvText: string,
    jobInput: JobDescriptionInput,
    tone: string
  ) => {
    setIsLoading(true);
    setAppError(null);
    setJobDescription(jobInput);
    setLoadingStepText('1/3: Analyzing resume against target job description...');

    try {
      let baseResume = parsedResume;

      // If user pasted raw text without parsing first, parse it now
      if (!baseResume && rawCvText) {
        setLoadingStepText('1/3: Parsing resume structure and contact info...');
        const parseData = await safeFetchJson<{ success: boolean; resume?: ResumeData }>('/api/parse-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: rawCvText }),
        });
        if (parseData?.success && parseData.resume) {
          baseResume = parseData.resume;
        }
      }

      if (!baseResume) {
        throw new Error('Please provide resume details to proceed.');
      }

      setLoadingStepText('2/3: Identifying skill gaps & rewriting experience bullets...');

      const json = await safeFetchJson<{
        success: boolean;
        data?: {
          gapAnalysis: GapAnalysis;
          optimizedResume: ResumeData;
          originalResume?: ResumeData;
          coverLetter: CoverLetterData;
        };
        error?: string;
      }>('/api/analyze-and-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: baseResume,
          jobDescription: jobInput,
          tone,
        }),
      });

      if (!json?.success || !json.data) {
        throw new Error(json?.error || 'Failed to complete ATS analysis');
      }

      setLoadingStepText('3/3: Finalizing tailored resume & cover letter...');

      setGapAnalysis(json.data.gapAnalysis);
      setOriginalResume(json.data.originalResume || baseResume);
      setOptimizedResume(json.data.optimizedResume);
      setCoverLetter(json.data.coverLetter);

      // Celebrate success
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      });

      setCurrentStep('analysis');
    } catch (err: any) {
      console.error('Optimization error:', err);
      setAppError(err.message || 'An unexpected issue occurred while analyzing your CV. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  // Load a pre-set scenario
  const handleSelectSample = (scenario: SampleScenario) => {
    setAppError(null);
    setOriginalResume(scenario.resume);
    setOptimizedResume(scenario.resume);
    setJobDescription(scenario.jobDescription);
    // Switch to input step so they see it populated or let them click analyze
    setCurrentStep('input');
  };

  // Reset everything
  const handleReset = () => {
    setAppError(null);
    setCurrentStep('input');
    setOriginalResume(null);
    setOptimizedResume(null);
    setGapAnalysis(null);
    setCoverLetter(null);
    setJobDescription(null);
  };

  // Inject a missing skill into the resume skill categories
  const handleAddSkillToResume = (skillName: string) => {
    if (!optimizedResume) return;
    const categories = [...optimizedResume.skillCategories];
    if (categories.length > 0) {
      if (!categories[0].skills.includes(skillName)) {
        categories[0].skills.push(skillName);
        setOptimizedResume({
          ...optimizedResume,
          skillCategories: categories,
        });
      }
    } else {
      setOptimizedResume({
        ...optimizedResume,
        skillCategories: [{ category: 'Core Skills', skills: [skillName] }],
      });
    }
  };

  const hasOptimized = !!(optimizedResume && gapAnalysis);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-indigo-100 selection:text-indigo-800">
      {/* Header */}
      <Header
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        hasOptimized={hasOptimized}
        onSelectSample={handleSelectSample}
        onReset={handleReset}
        matchScore={gapAnalysis?.matchScore}
      />

      {/* Main Content Step Renderer */}
      <main className="flex-1">
        {currentStep === 'input' && (
          <InputStep
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            loadingStepText={loadingStepText}
            appError={appError}
            onDismissError={() => setAppError(null)}
          />
        )}

        {currentStep === 'analysis' && gapAnalysis && jobDescription && optimizedResume && (
          <AnalysisDashboard
            analysis={gapAnalysis}
            jobDescription={jobDescription}
            optimizedResume={optimizedResume}
            onGoToResume={() => setCurrentStep('resume')}
            onGoToCoverLetter={() => setCurrentStep('cover-letter')}
            onAddSkillToResume={handleAddSkillToResume}
          />
        )}

        {currentStep === 'resume' && optimizedResume && originalResume && jobDescription && (
          <ResumeEditor
            resume={optimizedResume}
            originalResume={originalResume}
            jobDescription={jobDescription}
            onUpdateResume={setOptimizedResume}
            onGoToCoverLetter={() => setCurrentStep('cover-letter')}
            onGoToAnalysis={() => setCurrentStep('analysis')}
          />
        )}

        {currentStep === 'cover-letter' && coverLetter && optimizedResume && jobDescription && (
          <CoverLetterEditor
            coverLetter={coverLetter}
            resume={optimizedResume}
            jobDescription={jobDescription}
            onUpdateCoverLetter={setCoverLetter}
            onGoBackToResume={() => setCurrentStep('resume')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>System Status: Active</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>CVtailor • ATS Intelligence</span>
          </div>
          <div className="text-slate-400">
            Powered by Gemini AI • ATS Verified Formats
          </div>
        </div>
      </footer>
    </div>
  );
}
