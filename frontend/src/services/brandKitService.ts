import { supabase } from '../lib/supabase';
import { BrandPreset, BrandPresetFormData } from '../types/brandkit';

const uploadFile = async (file: File, bucket: string, userId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

export const createBrandPreset = async (
  userId: string,
  formData: BrandPresetFormData
): Promise<BrandPreset> => {
  let logoUrl: string | null = null;
  let signatureUrl: string | null = null;

  if (formData.logoFile) {
    logoUrl = await uploadFile(formData.logoFile, 'brand-logos', userId);
  }

  if (formData.signatureFile) {
    signatureUrl = await uploadFile(formData.signatureFile, 'brand-signatures', userId);
  }

  const presetData = {
    user_id: userId,
    name: formData.name,
    description: formData.description || null,
    is_default: false,
    logo_url: logoUrl,
    logo_alignment: formData.logoAlignment,
    logo_scale: formData.logoScale,
    color_primary: formData.primaryColor,
    color_secondary: formData.secondaryColor,
    color_background: formData.backgroundColor,
    color_text: formData.textColor,
    signatory_name: formData.signatoryName,
    signatory_position: formData.signatoryPosition,
    signatory_signature_url: signatureUrl,
    signatory_visible: formData.signatoryVisible,
    header_institution_name: formData.institutionName,
    header_department_name: formData.departmentName || null,
    header_address: formData.address || null,
    header_motto: formData.motto || null,
    header_alignment: formData.headerAlignment,
    header_font_family: formData.headerFontFamily,
    header_font_size: formData.headerFontSize,
  };

  const { data, error } = await supabase
    .from('brand_presets')
    .insert(presetData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create preset: ${error.message}`);
  }

  return mapDatabaseToPreset(data);
};

export const updateBrandPreset = async (
  presetId: string,
  userId: string,
  formData: BrandPresetFormData,
  existingPreset: BrandPreset
): Promise<BrandPreset> => {
  let logoUrl = existingPreset.logo?.url || null;
  let signatureUrl = existingPreset.signatory.signatureUrl || null;

  if (formData.logoFile) {
    logoUrl = await uploadFile(formData.logoFile, 'brand-logos', userId);
  }

  if (formData.signatureFile) {
    signatureUrl = await uploadFile(formData.signatureFile, 'brand-signatures', userId);
  }

  const presetData = {
    name: formData.name,
    description: formData.description || null,
    logo_url: logoUrl,
    logo_alignment: formData.logoAlignment,
    logo_scale: formData.logoScale,
    color_primary: formData.primaryColor,
    color_secondary: formData.secondaryColor,
    color_background: formData.backgroundColor,
    color_text: formData.textColor,
    signatory_name: formData.signatoryName,
    signatory_position: formData.signatoryPosition,
    signatory_signature_url: signatureUrl,
    signatory_visible: formData.signatoryVisible,
    header_institution_name: formData.institutionName,
    header_department_name: formData.departmentName || null,
    header_address: formData.address || null,
    header_motto: formData.motto || null,
    header_alignment: formData.headerAlignment,
    header_font_family: formData.headerFontFamily,
    header_font_size: formData.headerFontSize,
  };

  const { data, error } = await supabase
    .from('brand_presets')
    .update(presetData)
    .eq('id', presetId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update preset: ${error.message}`);
  }

  return mapDatabaseToPreset(data);
};

export const getBrandPresets = async (userId: string): Promise<BrandPreset[]> => {
  const { data, error } = await supabase
    .from('brand_presets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch presets: ${error.message}`);
  }

  return data.map(mapDatabaseToPreset);
};

export const getBrandPreset = async (presetId: string): Promise<BrandPreset | null> => {
  const { data, error } = await supabase
    .from('brand_presets')
    .select('*')
    .eq('id', presetId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch preset: ${error.message}`);
  }

  return data ? mapDatabaseToPreset(data) : null;
};

export const deleteBrandPreset = async (presetId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('brand_presets')
    .delete()
    .eq('id', presetId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete preset: ${error.message}`);
  }
};

export const setDefaultPreset = async (userId: string, presetId: string): Promise<void> => {
  const { error } = await supabase
    .from('brand_presets')
    .update({ is_default: true })
    .eq('id', presetId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to set default preset: ${error.message}`);
  }
};

export const getDefaultPreset = async (userId: string): Promise<BrandPreset | null> => {
  const { data, error } = await supabase
    .from('brand_presets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch default preset: ${error.message}`);
  }

  return data ? mapDatabaseToPreset(data) : null;
};

function mapDatabaseToPreset(data: any): BrandPreset {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    isDefault: data.is_default,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    userId: data.user_id,
    logo: data.logo_url
      ? {
          url: data.logo_url,
          alignment: data.logo_alignment,
          scale: data.logo_scale,
        }
      : undefined,
    colors: {
      primary: data.color_primary,
      secondary: data.color_secondary,
      background: data.color_background,
      text: data.color_text,
    },
    signatory: {
      name: data.signatory_name,
      position: data.signatory_position,
      signatureUrl: data.signatory_signature_url,
      visible: data.signatory_visible,
    },
    header: {
      institutionName: data.header_institution_name,
      departmentName: data.header_department_name,
      address: data.header_address,
      motto: data.header_motto,
      alignment: data.header_alignment,
      fontFamily: data.header_font_family,
      fontSize: data.header_font_size,
    },
  };
}
