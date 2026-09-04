import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  BorderStyle,
  AlignmentType,
  LevelFormat,
} from 'docx';
import { ResumeData, CoverLetterData } from '../types';

/**
 * Ensures a valid URL with https:// protocol
 */
const ensureHttpUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/**
 * Creates and downloads a clean, highly structured, ATS-compliant Microsoft Word (.docx) document
 * with native hyperlinks, bullet points, headers, and metadata.
 */
export async function exportResumeToDocx(resume: ResumeData, filename: string): Promise<void> {
  const { contactInfo, targetJobTitle, careerSummary, skillCategories, experiences, education, certifications, projects } = resume;

  const docChildren: Paragraph[] = [];

  // 1. Candidate Full Name
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 60, before: 0 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (contactInfo.fullName || 'Candidate Name').toUpperCase(),
          bold: true,
          size: 32, // 16pt (half-points in docx)
          color: '0F172A', // Slate 900
          font: 'Calibri',
        }),
      ],
    })
  );

  // 2. Target Job Title (if provided)
  if (targetJobTitle) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100, before: 0 },
        children: [
          new TextRun({
            text: targetJobTitle,
            bold: true,
            size: 24, // 12pt
            color: '4338CA', // Indigo 700
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // 3. Contact Info Line with Clickable Hyperlinks
  const contactRuns: (TextRun | ExternalHyperlink)[] = [];

  if (contactInfo.email) {
    contactRuns.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: contactInfo.email,
            color: '4338CA',
            underline: {},
            font: 'Calibri',
            size: 20, // 10pt
          }),
        ],
        link: `mailto:${contactInfo.email}`,
      })
    );
  }

  if (contactInfo.phone) {
    if (contactRuns.length > 0) {
      contactRuns.push(new TextRun({ text: '  |  ', color: '64748B', font: 'Calibri', size: 20 }));
    }
    contactRuns.push(
      new TextRun({
        text: contactInfo.phone,
        color: '334155',
        font: 'Calibri',
        size: 20,
      })
    );
  }

  if (contactInfo.location) {
    if (contactRuns.length > 0) {
      contactRuns.push(new TextRun({ text: '  |  ', color: '64748B', font: 'Calibri', size: 20 }));
    }
    contactRuns.push(
      new TextRun({
        text: contactInfo.location,
        color: '334155',
        font: 'Calibri',
        size: 20,
      })
    );
  }

  if (contactInfo.portfolio) {
    if (contactRuns.length > 0) {
      contactRuns.push(new TextRun({ text: '  |  ', color: '64748B', font: 'Calibri', size: 20 }));
    }
    contactRuns.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: 'Portfolio',
            color: '4338CA',
            underline: {},
            bold: true,
            font: 'Calibri',
            size: 20,
          }),
        ],
        link: ensureHttpUrl(contactInfo.portfolio),
      })
    );
  }

  if (contactInfo.linkedin) {
    if (contactRuns.length > 0) {
      contactRuns.push(new TextRun({ text: '  |  ', color: '64748B', font: 'Calibri', size: 20 }));
    }
    contactRuns.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: 'LinkedIn',
            color: '1D4ED8',
            underline: {},
            bold: true,
            font: 'Calibri',
            size: 20,
          }),
        ],
        link: ensureHttpUrl(contactInfo.linkedin),
      })
    );
  }

  if (contactInfo.github) {
    if (contactRuns.length > 0) {
      contactRuns.push(new TextRun({ text: '  |  ', color: '64748B', font: 'Calibri', size: 20 }));
    }
    contactRuns.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: 'GitHub',
            color: '1E293B',
            underline: {},
            bold: true,
            font: 'Calibri',
            size: 20,
          }),
        ],
        link: ensureHttpUrl(contactInfo.github),
      })
    );
  }

  if (contactRuns.length > 0) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, before: 0 },
        children: contactRuns,
      })
    );
  }

  // Helper for Section Headings
  const createSectionHeading = (title: string): Paragraph => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 80 },
      border: {
        bottom: {
          color: 'CBD5E1',
          space: 2,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 22, // 11pt
          color: '1E293B',
          font: 'Calibri',
        }),
      ],
    });
  };

  // 4. Professional Summary
  if (careerSummary) {
    docChildren.push(createSectionHeading('Professional Summary'));
    docChildren.push(
      new Paragraph({
        spacing: { after: 140, line: 276 },
        children: [
          new TextRun({
            text: careerSummary,
            size: 21, // 10.5pt
            color: '334155',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // 5. Core Competencies & Skills
  if (skillCategories && skillCategories.length > 0) {
    docChildren.push(createSectionHeading('Core Competencies & Technical Skills'));
    skillCategories.forEach((cat) => {
      docChildren.push(
        new Paragraph({
          spacing: { after: 60, line: 260 },
          children: [
            new TextRun({
              text: `${cat.category}: `,
              bold: true,
              size: 20,
              color: '0F172A',
              font: 'Calibri',
            }),
            new TextRun({
              text: cat.skills.join('  •  '),
              size: 20,
              color: '334155',
              font: 'Calibri',
            }),
          ],
        })
      );
    });
  }

  // 6. Professional Experience
  if (experiences && experiences.length > 0) {
    docChildren.push(createSectionHeading('Professional Experience'));
    experiences.forEach((exp) => {
      const dates = `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`;

      // Title & Dates Header Line
      docChildren.push(
        new Paragraph({
          spacing: { before: 140, after: 40 },
          children: [
            new TextRun({
              text: exp.title,
              bold: true,
              size: 22, // 11pt
              color: '0F172A',
              font: 'Calibri',
            }),
            new TextRun({
              text: `  |  ${exp.company}`,
              bold: true,
              size: 21,
              color: '4338CA',
              font: 'Calibri',
            }),
            new TextRun({
              text: ` (${exp.location || 'Remote'})`,
              size: 20,
              color: '64748B',
              font: 'Calibri',
            }),
            new TextRun({
              text: `\t${dates}`,
              bold: true,
              size: 20,
              color: '475569',
              font: 'Calibri',
            }),
          ],
        })
      );

      // Bullets
      exp.bullets.forEach((b) => {
        const bulletText = b.optimizedText || b.originalText;
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 50, line: 260 },
            children: [
              new TextRun({
                text: bulletText,
                size: 20,
                color: '334155',
                font: 'Calibri',
              }),
            ],
          })
        );
      });
    });
  }

  // 7. Key Projects (if present)
  if (projects && projects.length > 0) {
    docChildren.push(createSectionHeading('Key Projects'));
    projects.forEach((proj) => {
      const projChildren: (TextRun | ExternalHyperlink)[] = [
        new TextRun({
          text: proj.name,
          bold: true,
          size: 21,
          color: '0F172A',
          font: 'Calibri',
        }),
      ];

      if (proj.role) {
        projChildren.push(
          new TextRun({
            text: `  (${proj.role})`,
            size: 20,
            color: '64748B',
            font: 'Calibri',
          })
        );
      }

      if (proj.link) {
        projChildren.push(new TextRun({ text: '  •  ', color: '94A3B8', size: 20, font: 'Calibri' }));
        projChildren.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: 'Project Link',
                color: '4338CA',
                underline: {},
                bold: true,
                size: 20,
                font: 'Calibri',
              }),
            ],
            link: ensureHttpUrl(proj.link),
          })
        );
      }

      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: projChildren,
        })
      );

      if (proj.description) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 40, line: 260 },
            children: [
              new TextRun({
                text: proj.description,
                size: 20,
                color: '334155',
                font: 'Calibri',
              }),
            ],
          })
        );
      }

      if (proj.technologies && proj.technologies.length > 0) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 50, line: 260 },
            children: [
              new TextRun({
                text: 'Technologies: ',
                bold: true,
                size: 19,
                color: '0F172A',
                font: 'Calibri',
              }),
              new TextRun({
                text: proj.technologies.join(', '),
                size: 19,
                color: '475569',
                font: 'Calibri',
              }),
            ],
          })
        );
      }

      if (proj.bullets && proj.bullets.length > 0) {
        proj.bullets.forEach((b) => {
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40, line: 260 },
              children: [
                new TextRun({
                  text: b,
                  size: 20,
                  color: '334155',
                  font: 'Calibri',
                }),
              ],
            })
          );
        });
      }
    });
  }

  // 8. Education
  if (education && education.length > 0) {
    docChildren.push(createSectionHeading('Education'));
    education.forEach((edu) => {
      docChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 21,
              color: '0F172A',
              font: 'Calibri',
            }),
            new TextRun({
              text: `  |  ${edu.institution}`,
              size: 20,
              color: '4338CA',
              font: 'Calibri',
            }),
            new TextRun({
              text: `\t${edu.graduationYear || ''}${edu.honorsOrGpa ? ` • ${edu.honorsOrGpa}` : ''}`,
              bold: true,
              size: 20,
              color: '475569',
              font: 'Calibri',
            }),
          ],
        })
      );
    });
  }

  // 9. Certifications
  if (certifications && certifications.length > 0) {
    docChildren.push(createSectionHeading('Certifications'));
    certifications.forEach((cert) => {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40, line: 260 },
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 20,
              color: '0F172A',
              font: 'Calibri',
            }),
            new TextRun({
              text: ` — ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}`,
              size: 20,
              color: '475569',
              font: 'Calibri',
            }),
          ],
        })
      );
    });
  }

  // Create Document with standard 1-inch margins (1440 twips / dxa = 1 inch)
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'default-bullet-numbering',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 400, hanging: 240 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1000,
              right: 1000,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates and downloads a formatted Cover Letter in Microsoft Word (.docx) format
 */
