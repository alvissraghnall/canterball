import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .dev.vars which is in the same directory
const envPath = path.resolve(process.cwd(), '.dev.vars');
if (fs.existsSync(envPath)) {
	const envConfig = dotenv.parse(fs.readFileSync(envPath));
	for (const k in envConfig) {
		process.env[k] = envConfig[k];
	}
}

async function push() {
	const url = process.env.TURSO_URL;
	const authToken = process.env.TURSO_AUTH_TOKEN;

	if (!url || !authToken) {
		console.error('Missing TURSO_URL or TURSO_AUTH_TOKEN in environment.');
		process.exit(1);
	}

	const client = createClient({ url, authToken });

	// Find the latest migration file
	const migrationDir = 'drizzle';
	const files = fs
		.readdirSync(migrationDir)
		.filter((f) => f.endsWith('.sql'))
		.sort();
	if (files.length === 0) {
		console.error('No migration files found in drizzle/');
		return;
	}

	const latestMigration = files[files.length - 1];
	console.log(`Pushing migration: ${latestMigration}`);
	const sql = fs.readFileSync(path.join(migrationDir, latestMigration), 'utf8');

	// Split by semicolon and filter empty lines
	const statements = sql
		.split(';')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	console.log(`Executing ${statements.length} statements...`);

	for (const statement of statements) {
		try {
			await client.execute(statement);
			console.log(`Executed: ${statement.substring(0, 50)}...`);
		} catch (e) {
			// Ignore "already exists" errors for manual push
			if (
				e.message &&
				(e.message.includes('already exists') || e.message.includes('already exist'))
			) {
				console.log(`Skipped (already exists): ${statement.substring(0, 50)}...`);
				continue;
			}
			console.error(`Error executing: ${statement.substring(0, 50)}...`);
			console.error(e);
		}
	}
}

push();
