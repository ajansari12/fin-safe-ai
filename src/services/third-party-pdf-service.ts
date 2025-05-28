
import { generatePDF, createHTMLContent } from './pdf-export-service';
import { VendorProfile } from './third-party-service';
import { format } from 'date-fns';

export const generateThirdPartyReviewPDF = async (vendors: VendorProfile[]) => {
  const getRiskBadge = (risk: string) => {
    const badgeClass = risk === 'high' || risk === 'critical' ? 'badge-error' : 
                      risk === 'medium' ? 'badge-warning' : 'badge-success';
    return `<span class="badge ${badgeClass}">${risk.toUpperCase()}</span>`;
  };

  const getStatusBadge = (status: string) => {
    const badgeClass = status === 'active' ? 'badge-success' : 
                      status === 'under_review' ? 'badge-warning' : 'badge-error';
    return `<span class="badge ${badgeClass}">${status.replace('_', ' ').toUpperCase()}</span>`;
  };

  const vendorsTable = vendors.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Vendor Name</th>
          <th>Service Type</th>
          <th>Risk Rating</th>
          <th>Status</th>
          <th>Contract End</th>
          <th>Last Review</th>
        </tr>
      </thead>
      <tbody>
        ${vendors.map(vendor => `
          <tr>
            <td><strong>${vendor.vendor_name}</strong></td>
            <td>${vendor.service_type || 'N/A'}</td>
            <td>${getRiskBadge(vendor.risk_rating)}</td>
            <td>${getStatusBadge(vendor.status)}</td>
            <td>${vendor.contract_end_date ? format(new Date(vendor.contract_end_date), 'MMM dd, yyyy') : 'N/A'}</td>
            <td>${vendor.last_assessment_date ? format(new Date(vendor.last_assessment_date), 'MMM dd, yyyy') : 'Never'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p>No vendor profiles found.</p>';

  const riskSummary = {
    total: vendors.length,
    high: vendors.filter(v => v.risk_rating === 'high' || v.risk_rating === 'critical').length,
    medium: vendors.filter(v => v.risk_rating === 'medium').length,
    low: vendors.filter(v => v.risk_rating === 'low').length,
    active: vendors.filter(v => v.status === 'active').length,
  };

  const upcomingRenewals = vendors.filter(v => {
    if (!v.contract_end_date) return false;
    const endDate = new Date(v.contract_end_date);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return endDate <= threeMonthsFromNow && endDate >= new Date();
  });

  const htmlContent = `
    <div class="header">
      <h1>Third-Party Risk Review Summary</h1>
      <div class="subtitle">Vendor Risk Assessment Overview</div>
    </div>

    <div class="section">
      <h2>Risk Summary</h2>
      <div class="grid">
        <div class="card">
          <strong>Total Vendors:</strong><br>
          <span style="font-size: 24px; color: #2d3748;">${riskSummary.total}</span>
        </div>
        <div class="card">
          <strong>High Risk:</strong><br>
          <span style="font-size: 24px; color: #742a2a;">${riskSummary.high}</span>
        </div>
        <div class="card">
          <strong>Medium Risk:</strong><br>
          <span style="font-size: 24px; color: #744210;">${riskSummary.medium}</span>
        </div>
        <div class="card">
          <strong>Low Risk:</strong><br>
          <span style="font-size: 24px; color: #22543d;">${riskSummary.low}</span>
        </div>
        <div class="card">
          <strong>Active Vendors:</strong><br>
          <span style="font-size: 24px; color: #2a4365;">${riskSummary.active}</span>
        </div>
        <div class="card">
          <strong>Overall Risk Score:</strong><br>
          <span style="font-size: 24px; color: ${riskSummary.high > 0 ? '#742a2a' : riskSummary.medium > riskSummary.low ? '#744210' : '#22543d'};">
            ${riskSummary.total > 0 ? Math.round(((riskSummary.high * 3 + riskSummary.medium * 2 + riskSummary.low * 1) / (riskSummary.total * 3)) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>

    ${upcomingRenewals.length > 0 ? `
    <div class="section">
      <h2>Upcoming Contract Renewals (Next 3 Months)</h2>
      <table>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Contract End Date</th>
            <th>Risk Rating</th>
            <th>Days Until Expiry</th>
          </tr>
        </thead>
        <tbody>
          ${upcomingRenewals.map(vendor => {
            const daysUntilExpiry = Math.ceil((new Date(vendor.contract_end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return `
              <tr>
                <td><strong>${vendor.vendor_name}</strong></td>
                <td>${format(new Date(vendor.contract_end_date!), 'MMM dd, yyyy')}</td>
                <td>${getRiskBadge(vendor.risk_rating)}</td>
                <td>${daysUntilExpiry} days</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <div class="section">
      <h2>All Vendors</h2>
      ${vendorsTable}
    </div>

    <div class="section">
      <h2>Recommendations</h2>
      <div class="card">
        <ul>
          ${riskSummary.high > 0 ? '<li><strong>Priority:</strong> Review and mitigate high-risk vendors immediately</li>' : ''}
          ${upcomingRenewals.length > 0 ? `<li><strong>Action Required:</strong> ${upcomingRenewals.length} contract(s) expiring within 3 months</li>` : ''}
          <li>Establish regular review schedules for all vendor relationships</li>
          <li>Implement automated risk monitoring and alerts</li>
          <li>Consider diversification to reduce concentration risk</li>
          ${riskSummary.total > 10 ? '<li>Review vendor portfolio for potential consolidation opportunities</li>' : ''}
        </ul>
      </div>
    </div>
  `;

  const element = document.createElement('div');
  element.innerHTML = createHTMLContent(`Third-Party Risk Review Summary`, htmlContent);
  document.body.appendChild(element);

  const filename = `third-party-review-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  const result = await generatePDF(element, { filename });
  
  document.body.removeChild(element);
  return result;
};
