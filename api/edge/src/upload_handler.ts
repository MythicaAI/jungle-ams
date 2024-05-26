addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    if (request.method === 'POST') {
        const contentType = request.headers.get('Content-Type') || '';
        if (contentType.startsWith('multipart/form-data')) {
            // Parse the form data
            const formData = await request.formData();
            const file = formData.get('file');
            if (file) {
                // Stream the file to R2
                const key = `uploads/${file.name}`;
                const r2Response = await uploadToR2(key, file);

                if (r2Response.ok) {
                    return new Response('File uploaded successfully', { status: 200 });
                } else {
                    return new Response('Failed to upload file', { status: 500 });
                }
            }
        }
        return new Response('Bad Request', { status: 400 });
    } else {
        return new Response('Method Not Allowed', { status: 405 });
    }
}

async function uploadToR2(key, file) {
    const R2_BUCKET_NAME = 'your-r2-bucket-name';
    const R2_ACCESS_KEY_ID = 'your-access-key-id';
    const R2_SECRET_ACCESS_KEY = 'your-secret-access-key';
    const R2_REGION = 'auto'; // Typically 'auto' for R2

    const r2Endpoint = `https://${R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;

    const response = await fetch(r2Endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
            'Content-Length': file.size,
            'Authorization': `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${R2_REGION}/r2/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${R2_SECRET_ACCESS_KEY}`,
            'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
            'x-amz-date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
        },
        body: file.stream()
    });

    return response;
}
