import React, { useState } from 'react';
import {
  Download,
  Copy,
  Printer,
  FileText,
  Sparkles,
  Edit3,
  Check,
  RotateCw,
  Plus,
  Trash2,
  Sliders,
  Palette,
  Eye,
  GitCompare,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  Link2
} from 'lucide-react';
import { ResumeData, TemplateStyle, AccentColor, JobDescriptionInput, ExperienceItem, ExperienceBullet, ContactInfo } from '../types';
import { ResumeDocument } from './ResumeDocument';
import { exportElementToPdf, exportResumeToPlainText, downloadTextFile, exportResumeToDocx } from '../lib/pdfExport';
import { safeFetchJson } from '../lib/api';
import confetti from 'canvas-confetti';

interface ResumeEditorProps {
  resume: ResumeData;
  originalResume: ResumeData;
  jobDescription: JobDescriptionInput;
  onUpdateResume: (updated: ResumeData) => void;
  onGoToCoverLetter: () => void;
  onGoToAnalysis: () => void;
}

const ensureHttpUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resume,
  originalResume,
  jobDescription,
  onUpdateResume,
  onGoToCoverLetter,
  onGoToAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [templateStyle, setTemplateStyle] = useState<TemplateStyle>('modern');
  const [accentColor, setAccentColor] = useState<AccentColor>('indigo');
  const [isDiffMode, setIsDiffMode] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Bullet AI rewrite state
  const [rewritingBulletId, setRewritingBulletId] = useState<string | null>(null);
  const [customDirective, setCustomDirective] = useState<string>('metrics');
  const [activeExpIndex, setActiveExpIndex] = useState<number>(0);

  // Handle PDF Export
  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      // If user is currently in editing mode, switch to live paper preview to mount the printable element
      if (activeTab !== 'preview') {
        setActiveTab('preview');
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      const filename = `${resume.contactInfo.fullName.replace(/\s+/g, '_')}_Tailored_CV.pdf`;
      await exportElementToPdf('resume-paper-document', filename);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Unable to generate PDF. You can also print to PDF or export as plain text.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle DOCX Export
  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      const filename = `${resume.contactInfo.fullName.replace(/\s+/g, '_')}_Tailored_CV.docx`;
      await exportResumeToDocx(resume, filename);
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

  // Handle Copy Plain Text
  const handleCopyPlainText = () => {
    const text = exportResumeToPlainText(resume);
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Handle Download Plain Text
  const handleDownloadTxt = () => {
    const text = exportResumeToPlainText(resume);
    const filename = `${resume.contactInfo.fullName.replace(/\s+/g, '_')}_Tailored_CV.txt`;
    downloadTextFile(text, filename);
  };

  // Direct In-line editing handlers
  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    onUpdateResume({
      ...resume,
      contactInfo: {
        ...resume.contactInfo,
        [field]: value,
      },
    });
  };

  const handleSummaryChange = (newSummary: string) => {
    onUpdateResume({
      ...resume,
      careerSummary: newSummary,
    });
  };

  const handleJobTitleChange = (newTitle: string) => {
    onUpdateResume({
      ...resume,
      targetJobTitle: newTitle,
    });
  };

  const handleBulletChange = (expId: string, bulletId: string, newText: string) => {
    const updatedExperiences = resume.experiences.map((exp) => {
      if (exp.id === expId) {
        return {
          ...exp,
          bullets: exp.bullets.map((b) => (b.id === bulletId ? { ...b, optimizedText: newText } : b)),
        };
      }
      return exp;
    });
    onUpdateResume({ ...resume, experiences: updatedExperiences });
  };

  const handleAddBullet = (expId: string) => {
    const updatedExperiences = resume.experiences.map((exp) => {
      if (exp.id === expId) {
        const newBullet: ExperienceBullet = {
          id: `b-${Date.now()}`,
          optimizedText: 'Spearheaded key initiatives delivering measurable performance improvements and collaborating across cross-functional teams.',
          actionVerb: 'Spearheaded',
          keywordsIncluded: [],
        };
        return {
          ...exp,
          bullets: [...exp.bullets, newBullet],
        };
      }
      return exp;
    });
    onUpdateResume({ ...resume, experiences: updatedExperiences });
  };

  const handleDeleteBullet = (expId: string, bulletId: string) => {
    const updatedExperiences = resume.experiences.map((exp) => {
      if (exp.id === expId) {
        return {
          ...exp,
          bullets: exp.bullets.filter((b) => b.id !== bulletId),
        };
      }
      return exp;
    });
    onUpdateResume({ ...resume, experiences: updatedExperiences });
  };

  // AI Bullet Rewriter call
  const handleAiRewriteBullet = async (expId: string, bulletId: string, currentText: string, directive: string) => {
    setRewritingBulletId(bulletId);
    try {
      const data = await safeFetchJson<{ success: boolean; bullet?: { optimizedText: string } }>('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletText: currentText,
          jobDescription: `${jobDescription.jobTitle} at ${jobDescription.companyName}: ${jobDescription.rawText}`,
          directive,
        }),
      });
      if (data?.success && data?.bullet) {
        handleBulletChange(expId, bulletId, data.bullet.optimizedText);
      }
    } catch (err) {
      console.error('Error rewriting bullet:', err);
    } finally {
      setRewritingBulletId(null);
    }
  };

  // Add/Remove Skills
  const handleAddSkill = (categoryIndex: number, skillName: string) => {
    if (!skillName.trim()) return;
    const updated = [...resume.skillCategories];
    if (!updated[categoryIndex].skills.includes(skillName.trim())) {
      updated[categoryIndex].skills.push(skillName.trim());
      onUpdateResume({ ...resume, skillCategories: updated });
    }
  };

  const handleRemoveSkill = (categoryIndex: number, skillName: string) => {
    const updated = [...resume.skillCategories];
    updated[categoryIndex].skills = updated[categoryIndex].skills.filter((s) => s !== skillName);
    onUpdateResume({ ...resume, skillCategories: updated });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        {/* Left: View Mode Toggle & Diff */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'preview' ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Paper Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'edit' ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>In-Line Editor</span>
            </button>
          </div>

          <button
            onClick={() => setIsDiffMode(!isDiffMode)}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              isDiffMode
                ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isDiffMode ? 'Showing Original Diffs' : 'Compare Original'}</span>
          </button>
        </div>

        {/* Middle: Template & Accent Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">Style:</span>
            <select
              value={templateStyle}
              onChange={(e) => setTemplateStyle(e.target.value as TemplateStyle)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="modern" className="bg-white text-slate-900">Modern ATS</option>
              <option value="executive" className="bg-white text-slate-900">Executive Classic</option>
              <option value="technical" className="bg-white text-slate-900">Technical Clean</option>
              <option value="compact" className="bg-white text-slate-900">Compact Grid</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Palette className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex items-center space-x-1.5">
              {(['indigo', 'blue', 'slate', 'emerald', 'rose', 'amber'] as AccentColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    accentColor === c ? 'scale-125 ring-2 ring-indigo-500/50' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor:
                      c === 'indigo'
                        ? '#4f46e5'
                        : c === 'blue'
                        ? '#2563eb'
                        : c === 'slate'
                        ? '#334155'
                        : c === 'emerald'
                        ? '#059669'
                        : c === 'rose'
                        ? '#e11d48'
                        : '#d97706',
                  }}
                  title={`Accent: ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Export & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyPlainText}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-all cursor-pointer"
            title="Copy ATS Plain Text format to paste into Job Application forms"
          >
            {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedNotification ? 'Copied ATS Text!' : 'Copy ATS Text'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-all cursor-pointer"
            title="Download Plain Text format"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>.TXT</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            title="Download formatted Microsoft Word (.docx) format with active links"
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
            <span>Download Tailored PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'preview' ? (
        <div className="flex flex-col items-center justify-center p-3 sm:p-8 bg-slate-100/70 rounded-xl border border-slate-200">
          <div className="w-full flex justify-end pb-3 text-xs text-slate-500">
            <span className="flex items-center space-x-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>ATS Standard 1-Inch Margin Format</span>
            </span>
          </div>

          <ResumeDocument
            resume={resume}
            templateStyle={templateStyle}
            accentColor={accentColor}
            isDiffMode={isDiffMode}
          />
        </div>
      ) : (
        /* In-Line Editing Studio */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: Form Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information & Online Hyperlinks */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900 font-heading">Contact Details & Online Hyperlinks</h3>
                </div>
                <span className="text-xs text-indigo-700 font-medium px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                  Interactive Links
                </span>
              </div>

              {/* Name, Email, Phone, Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resume.contactInfo?.fullName || ''}
                    onChange={(e) => handleContactChange('fullName', e.target.value)}
                    placeholder="e.g. Alex Rivers"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      value={resume.contactInfo?.email || ''}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={resume.contactInfo?.phone || ''}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={resume.contactInfo?.location || ''}
                      onChange={(e) => handleContactChange('location', e.target.value)}
                      placeholder="City, State / Remote"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Online Presence & Hyperlinks */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>Online Profiles & Hyperlinks</span>
                  <span className="text-[11px] font-normal text-slate-500">Rendered as clickable links on your CV & export</span>
                </div>

                {/* Portfolio Website Hyperlink */}
                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-1.5 text-xs font-bold text-indigo-950">
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Portfolio Website Link</span>
                    </label>
                    {resume.contactInfo?.portfolio && (
                      <a
                        href={ensureHttpUrl(resume.contactInfo.portfolio)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 shadow-2xs transition-colors"
                        title="Open portfolio website in new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Test Portfolio Link ↗</span>
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={resume.contactInfo?.portfolio || ''}
                      onChange={(e) => handleContactChange('portfolio', e.target.value)}
                      placeholder="e.g. alexrivers.dev or https://myportfolio.com"
                      className="w-full bg-white border border-indigo-200/80 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 shadow-2xs font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-indigo-900/70">
                    Your portfolio link is emphasized with an interactive hyperlink in the document header.
                  </p>
                </div>

                {/* LinkedIn Profile */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                      <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                      <span>LinkedIn Profile Link</span>
                    </label>
                    {resume.contactInfo?.linkedin && (
                      <a
                        href={ensureHttpUrl(resume.contactInfo.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs transition-colors"
                        title="Open LinkedIn in new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Test Profile ↗</span>
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={resume.contactInfo?.linkedin || ''}
                      onChange={(e) => handleContactChange('linkedin', e.target.value)}
                      placeholder="e.g. linkedin.com/in/alexrivers or https://linkedin.com/in/alexrivers"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono"
                    />
                  </div>
                </div>

                {/* GitHub Profile */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                      <Github className="w-3.5 h-3.5 text-slate-800" />
                      <span>GitHub Profile Link (Optional)</span>
                    </label>
                    {resume.contactInfo?.github && (
                      <a
                        href={ensureHttpUrl(resume.contactInfo.github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs transition-colors"
                        title="Open GitHub in new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Test GitHub ↗</span>
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={resume.contactInfo?.github || ''}
                      onChange={(e) => handleContactChange('github', e.target.value)}
                      placeholder="e.g. github.com/alexrivers"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Target Job Title & Summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 font-heading">Target Role & Career Summary</h3>
                <span className="text-xs text-indigo-700 font-medium px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">ATS High-Priority</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role Headline</label>
                <input
                  type="text"
                  value={resume.targetJobTitle || ''}
                  onChange={(e) => handleJobTitleChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tailored Executive Summary
                </label>
                <textarea
                  rows={4}
                  value={resume.careerSummary}
                  onChange={(e) => handleSummaryChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed"
                />
              </div>
            </div>

            {/* Work Experiences & AI Bullet Polish */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 font-heading">Work Experience Bullets</h3>
                <span className="text-xs text-slate-500">STAR Impact & Metrics</span>
              </div>

              {resume.experiences.map((exp) => (
                <div key={exp.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{exp.title}</span>
                      <span className="text-slate-500"> @ {exp.company}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>

                  {/* Bullets List */}
                  <div className="space-y-3">
                    {exp.bullets.map((b) => (
                      <div key={b.id} className="p-3 rounded-lg bg-white border border-slate-200 space-y-2 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <textarea
                            rows={2}
                            value={b.optimizedText}
                            onChange={(e) => handleBulletChange(exp.id, b.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteBullet(exp.id, b.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Delete Bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* AI Quick Polish Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-slate-500">Rewrite with AI:</span>
                            <button
                              type="button"
                              onClick={() => handleAiRewriteBullet(exp.id, b.id, b.optimizedText, 'more metrics & quantifiable data')}
                              disabled={rewritingBulletId === b.id}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors disabled:opacity-50 font-medium"
                            >
                              + Metrics
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAiRewriteBullet(exp.id, b.id, b.optimizedText, 'more technical architecture & depth')}
                              disabled={rewritingBulletId === b.id}
                              className="px-2 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors disabled:opacity-50 font-medium"
                            >
                              + Technical
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAiRewriteBullet(exp.id, b.id, b.optimizedText, 'more executive leadership & ownership')}
                              disabled={rewritingBulletId === b.id}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors disabled:opacity-50 font-medium"
                            >
                              + Leadership
                            </button>
                          </div>

                          {rewritingBulletId === b.id && (
                            <span className="flex items-center space-x-1 text-indigo-600 animate-pulse font-medium">
                              <Sparkles className="w-3 h-3" />
                              <span>Rewriting...</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddBullet(exp.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 font-semibold pt-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Experience Bullet</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills & Categories */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 font-heading">Categorized Skills</h3>
                <span className="text-xs text-slate-500">ATS Keyword Match Matrix</span>
              </div>

              {resume.skillCategories.map((cat, catIdx) => (
                <div key={catIdx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">{cat.category}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-xs font-medium"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(catIdx, skill)}
                          className="text-slate-400 hover:text-rose-600 ml-1 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1 Col: Quick Live Minimap & Next Step */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 font-heading">ATS Optimization Tips</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Keep bullets under 2-3 lines for optimal scanning</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Begin every bullet with a strong action verb (e.g. Architected, Accelerated, Spearheaded)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Include metrics (% revenue, $ volume, latency reduction, team size)</span>
                </li>
              </ul>
            </div>

            {/* Switch to Cover Letter CTA */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-6 text-center space-y-3 shadow-sm">
              <Sparkles className="w-7 h-7 text-indigo-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-900 font-heading">Proceed to Cover Letter</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download your tailored cover letter matching this role & company.
              </p>
              <button
                onClick={onGoToCoverLetter}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Open Cover Letter Studio →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
