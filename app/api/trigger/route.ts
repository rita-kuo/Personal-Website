import prisma from '../../../lib/db';

export async function POST(req: Request) {
    const IOT_INVOKE_SECRET = process.env.IOT_INVOKE_SECRET;
    const provided = req.headers.get('x-invoke-secret');

    if (!IOT_INVOKE_SECRET || provided !== IOT_INVOKE_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let body: any;
    try {
        body = await req.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { detailId, payload } = body ?? {};
    if (!detailId) {
        return new Response(JSON.stringify({ error: 'detailId required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const detail = await prisma.levelDetail.findUnique({
        where: { id: detailId },
    });
    if (!detail) {
        return new Response(JSON.stringify({ error: 'detail not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (detail.actionType === 'IOT') {
        try {
            const res = await fetch(detail.content, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Trigger-Secret': IOT_INVOKE_SECRET,
                },
                body: JSON.stringify(payload ?? {}),
            });

            const text = await res.text();
            let data: any;
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

            return new Response(JSON.stringify({ status: res.status, data }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (err: any) {
            return new Response(
                JSON.stringify({
                    error: 'forward-failed',
                    details: err?.message ?? String(err),
                }),
                { status: 502, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    return new Response(
        JSON.stringify({
            error: 'unsupported actionType',
            actionType: detail.actionType,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
}
