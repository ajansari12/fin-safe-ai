
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createPolicy, updatePolicy } from "@/services/governance-service";
import { GovernancePolicy } from "@/pages/governance/types";
import { File } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Policy title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]).default("active"),
});

interface PolicyFormProps {
  frameworkId: string;
  onSuccess?: (policy: GovernancePolicy) => void;
  onCancel?: () => void;
  existingPolicy?: GovernancePolicy;
}

export default function PolicyForm({ 
  frameworkId, 
  onSuccess, 
  onCancel, 
  existingPolicy 
}: PolicyFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: existingPolicy?.title || "",
      description: existingPolicy?.description || "",
      status: (existingPolicy?.status as "active" | "draft" | "archived") || "active",
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, DOCX, and Markdown files are allowed");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      setSelectedFile(file);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    try {
      if (existingPolicy) {
        // Update existing policy
        const updatedPolicy = await updatePolicy(existingPolicy.id, {
          title: values.title,
          description: values.description || null,
          status: values.status,
          framework_id: frameworkId,
        }, selectedFile || undefined);
        
        if (updatedPolicy && onSuccess) {
          onSuccess(updatedPolicy);
        }
      } else {
        // Create new policy
        const newPolicy = await createPolicy({
          title: values.title,
          description: values.description || null,
          status: values.status,
          framework_id: frameworkId,
          version: 1,
        }, selectedFile || undefined);
        
        if (newPolicy && onSuccess) {
          onSuccess(newPolicy);
          form.reset();
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }
    } catch (error) {
      console.error("Error submitting policy:", error);
      toast.error("An error occurred while saving the policy");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter policy title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter policy description (optional)" 
                  className="min-h-[100px]"
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  className="w-full p-2 border rounded"
                  {...field}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Policy Document</FormLabel>
          <FormControl>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.md"
              onChange={handleFileChange}
            />
          </FormControl>
          <FormDescription>
            Upload PDF, DOCX, or Markdown files (max 10MB)
          </FormDescription>
          {existingPolicy?.file_path && !selectedFile && (
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <File className="h-4 w-4 mr-1" /> Current file: {existingPolicy.file_path.split('/').pop()}
            </div>
          )}
          {selectedFile && (
            <div className="flex items-center text-sm text-green-500 mt-1">
              <File className="h-4 w-4 mr-1" /> New file selected: {selectedFile.name}
            </div>
          )}
        </FormItem>

        <div className="flex space-x-2 justify-end">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSaving}
          >
            {isSaving 
              ? "Saving..." 
              : (existingPolicy ? "Update Policy" : "Create Policy")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
