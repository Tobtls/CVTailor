import React, { useState } from 'react';
import {
  Download,
  Copy,
  Sparkles,
  FileText,
  Check,
  RotateCw,
  Edit3,
  Eye,
  Building2,
  Sliders,
  Send,
  ArrowLeft,
  Globe,
  Linkedin,
  Github,
  Mail,
  Phone
} from 'lucide-react';
import { CoverLetterData, ResumeData, JobDescriptionInput } from '../types';
import { exportElementToPdf, exportCoverLetterToPlainText, downloadTextFile, exportCoverLetterToDocx } from '../lib/pdfExport';
import { safeFetchJson } from '../lib/api';
import confetti from 'canvas-confetti';

interface CoverLetterEditorProps {
  coverLetter: CoverLetterData;
  resume: ResumeData;
  jobDescription: JobDescriptionInput;
  onUpdateCoverLetter: (updated: CoverLetterData) => void;
  onGoBackToResume: () => void;
}

const ensureHttpUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const cleanDisplayUrl = (url?: string): string => {
  if (!url) return '';
  return url.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
};

export const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({
  coverLetter,
  resume,
  jobDescription,
  onUpdateCoverLetter,
  onGoBackToResume,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [selectedTone, setSelectedTone] = useState<string>('Professional & Persuasive');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Download PDF
  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      // If user is currently in editing mode, switch to live paper preview to mount the printable element
      if (activeTab !== 'preview') {
        setActiveTab('preview');
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      const filename = `${resume.contactInfo.fullName.replace(/\s+/g, '_')}_Cover_Letter.pdf`;
      await exportElementToPdf('cover-letter-paper-document', filename);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error('Failed to export Cover Letter PDF:', err);
      alert('Unable to generate PDF. You can copy the plain text or use system print.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Download DOCX
  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      const filename = `${resume.contactInfo.fullName.replace(/\s+/g, '_')}_Cover_Letter.docx`;
      await exportCoverLetterToDocx(coverLetter, resume, filename);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error('Failed to export DOCX:', err);
      alert('Unable to generate Word document. Please try again or export as PDF.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Copy Plain Text
  const handleCopyText = () => {
    const text = exportCoverLetterToPlainText(coverLetter);
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Download Plain Text
  const handleDownloadTxt = () => {
    const text = exportCoverLetterToPlainText(coverLetter);
    const filename = `${resume.contactInfo.fullName.replace(/\s+/g, '_')}_Cover_Letter.txt`;
    downloadTextFile(text, filename);
  };

  // AI Regenerate Cover Letter
  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const data = await safeFetchJson<{ success: boolean; coverLetter?: CoverLetterData }>('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          jobDescription,
          tone: selectedTone,
          customNote: customInstructions,
        }),
      });
      if (data?.success && data?.coverLetter) {
        onUpdateCoverLetter(data.coverLetter);
      }
    } catch (err) {
      console.error('Error regenerating cover letter:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Paragraph edits
  const handleParagraphChange = (index: number, newText: string) => {
    const updated = [...coverLetter.bodyParagraphs];
    updated[index] = newText;
    onUpdateCoverLetter({ ...coverLetter, bodyParagraphs: updated });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        {/* Left: Switch back & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onGoBackToResume}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to CV</span>
          </button>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                activeTab === 'preview' ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Paper Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                activeTab === 'edit' ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>In-Line Editor</span>
            </button>
          </div>
        </div>

        {/* Right: Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedNotification ? 'Copied Letter!' : 'Copy Letter Text'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>.TXT</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            title="Download formatted Microsoft Word (.docx) format"
          >
            {isExportingDocx ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-blue-600" />}
            <span>.DOCX (Word)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            {isExportingPdf ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Paper Preview or Editor */}
        <div className="lg:col-span-2">
          {activeTab === 'preview' ? (
            <div className="flex flex-col items-center justify-center p-3 sm:p-8 bg-slate-100/70 rounded-xl border border-slate-200">
              <div
                id="cover-letter-paper-document"
                className="resume-paper bg-white text-slate-900 w-full max-w-[800px] min-h-[950px] p-8 sm:p-12 mx-auto shadow-md rounded-lg border border-slate-200 font-sans leading-relaxed selection:bg-indigo-100 selection:text-indigo-900"
              >
                {/* Sender Header */}
                <div className="pb-6 mb-6 border-b border-slate-200">
                  <h1 className="text-2xl font-bold text-slate-950 uppercase tracking-tight font-heading">
                    {resume.contactInfo.fullName}
                  </h1>
                  <div className="text-xs text-slate-600 mt-1.5 flex flex-wrap gap-x-3 gap-y-1 items-center">
                    {resume.contactInfo.email && (
                      <a href={`mailto:${resume.contactInfo.email}`} className="hover:text-indigo-600 hover:underline">
                        {resume.contactInfo.email}
                      </a>
                    )}
                    {resume.contactInfo.phone && (
                      <span>• {resume.contactInfo.phone}</span>
                    )}
                    {resume.contactInfo.location && (
                      <span>• {resume.contactInfo.location}</span>
                    )}
                    {resume.contactInfo.portfolio && (
                      <a
                        href={ensureHttpUrl(resume.contactInfo.portfolio)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-700 font-semibold hover:text-indigo-900 underline decoration-indigo-400 inline-flex items-center space-x-1"
                        title={`Portfolio Website: ${ensureHttpUrl(resume.contactInfo.portfolio)}`}
                      >
                        <span>•</span>
                        <Globe className="w-3 h-3 text-indigo-600" />
                        <span>Portfolio</span>
                      </a>
                    )}
                    {resume.contactInfo.linkedin && (
                      <a
                        href={ensureHttpUrl(resume.contactInfo.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 font-semibold hover:text-blue-900 underline decoration-blue-400 inline-flex items-center space-x-1"
                        title={`LinkedIn Profile: ${ensureHttpUrl(resume.contactInfo.linkedin)}`}
                      >
                        <span>•</span>
                        <Linkedin className="w-3 h-3 text-blue-600" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {resume.contactInfo.github && (
                      <a
                        href={ensureHttpUrl(resume.contactInfo.github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-800 font-semibold hover:text-slate-950 underline decoration-slate-400 inline-flex items-center space-x-1"
                        title={`GitHub Profile: ${ensureHttpUrl(resume.contactInfo.github)}`}
                      >
                        <span>•</span>
                        <Github className="w-3 h-3 text-slate-700" />
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Date & Recipient Details */}
                <div className="mb-6 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">{coverLetter.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <p className="font-bold text-slate-950 mt-3">{coverLetter.recipientName || 'Hiring Team'}</p>
                  <p className="text-slate-600">{coverLetter.recipientTitle || `Hiring Committee for ${jobDescription.jobTitle}`}</p>
                  <p className="font-semibold text-slate-900">{coverLetter.companyName || jobDescription.companyName}</p>
                </div>

                {/* Salutation */}
                <p className="text-xs font-bold text-slate-950 mb-4">
                  {coverLetter.salutation || `Dear Hiring Team at ${jobDescription.companyName},`}
                </p>

                {/* Letter Body */}
                <div className="space-y-4 text-xs sm:text-[13px] text-slate-800 leading-relaxed font-normal">
                  <p>{coverLetter.openingParagraph}</p>
                  {coverLetter.bodyParagraphs?.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  <p>{coverLetter.closingParagraph}</p>
                </div>

                {/* Sign-Off */}
                <div className="mt-8 text-xs text-slate-800 space-y-1">
                  <p className="font-medium">{coverLetter.signOff || 'Sincerely,'}</p>
                  <p className="font-bold text-slate-950 text-sm mt-3">{coverLetter.senderName || resume.contactInfo.fullName}</p>
                </div>
              </div>
            </div>
          ) : (
            /* In-line Edit Form */
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 font-heading pb-3 border-b border-slate-100">
                Edit Cover Letter Paragraphs
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Hook & Salutation</label>
                <input
                  type="text"
                  value={coverLetter.salutation}
                  onChange={(e) => onUpdateCoverLetter({ ...coverLetter, salutation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 mb-2 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
                <textarea
                  rows={3}
                  value={coverLetter.openingParagraph}
                  onChange={(e) => onUpdateCoverLetter({ ...coverLetter, openingParagraph: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              {coverLetter.bodyParagraphs.map((p, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Body Achievement Paragraph {idx + 1}
                  </label>
                  <textarea
                    rows={4}
                    value={p}
                    onChange={(e) => handleParagraphChange(idx, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Closing & Call to Action</label>
                <textarea
                  rows={3}
                  value={coverLetter.closingParagraph}
                  onChange={(e) => onUpdateCoverLetter({ ...coverLetter, closingParagraph: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: AI Regeneration & Tuning Controls */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900 font-heading">AI Tone Tuner</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Letter Tone & Style</label>
              <div className="space-y-2">
                {[
                  'Professional & Persuasive',
                  'Executive Leadership',
                  'Enthusiastic & High Energy',
                  'Technical & Direct',
                ].map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                    className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      selectedTone === tone
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Focus / Addendum Instructions
              </label>
              <textarea
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Highlight my AWS architecture experience and readiness for remote work..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {isRegenerating ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Regenerating Tailored Letter...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Regenerate with AI</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-xs text-slate-600 space-y-2.5">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">Best Practice Checklist</h4>
            <p>• Aligned directly with <strong className="text-slate-900">{jobDescription.jobTitle}</strong></p>
            <p>• Highlights 2-3 highest impact metrics matching target JD keywords</p>
            <p>• Concise 1-page length optimal for recruiter scan times (&lt; 400 words)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
