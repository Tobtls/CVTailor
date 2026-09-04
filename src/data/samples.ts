import { ResumeData, JobDescriptionInput } from '../types';

export interface SampleScenario {
  id: string;
  name: string;
  role: string;
  company: string;
  jobDescription: JobDescriptionInput;
  resume: ResumeData;
  rawResumeText: string;
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'software-engineer',
    name: 'Full Stack Engineer -> Senior Cloud & React Lead',
    role: 'Senior Full Stack Software Engineer',
    company: 'Fintech Velocity',
    jobDescription: {
      jobTitle: 'Senior Full Stack Software Engineer (React / Node / AWS)',
      companyName: 'StripeWave Financial',
      seniorityLevel: 'Senior / Lead',
      industry: 'Fintech & Cloud Infrastructure',
      rawText: `Position: Senior Full Stack Software Engineer
Company: StripeWave Financial
Location: Remote (US/Canada/EU)

About the Role:
We are looking for a Senior Full Stack Software Engineer to lead the architecture and scaling of our high-volume payments and ledger platform. You will build resilient microservices, design responsive user interfaces in React/Next.js and TypeScript, and optimize low-latency APIs processing over $20M daily.

Key Responsibilities:
- Architect and develop scalable web applications using React, TypeScript, Node.js, and GraphQL.
- Design cloud-native microservices on AWS (ECS, Lambda, DynamoDB, PostgreSQL) with 99.99% uptime.
- Lead system performance tuning, reducing API latency and improving Core Web Vitals.
- Implement automated CI/CD pipelines, Docker containerization, and Terraform infrastructure-as-code.
- Mentor 4+ junior and mid-level engineers, conduct rigorous code reviews, and drive engineering excellence.
- Partner with Product and Security teams to ensure SOC2 and PCI-DSS compliance.

Requirements & Qualifications:
- 5+ years of production experience with TypeScript, React, and Node.js.
- Strong expertise with SQL (PostgreSQL), distributed caching (Redis), and event streaming (Kafka/RabbitMQ).
- Deep experience in AWS cloud infrastructure and microservices architecture.
- Demonstrated experience driving measurable performance improvements and scaling distributed systems.
- Strong communication skills, technical mentorship, and ownership mindset.`
    },
    resume: {
      contactInfo: {
        fullName: 'Alexander Wright',
        email: 'alex.wright@email.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/alexander-wright',
        github: 'github.com/alexwright-dev',
        portfolio: 'alexwright.dev'
      },
      targetJobTitle: 'Full Stack Developer',
      careerSummary: 'Full Stack Developer with 4+ years of experience working with JavaScript, React, and Node.js. Experienced in building websites, fixing bugs, and working in agile teams.',
      skillCategories: [
        {
          category: 'Frontend',
          skills: ['JavaScript', 'React', 'HTML5', 'CSS3', 'Redux', 'Bootstrap']
        },
        {
          category: 'Backend & Databases',
          skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs']
        },
        {
          category: 'Tools & DevOps',
          skills: ['Git', 'Docker', 'Jest', 'Webpack', 'AWS (Basic)']
        }
      ],
      experiences: [
        {
          id: 'exp-1',
          title: 'Software Developer',
          company: 'Nexus Digital Solutions',
          location: 'San Francisco, CA',
          startDate: '2022-03',
          endDate: 'Present',
          current: true,
          bullets: [
            {
              id: 'b-1',
              originalText: 'Built frontend components in React for client dashboards and integrated them with backend APIs.',
              optimizedText: 'Built frontend components in React for client dashboards and integrated them with backend APIs.',
              actionVerb: 'Built',
              keywordsIncluded: ['React', 'APIs']
            },
            {
              id: 'b-2',
              originalText: 'Worked on database queries and improved page loading times across the application.',
              optimizedText: 'Worked on database queries and improved page loading times across the application.',
              actionVerb: 'Worked',
              keywordsIncluded: ['Database']
            },
            {
              id: 'b-3',
              originalText: 'Participated in code reviews and sprint planning meetings with the product team.',
              optimizedText: 'Participated in code reviews and sprint planning meetings with the product team.',
              actionVerb: 'Participated',
              keywordsIncluded: ['Code reviews', 'Sprint']
            }
          ]
        },
        {
          id: 'exp-2',
          title: 'Junior Web Developer',
          company: 'Apex Interactive',
          location: 'Oakland, CA',
          startDate: '2020-06',
          endDate: '2022-02',
          current: false,
          bullets: [
            {
              id: 'b-4',
              originalText: 'Created responsive web pages using JavaScript and CSS for e-commerce clients.',
              optimizedText: 'Created responsive web pages using JavaScript and CSS for e-commerce clients.',
              actionVerb: 'Created',
              keywordsIncluded: ['JavaScript', 'CSS']
            },
            {
              id: 'b-5',
              originalText: 'Wrote unit tests in Jest to catch bugs before production releases.',
              optimizedText: 'Wrote unit tests in Jest to catch bugs before production releases.',
              actionVerb: 'Wrote',
              keywordsIncluded: ['Jest', 'Unit tests']
            }
          ]
        }
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'B.S. in Computer Science',
          institution: 'University of California, Davis',
          location: 'Davis, CA',
          graduationYear: '2020',
          honorsOrGpa: '3.7 GPA'
        }
      ],
      certifications: [
        {
          id: 'cert-1',
          name: 'AWS Certified Solutions Architect – Associate',
          issuer: 'Amazon Web Services',
          date: '2023'
        }
      ]
    },
    rawResumeText: `Alexander Wright
alex.wright@email.com | +1 (555) 234-5678 | San Francisco, CA
LinkedIn: linkedin.com/in/alexander-wright | GitHub: github.com/alexwright-dev

PROFESSIONAL SUMMARY
Full Stack Developer with 4+ years of experience working with JavaScript, React, and Node.js. Experienced in building websites, fixing bugs, and working in agile teams.

SKILLS
Frontend: JavaScript, React, HTML5, CSS3, Redux, Bootstrap
Backend: Node.js, Express, MongoDB, PostgreSQL, REST APIs
Tools & DevOps: Git, Docker, Jest, Webpack, AWS (Basic)

WORK EXPERIENCE
Software Developer | Nexus Digital Solutions, San Francisco, CA | 2022-Present
- Built frontend components in React for client dashboards and integrated them with backend APIs.
- Worked on database queries and improved page loading times across the application.
- Participated in code reviews and sprint planning meetings with the product team.

Junior Web Developer | Apex Interactive, Oakland, CA | 2020-2022
- Created responsive web pages using JavaScript and CSS for e-commerce clients.
- Wrote unit tests in Jest to catch bugs before production releases.

EDUCATION
B.S. in Computer Science | University of California, Davis (2020)
AWS Certified Solutions Architect – Associate (2023)`
  },
  {
    id: 'product-manager',
    name: 'Associate PM -> Senior Growth Product Manager',
    role: 'Product Manager',
    company: 'SaaS Innovate',
    jobDescription: {
      jobTitle: 'Senior Growth Product Manager (B2B SaaS)',
      companyName: 'CloudScale Technologies',
      seniorityLevel: 'Senior',
      industry: 'Enterprise B2B SaaS',
      rawText: `Job Title: Senior Growth Product Manager
Company: CloudScale Technologies

We are seeking a data-driven Senior Growth Product Manager to own product-led growth (PLG), self-serve conversion funnels, and enterprise user onboarding. You will run rapid experimentation, analyze user behavior in Amplitude and Mixpanel, and partner with Engineering, Design, and GTM teams to increase ARR by 35%+.

Responsibilities:
- Define and execute the growth product roadmap focused on acquisition, activation, and monetization.
- Run continuous A/B tests across onboarding funnels, pricing tiers, and referral loops to lift conversion rates.
- Establish quantitative KPI tracking (LTV/CAC, cohort retention, activation rate, DAU/MAU).
- Conduct qualitative customer interviews and translate user friction points into high-impact PRDs.
- Collaborate closely with cross-functional engineering squads using Agile / Scrum methodologies.

Requirements:
- 4+ years of product management experience in B2B SaaS or PLG products.
- Deep expertise in SQL, Amplitude/Mixpanel, A/B testing frameworks (Optimizely, LaunchDarkly).
- Proven track record of improving free-to-paid conversion and retention metrics.
- Exceptional analytical rigor and stakeholder management skills.`
    },
    resume: {
      contactInfo: {
        fullName: 'Elena Rostova',
        email: 'elena.rostova@pmmail.com',
        phone: '+1 (415) 890-1234',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/elena-rostova'
      },
      targetJobTitle: 'Product Manager',
      careerSummary: 'Product Manager with experience managing SaaS features, sprint cycles, and gathering user feedback. Looking to grow in product management.',
      skillCategories: [
        {
          category: 'Product & Analytics',
          skills: ['Product Roadmapping', 'User Research', 'Google Analytics', 'Jira', 'Confluence']
        },
        {
          category: 'Methodologies',
          skills: ['Agile / Scrum', 'User Stories', 'Sprint Planning', 'Wireframing']
        }
      ],
      experiences: [
        {
          id: 'exp-1',
          title: 'Product Manager',
          company: 'Verve Systems',
          location: 'New York, NY',
          startDate: '2022-01',
          endDate: 'Present',
          current: true,
          bullets: [
            {
              id: 'b-1',
              originalText: 'Managed feature releases for the web application and gathered customer feedback.',
              optimizedText: 'Managed feature releases for the web application and gathered customer feedback.',
              actionVerb: 'Managed',
              keywordsIncluded: ['Releases', 'Feedback']
            },
            {
              id: 'b-2',
              originalText: 'Wrote user stories and PRDs for the engineering team to build new onboarding screens.',
              optimizedText: 'Wrote user stories and PRDs for the engineering team to build new onboarding screens.',
              actionVerb: 'Wrote',
              keywordsIncluded: ['PRDs', 'Onboarding']
            }
          ]
        }
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'B.A. in Economics & Business',
          institution: 'New York University',
          location: 'New York, NY',
          graduationYear: '2021'
        }
      ]
    },
    rawResumeText: `Elena Rostova
elena.rostova@pmmail.com | +1 (415) 890-1234 | New York, NY
LinkedIn: linkedin.com/in/elena-rostova

PROFESSIONAL SUMMARY
Product Manager with experience managing SaaS features, sprint cycles, and gathering user feedback. Looking to grow in product management.

SKILLS
Product & Analytics: Product Roadmapping, User Research, Google Analytics, Jira, Confluence
Methodologies: Agile / Scrum, User Stories, Sprint Planning, Wireframing

WORK EXPERIENCE
Product Manager | Verve Systems, New York, NY | 2022-Present
- Managed feature releases for the web application and gathered customer feedback.
- Wrote user stories and PRDs for the engineering team to build new onboarding screens.

EDUCATION
B.A. in Economics & Business | New York University (2021)`
  }
];
