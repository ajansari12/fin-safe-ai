-- Add control_type column to controls table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'controls' AND column_name = 'control_type') THEN
    ALTER TABLE public.controls ADD COLUMN control_type TEXT;
    RAISE NOTICE 'Added control_type column to controls table';
  ELSE
    RAISE NOTICE 'control_type column already exists in controls table';
  END IF;
END $$;