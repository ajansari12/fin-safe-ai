
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createFramework, updateFramework } from "@/services/governance-service";
import { toast } from "sonner";
import { GovernanceFramework } from "@/pages/governance/types";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Framework title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

interface FrameworkFormProps {
  onSuccess?: (framework: GovernanceFramework) => void;
  existingFramework?: GovernanceFramework;
  isLoading?: boolean;
}

export default function FrameworkForm({ 
  onSuccess, 
  existingFramework, 
  isLoading = false 
}: FrameworkFormProps) {
  const { profile, user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: existingFramework?.title || "",
      description: existingFramework?.description || "",
      status: (existingFramework?.status as "draft" | "active" | "archived") || "draft",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!profile || !user) {
      toast.error("You must be logged in to create a framework");
      return;
    }

    setIsSaving(true);
    
    try {
      if (existingFramework) {
        // Update existing framework
        const updatedFramework = await updateFramework(existingFramework.id, {
          ...values,
          updated_by: user.id,
        });
        
        if (updatedFramework && onSuccess) {
          onSuccess(updatedFramework);
        }
      } else {
        // Create new framework
        const newFramework = await createFramework({
          title: values.title,
          description: values.description || null,
          status: values.status,
          org_id: profile.organization_id || "",
          created_by: user.id,
          updated_by: user.id,
          version: 1,
        });
        
        if (newFramework && onSuccess) {
          onSuccess(newFramework);
          form.reset();
        }
      }
    } catch (error) {
      console.error("Error submitting framework:", error);
      toast.error("An error occurred while saving the framework");
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
              <FormLabel>Framework Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter framework title" {...field} />
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
                  placeholder="Enter framework description (optional)" 
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
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSaving || isLoading}
          className="w-full"
        >
          {isSaving ? "Saving..." : (existingFramework ? "Update Framework" : "Create Framework")}
        </Button>
      </form>
    </Form>
  );
}
