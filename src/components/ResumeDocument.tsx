import React from 'react';
import { ResumeData, TemplateStyle, AccentColor } from '../types';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink } from 'lucide-react';

interface ResumeDocumentProps {
  resume: ResumeData;
  templateStyle?: TemplateStyle;
  accentColor?: AccentColor;
  isDiffMode?: boolean;
}

const ensureHttpUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
  resume,
  templateStyle = 'modern',
  accentColor = 'indigo',
  isDiffMode = false,
}) => {
  const { contactInfo, targetJobTitle, careerSummary, skillCategories, experiences, education, certifications, projects } = resume;

  // Accent color mappings for clean professional print styling
  const colorMap = {
    indigo: {
      primary: 'text-indigo-900',
      heading: 'text-indigo-950 border-indigo-200',
      tag: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      bullet: 'text-indigo-700',
      line: 'border-indigo-600',
    },
    blue: {
      primary: 'text-blue-900',
      heading: 'text-blue-950 border-blue-200',
      tag: 'bg-blue-50 text-blue-900 border-blue-200',
      bullet: 'text-blue-700',
      line: 'border-blue-600',
    },
    slate: {
      primary: 'text-slate-900',
      heading: 'text-slate-950 border-slate-300',
      tag: 'bg-slate-100 text-slate-900 border-slate-200',
      bullet: 'text-slate-700',
      line: 'border-slate-800',
    },
    emerald: {
      primary: 'text-emerald-900',
      heading: 'text-emerald-950 border-emerald-200',
      tag: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      bullet: 'text-emerald-700',
      line: 'border-emerald-600',
    },
    rose: {
      primary: 'text-rose-900',
      heading: 'text-rose-950 border-rose-200',
      tag: 'bg-rose-50 text-rose-900 border-rose-200',
      bullet: 'text-rose-700',
      line: 'border-rose-600',
    },
    amber: {
      primary: 'text-amber-900',
      heading: 'text-amber-950 border-amber-200',
      tag: 'bg-amber-50 text-amber-900 border-amber-200',
      bullet: 'text-amber-700',
      line: 'border-amber-600',
    },
  }[accentColor] || {
    primary: 'text-indigo-900',
    heading: 'text-indigo-950 border-indigo-200',
    tag: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    bullet: 'text-indigo-700',
    line: 'border-indigo-600',
  };

  return (
    <div
      id="resume-paper-document"
      className="resume-paper bg-white text-slate-900 w-full max-w-[800px] min-h-[1050px] p-8 sm:p-10 mx-auto shadow-md rounded-lg border border-slate-200 font-sans transition-all selection:bg-indigo-100 selection:text-indigo-900"
      style={{
        boxSizing: 'border-box',
      }}
    >
      {/* HEADER: Candidate Name & Contact Info */}
      <header className={`pb-5 mb-5 border-b ${templateStyle === 'executive' ? 'border-b-2 border-slate-900 text-center' : 'border-slate-200'}`}>
        <div className={templateStyle === 'executive' ? 'text-center' : ''}>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight uppercase">
            {contactInfo?.fullName || 'Your Name'}
          </h1>
          {targetJobTitle && (
            <div className={`text-sm font-bold tracking-wide mt-1 uppercase ${colorMap.primary}`}>
              {targetJobTitle}
            </div>
          )}
        </div>

        {/* Contact & Online Presence Links Bar */}
        <div className={`mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 ${templateStyle === 'executive' ? 'justify-center' : ''}`}>
          {contactInfo?.email && (
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center space-x-1 text-slate-700 hover:text-indigo-600 hover:underline transition-colors"
              title={`Send email to ${contactInfo.email}`}
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{contactInfo.email}</span>
            </a>
          )}
          {contactInfo?.phone && (
            <a
              href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center space-x-1 text-slate-700 hover:text-indigo-600 hover:underline transition-colors"
              title={`Call ${contactInfo.phone}`}
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{contactInfo.phone}</span>
            </a>
          )}
          {contactInfo?.location && (
            <span className="flex items-center space-x-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{contactInfo.location}</span>
            </span>
          )}
          {contactInfo?.portfolio && (
            <a
              href={ensureHttpUrl(contactInfo.portfolio)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-indigo-700 font-semibold hover:text-indigo-900 underline decoration-indigo-400 hover:decoration-indigo-700 underline-offset-2 transition-colors group"
              title={`Visit Portfolio Website (${ensureHttpUrl(contactInfo.portfolio)})`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>Portfolio</span>
            </a>
          )}
          {contactInfo?.linkedin && (
            <a
              href={ensureHttpUrl(contactInfo.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-700 font-semibold hover:text-blue-900 underline decoration-blue-400 hover:decoration-blue-700 underline-offset-2 transition-colors group"
              title={`Open LinkedIn Profile (${ensureHttpUrl(contactInfo.linkedin)})`}
            >
              <Linkedin className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>LinkedIn</span>
            </a>
          )}
          {contactInfo?.github && (
            <a
              href={ensureHttpUrl(contactInfo.github)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-slate-800 font-semibold hover:text-slate-950 underline decoration-slate-400 hover:decoration-slate-800 underline-offset-2 transition-colors group"
              title={`Open GitHub Profile (${ensureHttpUrl(contactInfo.github)})`}
            >
              <Github className="w-3.5 h-3.5 text-slate-700 group-hover:scale-110 transition-transform" />
              <span>GitHub</span>
            </a>
          )}
        </div>
      </header>

      {/* SECTION 1: Career Summary */}
      {careerSummary && (
        <section data-pdf-block="true" className="mb-6 break-inside-avoid">
          <h2 className={`text-xs font-extrabold uppercase tracking-wider pb-1 mb-2 border-b ${colorMap.heading}`}>
            Professional Summary
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
            {careerSummary}
          </p>
        </section>
      )}

      {/* SECTION 2: Skills & Competencies */}
      {skillCategories && skillCategories.length > 0 && (
        <section data-pdf-block="true" className="mb-6 break-inside-avoid">
          <h2 className={`text-xs font-extrabold uppercase tracking-wider pb-1 mb-2 border-b ${colorMap.heading}`}>
            Skills & Core Competencies
          </h2>
          <div className="space-y-1.5 text-xs sm:text-[13px]">
            {skillCategories.map((cat, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                <span className="font-bold text-slate-900 min-w-[140px] text-xs">
                  {cat.category}:
                </span>
                <span className="text-slate-700 leading-normal">
                  {cat.skills?.join(' • ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: Professional Experience */}
      {experiences && experiences.length > 0 && (
        <section className="mb-6">
          <h2 data-pdf-block="true" className={`text-xs font-extrabold uppercase tracking-wider pb-1 mb-3 border-b ${colorMap.heading}`}>
            Professional Experience
          </h2>
          <div className="space-y-5">
            {experiences.map((exp) => (
              <div key={exp.id} data-pdf-block="true" className="text-xs sm:text-[13px] break-inside-avoid">
                {/* Role Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-slate-950">
                  <div className="text-sm">
                    <span className="font-extrabold">{exp.title}</span>
                    <span className="font-normal text-slate-600"> — {exp.company}</span>
                    {exp.location && <span className="text-xs font-normal text-slate-500"> ({exp.location})</span>}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5 sm:mt-0">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </div>
                </div>

                {/* Bullets */}
                <ul className="mt-2 space-y-1.5 text-slate-700 list-disc list-outside pl-4">
                  {exp.bullets?.map((b) => (
                    <li key={b.id} data-pdf-block="true" className="leading-relaxed">
                      {isDiffMode && b.originalText && b.originalText !== b.optimizedText ? (
                        <div>
                          <span className="line-through text-slate-400 block text-[11px]">
                            {b.originalText}
                          </span>
                          <span className="text-slate-900 font-medium">
                            {b.optimizedText}
                          </span>
                        </div>
                      ) : (
                        <span>{b.optimizedText || b.originalText}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: Education */}
      {education && education.length > 0 && (
        <section data-pdf-block="true" className="mb-6 break-inside-avoid">
          <h2 className={`text-xs font-extrabold uppercase tracking-wider pb-1 mb-2 border-b ${colorMap.heading}`}>
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} data-pdf-block="true" className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-[13px]">
                <div>
                  <span className="font-bold text-slate-950">{edu.degree}</span>
                  <span className="text-slate-700">, {edu.institution}</span>
                  {edu.honorsOrGpa && <span className="text-slate-500 font-medium text-xs"> — {edu.honorsOrGpa}</span>}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {edu.graduationYear}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: Key Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-6">
          <h2 data-pdf-block="true" className={`text-xs font-extrabold uppercase tracking-wider pb-1 mb-3 border-b ${colorMap.heading}`}>
            Key Projects
          </h2>
          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id} data-pdf-block="true" className="text-xs sm:text-[13px] break-inside-avoid">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-slate-950">
                  <div className="text-sm flex items-center space-x-2">
                    <span className="font-extrabold">{proj.name}</span>
                    {proj.link && (
                      <a
                        href={ensureHttpUrl(proj.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline decoration-indigo-300 inline-flex items-center space-x-1"
                        title={`View ${proj.name}`}
                      >
                        <span>Project Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {proj.role && <span className="text-xs font-semibold text-slate-500">{proj.role}</span>}
                </div>
                {proj.description && <p className="mt-1 text-slate-700 leading-relaxed">{proj.description}</p>}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="mt-1 text-xs text-slate-600">
                    <strong className="text-slate-900">Technologies:</strong> {proj.technologies.join(', ')}
                  </div>
                )}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="mt-1.5 space-y-1 text-slate-700 list-disc list-outside pl-4">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx} data-pdf-block="true">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 6: Certifications */}
      {certifications && certifications.length > 0 && (
        <section data-pdf-block="true" className="mb-4 break-inside-avoid">
          <h2 className={`text-xs font-extrabold uppercase tracking-wider pb-1 mb-2 border-b ${colorMap.heading}`}>
            Certifications & Licenses
          </h2>
          <div className="space-y-1 text-xs sm:text-[13px]">
            {certifications.map((cert) => (
              <div key={cert.id} data-pdf-block="true" className="flex items-baseline justify-between text-slate-700">
                <span>
                  <strong className="text-slate-950">{cert.name}</strong> – {cert.issuer}
                </span>
                {cert.date && <span className="text-xs text-slate-500">{cert.date}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
