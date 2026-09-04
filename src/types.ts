export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ExperienceBullet {
  id: string;
  originalText?: string;
  optimizedText: string;
  actionVerb: string;
  keywordsIncluded: string[];
  metricsIncluded?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  bullets: ExperienceBullet[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  graduationYear: string;
  honorsOrGpa?: string;
  relevantCoursework?: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  link?: string;
  description: string;
  technologies: string[];
  bullets: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface ResumeData {
  contactInfo: ContactInfo;
  targetJobTitle?: string;
  careerSummary: string;
  originalSummary?: string;
  skillCategories: SkillCategory[];
  experiences: ExperienceItem[];
  education: EducationItem[];
  projects?: ProjectItem[];
  certifications?: CertificationItem[];
}

export interface GapAnalysis {
  matchScore: number; // 0 - 100
  originalScore?: number;
  atsPassProbability: 'High' | 'Medium' | 'Low';
  keywordCoveragePercentage: number;
  
  matchedKeywords: string[];
  missingHardSkills: string[];
  missingSoftSkills: string[];
  criticalGaps: string[];
  strengths: string[];
  improvementSuggestions: string[];
  
  quantifiableMetricsScore: number; // 0-100
  actionVerbsScore: number; // 0-100
  formattingAtsCheck: {
    passed: boolean;
    issues: string[];
  };
}

export interface CoverLetterData {
  recipientName?: string;
  recipientTitle?: string;
  companyName: string;
  jobTitle: string;
  date: string;
  salutation: string;
  openingParagraph: string;
  bodyParagraphs: string[];
  closingParagraph: string;
  signOff: string;
  senderName: string;
}

export interface OptimizationResult {
  gapAnalysis: GapAnalysis;
  optimizedResume: ResumeData;
  originalResume: ResumeData;
  coverLetter: CoverLetterData;
}

export interface JobDescriptionInput {
  jobTitle: string;
  companyName: string;
  rawText: string;
  seniorityLevel?: string;
  industry?: string;
}

export type TemplateStyle = 'modern' | 'classic' | 'technical' | 'compact';
export type AccentColor = 'indigo' | 'blue' | 'slate' | 'emerald' | 'rose' | 'amber';
