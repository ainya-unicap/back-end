const formularioExample = {
    id: "f1f1f1f1-2222-3333-4444-555555555555",
    list_id: "99999999-aaaa-bbbb-cccc-dddddddddddd",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    type: "SEMANAL",
    started_at: "2026-05-29T11:30:00.000Z",
    ended_at: "2026-05-29T11:45:00.000Z",
    observations: "Plantas com bom desenvolvimento.",
    synced: true,
    createdAt: "2026-05-29T11:30:00.000Z",
    updatedAt: "2026-05-29T11:45:00.000Z",
};

const envelope = (data: any, msg: string) => ({ data, error: null, message: msg });

export const formularioPaths = {
    "/formularios": {
        get: {
            tags: ["Formularios"],
            summary: "Formulários do usuário (?user_id=)",
            parameters: [
                { name: "user_id", in: "query", schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: envelope([formularioExample], "Formulários encontrados com sucesso"),
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Formularios"],
            summary: "Criar formulário (user_id vem do JWT)",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/FormularioCreate" },
                        example: {
                            list_id: formularioExample.list_id,
                            type: "SEMANAL",
                            observations: "Plantas com bom desenvolvimento.",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criado",
                    content: {
                        "application/json": {
                            example: envelope(formularioExample, "Formulário criado com sucesso"),
                        },
                    },
                },
                "400": {
                    description: "list_id ou type ausentes",
                    content: {
                        "application/json": {
                            example: envelope(null, "Erro ao criar formulário"),
                        },
                    },
                },
            },
        },
    },
    "/formularios/user/{userId}": {
        get: {
            tags: ["Formularios"],
            summary: "Formulários de um aluno",
            parameters: [
                { name: "userId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: envelope([formularioExample], "Formulários encontrados com sucesso"),
                        },
                    },
                },
            },
        },
    },
    "/formularios/{id}": {
        get: {
            tags: ["Formularios"],
            summary: "Formulário por id (com checklist, measurements, photos)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Formulário",
                    content: {
                        "application/json": {
                            example: envelope(
                                {
                                    ...formularioExample,
                                    checklists: [],
                                    measurements: [],
                                    photos: [],
                                },
                                "Formulário encontrado com sucesso"
                            ),
                        },
                    },
                },
                "404": {
                    description: "Não encontrado",
                    content: {
                        "application/json": {
                            example: envelope(null, "Erro ao buscar formulário"),
                        },
                    },
                },
            },
        },
        put: {
            tags: ["Formularios"],
            summary: "Atualizar formulário",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { type: "object" },
                        example: { observations: "Atualizando observações." },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Atualizado",
                    content: {
                        "application/json": {
                            example: envelope(formularioExample, "Formulário atualizado com sucesso"),
                        },
                    },
                },
            },
        },
    },
    "/formularios/{id}/checklist": {
        get: {
            tags: ["Formularios"],
            summary: "Checklist do formulário",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Itens",
                    content: {
                        "application/json": {
                            example: [
                                {
                                    id: "c1c1c1c1-1111-2222-3333-444444444444",
                                    form_id: formularioExample.id,
                                    template_id: "t1t1t1t1-1111-2222-3333-444444444444",
                                    checked: true,
                                    template: {
                                        id: "t1t1t1t1-1111-2222-3333-444444444444",
                                        field_name: "Irrigação realizada",
                                        unit: null,
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Formularios"],
            summary: "Criar checklist em lote (template_ids)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                template_ids: { type: "array", items: { type: "string" } },
                            },
                        },
                        example: {
                            template_ids: [
                                "t1t1t1t1-1111-2222-3333-444444444444",
                                "t2t2t2t2-1111-2222-3333-444444444444",
                            ],
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criado",
                    content: { "application/json": { example: { count: 2 } } },
                },
            },
        },
    },
    "/formularios/{id}/measurements": {
        get: {
            tags: ["Formularios"],
            summary: "Medições do formulário",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Itens",
                    content: {
                        "application/json": {
                            example: [
                                {
                                    id: "m1m1m1m1-1111-2222-3333-444444444444",
                                    form_id: formularioExample.id,
                                    template_id: "t3t3t3t3-1111-2222-3333-444444444444",
                                    value: 42.5,
                                    template: {
                                        id: "t3t3t3t3-1111-2222-3333-444444444444",
                                        field_name: "Altura da planta",
                                        unit: "cm",
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Formularios"],
            summary: "Criar medições em lote",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                measurements: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            template_id: { type: "string" },
                                            value: { type: "number" },
                                        },
                                    },
                                },
                            },
                        },
                        example: {
                            measurements: [
                                { template_id: "t3t3t3t3-1111-2222-3333-444444444444", value: 42.5 },
                                { template_id: "t4t4t4t4-1111-2222-3333-444444444444", value: 8 },
                            ],
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criado",
                    content: { "application/json": { example: { count: 2 } } },
                },
            },
        },
    },
    "/formularios/{id}/photos": {
        get: {
            tags: ["Formularios"],
            summary: "Fotos do formulário",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: [
                                {
                                    id: "p1p1p1p1-1111-2222-3333-444444444444",
                                    form_id: formularioExample.id,
                                    url: "https://xyz.public.blob.vercel-storage.com/photos/foto.jpg",
                                    takenAt: "2026-05-29T11:40:00.000Z",
                                    updatedAt: "2026-05-29T11:40:00.000Z",
                                },
                            ],
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Formularios"],
            summary: "Upload de foto",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            properties: { photo: { type: "string", format: "binary" } },
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Enviada",
                    content: {
                        "application/json": {
                            example: envelope(
                                {
                                    id: "p1p1p1p1-1111-2222-3333-444444444444",
                                    form_id: formularioExample.id,
                                    url: "https://xyz.public.blob.vercel-storage.com/photos/foto.jpg",
                                },
                                "Foto enviada com sucesso"
                            ),
                        },
                    },
                },
            },
        },
    },
    "/formularios/{id}/finalizar": {
        post: {
            tags: ["Formularios"],
            summary: "Finalizar formulário",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Finalizado",
                    content: {
                        "application/json": {
                            example: envelope(
                                { ...formularioExample, synced: true, ended_at: "2026-05-29T12:00:00.000Z" },
                                "Formulário finalizado com sucesso"
                            ),
                        },
                    },
                },
            },
        },
    },
    "/formularios/{id}/sync": {
        post: {
            tags: ["Formularios"],
            summary: "Sincronizar dados offline (formulario + checklist + measurements + photos)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { type: "object" },
                        example: {
                            formulario: { observations: "Sincronizado offline." },
                            checklist: [{ template_id: "t1t1t1t1-1111-2222-3333-444444444444", checked: true }],
                            measurements: [{ template_id: "t3t3t3t3-1111-2222-3333-444444444444", value: 42.5 }],
                            photos: [{ url: "https://xyz.public.blob.vercel-storage.com/photos/foto.jpg" }],
                        },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Sincronizado",
                    content: {
                        "application/json": {
                            example: envelope(formularioExample, "Formulário sincronizado com sucesso"),
                        },
                    },
                },
            },
        },
    },
};
