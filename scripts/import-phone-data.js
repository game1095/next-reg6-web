const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load env vars
const envLocalPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envLocalPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase URL or Key is missing in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_FILE = path.resolve(__dirname, '../เบอร์โทรฯภายใน ปณท 2568 - ชีต2.csv');

async function importData() {
    try {
        const fileContent = fs.readFileSync(CSV_FILE, 'utf8');
        const lines = fileContent.split(/\r?\n/);

        // Skip header and empty lines
        const dataToInsert = [];
        const headers = lines[0].split(',');

        console.log(`Found ${lines.length} lines. Processing...`);

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Handle CSV parsing (simple split by comma, assuming no commas in values based on sample)
            // If values have commas, we need a better regex or library. Sample looks safe.
            const cols = line.split(',');

            if (cols.length < 5) continue;

            const record = {
                office_name: cols[0]?.trim() || '',
                zip_code: cols[1]?.trim() || '',
                title: cols[2]?.trim() || '',
                phone: cols[3]?.trim() || '',
                dept: cols[4]?.trim() || ''
            };
            dataToInsert.push(record);
        }

        console.log(`Parsed ${dataToInsert.length} records. Uploading to Supabase...`);

        // Insert in chunks to avoid hitting payload limits
        const CHUNK_SIZE = 100;
        for (let i = 0; i < dataToInsert.length; i += CHUNK_SIZE) {
            const chunk = dataToInsert.slice(i, i + CHUNK_SIZE);
            const { error } = await supabase
                .from('phone_numbers')
                .insert(chunk);

            if (error) {
                console.error('Error inserting chunk:', error);
            } else {
                console.log(`Inserted records ${i + 1} to ${Math.min(i + CHUNK_SIZE, dataToInsert.length)}`);
            }
        }

        console.log('Import completed!');

    } catch (err) {
        console.error('Import failed:', err);
    }
}

importData();
