import { supabase } from './supabase';

export interface PhotoUploadResult {
  id: string;
  file_path: string;
  file_name: string;
  public_url: string;
  file_size: number;
  mime_type: string;
}

const STORAGE_BUCKET = 'job-photos';

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function uploadPhoto(
  file: File,
  jobId?: string,
  caption?: string
): Promise<PhotoUploadResult> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = jobId
    ? `${userId}/${jobId}/${timestamp}_${cleanFileName}`
    : `${userId}/uploads/${timestamp}_${cleanFileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  const { data: photoData, error: photoError } = await supabase
    .from('photos')
    .insert({
      user_id: userId,
      job_id: jobId,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      caption: caption || null,
    })
    .select()
    .single();

  if (photoError) throw photoError;

  return {
    id: photoData.id,
    file_path: filePath,
    file_name: file.name,
    public_url: publicUrl,
    file_size: file.size,
    mime_type: file.type,
  };
}

export async function uploadMultiplePhotos(
  files: File[],
  jobId?: string
): Promise<PhotoUploadResult[]> {
  const results: PhotoUploadResult[] = [];

  for (const file of files) {
    try {
      const result = await uploadPhoto(file, jobId);
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
    }
  }

  return results;
}

export async function getJobPhotos(jobId: string): Promise<PhotoUploadResult[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(photo => ({
    id: photo.id,
    file_path: photo.file_path,
    file_name: photo.file_name,
    public_url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(photo.file_path).data.publicUrl,
    file_size: photo.file_size || 0,
    mime_type: photo.mime_type || 'image/jpeg',
  }));
}

export async function deletePhoto(photoId: string): Promise<void> {
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('file_path')
    .eq('id', photoId)
    .single();

  if (fetchError) throw fetchError;

  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([photo.file_path]);

  if (storageError) throw storageError;

  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId);

  if (dbError) throw dbError;
}

export async function updatePhotoCaption(
  photoId: string,
  caption: string
): Promise<void> {
  const { error } = await supabase
    .from('photos')
    .update({ caption })
    .eq('id', photoId);

  if (error) throw error;
}

export async function getPhotoUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function getAllUserPhotos(limit = 50): Promise<PhotoUploadResult[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map(photo => ({
    id: photo.id,
    file_path: photo.file_path,
    file_name: photo.file_name,
    public_url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(photo.file_path).data.publicUrl,
    file_size: photo.file_size || 0,
    mime_type: photo.mime_type || 'image/jpeg',
  }));
}

export async function uploadPdfToStorage(
  buffer: Uint8Array,
  proposalId: string
): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const filePath = `proposals/${userId}/${proposalId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('pdf')
    .upload(filePath, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('pdf')
    .getPublicUrl(filePath);

  return publicUrl;
}
