require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase URL and Anon Key must be provided in .env file');
    process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Setting up Supabase tables...');

const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL file
const sqlFilePath = path.join(__dirname, 'setup-supabase.sql');
const sqlQueries = fs.readFileSync(sqlFilePath, 'utf8');

// Split SQL file into individual queries
const queries = sqlQueries
    .split(';')
    .filter(query => query.trim() !== '')
    .map(query => query.trim() + ';');

async function executeQueries() {
    console.log('Starting Supabase setup...');

    for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        try {
            console.log(`Executing query ${i + 1}/${queries.length}...`);
            const { error } = await supabase.rpc('pgql', { query });

            if (error) {
                console.error(`Error executing query ${i + 1}:`, error);
            } else {
                console.log(`Query ${i + 1} executed successfully.`);
            }
        } catch (err) {
            console.error(`Exception executing query ${i + 1}:`, err.message);
        }
    }

    console.log('Supabase setup completed.');
}

executeQueries().catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
}); 