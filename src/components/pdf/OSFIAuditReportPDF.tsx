import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { OSFIAuditData } from '@/services/pdf-generation-service';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 11,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 25,
    borderBottom: '3px solid #dc2626',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 5,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 12,
    borderBottom: '1px solid #fecaca',
    paddingBottom: 5,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  finding: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  findingId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  severityBadge: {
    padding: 3,
    borderRadius: 3,
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  critical: { backgroundColor: '#dc2626' },
  high: { backgroundColor: '#ea580c' },
  medium: { backgroundColor: '#d97706' },
  low: { backgroundColor: '#65a30d' },
  findingContent: {
    fontSize: 10,
    marginBottom: 6,
  },
  complianceTable: {
    border: '1px solid #d1d5db',
    borderRadius: 5,
    marginBottom: 15,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    paddingRight: 5,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    paddingRight: 5,
  },
  statusCompliant: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  statusNonCompliant: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  statusPartial: {
    color: '#d97706',
    fontWeight: 'bold',
  },
  listItem: {
    fontSize: 10,
    marginBottom: 4,
    paddingLeft: 10,
  },
  ratingBox: {
    backgroundColor: '#dbeafe',
    border: '2px solid #3b82f6',
    borderRadius: 8,
    padding: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 5,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#1e40af',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#64748b',
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
  },
});

interface OSFIAuditReportPDFProps {
  data: OSFIAuditData;
}

export const OSFIAuditReportPDF: React.FC<OSFIAuditReportPDFProps> = ({ data }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return [styles.severityBadge, styles.critical];
      case 'high': return [styles.severityBadge, styles.high];
      case 'medium': return [styles.severityBadge, styles.medium];
      case 'low': return [styles.severityBadge, styles.low];
      default: return [styles.severityBadge, styles.medium];
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Compliant': return styles.statusCompliant;
      case 'Non-Compliant': return styles.statusNonCompliant;
      case 'Partially Compliant': return styles.statusPartial;
      default: return {};
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>OSFI Operational Resilience Audit Report</Text>
          <Text style={styles.subtitle}>{data.organizationName}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Text>Audit Period: {data.auditPeriod}</Text>
            <Text>Report Date: {data.auditDate}</Text>
          </View>
        </View>

        {/* Overall Rating */}
        <View style={styles.ratingBox}>
          <Text style={styles.ratingValue}>{data.complianceRating}</Text>
          <Text style={styles.ratingLabel}>Overall Compliance Rating</Text>
        </View>

        {/* Audit Scope */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audit Scope</Text>
          <Text style={{ fontSize: 10, marginBottom: 10 }}>{data.auditScope}</Text>
          
          <Text style={styles.subsectionTitle}>Audit Objectives</Text>
          {data.auditObjectives.map((objective, index) => (
            <Text key={index} style={styles.listItem}>• {objective}</Text>
          ))}
        </View>

        {/* Overall Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={{ fontSize: 10, marginBottom: 15 }}>{data.overallAssessment}</Text>
          
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.subsectionTitle}>Key Strengths</Text>
              {data.keyStrengths.map((strength, index) => (
                <Text key={index} style={styles.listItem}>• {strength}</Text>
              ))}
            </View>
            
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.subsectionTitle}>Areas for Improvement</Text>
              {data.areasForImprovement.map((area, index) => (
                <Text key={index} style={styles.listItem}>• {area}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Regulatory Compliance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regulatory Compliance Assessment</Text>
          <View style={styles.complianceTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, { flex: 2 }]}>Requirement</Text>
              <Text style={styles.tableCellHeader}>Status</Text>
              <Text style={[styles.tableCellHeader, { flex: 2 }]}>Evidence</Text>
            </View>
            {data.regulatoryRequirements.map((req, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{req.requirement}</Text>
                <Text style={[styles.tableCell, getStatusStyle(req.status)]}>{req.status}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{req.evidence}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Findings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Findings</Text>
          {data.findings.length === 0 ? (
            <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#64748b' }}>
              No findings identified during this assessment.
            </Text>
          ) : (
            data.findings.map((finding, index) => (
              <View key={index} style={styles.finding}>
                <View style={styles.findingHeader}>
                  <Text style={styles.findingId}>{finding.id} - {finding.category}</Text>
                  <View style={getSeverityStyle(finding.severity)}>
                    <Text>{finding.severity}</Text>
                  </View>
                </View>
                
                <Text style={[styles.findingContent, { fontWeight: 'bold' }]}>Description:</Text>
                <Text style={styles.findingContent}>{finding.description}</Text>
                
                <Text style={[styles.findingContent, { fontWeight: 'bold', marginTop: 8 }]}>Recommendation:</Text>
                <Text style={styles.findingContent}>{finding.recommendation}</Text>
                
                <Text style={[styles.findingContent, { fontWeight: 'bold', marginTop: 8 }]}>Management Response:</Text>
                <Text style={styles.findingContent}>{finding.managementResponse}</Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={[styles.findingContent, { fontWeight: 'bold' }]}>Target Date: {finding.targetDate}</Text>
                  <Text style={[styles.findingContent, { fontWeight: 'bold' }]}>Status: {finding.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text>
            This audit report is prepared in accordance with OSFI Guideline E-21. 
            Confidential and proprietary to {data.organizationName}.
          </Text>
        </View>
      </Page>
    </Document>
  );
};