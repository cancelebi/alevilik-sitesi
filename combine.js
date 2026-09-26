const fs = require('fs');

const files = [
  'supabase/schema.sql',
  'supabase/audio_schema.sql',
  'supabase/likes_bookmarks.sql',
  'supabase/dedeler_kategori.sql',
  'supabase/fix_rls.sql',
  'supabase/audio_schema_update.sql'
];

let combined = '';
for (const file of files) {
  combined += fs.readFileSync(file, 'utf8') + '\n\n';
}

fs.writeFileSync('schema_migration.sql', combined, 'utf8');
console.log('Done!');
