
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CRO at Maple Bank",
    content: "ResilientFI has streamlined our operational risk management process and helped us achieve OSFI E-21 compliance in half the time we expected.",
    avatar: "/testimonials/avatar-1.png",
    company: "Maple Bank",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    role: "Head of Operational Risk",
    content: "The AI-powered workflows in ResilientFI have transformed how we document and assess our critical operations dependencies.",
    avatar: "/testimonials/avatar-2.png",
    company: "Nova Credit Union",
    rating: 5,
  },
  {
    name: "Jessica Taylor",
    role: "VP of Compliance",
    content: "Implementing ResilientFI has given us clear visibility into our operational resilience posture across all business units.",
    avatar: "/testimonials/avatar-3.png",
    company: "Atlantic Financial",
    rating: 4,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Trusted by Leading Financial Institutions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how Canadian financial institutions are strengthening their operational resilience with our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden h-full card-hover-effect">
              <CardContent className="pt-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                
                <blockquote className="text-lg mb-6 flex-grow">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center mt-auto">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 mt-16">
          <img src="/logos/logo-1.svg" alt="Client logo" className="h-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all" />
          <img src="/logos/logo-2.svg" alt="Client logo" className="h-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all" />
          <img src="/logos/logo-3.svg" alt="Client logo" className="h-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all" />
          <img src="/logos/logo-4.svg" alt="Client logo" className="h-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all" />
          <img src="/logos/logo-5.svg" alt="Client logo" className="h-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all" />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
