const listaExample = {
    id: "99999999-aaaa-bbbb-cccc-dddddddddddd",
    canteiro_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    plant_id: "ffffffff-1111-2222-3333-444444444444",
    created_by: "550e8400-e29b-41d4-a716-446655440000",
    name: "Semana 1",
    createdAt: "2026-05-29T11:00:00.000Z",
    updatedAt: "2026-05-29T11:00:00.000Z",
    plant: {
        id: "ffffffff-1111-2222-3333-444444444444",
        name: "Brachiaria brizantha",
        category: "GRAMINEA_PORTE_ALTO",
    },
};

export const listaPaths = {
    "/listas-formularios": {
        post: {
            tags: ["ListasFormularios"],
            summary: "Criar lista (created_by vem do JWT; plant_id derivado do canteiro)",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/ListaCreate" },
                        example: {
                            canteiro_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
                            name: "Semana 1",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criada",
                    content: { "application/json": { example: listaExample } },
                },
                "403": {
                    description: "Usuário não vinculado ao canteiro",
                    content: {
                        "application/json": {
                            example: { error: "Usuário não está vinculado ao canteiro informado" },
                        },
                    },
                },
                "404": {
                    description: "Canteiro não encontrado",
                    content: {
                        "application/json": {
                            example: { error: "Canteiro não encontrado" },
                        },
                    },
                },
            },
        },
    },
    "/listas-formularios/canteiro/{canteiroId}": {
        get: {
            tags: ["ListasFormularios"],
            summary: "Listas de um canteiro",
            parameters: [
                { name: "canteiroId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: [{ ...listaExample, _count: { formularios: 2 } }],
                        },
                    },
                },
            },
        },
    },
    "/listas-formularios/{listaId}": {
        get: {
            tags: ["ListasFormularios"],
            summary: "Lista por id (com formulários)",
            parameters: [
                { name: "listaId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: {
                                ...listaExample,
                                formularios: [
                                    {
                                        id: "f1f1f1f1-2222-3333-4444-555555555555",
                                        type: "SEMANAL",
                                        synced: true,
                                        started_at: "2026-05-29T11:30:00.000Z",
                                        ended_at: "2026-05-29T11:45:00.000Z",
                                        createdAt: "2026-05-29T11:30:00.000Z",
                                    },
                                ],
                            },
                        },
                    },
                },
                "404": {
                    description: "Lista não encontrada",
                    content: {
                        "application/json": {
                            example: { error: "Lista de formulários não encontrada" },
                        },
                    },
                },
            },
        },
    },
    "/listas-formularios/{id}/formularios": {
        get: {
            tags: ["ListasFormularios"],
            summary: "Formulários da lista (cronológico)",
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
                                    id: "f1f1f1f1-2222-3333-4444-555555555555",
                                    list_id: listaExample.id,
                                    user_id: listaExample.created_by,
                                    type: "SEMANAL",
                                    started_at: "2026-05-29T11:30:00.000Z",
                                    ended_at: "2026-05-29T11:45:00.000Z",
                                    observations: "Sem ocorrências.",
                                    synced: true,
                                    createdAt: "2026-05-29T11:30:00.000Z",
                                    updatedAt: "2026-05-29T11:45:00.000Z",
                                },
                            ],
                        },
                    },
                },
            },
        },
    },
};
