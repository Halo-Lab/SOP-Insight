// seedSupabase.js
import { createClient } from '@supabase/supabase-js';
import { roles, sops } from './seedData.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  // 1. Insert roles
  const { data: insertedRoles, error: roleError } = await supabase
    .from('roles')
    .insert(roles)
    .select();

  if (roleError) throw roleError;

  // 2. Map role names to ids
  const roleNameToId = {};
  insertedRoles?.forEach((role) => {
    roleNameToId[role.name] = role.id;
  });

  // 3. Insert SOPs with role_id
  const sopsWithRoleId = sops.map((sop) => ({
    role_id: roleNameToId[sop.role_name],
    name: sop.name,
    goal: sop.goal,
    content: sop.content
  }));

  const { error: sopError } = await supabase.from('default_sops').insert(sopsWithRoleId);
  if (sopError) throw sopError;

  console.log('Seed completed!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});