'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateEmail(newEmail: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Oturum açık değil.' };
  }

  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) {
    return { error: 'E-posta güncellenirken bir hata oluştu: ' + error.message };
  }

  return { success: true, message: 'E-posta adresinize bir onay linki gönderildi. Lütfen yeni e-postanızı onaylayın.' };
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Oturum açık değil.' };
  }

  if (newPassword.length < 6) {
    return { error: 'Şifre en az 6 karakter olmalıdır.' };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: 'Şifre güncellenirken bir hata oluştu: ' + error.message };
  }

  return { success: true, message: 'Şifreniz başarıyla güncellendi!' };
}
