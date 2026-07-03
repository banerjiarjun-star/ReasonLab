import { supabase } from './supabase';

export async function getExperimentStats() {
  // This queries the 'experiment_summary' view we created in Phase 3
  const { data, error } = await supabase
    .from('experiment_summary')
    .select('*');

  if (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
  return data;
}