import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { enhancedAuditService, RegulatoryMapping } from "@/services/enhanced-audit-service";
import { auditService } from "@/services/audit-service";

const regulatoryMappingSchema = z.object({
  regulatory_framework: z.enum(["OSFI_B10", "OSFI_B13", "OSFI_E21"]),
  requirement_section: z.string().min(1, "Section is required"),
  requirement_title: z.string().min(1, "Title is required"),
  requirement_description: z.string().optional(),
  compliance_status: z.enum(["compliant", "non_compliant", "partial", "not_assessed"]),
  gap_severity: z.enum(["low", "medium", "high", "critical"]),
  remediation_priority: z.enum(["low", "medium", "high", "critical"]),
  finding_id: z.string().optional(),
  audit_upload_id: z.string().optional(),
  target_completion_date: z.date().optional(),
  responsible_party: z.string().optional(),
  validation_evidence: z.string().optional(),
});

type RegulatoryMappingFormData = z.infer<typeof regulatoryMappingSchema>;

interface RegulatoryMappingFormProps {
  orgId: string;
  mapping?: RegulatoryMapping | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const RegulatoryMappingForm: React.FC<RegulatoryMappingFormProps> = ({
  orgId,
  mapping,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [findings, setFindings] = useState<any[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);

  const form = useForm<RegulatoryMappingFormData>({
    resolver: zodResolver(regulatoryMappingSchema),
    defaultValues: {
      regulatory_framework: "OSFI_B10",
      requirement_section: "",
      requirement_title: "",
      requirement_description: "",
      compliance_status: "not_assessed",
      gap_severity: "medium",
      remediation_priority: "medium",
      finding_id: "",
      audit_upload_id: "",
      responsible_party: "",
      validation_evidence: "",
    }
  });

  useEffect(() => {
    loadRelatedData();
  }, [orgId]);

  useEffect(() => {
    if (mapping) {
      form.reset({
        regulatory_framework: mapping.regulatory_framework as any,
        requirement_section: mapping.requirement_section,
        requirement_title: mapping.requirement_title,
        requirement_description: mapping.requirement_description || "",
        compliance_status: mapping.compliance_status as any,
        gap_severity: mapping.gap_severity as any,
        remediation_priority: mapping.remediation_priority as any,
        finding_id: mapping.finding_id || "",
        audit_upload_id: mapping.audit_upload_id || "",
        target_completion_date: mapping.target_completion_date ? new Date(mapping.target_completion_date) : undefined,
        responsible_party: mapping.responsible_party || "",
        validation_evidence: mapping.validation_evidence || "",
      });
    }
  }, [mapping, form]);

  const loadRelatedData = async () => {
    try {
      const [findingsData, uploadsData] = await Promise.all([
        auditService.getComplianceFindings(orgId),
        auditService.getAuditUploads(orgId)
      ]);
      setFindings(findingsData);
      setUploads(uploadsData);
    } catch (error) {
      console.error('Error loading related data:', error);
    }
  };

  const onSubmit = async (data: RegulatoryMappingFormData) => {
    try {
      setLoading(true);
      
      const mappingData = {
        org_id: orgId,
        regulatory_framework: data.regulatory_framework,
        requirement_section: data.requirement_section,
        requirement_title: data.requirement_title,
        requirement_description: data.requirement_description || "",
        compliance_status: data.compliance_status,
        gap_severity: data.gap_severity,
        remediation_priority: data.remediation_priority,
        finding_id: data.finding_id || "",
        audit_upload_id: data.audit_upload_id || "",
        target_completion_date: data.target_completion_date ? 
          format(data.target_completion_date, 'yyyy-MM-dd') : "",
        responsible_party: data.responsible_party || "",
        validation_evidence: data.validation_evidence || "",
        last_assessment_date: format(new Date(), 'yyyy-MM-dd'),
      };

      if (mapping) {
        await enhancedAuditService.updateRegulatoryMapping(mapping.id, mappingData);
      } else {
        await enhancedAuditService.createRegulatoryMapping(mappingData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving regulatory mapping:', error);
    } finally {
      setLoading(false);
    }
  };

  const frameworkSections = {
    OSFI_B10: [
      "2.1 - Governance Framework",
      "2.2 - Risk Management",
      "2.3 - Due Diligence",
      "2.4 - Service Provider Selection",
      "2.5 - Contracting",
      "2.6 - Monitoring",
      "2.7 - Business Continuity",
      "2.8 - Exit Strategies"
    ],
    OSFI_B13: [
      "2.1 - Technology Risk Governance",
      "2.2 - Technology Risk Management",
      "2.3 - IT Infrastructure",
      "2.4 - System Development",
      "2.5 - Data Management",
      "2.6 - Cybersecurity",
      "2.7 - Business Continuity",
      "2.8 - Third-Party Management"
    ],
    OSFI_E21: [
      "2.1 - Operational Risk Framework",
      "2.2 - Risk Identification",
      "2.3 - Risk Assessment",
      "2.4 - Risk Monitoring",
      "2.5 - Risk Mitigation",
      "2.6 - Incident Management",
      "2.7 - Business Continuity",
      "2.8 - Reporting"
    ]
  };

  const selectedFramework = form.watch("regulatory_framework");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="regulatory_framework"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regulatory Framework</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="OSFI_B10">OSFI B-10 (Outsourcing)</SelectItem>
                    <SelectItem value="OSFI_B13">OSFI B-13 (Technology Risk)</SelectItem>
                    <SelectItem value="OSFI_E21">OSFI E-21 (Operational Risk)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requirement_section"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requirement Section</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {frameworkSections[selectedFramework]?.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="requirement_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirement Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Risk Assessment and Due Diligence" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirement_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirement Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detailed description of the regulatory requirement..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="compliance_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compliance Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                    <SelectItem value="partial">Partially Compliant</SelectItem>
                    <SelectItem value="not_assessed">Not Assessed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gap_severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gap Severity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remediation_priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remediation Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="finding_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Finding (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select finding" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {findings.map((finding) => (
                      <SelectItem key={finding.id} value={finding.id}>
                        {finding.finding_reference} - {finding.finding_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="audit_upload_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Document (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {uploads.map((upload) => (
                      <SelectItem key={upload.id} value={upload.id}>
                        {upload.document_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="target_completion_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Completion Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsible_party"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsible Party</FormLabel>
                <FormControl>
                  <Input placeholder="Risk Management Team" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="validation_evidence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Validation Evidence</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Evidence of compliance or remediation efforts..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : mapping ? "Update Mapping" : "Create Mapping"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RegulatoryMappingForm;
