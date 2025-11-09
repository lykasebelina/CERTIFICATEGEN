/*
  # Create Brand Presets Table

  ## Overview
  This migration creates the infrastructure for the BrandKit module, allowing users to create
  and manage branding presets for certificate generation.

  ## New Tables
  
  ### `brand_presets`
  Stores branding preset configurations including logos, colors, signatories, and headers.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for the preset
  - `user_id` (uuid) - Reference to the user who created the preset
  - `name` (text) - Name of the preset (e.g., "PUP Main", "IBITS Org")
  - `description` (text, nullable) - Optional description of the preset
  - `is_default` (boolean) - Whether this is the user's default preset
  - `created_at` (timestamptz) - When the preset was created
  - `updated_at` (timestamptz) - When the preset was last updated
  
  **Logo Configuration:**
  - `logo_url` (text, nullable) - URL to the uploaded logo image
  - `logo_alignment` (text) - Logo alignment: 'left', 'center', or 'right'
  - `logo_scale` (numeric) - Logo scale factor (0.5 to 2.0)
  
  **Color Theme:**
  - `color_primary` (text) - Primary color (hex code)
  - `color_secondary` (text) - Secondary color (hex code)
  - `color_background` (text) - Background color (hex code)
  - `color_text` (text) - Text color (hex code)
  
  **Signatory Information:**
  - `signatory_name` (text) - Name of the signatory
  - `signatory_position` (text) - Position/title of the signatory
  - `signatory_signature_url` (text, nullable) - URL to signature image
  - `signatory_visible` (boolean) - Whether signature should be visible by default
  
  **Header Information:**
  - `header_institution_name` (text) - Institution/organization name
  - `header_department_name` (text, nullable) - Department/college name
  - `header_address` (text, nullable) - Address line
  - `header_motto` (text, nullable) - Motto or slogan
  - `header_alignment` (text) - Header text alignment
  - `header_font_family` (text) - Font family for header
  - `header_font_size` (integer) - Font size in pixels

  ## Security
  
  1. Row Level Security (RLS) is enabled on the table
  2. Users can only read their own presets
  3. Users can only create presets associated with their user ID
  4. Users can only update their own presets
  5. Users can only delete their own presets

  ## Storage
  
  Creates storage buckets for logos and signatures with appropriate security policies.

  ## Important Notes
  
  - Only one preset can be set as default per user
  - All color values should be valid hex codes
  - Logo and signature URLs point to Supabase Storage
  - Font sizes range from 16 to 48 pixels
  - Alignment values are restricted to: 'left', 'center', 'right'
*/

-- Create the brand_presets table
CREATE TABLE IF NOT EXISTS brand_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Logo configuration
  logo_url text,
  logo_alignment text DEFAULT 'center' CHECK (logo_alignment IN ('left', 'center', 'right')),
  logo_scale numeric DEFAULT 1.0 CHECK (logo_scale >= 0.5 AND logo_scale <= 2.0),
  
  -- Color theme
  color_primary text NOT NULL,
  color_secondary text NOT NULL,
  color_background text DEFAULT '#1E293B',
  color_text text NOT NULL,
  
  -- Signatory information
  signatory_name text NOT NULL,
  signatory_position text NOT NULL,
  signatory_signature_url text,
  signatory_visible boolean DEFAULT false,
  
  -- Header information
  header_institution_name text NOT NULL,
  header_department_name text,
  header_address text,
  header_motto text,
  header_alignment text DEFAULT 'center' CHECK (header_alignment IN ('left', 'center', 'right')),
  header_font_family text DEFAULT 'serif',
  header_font_size integer DEFAULT 24 CHECK (header_font_size >= 16 AND header_font_size <= 48)
);

-- Enable Row Level Security
ALTER TABLE brand_presets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own presets
CREATE POLICY "Users can view own brand presets"
  ON brand_presets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can create their own presets
CREATE POLICY "Users can create own brand presets"
  ON brand_presets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own presets
CREATE POLICY "Users can update own brand presets"
  ON brand_presets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own presets
CREATE POLICY "Users can delete own brand presets"
  ON brand_presets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create an index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_brand_presets_user_id ON brand_presets(user_id);

-- Create an index for finding default presets
CREATE INDEX IF NOT EXISTS idx_brand_presets_user_default ON brand_presets(user_id, is_default) WHERE is_default = true;

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-signatures', 'brand-signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Users can upload their own logos
CREATE POLICY "Users can upload own logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brand-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: Anyone can view logos
CREATE POLICY "Anyone can view logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'brand-logos');

-- Storage policy: Users can update their own logos
CREATE POLICY "Users can update own logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'brand-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: Users can delete their own logos
CREATE POLICY "Users can delete own logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brand-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: Users can upload their own signatures
CREATE POLICY "Users can upload own signatures"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brand-signatures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: Anyone can view signatures
CREATE POLICY "Anyone can view signatures"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'brand-signatures');

-- Storage policy: Users can update their own signatures
CREATE POLICY "Users can update own signatures"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'brand-signatures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: Users can delete their own signatures
CREATE POLICY "Users can delete own signatures"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brand-signatures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brand_preset_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before updates
CREATE TRIGGER set_brand_preset_updated_at
  BEFORE UPDATE ON brand_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_preset_updated_at();

-- Function to ensure only one default preset per user
CREATE OR REPLACE FUNCTION ensure_single_default_preset()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE brand_presets
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure single default preset
CREATE TRIGGER ensure_one_default_preset
  BEFORE INSERT OR UPDATE ON brand_presets
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_preset();
