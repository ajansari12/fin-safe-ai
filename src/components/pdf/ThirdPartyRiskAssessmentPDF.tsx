import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ThirdPartyRiskData } from '@/services/pdf-generation-service';

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
    borderBottom: '3px solid #7c3aed',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
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
    color: '#7c3aed',
    marginBottom: 12,
    borderBottom: '1px solid #ddd6fe',
    paddingBottom: 5,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  riskCategory: {
    backgroundColor: '#faf5ff',
    border: '1px solid #c084fc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  riskRating: {
    padding: 4,
    borderRadius: 3,
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  ratingLow: { backgroundColor: '#16a34a' },
  ratingMedium: { backgroundColor: '#d97706' },
  ratingHigh: { backgroundColor: '#dc2626' },
  ratingCritical: { backgroundColor: '#991b1b' },
  scoreText: {
    fontSize: 10,
    marginBottom: 8,
    color: '#64748b',
  },
  findingsList: {
    marginBottom: 8,
  },
  listItem: {
    fontSize: 10,
    marginBottom: 4,
    paddingLeft: 10,
  },
  overallRating: {
    backgroundColor: '#ede9fe',
    border: '2px solid #8b5cf6',
    borderRadius: 8,
    padding: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 5,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#6d28d9',
  },
  contractTable: {
    border: '1px solid #d1d5db',
    borderRadius: 5,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1px solid #e5e7eb',
  },
  tableLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableValue: {
    flex: 2,
    fontSize: 10,
    color: '#64748b',
  },
  mitigationBox: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #7dd3fc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
  },
  mitigationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
  },
  conclusionBox: {
    backgroundColor: '#f8fafc',
    border: '2px solid #64748b',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    textAlign: 'center',
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

interface ThirdPartyRiskAssessmentPDFProps {
  data: ThirdPartyRiskData;
}

export const ThirdPartyRiskAssessmentPDF: React.FC<ThirdPartyRiskAssessmentPDFProps> = ({ data }) => {
  const getRatingStyle = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'low': return [styles.riskRating, styles.ratingLow];
      case 'medium': return [styles.riskRating, styles.ratingMedium];
      case 'high': return [styles.riskRating, styles.ratingHigh];
      case 'critical': return [styles.riskRating, styles.ratingCritical];
      default: return [styles.riskRating, styles.ratingMedium];
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Third-Party Risk Assessment</Text>
          <Text style={styles.subtitle}>{data.vendorName}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Text>Assessment Type: {data.assessmentType}</Text>
            <Text>Date: {data.assessmentDate}</Text>
          </View>
        </View>

        {/* Overall Risk Rating */}
        <View style={styles.overallRating}>
          <Text style={styles.ratingValue}>{data.overallRiskRating}</Text>
          <Text style={styles.ratingLabel}>Overall Risk Rating</Text>
          <Text style={{ fontSize: 10, marginTop: 5, color: '#6d28d9' }}>
            Service Criticality: {data.serviceCriticality}
          </Text>
        </View>

        {/* Contract Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contract Information</Text>
          <View style={styles.contractTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Contract Start Date:</Text>
              <Text style={styles.tableValue}>{data.contractDetails.startDate}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Contract End Date:</Text>
              <Text style={styles.tableValue}>{data.contractDetails.endDate}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Renewal Date:</Text>
              <Text style={styles.tableValue}>{data.contractDetails.renewalDate}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Financial Exposure:</Text>
              <Text style={styles.tableValue}>{data.contractDetails.financialExposure}</Text>
            </View>
          </View>
          
          <Text style={styles.subsectionTitle}>SLA Requirements</Text>
          {data.contractDetails.slaRequirements.map((sla, index) => (
            <Text key={index} style={styles.listItem}>• {sla}</Text>
          ))}
        </View>

        {/* Risk Categories Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Categories Assessment</Text>
          {data.riskCategories.map((category, index) => (
            <View key={index} style={styles.riskCategory}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.category}</Text>
                <View style={getRatingStyle(category.rating)}>
                  <Text>{category.rating}</Text>
                </View>
              </View>
              
              <Text style={styles.scoreText}>
                Score: {category.score}/{category.maxScore} 
                ({Math.round((category.score / category.maxScore) * 100)}%)
              </Text>
              
              {category.findings.length > 0 && (
                <View style={styles.findingsList}>
                  <Text style={[styles.subsectionTitle, { fontSize: 11, marginBottom: 5 }]}>Key Findings:</Text>
                  {category.findings.map((finding, idx) => (
                    <Text key={idx} style={styles.listItem}>• {finding}</Text>
                  ))}
                </View>
              )}
              
              {category.recommendations.length > 0 && (
                <View>
                  <Text style={[styles.subsectionTitle, { fontSize: 11, marginBottom: 5 }]}>Recommendations:</Text>
                  {category.recommendations.map((rec, idx) => (
                    <Text key={idx} style={styles.listItem}>• {rec}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Risk Mitigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Mitigation Strategy</Text>
          
          <View style={styles.mitigationBox}>
            <Text style={styles.mitigationTitle}>Existing Controls</Text>
            {data.riskMitigation.existingControls.map((control, index) => (
              <Text key={index} style={styles.listItem}>• {control}</Text>
            ))}
          </View>
          
          <View style={styles.mitigationBox}>
            <Text style={styles.mitigationTitle}>Additional Controls Required</Text>
            {data.riskMitigation.additionalControls.map((control, index) => (
              <Text key={index} style={styles.listItem}>• {control}</Text>
            ))}
          </View>
          
          <View style={styles.mitigationBox}>
            <Text style={styles.mitigationTitle}>Monitoring Plan</Text>
            <Text style={{ fontSize: 10, paddingLeft: 10 }}>{data.riskMitigation.monitoringPlan}</Text>
          </View>
        </View>

        {/* Conclusion */}
        <View style={styles.conclusionBox}>
          <Text style={[styles.subsectionTitle, { textAlign: 'center', marginBottom: 10 }]}>Assessment Conclusion</Text>
          <Text style={{ fontSize: 11, textAlign: 'center', marginBottom: 10 }}>{data.conclusion}</Text>
          <Text style={{ fontSize: 10, color: '#64748b' }}>Next Review Date: {data.nextReviewDate}</Text>
        </View>

        <View style={styles.footer}>
          <Text>
            This assessment is confidential and proprietary. 
            Generated by ResilientFI Third-Party Risk Management Platform.
          </Text>
        </View>
      </Page>
    </Document>
  );
};