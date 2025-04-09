import { supabase } from '../supabaseClient';

export const fetchComments = async (eventId) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const addComment = async (eventId, content, createdBy) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        event_id: eventId,
        content,
        created_by: createdBy
      }
    ])
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteComment = async (commentId) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
};