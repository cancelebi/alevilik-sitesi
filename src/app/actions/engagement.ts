'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Beğenmek için giriş yapmalısınız.' };
  }

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single();

  if (existingLike) {
    // Remove like
    await supabase.from('likes').delete().eq('id', existingLike.id);
  } else {
    // Add like
    await supabase.from('likes').insert({ user_id: user.id, post_id: postId });
  }

  revalidatePath('/');
  revalidatePath('/yazi/[slug]', 'page');
  return { success: true };
}

export async function toggleBookmark(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Kaydetmek için giriş yapmalısınız.' };
  }

  // Check if already bookmarked
  const { data: existingBookmark } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single();

  if (existingBookmark) {
    // Remove bookmark
    await supabase.from('bookmarks').delete().eq('id', existingBookmark.id);
  } else {
    // Add bookmark
    await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId });
  }

  revalidatePath('/profil');
  revalidatePath('/yazi/[slug]', 'page');
  return { success: true };
}
