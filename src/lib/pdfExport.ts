import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { ResumeData, CoverLetterData } from '../types';
export { exportResumeToDocx, exportCoverLetterToDocx } from './docxExport';

export async function exportElementToPdf(elementId: string, filename: string): Promise<void> {
  // Resilient element lookup: poll up to 5 attempts (total 1000ms) to ensure element is mounted
  let element = document.getElementById(elementId);
  if (!element) {
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      element = document.getElementById(elementId);
      if (element) break;
    }
  }

  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Pre-calculate positions of all clickable <a> hyperlinks before image rendering
  const elementRect = element.getBoundingClientRect();
  const linkElements = Array.from(element.querySelectorAll('a[href]')) as HTMLAnchorElement[];

  const linkAnnotations = linkElements
    .map((a) => {
      const href = a.getAttribute('href') || a.href;
      if (!href || href === '#' || href.startsWith('javascript:')) return null;

      // Ensure proper URL protocol for links
      let fullUrl = href;
      if (
        !fullUrl.startsWith('http://') &&
        !fullUrl.startsWith('https://') &&
        !fullUrl.startsWith('mailto:') &&
        !fullUrl.startsWith('tel:')
      ) {
        fullUrl = `https://${fullUrl}`;
      }

      const rect = a.getBoundingClientRect();
      const relLeft = rect.left - elementRect.left;
      const relTop = rect.top - elementRect.top;
      const relWidth = rect.width;
      const relHeight = rect.height;

      return {
        url: fullUrl,
        relLeft,
        relTop,
        relWidth,
        relHeight,
      };
    })
    .filter(Boolean) as Array<{
      url: string;
      relLeft: number;
      relTop: number;
      relWidth: number;
      relHeight: number;
    }>;

  // Generate high-resolution PNG data URL using browser SVG foreignObject rendering
  const imgData = await toPng(element, {
    quality: 0.98,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  });

  const img = new Image();
  img.src = imgData;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(new Error('Failed to load captured image for PDF generation: ' + String(e)));
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const containerWidth = elementRect.width;
  const containerHeight = elementRect.height;
  const scale = img.naturalWidth / containerWidth;

  // Standard A4 aspect ratio in DOM pixel terms
  const a4PageHeightPx = containerWidth * (pdfHeight / pdfWidth);

  // If the document fits on 1 page comfortably
  if (containerHeight <= a4PageHeightPx + 15) {
    const singleHeightMm = (containerHeight / containerWidth) * pdfWidth;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(singleHeightMm, pdfHeight), undefined, 'FAST');

    // Add hyperlinks
    linkAnnotations.forEach((link) => {
      const scaleMm = pdfWidth / containerWidth;
      const xMm = link.relLeft * scaleMm;
      const yMm = link.relTop * scaleMm;
      const wMm = Math.max(link.relWidth * scaleMm, 3);
      const hMm = Math.max(link.relHeight * scaleMm, 3);
      pdf.link(xMm, yMm, wMm, hMm, { url: link.url });
    });

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return;
  }

  // --- SMART MULTI-PAGE SLICING ALGORITHM ---
  // Query all block elements to find safe, natural break boundaries (avoiding cutting text mid-line or stranding headers)
  const queryCandidates = Array.from(
    element.querySelectorAll('header, section, section > div > div, li, p, [data-pdf-block="true"]')
  ) as HTMLElement[];

  const blockBounds = queryCandidates
    .map((b) => {
      const r = b.getBoundingClientRect();
      const isHeaderOrHeading =
        b.tagName === 'HEADER' ||
        b.tagName === 'H2' ||
        b.tagName === 'H3' ||
        b.classList.contains('section-heading');
      return {
        top: r.top - elementRect.top,
        bottom: r.bottom - elementRect.top,
        height: r.height,
        isHeaderOrHeading,
      };
    })
    .filter((b) => b.height > 4)
    .sort((a, b) => a.top - b.top);

  interface PageSlice {
    top: number;
    bottom: number;
  }

  const slices: PageSlice[] = [];
  let currentTop = 0;

  while (currentTop < containerHeight) {
    const targetBottom = currentTop + a4PageHeightPx;

    if (targetBottom >= containerHeight - 30) {
      // Reached the final page
      slices.push({ top: currentTop, bottom: containerHeight });
      break;
    }

    let bestCut = targetBottom;
    let foundSafeCut = false;

    // 1. Check if any block spans across targetBottom
    const intersectingBlock = blockBounds.find(
      (b) => b.top < targetBottom && b.bottom > targetBottom && b.top > currentTop + a4PageHeightPx * 0.4
    );

    if (intersectingBlock) {
      // If the intersecting block is a header/heading, cut cleanly BEFORE it
      bestCut = Math.max(currentTop + 100, intersectingBlock.top - 4);
      foundSafeCut = true;
    } else {
      // 2. Find the lowest block that finishes cleanly before targetBottom
      const validBlocks = blockBounds.filter(
        (b) => b.bottom <= targetBottom && b.bottom > currentTop + a4PageHeightPx * 0.5
      );

      if (validBlocks.length > 0) {
        const lastBlock = validBlocks[validBlocks.length - 1];

        // Check if there is an orphaned section header immediately after lastBlock
        const nextHeader = blockBounds.find(
          (b) => b.top >= lastBlock.bottom && b.top < targetBottom && b.isHeaderOrHeading
        );

        if (nextHeader) {
          bestCut = Math.max(currentTop + 100, nextHeader.top - 4);
        } else {
          bestCut = lastBlock.bottom + 4;
        }
        foundSafeCut = true;
      }
    }

    if (!foundSafeCut || bestCut <= currentTop + 80) {
      bestCut = targetBottom - 20;
    }

    slices.push({ top: currentTop, bottom: bestCut });
    currentTop = bestCut;
  }

  // Render each computed slice onto its own canvas and add to PDF
  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i];
    const sliceHeightDom = slice.bottom - slice.top;

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = img.naturalWidth;
    sliceCanvas.height = Math.max(Math.round(sliceHeightDom * scale), 1);
    const ctx = sliceCanvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(
        img,
        0,
        Math.round(slice.top * scale),
        img.naturalWidth,
        Math.round(sliceHeightDom * scale),
        0,
        0,
        sliceCanvas.width,
        sliceCanvas.height
      );
    }

    const sliceImgData = sliceCanvas.toDataURL('image/png');
    if (i > 0) {
      pdf.addPage();
    }

    const sliceHeightMm = (sliceHeightDom / containerWidth) * pdfWidth;
    pdf.addImage(sliceImgData, 'PNG', 0, 0, pdfWidth, sliceHeightMm, undefined, 'FAST');
  }

  // Map hyperlinks to the exact page and coordinates
  linkAnnotations.forEach((link) => {
    const pageIndex = slices.findIndex((s) => link.relTop >= s.top && link.relTop < s.bottom);
    if (pageIndex !== -1) {
      const slice = slices[pageIndex];
      const yOnPageDom = link.relTop - slice.top;
      const scaleMm = pdfWidth / containerWidth;

      const xMm = link.relLeft * scaleMm;
      const yMm = yOnPageDom * scaleMm;
      const wMm = Math.max(link.relWidth * scaleMm, 3);
      const hMm = Math.max(link.relHeight * scaleMm, 3);

      pdf.setPage(pageIndex + 1);
      pdf.link(xMm, yMm, wMm, hMm, { url: link.url });
    }
  });

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

