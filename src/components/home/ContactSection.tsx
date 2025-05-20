
import { EnvelopeClosedIcon, PhoneIcon } from "@radix-ui/react-icons";
import ContactForm from "./ContactForm";
import { Button } from "@/components/ui/button";

const ContactSection = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our platform or want to schedule a demo? Reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
              <ContactForm />
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <EnvelopeClosedIcon className="h-5 w-5 mr-3 text-primary" />
                  <a href="mailto:info@resilientfi.com" className="text-muted-foreground hover:text-primary">
                    info@resilientfi.com
                  </a>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-3 text-primary" />
                  <a href="tel:+14165550123" className="text-muted-foreground hover:text-primary">
                    +1 (416) 555-0123
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Office Location</h3>
              <p className="text-muted-foreground">
                120 Adelaide Street West<br />
                Suite 2500<br />
                Toronto, ON M5H 1T1<br />
                Canada
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
              <p className="text-muted-foreground">
                Monday - Friday: 9:00 AM - 5:00 PM EST<br />
                Saturday & Sunday: Closed
              </p>
            </div>
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-8">
              <h3 className="text-xl font-semibold mb-4">Book a Demo</h3>
              <p className="text-muted-foreground mb-4">
                See ResilientFI in action with a personalized demo tailored to your institution's needs.
              </p>
              <Button asChild variant="outline" className="rounded-full">
                <a href="/demo">Schedule a Demo</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
