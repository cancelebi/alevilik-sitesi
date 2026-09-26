'use server';

import { createClient } from '@/utils/supabase/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const S3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'Dosya bulunamadı' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Giriş yapmalısınız' };
  }

  // Sadece editör ve adminler resim/dosya yükleyebilsin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin')) {
    return { error: 'Yetkisiz işlem' };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const bucketName = process.env.R2_BUCKET_NAME!;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await S3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );
    
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;
    return { url: publicUrl };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { error: 'Dosya yüklenemedi: ' + error.message };
  }
}
