import { supabase } from './supabase';

export async function getExperimentStats() {
  const { data, error } = await supabase
    .from('experiment_summary')
    .select('*');

  if (error) {
    console.error('Data Scientist Error:', error);
    return null;
  }
  return data;
}