
import { generatePDF, createHTMLContent } from './pdf-export-service';
import { Incident, IncidentResponse } from './incident-service';
import { format } from 'date-fns';

export const generateIncidentReportPDF = async (
  incident: Incident,
  responses: IncidentResponse[] = []
) => {
  const getSeverityBadge = (severity: string) => {
    const badgeClass = severity === 'critical' || severity === 'high' ? 'badge-error' : 
                      severity === 'medium' ? 'badge-warning' : 'badge-info';
    return `<span class="badge ${badgeClass}">${severity.toUpperCase()}</span>`;
  };

  const getStatusBadge = (status: string) => {
    const badgeClass = status === 'resolved' || status === 'closed' ? 'badge-success' : 
                      status === 'in_progress' ? 'badge-warning' : 'badge-error';
    return `<span class="badge ${badgeClass}">${status.replace('_', ' ').toUpperCase()}</span>`;
  };

  const responsesTable = responses.length > 0 ? `
    <div class="section">
      <h2>Incident Timeline</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Response By</th>
            <th>Content</th>
          </tr>
        </thead>
        <tbody>
          ${responses.map(response => `
            <tr>
              <td>${format(new Date(response.created_at), 'MMM dd, yyyy HH:mm')}</td>
              <td><span class="badge badge-info">${response.response_type.toUpperCase()}</span></td>
              <td>${response.response_by_name || 'System'}</td>
              <td>${response.response_content}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : '';

  const htmlContent = `
    <div class="header">
      <h1>Incident Report</h1>
      <div class="subtitle">Incident ID: ${incident.id}</div>
    </div>

    <div class="section">
      <h2>Incident Details</h2>
      <div class="grid">
        <div class="card">
          <strong>Title:</strong><br>
          ${incident.title}
        </div>
        <div class="card">
          <strong>Status:</strong><br>
          ${getStatusBadge(incident.status)}
        </div>
        <div class="card">
          <strong>Severity:</strong><br>
          ${getSeverityBadge(incident.severity)}
        </div>
        <div class="card">
          <strong>Impact Rating:</strong><br>
          ${incident.impact_rating ? `${incident.impact_rating}/10` : 'Not rated'}
        </div>
        <div class="card">
          <strong>Reported:</strong><br>
          ${format(new Date(incident.reported_at), 'PPP')}
        </div>
        ${incident.resolved_at ? `
        <div class="card">
          <strong>Resolved:</strong><br>
          ${format(new Date(incident.resolved_at), 'PPP')}
        </div>
        ` : ''}
      </div>
    </div>

    ${incident.description ? `
    <div class="section">
      <h2>Description</h2>
      <div class="card">
        ${incident.description.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}

    ${incident.category ? `
    <div class="section">
      <h2>Category</h2>
      <span class="badge badge-info">${incident.category.replace('_', ' ').toUpperCase()}</span>
    </div>
    ` : ''}

    ${responsesTable}
  `;

  const element = document.createElement('div');
  element.innerHTML = createHTMLContent(`Incident Report - ${incident.title}`, htmlContent);
  document.body.appendChild(element);

  const filename = `incident-report-${incident.id}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  const result = await generatePDF(element, { filename });
  
  document.body.removeChild(element);
  return result;
};
