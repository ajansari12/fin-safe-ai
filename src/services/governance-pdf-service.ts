
import { generatePDF, createHTMLContent } from './pdf-export-service';
import { GovernancePolicy, GovernanceFramework } from '../pages/governance/types';
import { format } from 'date-fns';

interface PolicyWithFramework extends GovernancePolicy {
  framework?: GovernanceFramework;
}

export const generateGovernancePolicyListPDF = async (
  policies: PolicyWithFramework[],
  frameworkTitle?: string
) => {
  const getStatusBadge = (status: string) => {
    const badgeClass = status === 'active' || status === 'approved' ? 'badge-success' : 
                      status === 'under_review' ? 'badge-warning' : 'badge-info';
    return `<span class="badge ${badgeClass}">${status.replace('_', ' ').toUpperCase()}</span>`;
  };

  const policiesTable = policies.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Policy Title</th>
          <th>Framework</th>
          <th>Status</th>
          <th>Version</th>
          <th>Created</th>
          <th>Last Review</th>
        </tr>
      </thead>
      <tbody>
        ${policies.map(policy => `
          <tr>
            <td><strong>${policy.title}</strong></td>
            <td>${policy.framework?.title || 'N/A'}</td>
            <td>${getStatusBadge(policy.status)}</td>
            <td>${policy.version || '1.0'}</td>
            <td>${format(new Date(policy.created_at), 'MMM dd, yyyy')}</td>
            <td>Never</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p>No policies found.</p>';

  const summary = {
    total: policies.length,
    active: policies.filter(p => p.status === 'active' || p.status === 'approved').length,
    underReview: policies.filter(p => p.status === 'under_review').length,
    draft: policies.filter(p => p.status === 'draft').length,
  };

  const htmlContent = `
    <div class="header">
      <h1>Governance Policy Report</h1>
      <div class="subtitle">${frameworkTitle || 'All Frameworks'}</div>
    </div>

    <div class="section">
      <h2>Summary</h2>
      <div class="grid">
        <div class="card">
          <strong>Total Policies:</strong><br>
          <span style="font-size: 24px; color: #2d3748;">${summary.total}</span>
        </div>
        <div class="card">
          <strong>Active Policies:</strong><br>
          <span style="font-size: 24px; color: #22543d;">${summary.active}</span>
        </div>
        <div class="card">
          <strong>Under Review:</strong><br>
          <span style="font-size: 24px; color: #744210;">${summary.underReview}</span>
        </div>
        <div class="card">
          <strong>Draft Policies:</strong><br>
          <span style="font-size: 24px; color: #2a4365;">${summary.draft}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Policy Listing</h2>
      ${policiesTable}
    </div>

    <div class="section">
      <h2>Compliance Overview</h2>
      <div class="grid">
        <div class="card">
          <strong>Compliance Rate:</strong><br>
          ${summary.total > 0 ? Math.round((summary.active / summary.total) * 100) : 0}%
        </div>
        <div class="card">
          <strong>Policies Needing Attention:</strong><br>
          ${summary.underReview + summary.draft}
        </div>
      </div>
    </div>
  `;

  const element = document.createElement('div');
  element.innerHTML = createHTMLContent(`Governance Policy Report`, htmlContent);
  document.body.appendChild(element);

  const filename = `governance-policies-${frameworkTitle ? frameworkTitle.replace(/\s+/g, '-').toLowerCase() : 'all'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  const result = await generatePDF(element, { filename });
  
  document.body.removeChild(element);
  return result;
};
