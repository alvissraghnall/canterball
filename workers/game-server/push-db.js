import { createClient } from '@libsql/client';
import fs from 'fs';

async function push() {
  const url = "libsql://ball-alvissraghnall.aws-eu-west-1.turso.io";
  const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MTI4NTI0NzQsImlhdCI6MTc4MTMxNjQ3NCwiaWQiOiIwMTllYmViYi0wNTAxLTc2ZDAtYWJiMy1lYzJlNzRiOTc5YTEiLCJyaWQiOiI0YTQ1NzAxYS01ZWJjLTQ0NzQtYjkwMy00ZTZhYWEzNGFmYmUifQ.mon9fOiKUfJDU_6nw1vzUdISROqjaeq-6xLGjzis_7fD0WMLUJbXEo75vcbUMAUTQWeRj32WImdsppbOnUCyAw";

  const client = createClient({ url, authToken });
  const sql = fs.readFileSync('drizzle/0000_futuristic_nightmare.sql', 'utf8');

  // Split by semicolon and filter empty lines
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

  console.log(`Executing ${statements.length} statements...`);

  for (const statement of statements) {
    try {
      await client.execute(statement);
      console.log(`Executed: ${statement.substring(0, 50)}...`);
    } catch (e) {
      console.error(`Error executing: ${statement.substring(0, 50)}...`);
      console.error(e);
    }
  }
}

push();