export function exportResumeToPlainText(resume: ResumeData): string {
  const lines: string[] = [];

  // Contact
  lines.push(resume.contactInfo.fullName.toUpperCase());
  const contacts = [
    resume.contactInfo.email,
    resume.contactInfo.phone,
    resume.contactInfo.location,
    resume.contactInfo.portfolio ? `Portfolio: ${resume.contactInfo.portfolio}` : null,
    resume.contactInfo.linkedin ? `LinkedIn: ${resume.contactInfo.linkedin}` : null,
    resume.contactInfo.github ? `GitHub: ${resume.contactInfo.github}` : null,
  ].filter(Boolean);
  lines.push(contacts.join(' | '));
  lines.push('');

  // Target Role
  if (resume.targetJobTitle) {
    lines.push(`TARGET ROLE: ${resume.targetJobTitle}`);
    lines.push('');
  }

  // Summary
  lines.push('PROFESSIONAL SUMMARY');
  lines.push('----------------------------------------');
  lines.push(resume.careerSummary);
  lines.push('');

  // Skills
  if (resume.skillCategories && resume.skillCategories.length > 0) {
    lines.push('CORE COMPETENCIES & SKILLS');
    lines.push('----------------------------------------');
    resume.skillCategories.forEach(cat => {
      lines.push(`${cat.category}: ${cat.skills.join(', ')}`);
    });
    lines.push('');
  }

  // Experiences
  if (resume.experiences && resume.experiences.length > 0) {
    lines.push('PROFESSIONAL EXPERIENCE');
    lines.push('----------------------------------------');
    resume.experiences.forEach(exp => {
      const dates = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
      lines.push(`${exp.title} | ${exp.company} ${exp.location ? `(${exp.location})` : ''} | ${dates}`);
      exp.bullets.forEach(b => {
        lines.push(`• ${b.optimizedText || b.originalText}`);
      });
      lines.push('');
    });
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    lines.push('EDUCATION');
    lines.push('----------------------------------------');
    resume.education.forEach(edu => {
      lines.push(`${edu.degree} - ${edu.institution} (${edu.graduationYear}) ${edu.honorsOrGpa ? `| ${edu.honorsOrGpa}` : ''}`);
    });
    lines.push('');
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    lines.push('CERTIFICATIONS');
    lines.push('----------------------------------------');
    resume.certifications.forEach(cert => {
      lines.push(`• ${cert.name} - ${cert.issuer} ${cert.date ? `(${cert.date})` : ''}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

export function exportCoverLetterToPlainText(cl: CoverLetterData): string {
  const lines: string[] = [];
  lines.push(cl.date);
  lines.push('');
  if (cl.recipientName) lines.push(cl.recipientName);
  if (cl.recipientTitle) lines.push(cl.recipientTitle);
  lines.push(cl.companyName);
  lines.push('');
  lines.push(cl.salutation);
  lines.push('');
  lines.push(cl.openingParagraph);
  lines.push('');
  cl.bodyParagraphs.forEach(p => {
    lines.push(p);
    lines.push('');
  });
  lines.push(cl.closingParagraph);
  lines.push('');
  lines.push(cl.signOff);
  lines.push(cl.senderName);
  return lines.join('\n');
}

export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
