
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thanks for reaching out! We'll get back to you soon.",
      });
      setIsSubmitting(false);
      
      // Reset form
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <PageLayout>
      <div className="section-container py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
            <p className="text-xl text-muted-foreground">
              Have questions about ResilientFI? We'd love to hear from you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader className="pb-2">
                <div className="bg-primary/10 p-3 rounded-full w-fit">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">Email</CardTitle>
                <CardDescription className="mt-1">
                  <a href="mailto:info@resilientfi.com" className="hover:text-primary">
                    info@resilientfi.com
                  </a>
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="bg-primary/10 p-3 rounded-full w-fit">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">Phone</CardTitle>
                <CardDescription className="mt-1">
                  <a href="tel:+14165551234" className="hover:text-primary">
                    +1 (416) 555-1234
                  </a>
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="bg-primary/10 p-3 rounded-full w-fit">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">Office</CardTitle>
                <CardDescription className="mt-1">
                  120 Adelaide St W, Toronto, ON M5H 1T1
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="first-name" className="text-sm font-medium">
                        First Name
                      </label>
                      <Input id="first-name" name="first-name" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last-name" className="text-sm font-medium">
                        Last Name
                      </label>
                      <Input id="last-name" name="last-name" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium">
                      Company
                    </label>
                    <Input id="company" name="company" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea id="message" name="message" rows={5} required />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">How does the platform help with OSFI E-21 compliance?</h4>
                  <p className="text-muted-foreground mt-1">
                    ResilientFI provides structured workflows and documentation templates aligned with all key requirements of the E-21 guideline on operational resilience.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Do you offer implementation support?</h4>
                  <p className="text-muted-foreground mt-1">
                    Yes, our Professional Services team can provide implementation support tailored to your organization's specific needs.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Is the platform suitable for smaller financial institutions?</h4>
                  <p className="text-muted-foreground mt-1">
                    Absolutely. Our platform is designed to scale according to the size and complexity of your organization, with plans suitable for institutions of all sizes.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">How secure is the platform?</h4>
                  <p className="text-muted-foreground mt-1">
                    Security is our priority. We use industry-leading encryption, regular security audits, and follow all relevant data protection regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
