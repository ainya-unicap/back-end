const photoExample = {
    id: "p1p1p1p1-1111-2222-3333-444444444444",
    form_id: "f1f1f1f1-2222-3333-4444-555555555555",
    url: "https://xyz.public.blob.vercel-storage.com/photos/1748520000-foto.jpg",
    takenAt: "2026-05-29T11:40:00.000Z",
    updatedAt: "2026-05-29T11:40:00.000Z",
};

const envelope = (data: any, msg: string) => ({ data, error: null, message: msg });

export const photoPaths = {
    "/photos": {
        post: {
            tags: ["Photos"],
            summary: "Registrar foto por URL (sem upload)",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["form_id", "url"],
                            properties: {
                                form_id: { type: "string" },
                                url: { type: "string" },
                            },
                        },
                        example: {
                            form_id: photoExample.form_id,
                            url: photoExample.url,
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criada",
                    content: {
                        "application/json": {
                            example: envelope(photoExample, "Foto criada com sucesso"),
                        },
                    },
                },
            },
        },
    },
    "/photos/upload": {
        post: {
            tags: ["Photos"],
            summary: "Upload de arquivo (multipart) — vai pro Vercel Blob em prod",
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            properties: {
                                photo: { type: "string", format: "binary" },
                            },
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Enviada",
                    content: {
                        "application/json": {
                            example: envelope(photoExample, "Foto enviada com sucesso"),
                        },
                    },
                },
                "400": {
                    description: "Arquivo ausente ou tipo inválido",
                    content: {
                        "application/json": {
                            example: envelope(null, "Erro ao enviar foto"),
                        },
                    },
                },
            },
        },
    },
    "/photos/formulario/{formularioId}": {
        get: {
            tags: ["Photos"],
            summary: "Fotos do formulário",
            parameters: [
                { name: "formularioId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: envelope([photoExample], "Fotos encontradas com sucesso"),
                        },
                    },
                },
            },
        },
    },
    "/photos/{id}": {
        delete: {
            tags: ["Photos"],
            summary: "Remover foto (apaga do Blob/disco também)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Removida",
                    content: {
                        "application/json": {
                            example: envelope(photoExample, "Foto removida com sucesso"),
                        },
                    },
                },
                "404": {
                    description: "Foto não encontrada",
                    content: {
                        "application/json": {
                            example: envelope(null, "Erro ao remover foto"),
                        },
                    },
                },
            },
        },
    },
};
