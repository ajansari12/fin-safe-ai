
import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';

export interface PDFExportOptions {
  margin: number;
  filename: string;
  image: { type: string; quality: number };
  html2canvas: { scale: number };
  jsPDF: { unit: string; format: string; orientation: string };
}

const defaultPDFOptions: PDFExportOptions = {
  margin: 1,
  filename: 'export.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
};

export const generatePDF = async (element: HTMLElement, options: Partial<PDFExportOptions> = {}) => {
  const finalOptions = { ...defaultPDFOptions, ...options };
  
  try {
    await html2pdf().from(element).set(finalOptions).save();
    return { success: true };
  } catch (error) {
    console.error('PDF generation failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const createHTMLContent = (title: string, content: string, additionalStyles = ''): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        .header {
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          color: #1a202c;
          font-size: 28px;
        }
        .header .subtitle {
          color: #718096;
          margin-top: 8px;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section h2 {
          color: #2d3748;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin: 16px 0;
        }
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          background: #f7fafc;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          margin: 2px;
        }
        .badge-success { background: #c6f6d5; color: #22543d; }
        .badge-warning { background: #fefcbf; color: #744210; }
        .badge-error { background: #fed7d7; color: #742a2a; }
        .badge-info { background: #bee3f8; color: #2a4365; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        th, td {
          border: 1px solid #e2e8f0;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background: #edf2f7;
          font-weight: 600;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #718096;
          font-size: 12px;
        }
        ${additionalStyles}
      </style>
    </head>
    <body>
      ${content}
      <div class="footer">
        <p>Generated on ${format(new Date(), 'PPP')} • Operational Resilience Management System</p>
      </div>
    </body>
    </html>
  `;
};
