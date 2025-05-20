
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Shield, Users, FileText, CheckCircle } from "lucide-react";

const About = () => {
  return (
    <PageLayout>
      <div className="section-container py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">About ResilientFI</h1>
            <p className="text-xl text-muted-foreground">
              Building operational resilience for Canadian financial institutions
            </p>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              ResilientFI was founded in 2023 with a mission to help Canadian financial institutions meet regulatory requirements for operational resilience while strengthening their ability to withstand, adapt to, and recover from disruptive events.
            </p>
            
            <h2 className="mt-12">Our Mission</h2>
            <p>
              To simplify operational risk management and regulatory compliance for financial institutions through intelligent technology solutions that enhance resilience against disruptions and protect critical operations.
            </p>
            
            <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Regulatory Compliance</h3>
                  <p className="text-muted-foreground">
                    Our platform is designed specifically to meet OSFI's E-21, B-10, and B-13 guidelines, ensuring your institution stays compliant.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Expert Team</h3>
                  <p className="text-muted-foreground">
                    Founded by veterans from banking, risk management, and technology sectors with decades of collective experience.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Research-Backed</h3>
                  <p className="text-muted-foreground">
                    Our methodologies are grounded in industry best practices and academic research on operational resilience.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Customer Success</h3>
                  <p className="text-muted-foreground">
                    We're committed to our clients' success with dedicated support and continuous platform improvements.
                  </p>
                </div>
              </div>
            </div>
            
            <h2>Leadership Team</h2>
            <p>
              Our leadership team brings together expertise from financial services, risk management, regulatory compliance, and technology sectors to deliver a comprehensive solution for operational resilience.
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold">Sarah Johnson</h3>
                <p className="text-muted-foreground">CEO & Co-Founder</p>
                <p className="mt-2">
                  Former Chief Risk Officer with 15+ years of experience in operational risk management at major Canadian financial institutions.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold">Michael Chen</h3>
                <p className="text-muted-foreground">CTO & Co-Founder</p>
                <p className="mt-2">
                  Technology leader with extensive experience building enterprise risk management systems for the financial sector.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold">David Patel</h3>
                <p className="text-muted-foreground">Chief Compliance Officer</p>
                <p className="mt-2">
                  Former regulator with deep knowledge of OSFI guidelines and regulatory requirements for financial institutions.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold">Lisa Tremblay</h3>
                <p className="text-muted-foreground">VP of Customer Success</p>
                <p className="mt-2">
                  Dedicated to ensuring our clients achieve their operational resilience objectives through effective implementation of our platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default About;
