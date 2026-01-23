import fs from 'fs';
import path from 'path';

export async function getMessages(locale: string, namespace = 'common') {
    // Load from public/locales JSON files only (no DB)
    try {
        const normalizedLocale = locale.toLowerCase();
        const file = path.join(
            process.cwd(),
            'public',
            'locales',
            normalizedLocale + '.json'
        );
        if (fs.existsSync(file)) {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            const ns = data[namespace] ?? data;
            return { messages: ns, version: null };
        }
    } catch (e) {
        console.warn('getMessages: file fallback error', e);
    }

    return { messages: {}, version: null };
}
