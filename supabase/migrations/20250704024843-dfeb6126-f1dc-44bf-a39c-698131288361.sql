-- Create custom_dashboards table
CREATE TABLE public.custom_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  created_by UUID NOT NULL,
  created_by_name TEXT,
  name TEXT NOT NULL,
  description TEXT,
  layout_config JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  shared_with JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard_widgets table
CREATE TABLE public.dashboard_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES public.custom_dashboards(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL, -- 'kri_chart', 'incident_trends', 'vendor_risk', 'compliance_score', etc.
  widget_config JSONB NOT NULL DEFAULT '{}',
  position_config JSONB NOT NULL DEFAULT '{}', -- x, y, w, h for grid layout
  filters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for custom_dashboards
CREATE POLICY "Users can view their org's dashboards"
  ON public.custom_dashboards
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = custom_dashboards.org_id
  ));

CREATE POLICY "Users can create dashboards for their org"
  ON public.custom_dashboards
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = custom_dashboards.org_id
    AND custom_dashboards.created_by = auth.uid()
  ));

CREATE POLICY "Users can update their own dashboards"
  ON public.custom_dashboards
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own dashboards"
  ON public.custom_dashboards
  FOR DELETE
  USING (created_by = auth.uid());

-- Create RLS policies for dashboard_widgets
CREATE POLICY "Users can view widgets for accessible dashboards"
  ON public.dashboard_widgets
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.custom_dashboards cd
    JOIN public.profiles p ON p.organization_id = cd.org_id
    WHERE cd.id = dashboard_widgets.dashboard_id
    AND p.id = auth.uid()
  ));

CREATE POLICY "Users can manage widgets for their dashboards"
  ON public.dashboard_widgets
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.custom_dashboards cd
    WHERE cd.id = dashboard_widgets.dashboard_id
    AND cd.created_by = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_custom_dashboards_org_id ON public.custom_dashboards(org_id);
CREATE INDEX idx_custom_dashboards_created_by ON public.custom_dashboards(created_by);
CREATE INDEX idx_dashboard_widgets_dashboard_id ON public.dashboard_widgets(dashboard_id);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_dashboards_timestamp
  BEFORE UPDATE ON public.custom_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_timestamp
  BEFORE UPDATE ON public.dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();