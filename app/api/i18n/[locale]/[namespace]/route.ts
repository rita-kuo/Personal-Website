import { NextResponse, type NextRequest } from 'next/server';
import { getMessages } from '../../../../../lib/getMessages';

export async function GET(
    request: NextRequest,
    context: {
        params:
            | { locale: string; namespace: string }
            | Promise<{ locale: string; namespace: string }>;
    }
) {
    const params = await (context.params as
        | Promise<{ locale: string; namespace: string }>
        | { locale: string; namespace: string });
    const { locale, namespace } = params;
    const result = await getMessages(locale, namespace);
    return NextResponse.json({
        locale,
        namespace,
        messages: result.messages,
        version: result.version,
    });
}
