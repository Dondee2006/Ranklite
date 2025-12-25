
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const TS_CONFIG_PATH = path.join(process.cwd(), 'tsconfig.json');

// Simple regex to capture imports: import ... from '...' or require('...')
// This is not a full AST parser but catches most static imports
const IMPORT_REGEX = /from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)|import\(['"]([^'"]+)['"]\)/g;

async function checkImports() {
    console.log('Scanning for case-sensitivity issues in imports...');
    const files = await glob('src/**/*.{ts,tsx,js,jsx}', { ignore: 'node_modules/**' });

    let issues = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        let match;
        while ((match = IMPORT_REGEX.exec(content)) !== null) {
            const importPath = match[1] || match[2] || match[3];

            if (importPath.startsWith('.')) {
                // Resolve relative import
                const dir = path.dirname(file);
                const resolvedPath = path.resolve(dir, importPath);

                // Check if file exists (try extensions)
                const extensions = ['.ts', '.tsx', '.js', '.jsx', '.d.ts', '', '/index.ts', '/index.tsx', '/index.js'];
                let found = false;
                let actualParams = null;

                for (const ext of extensions) {
                    const fullPath = resolvedPath + ext;
                    if (fs.existsSync(fullPath)) {
                        // Get the actual file name from valid stats
                        const actualName = getActualFilename(path.dirname(fullPath), path.basename(fullPath));
                        if (actualName) {
                            if (actualName !== path.basename(fullPath)) {
                                console.error(`[CASE MISMATCH] In ${file}: Import "${importPath}" resolves to "${actualName}" but path has casing mismatch.`);
                                issues++;
                            }
                            found = true;
                            break;
                        }
                    }
                }
            }

            // We could also check alias paths (@/...) but let's start with relative
        }
    }

    if (issues === 0) {
        console.log('No case-sensitivity issues found in relative imports.');
    } else {
        console.log(`Found ${issues} case-sensitivity issues.`);
        process.exit(1);
    }
}

function getActualFilename(dir, filename) {
    const files = fs.readdirSync(dir);
    return files.find(f => f.toLowerCase() === filename.toLowerCase());
}

checkImports().catch(console.error);