export async function exportCoverLetterToDocx(
  coverLetter: CoverLetterData,
  resume: ResumeData,
  filename: string
): Promise<void> {
  const docChildren: Paragraph[] = [];

  // Sender Name Header
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 40, before: 0 },
      children: [
        new TextRun({
          text: (resume.contactInfo.fullName || 'Candidate Name').toUpperCase(),
          bold: true,
          size: 28,
          color: '0F172A',
          font: 'Calibri',
        }),
      ],
    })
  );

  // Sender Contact Line
  const contactParts: string[] = [
    resume.contactInfo.email,
    resume.contactInfo.phone,
    resume.contactInfo.location,
  ].filter(Boolean) as string[];

  if (contactParts.length > 0) {
    docChildren.push(
      new Paragraph({
        spacing: { after: 200, before: 0 },
        border: {
          bottom: {
            color: 'CBD5E1',
            space: 2,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: 20,
            color: '64748B',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // Date
  docChildren.push(
    new Paragraph({
      spacing: { before: 160, after: 160 },
      children: [
        new TextRun({
          text: coverLetter.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          size: 21,
          color: '334155',
          font: 'Calibri',
        }),
      ],
    })
  );

  // Recipient Block
  if (coverLetter.recipientName) {
    docChildren.push(
      new Paragraph({
        spacing: { after: 30 },
        children: [
          new TextRun({
            text: coverLetter.recipientName,
            bold: true,
            size: 21,
            color: '0F172A',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  if (coverLetter.recipientTitle) {
    docChildren.push(
      new Paragraph({
        spacing: { after: 30 },
        children: [
          new TextRun({
            text: coverLetter.recipientTitle,
            size: 20,
            color: '475569',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  if (coverLetter.companyName) {
    docChildren.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: coverLetter.companyName,
            bold: true,
            size: 21,
            color: '0F172A',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // Salutation
  docChildren.push(
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: coverLetter.salutation || 'Dear Hiring Team,',
          bold: true,
          size: 21,
          color: '0F172A',
          font: 'Calibri',
        }),
      ],
    })
  );

  // Opening Paragraph
  if (coverLetter.openingParagraph) {
    docChildren.push(
      new Paragraph({
        spacing: { after: 140, line: 280 },
        children: [
          new TextRun({
            text: coverLetter.openingParagraph,
            size: 21,
            color: '334155',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // Body Paragraphs
  if (coverLetter.bodyParagraphs && coverLetter.bodyParagraphs.length > 0) {
    coverLetter.bodyParagraphs.forEach((p) => {
      docChildren.push(
        new Paragraph({
          spacing: { after: 140, line: 280 },
          children: [
            new TextRun({
              text: p,
              size: 21,
              color: '334155',
              font: 'Calibri',
            }),
          ],
        })
      );
    });
  }

  // Closing Paragraph
  if (coverLetter.closingParagraph) {
    docChildren.push(
      new Paragraph({
        spacing: { after: 180, line: 280 },
        children: [
          new TextRun({
            text: coverLetter.closingParagraph,
            size: 21,
            color: '334155',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // Sign off & Name
  docChildren.push(
    new Paragraph({
      spacing: { before: 120, after: 60 },
      children: [
        new TextRun({
          text: coverLetter.signOff || 'Sincerely,',
          size: 21,
          color: '334155',
          font: 'Calibri',
        }),
      ],
    })
  );

  docChildren.push(
    new Paragraph({
      spacing: { after: 0 },
      children: [
        new TextRun({
          text: coverLetter.senderName || resume.contactInfo.fullName,
          bold: true,
          size: 22,
          color: '0F172A',
          font: 'Calibri',
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1200,
              bottom: 1200,
              left: 1200,
              right: 1200,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
