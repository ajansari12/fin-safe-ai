import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ExecutiveSummaryData } from '@/services/pdf-generation-service';

// Register fonts if needed
// Font.register({ family: 'Arial', src: '/fonts/arial.ttf' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 11,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #1e40af',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  kpiBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  kpiLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  riskItem: {
    backgroundColor: '#fef7ff',
    border: '1px solid #e879f9',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  riskCategory: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9333ea',
    marginBottom: 5,
  },
  riskDescription: {
    fontSize: 10,
    marginBottom: 5,
  },
  riskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#64748b',
  },
  actionItem: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 3,
    padding: 8,
    marginBottom: 5,
    fontSize: 10,
  },
  incidentStat: {
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: 5,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d97706',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 9,
    color: '#92400e',
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

interface ExecutiveSummaryPDFProps {
  data: ExecutiveSummaryData;
}

export const ExecutiveSummaryPDF: React.FC<ExecutiveSummaryPDFProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Executive Risk Summary</Text>
        <Text style={styles.subtitle}>{data.organizationName}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>Period: {data.reportPeriod}</Text>
          <Text>Generated: {data.reportDate}</Text>
        </View>
      </View>

      {/* Key Performance Indicators */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        <View style={styles.row}>
          <View style={[styles.column, styles.kpiBox]}>
            <Text style={styles.kpiValue}>{data.kpis.riskScore}%</Text>
            <Text style={styles.kpiLabel}>Overall Risk Score</Text>
          </View>
          <View style={[styles.column, styles.kpiBox]}>
            <Text style={styles.kpiValue}>{data.kpis.complianceScore}%</Text>
            <Text style={styles.kpiLabel}>Compliance Score</Text>
          </View>
          <View style={[styles.column, styles.kpiBox]}>
            <Text style={styles.kpiValue}>{data.kpis.controlEffectiveness.toFixed(1)}%</Text>
            <Text style={styles.kpiLabel}>Control Effectiveness</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.column, styles.kpiBox]}>
            <Text style={styles.kpiValue}>{data.kpis.vendorRiskScore}%</Text>
            <Text style={styles.kpiLabel}>Vendor Risk Score</Text>
          </View>
          <View style={[styles.column, styles.kpiBox]}>
            <Text style={styles.kpiValue}>{data.kpis.systemAvailability}%</Text>
            <Text style={styles.kpiLabel}>System Availability</Text>
          </View>
          <View style={styles.column}></View>
        </View>
      </View>

      {/* Incident Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Incident Management Summary</Text>
        <View style={styles.row}>
          <View style={[styles.column, styles.incidentStat]}>
            <Text style={styles.statValue}>{data.incidents.total}</Text>
            <Text style={styles.statLabel}>Total Incidents</Text>
          </View>
          <View style={[styles.column, styles.incidentStat]}>
            <Text style={styles.statValue}>{data.incidents.critical}</Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={[styles.column, styles.incidentStat]}>
            <Text style={styles.statValue}>{data.incidents.high}</Text>
            <Text style={styles.statLabel}>High Severity</Text>
          </View>
          <View style={[styles.column, styles.incidentStat]}>
            <Text style={styles.statValue}>{data.incidents.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
        <Text style={{ fontSize: 10, marginTop: 10, color: '#64748b' }}>
          Average Resolution Time: {data.incidents.avgResolutionTime.toFixed(1)} hours
        </Text>
      </View>

      {/* Top Risks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Risk Areas</Text>
        {data.topRisks.map((risk, index) => (
          <View key={index} style={styles.riskItem}>
            <Text style={styles.riskCategory}>{risk.category}</Text>
            <Text style={styles.riskDescription}>{risk.description}</Text>
            <View style={styles.riskMeta}>
              <Text>Likelihood: {risk.likelihood}</Text>
              <Text>Impact: {risk.impact}</Text>
            </View>
            <Text style={{ fontSize: 9, marginTop: 5, fontStyle: 'italic' }}>
              Mitigation: {risk.mitigation}
            </Text>
          </View>
        ))}
      </View>

      {/* Key Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Actions Required</Text>
        {data.keyActions.map((action, index) => (
          <View key={index} style={styles.actionItem}>
            <Text>• {action}</Text>
          </View>
        ))}
      </View>

      {/* Next Steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Steps</Text>
        {data.nextSteps.map((step, index) => (
          <View key={index} style={styles.actionItem}>
            <Text>• {step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text>
          This report is confidential and intended for internal use only. 
          Generated by ResilientFI Risk Management Platform.
        </Text>
      </View>
    </Page>
  </Document>
);