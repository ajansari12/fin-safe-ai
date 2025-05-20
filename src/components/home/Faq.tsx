
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is OSFI E-21 compliance?",
    answer: "OSFI E-21 is a regulatory guideline issued by the Office of the Superintendent of Financial Institutions in Canada. It requires financial institutions to establish an operational risk management framework that ensures the resilience of critical operations during disruptions."
  },
  {
    question: "How does ResilientFI help with regulatory compliance?",
    answer: "ResilientFI provides a comprehensive platform that guides financial institutions through the process of identifying critical operations, mapping dependencies, establishing impact tolerances, and conducting scenario testing—all key requirements of OSFI E-21 and other regulatory frameworks."
  },
  {
    question: "Do you support other regulatory frameworks besides OSFI E-21?",
    answer: "Yes, our platform also supports compliance with OSFI B-10 (Third-Party Risk Management), B-13 (Technology and Cyber Risk Management), and international standards like ISO 22301 for Business Continuity Management."
  },
  {
    question: "Can we customize the platform for our specific organization?",
    answer: "Absolutely. Our Professional and Enterprise plans include customization options for workflows, risk assessment methodologies, and reporting templates to align with your organization's specific needs and risk management framework."
  },
  {
    question: "How long does implementation typically take?",
    answer: "Implementation time varies based on the size and complexity of your organization. Typically, small to medium institutions can be fully operational within 4-6 weeks, while larger enterprises may require 8-12 weeks for a complete implementation."
  },
  {
    question: "Is user training included with the platform?",
    answer: "Yes, all plans include basic training resources. Our Professional plan includes virtual training sessions, while the Enterprise plan includes comprehensive on-site training and change management support."
  },
  {
    question: "How secure is the platform?",
    answer: "ResilientFI utilizes enterprise-grade security measures including end-to-end encryption, role-based access controls, and regular security audits. Our platform is hosted in Canadian data centers and complies with relevant data protection regulations."
  }
];

const Faq = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about our operational resilience platform.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-slate-200 dark:border-slate-800">
                <AccordionTrigger className="text-lg font-medium py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Still have questions? <a href="/contact" className="text-primary underline">Contact our team</a> for more information.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Faq;
