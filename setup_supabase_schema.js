import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres';

const client = new pg.Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupSchema() {
  try {
    console.log('🔌 Menghubungkan ke Supabase PostgreSQL database...');
    await client.connect();
    console.log('✅ Terhubung!');

    const sqlPath = path.join(__dirname, 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⚙️ Menjalankan DDL script supabase_schema.sql untuk membuat 6 tabel...');
    await client.query(sql);
    console.log('🎉 Berhasil membuat seluruh struktur tabel di Supabase!');

  } catch (err) {
    console.error('❌ Gagal menjalankan DDL schema:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupSchema();
