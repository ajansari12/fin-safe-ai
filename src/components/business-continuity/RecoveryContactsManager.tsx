import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Phone, Mail, Plus, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { businessContinuityService, RecoveryContact } from "@/services/business-continuity-service";

interface RecoveryContactsManagerProps {
  orgId: string;
  planId?: string; // Make planId optional since we might use this without a specific plan
}

interface ContactFormData {
  contact_name: string;
  contact_role: string;
  contact_type: 'internal' | 'external' | 'vendor' | 'emergency';
  primary_phone: string;
  secondary_phone: string;
  email: string;
  department: string;
  organization: string;
  availability: string;
  escalation_order: number;
  notes: string;
}

const RecoveryContactsManager: React.FC<RecoveryContactsManagerProps> = ({ orgId, planId }) => {
  const [contacts, setContacts] = useState<RecoveryContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<RecoveryContact | null>(null);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    defaultValues: {
      contact_name: '',
      contact_role: '',
      contact_type: 'internal',
      primary_phone: '',
      secondary_phone: '',
      email: '',
      department: '',
      organization: '',
      availability: '',
      escalation_order: 1,
      notes: ''
    }
  });

  useEffect(() => {
    loadContacts();
  }, [planId]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      if (planId) {
        const data = await businessContinuityService.getRecoveryContacts(planId);
        setContacts(data);
      } else {
        // Load all contacts for the organization if no specific plan
        setContacts([]);
      }
    } catch (error) {
      console.error('Error loading recovery contacts:', error);
      toast({
        title: "Error loading contacts",
        description: "There was an error loading the recovery contacts.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openForm = (contact?: RecoveryContact) => {
    if (contact) {
      setEditingContact(contact);
      form.reset({
        contact_name: contact.contact_name,
        contact_role: contact.contact_role,
        contact_type: contact.contact_type,
        primary_phone: contact.primary_phone || '',
        secondary_phone: contact.secondary_phone || '',
        email: contact.email || '',
        department: contact.department || '',
        organization: contact.organization || '',
        availability: contact.availability || '',
        escalation_order: contact.escalation_order,
        notes: contact.notes || ''
      });
    } else {
      setEditingContact(null);
      form.reset({
        contact_name: '',
        contact_role: '',
        contact_type: 'internal',
        primary_phone: '',
        secondary_phone: '',
        email: '',
        department: '',
        organization: '',
        availability: '',
        escalation_order: contacts.length + 1,
        notes: ''
      });
    }
    setFormOpen(true);
  };

  const onSubmit = async (data: ContactFormData) => {
    try {
      const contactData = {
        ...data,
        org_id: orgId,
        continuity_plan_id: planId
      };

      if (editingContact) {
        await businessContinuityService.updateRecoveryContact(editingContact.id, contactData);
      } else {
        await businessContinuityService.createRecoveryContact(contactData);
      }

      toast({
        title: "Success",
        description: `Recovery contact ${editingContact ? 'updated' : 'added'} successfully.`
      });

      setFormOpen(false);
      loadContacts();
    } catch (error) {
      console.error('Error saving recovery contact:', error);
      toast({
        title: "Error",
        description: "Failed to save recovery contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteContact = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await businessContinuityService.deleteRecoveryContact(contactId);
        toast({
          title: "Success",
          description: "Recovery contact deleted successfully."
        });
        loadContacts();
      } catch (error) {
        console.error('Error deleting recovery contact:', error);
        toast({
          title: "Error",
          description: "Failed to delete recovery contact. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'external': return 'bg-green-100 text-green-800';
      case 'vendor': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading recovery contacts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recovery Contacts
                {planId && <Badge variant="outline">Plan Specific</Badge>}
              </CardTitle>
              <CardDescription>
                Manage key contacts for emergency response and recovery coordination.
              </CardDescription>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recovery Contacts</h3>
              <p className="text-gray-500 mb-4">Add contacts for emergency response and recovery coordination.</p>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Contact
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name & Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Department/Org</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contact.contact_name}</div>
                        <div className="text-sm text-muted-foreground">{contact.contact_role}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getContactTypeColor(contact.contact_type)}>
                        {contact.contact_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {contact.primary_phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {contact.primary_phone}
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {contact.department && <div>{contact.department}</div>}
                        {contact.organization && <div className="text-muted-foreground">{contact.organization}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{contact.escalation_order}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingContact(contact)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteContact(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit' : 'Add'} Recovery Contact</DialogTitle>
            <DialogDescription>
              {editingContact ? 'Update the' : 'Add a new'} recovery contact for emergency response coordination.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input id="contact_name" placeholder="Enter contact name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_role">Role/Title</Label>
                <Input id="contact_role" placeholder="Enter role or title" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_type">Contact Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="escalation_order">Escalation Order</Label>
                <Input id="escalation_order" type="number" min="1" placeholder="1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter email address" />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingContact ? 'Update' : 'Add'} Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  function getContactTypeColor(type: string) {
    switch (type) {
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'external': return 'bg-green-100 text-green-800';
      case 'vendor': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  async function deleteContact(contactId: string) {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await businessContinuityService.deleteRecoveryContact(contactId);
        toast({
          title: "Success",
          description: "Recovery contact deleted successfully."
        });
        loadContacts();
      } catch (error) {
        console.error('Error deleting recovery contact:', error);
        toast({
          title: "Error",
          description: "Failed to delete recovery contact. Please try again.",
          variant: "destructive"
        });
      }
    }
  }
};

export default RecoveryContactsManager;
