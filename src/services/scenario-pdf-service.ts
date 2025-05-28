
import { generatePDF, createHTMLContent } from './pdf-export-service';
import { ScenarioTest } from './scenario-testing-service';
import { format } from 'date-fns';

export const generateScenarioTestPDF = async (scenario: ScenarioTest) => {
  const getStatusBadge = (status: string) => {
    const badgeClass = status === 'completed' ? 'badge-success' : 
                      status === 'in_progress' ? 'badge-warning' : 'badge-info';
    return `<span class="badge ${badgeClass}">${status.replace('_', ' ').toUpperCase()}</span>`;
  };

  const getSeverityBadge = (severity: string) => {
    const badgeClass = severity === 'critical' || severity === 'high' ? 'badge-error' : 
                      severity === 'medium' ? 'badge-warning' : 'badge-info';
    return `<span class="badge ${badgeClass}">${severity.toUpperCase()}</span>`;
  };

  const getOutcomeBadge = (outcome?: string) => {
    if (!outcome) return 'N/A';
    const badgeClass = outcome === 'successful' ? 'badge-success' : 
                      outcome === 'partial' ? 'badge-warning' : 'badge-error';
    return `<span class="badge ${badgeClass}">${outcome.toUpperCase()}</span>`;
  };

  const htmlContent = `
    <div class="header">
      <h1>Scenario Test Report</h1>
      <div class="subtitle">${scenario.title}</div>
    </div>

    <div class="section">
      <h2>Test Overview</h2>
      <div class="grid">
        <div class="card">
          <strong>Test ID:</strong><br>
          ${scenario.id}
        </div>
        <div class="card">
          <strong>Status:</strong><br>
          ${getStatusBadge(scenario.status)}
        </div>
        <div class="card">
          <strong>Disruption Type:</strong><br>
          <span class="badge badge-info">${scenario.disruption_type}</span>
        </div>
        <div class="card">
          <strong>Severity Level:</strong><br>
          ${getSeverityBadge(scenario.severity_level)}
        </div>
        <div class="card">
          <strong>Progress:</strong><br>
          Step ${scenario.current_step} of 6
        </div>
        <div class="card">
          <strong>Outcome:</strong><br>
          ${getOutcomeBadge(scenario.outcome)}
        </div>
        <div class="card">
          <strong>Created:</strong><br>
          ${format(new Date(scenario.created_at), 'PPP')}
        </div>
        ${scenario.completed_at ? `
        <div class="card">
          <strong>Completed:</strong><br>
          ${format(new Date(scenario.completed_at), 'PPP')}
        </div>
        ` : ''}
      </div>
    </div>

    ${scenario.description ? `
    <div class="section">
      <h2>Test Description</h2>
      <div class="card">
        ${scenario.description.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}

    ${scenario.response_plan ? `
    <div class="section">
      <h2>Response Plan</h2>
      <div class="card">
        ${scenario.response_plan.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}

    ${scenario.post_mortem ? `
    <div class="section">
      <h2>Post-Mortem Analysis</h2>
      <div class="card">
        ${scenario.post_mortem.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}

    ${scenario.lessons_learned ? `
    <div class="section">
      <h2>Lessons Learned</h2>
      <div class="card">
        ${scenario.lessons_learned.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}

    ${scenario.improvements_identified ? `
    <div class="section">
      <h2>Improvements Identified</h2>
      <div class="card">
        ${scenario.improvements_identified.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}
  `;

  const element = document.createElement('div');
  element.innerHTML = createHTMLContent(`Scenario Test Report - ${scenario.title}`, htmlContent);
  document.body.appendChild(element);

  const filename = `scenario-test-${scenario.title.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  const result = await generatePDF(element, { filename });
  
  document.body.removeChild(element);
  return result;
};
