// src/utils/templateSaver.ts

import { supabase } from "../lib/supabaseClient";

/**
 * Helper: Uploads a blob URL to Supabase.
 * 🟢 FIX: Skips upload if it's already a remote HTTP/HTTPS URL.
 */
const uploadAssetToSupabase = async (blobOrDataUrl: string | undefined, folder: string): Promise<string | undefined> => {
  if (!blobOrDataUrl) return undefined;

  // 👇 ADD THIS CHECK: If it's already a web URL, don't touch it.
  if (blobOrDataUrl.startsWith('http') || blobOrDataUrl.startsWith('//')) {
      return blobOrDataUrl;
  }

  try {
    const response = await fetch(blobOrDataUrl);
    const blob = await response.blob();
    // Default to png if type is missing, or infer from blob
    const fileExt = blob.type.split('/')[1] || 'png'; 
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('template-assets')
      .upload(fileName, blob);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('template-assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error(`Error uploading asset to ${folder}:`, error);
    return undefined; // This causes the image to vanish if fetch fails!
  }
};

/**
 * ⭐️ FIX: Define and export the missing utility function.
 * Checks if a template name already exists for the current user.
 */
export const checkTemplateNameExists = async (
    userId: string, 
    templateName: string, 
    excludeId?: string
): Promise<boolean> => {
    try {
        let query = supabase
            .from('templates')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('name', templateName);

        // Exclude the current template ID if in update mode
        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        const { count, error } = await query;

        if (error) throw error;
        
        return (count || 0) > 0;

    } catch (error) {
        console.error("Error checking template name existence:", error);
        // If there's an error (e.g., network issue), assume it doesn't exist to prevent blocking saves, 
        // but it's safer to rethrow or return true to prevent unexpected overwrites. Returning true here to be cautious.
        return true; 
    }
};


export const saveTemplateToDatabase = async (
  currentState: any, 
  userId: string, 
  width: number, 
  height: number,
  templateName: string,
  mode: 'create' | 'update',
  existingId?: string,
  thumbnailDataUrl?: string 
) => {
  
  // 1. Check for Name Duplication
  // ⭐️ THIS LINE NOW WORKS because checkTemplateNameExists is defined above
  const nameExists = await checkTemplateNameExists(userId, templateName, mode === 'update' ? existingId : undefined); 
  if (nameExists) {
      throw new Error("A template with this name already exists. Please choose a different name.");
  }

  // 2. Deep clone state
  const stateToSave = JSON.parse(JSON.stringify(currentState));

  // --- Z-INDEX SANITIZATION (From previous fix) ---
  if (stateToSave.background) stateToSave.background.zIndex = 1;
  if (stateToSave.border) stateToSave.border.zIndex = 2;
  if (stateToSave.innerFrame) stateToSave.innerFrame.zIndex = 3;
  if (stateToSave.cornerFrames) stateToSave.cornerFrames.zIndex = 4;
  if (stateToSave.watermark) stateToSave.watermark.zIndex = 5;
  // ------------------------------------------------

  // 3. Upload Thumbnail
  let thumbnailUrl: string | undefined;
  if (thumbnailDataUrl) {
    thumbnailUrl = await uploadAssetToSupabase(thumbnailDataUrl, 'thumbnails');
  }

  // 4. Upload Single Assets
  const assetTypes = [
      { obj: stateToSave.background, folder: 'backgrounds' },
      { obj: stateToSave.innerFrame, folder: 'frames' },
      { obj: stateToSave.border, folder: 'borders' },
      { obj: stateToSave.cornerFrames, folder: 'corners' },
      { obj: stateToSave.watermark, folder: 'watermarks' }
  ];

  for (const item of assetTypes) {
      if (item.obj?.src) {
          item.obj.src = await uploadAssetToSupabase(item.obj.src, item.folder);
      }
  }

  // 5. Upload Arrays (Logos AND Custom Images)
  const processArray = async (arr: any[], folder: string) => {
      if (!arr) return;
      const promises = arr.map(async (item: any) => {
          if (item.src) {
             const publicUrl = await uploadAssetToSupabase(item.src, folder);
             if (publicUrl) item.src = publicUrl; // Only update if upload succeeded
          }
          
          // Ensure zIndex consistency
          if (!item.zIndex) {
             // Give customImages a different zIndex if needed, or default to 18 (top)
             item.zIndex = folder === 'custom' ? 11 : 18; 
          }
          return item;
      });
      await Promise.all(promises);
  };

  await processArray(stateToSave.logos, 'logos');
  await processArray(stateToSave.customImages, 'custom'); 

  // 6. Save to DB
  const templateData = {
    name: templateName,
    width: width,
    height: height,
    canvas_state: stateToSave,
    thumbnail_url: thumbnailUrl,
  };
  
  let result;
  
  if (mode === 'update' && existingId) {
      result = await supabase
        .from('templates')
        .update({ ...templateData, updated_at: new Date().toISOString() })
        .eq('id', existingId)
        .select();
  } else {
      result = await supabase
        .from('templates')
        .insert([{ user_id: userId, ...templateData }])
        .select();
  }

  if (result.error) throw result.error;
  return result.data[0];
};