
-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add organization_id to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
  END IF;
END $$;

-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Everyone can read the knowledge base
CREATE POLICY "Anyone can read knowledge_base"
ON public.knowledge_base
FOR SELECT
USING (true);

-- Only authenticated users with admin role can modify the knowledge base
CREATE POLICY "Only admins can insert knowledge_base"
ON public.knowledge_base
FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update knowledge_base"
ON public.knowledge_base
FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete knowledge_base"
ON public.knowledge_base
FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');

-- Insert some sample knowledge base data
INSERT INTO public.knowledge_base (title, domain, sections) VALUES 
('OSFI E-21 Guideline', 'E-21', '[
  {
    "title": "Introduction",
    "content": "OSFI Guideline E-21 establishes expectations for federally regulated financial institutions (FRFIs) to develop robust approaches to operational risk management. The guideline applies to all FRFIs, including banks, insurance companies, and trust companies."
  },
  {
    "title": "Operational Risk Management Framework",
    "content": "The Operational Risk Management Framework (ORMF) is the set of interrelated tools and processes that a FRFI uses to identify, assess, measure, monitor, and respond to operational risks. It should be fully integrated with the overall risk management framework of the institution."
  },
  {
    "title": "Key Definitions",
    "content": "Operational risk is the risk of loss resulting from people, inadequate or failed internal processes and systems, or from external events. Operational resilience is the ability of a FRFI to deliver critical operations through disruption. This ability is enabled by the FRFI identifying and protecting itself from threats and potential failures, responding and adapting to, as well as recovering and learning from disruptive events in order to minimize their impact on the delivery of critical operations through disruption."
  },
  {
    "title": "Governance and Oversight",
    "content": "Effective governance and oversight are essential components of operational risk management. FRFIs should establish clear lines of accountability, appropriate segregation of duties, and comprehensive risk reporting mechanisms to ensure proper management of operational risks."
  }
]'),
('ISO 22301', 'ISO-22301', '[
  {
    "title": "Overview",
    "content": "ISO 22301 is the international standard for Business Continuity Management Systems (BCMS). It provides a framework to plan, establish, implement, operate, monitor, review, maintain and continually improve a business continuity management system."
  },
  {
    "title": "Business Impact Analysis",
    "content": "Business Impact Analysis (BIA) is the process of analyzing the impact over time of a disruption on the organization. It helps identify time-critical functions, their recovery priorities, and resource requirements."
  },
  {
    "title": "Plan-Do-Check-Act Model",
    "content": "ISO 22301 follows the Plan-Do-Check-Act (PDCA) model, which is a four-step management method used for the control and continuous improvement of processes and products. This ensures that the BCMS is not a one-time project but a continuous cycle of improvement."
  }
]'),
('OSFI B-10 Guidelines', 'OSFI', '[
  {
    "title": "Third-Party Risk Management",
    "content": "OSFI B-10 provides guidance on managing the risks associated with third-party arrangements. It requires FRFIs to establish robust risk management policies and procedures for third-party relationships."
  },
  {
    "title": "Due Diligence Requirements",
    "content": "The guideline requires FRFIs to conduct thorough due diligence before entering into arrangements with third parties. This includes assessing the third partys financial stability, expertise, reputation, and compliance with applicable laws and regulations."
  },
  {
    "title": "Contract Management",
    "content": "B-10 emphasizes the importance of having well-drafted contracts that clearly define the rights, responsibilities, and expectations of all parties involved in third-party arrangements, including specific provisions for performance measurement, confidentiality, and termination."
  }
]');
