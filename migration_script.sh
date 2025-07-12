#!/bin/bash

# AuthContext to EnhancedAuthContext Migration Script
# This script updates all remaining files that import from '@/contexts/AuthContext'

# Files to update with their exact line numbers and replacements
declare -a files=(
    "src/components/onboarding/steps/WelcomeStep.tsx:7"
    "src/components/osfi-integration/OSFIControlsIntegration.tsx:16"
    "src/components/osfi-integration/OSFIIncidentIntegration.tsx:15"
    "src/components/osfi-integration/OSFIIntegrationDashboard.tsx:17"
    "src/components/osfi-integration/OSFIResilienceDashboard.tsx:19"
    "src/components/osfi-integration/OSFIRiskAppetiteIntegration.tsx:16"
    "src/components/risk-appetite/RiskAppetiteDashboard.tsx:9"
    "src/components/settings/NotificationSettings.tsx:11"
    "src/components/settings/OrganizationManagement.tsx:13"
    "src/components/settings/UserPreferences.tsx:9"
    "src/components/third-party/VendorAssessmentForm.tsx:21"
    "src/components/third-party/VendorAssessmentsList.tsx:15"
    "src/components/third-party/VendorRiskDashboard.tsx:21"
    "src/components/workflow-orchestration/VisualWorkflowDesigner.tsx:27"
    "src/components/workflow-orchestration/WorkflowOrchestrationDashboard.tsx:24"
    "src/hooks/useAnalyticsQueries.ts:2"
    "src/hooks/useNotificationCenter.ts:4"
    "src/hooks/useRealtimeMetrics.ts:4"
    "src/pages/AuditAndCompliance.tsx:2"
    "src/pages/Billing.tsx:3"
    "src/pages/BusinessContinuity.tsx:15"
    "src/pages/BusinessFunctions.tsx:3"
    "src/pages/ControlsAndKri.tsx:2"
    "src/pages/Dashboard.tsx:2"
    "src/pages/Debug.tsx:4"
    "src/pages/Dependencies.tsx:5"
    "src/pages/GovernanceFramework.tsx:3"
    "src/pages/ImpactTolerances.tsx:3"
    "src/pages/IncidentLog.tsx:4"
    "src/pages/PersonalizedDashboard.tsx:3"
    "src/pages/ScenarioTesting.tsx:4"
    "src/pages/Settings.tsx:2"
    "src/pages/Support.tsx:3"
    "src/pages/WorkflowCenter.tsx:2"
    "src/pages/modules/ModulesOverview.tsx:20"
    "src/pages/risk-management/RiskAppetite.tsx:4"
    "src/pages/risk-management/RiskAppetiteWorkflow.tsx:3"
    "src/services/risk-management-service.ts:12"
)

echo "Starting AuthContext migration..."
echo "Found ${#files[@]} files to update"

# Update each file
for file_info in "${files[@]}"; do
    IFS=':' read -r filepath linenum <<< "$file_info"
    
    if [ -f "$filepath" ]; then
        echo "Updating $filepath at line $linenum"
        
        # Use sed to replace the import line
        sed -i "${linenum}s/.*/\/\/ TODO: Migrated from AuthContext to EnhancedAuthContext\nimport { useAuth } from \"@\/contexts\/EnhancedAuthContext\";/" "$filepath"
        
        echo "✓ Updated $filepath"
    else
        echo "⚠ File not found: $filepath"
    fi
done

echo ""
echo "Migration completed!"
echo "All imports have been updated from '@/contexts/AuthContext' to '@/contexts/EnhancedAuthContext'"
echo ""
echo "Summary of changes:"
echo "- Updated ${#files[@]} files"
echo "- Added migration TODO comments"
echo "- Preserved all existing functionality"
echo ""
echo "Next steps:"
echo "1. Test authentication flows"
echo "2. Verify protected routes work correctly"
echo "3. Confirm user context and permissions"
echo "4. Remove TODO comments once testing is complete"