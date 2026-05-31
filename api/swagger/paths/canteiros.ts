const canteiroExample = {
    id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    plant_id: "ffffffff-1111-2222-3333-444444444444",
    name: "Canteiro 01 - Brachiaria",
    createdAt: "2026-05-29T10:30:00.000Z",
    updatedAt: "2026-05-29T10:30:00.000Z",
};

export const canteiroPaths = {
    "/canteiros": {
        get: {
            tags: ["Canteiros"],
            summary: "Canteiros (por user_id na query)",
            parameters: [
                { name: "user_id", in: "query", schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: {
                                data: [
                                    {
                                        ...canteiroExample,
                                        plant: {
                                            id: "ffffffff-1111-2222-3333-444444444444",
                                            name: "Brachiaria brizantha",
                                            category: "GRAMINEA_PORTE_ALTO",
                                        },
                                    },
                                ],
                                error: null,
                                message: "Canteiros encontrados com sucesso",
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Canteiros"],
            summary: "Criar canteiro (vincula automaticamente o usuário autenticado)",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/CanteiroCreate" },
                        example: {
                            plant_id: "ffffffff-1111-2222-3333-444444444444",
                            name: "Canteiro 01 - Brachiaria",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criado",
                    content: { "application/json": { example: canteiroExample } },
                },
                "400": {
                    description: "plant_id ou name ausentes",
                    content: {
                        "application/json": {
                            example: { error: "plant_id e name são obrigatórios" },
                        },
                    },
                },
            },
        },
    },
    "/canteiros/user/{userId}": {
        get: {
            tags: ["Canteiros"],
            summary: "Canteiros de um usuário (via UserCanteiro)",
            parameters: [
                { name: "userId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: [canteiroExample],
                        },
                    },
                },
            },
        },
    },
    "/canteiros/{canteiroId}/listas": {
        get: {
            tags: ["Canteiros"],
            summary: "Listas de formulários de um canteiro",
            parameters: [
                { name: "canteiroId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: [
                                {
                                    id: "99999999-aaaa-bbbb-cccc-dddddddddddd",
                                    canteiro_id: canteiroExample.id,
                                    plant_id: canteiroExample.plant_id,
                                    created_by: "550e8400-e29b-41d4-a716-446655440000",
                                    name: "Semana 1",
                                    createdAt: "2026-05-29T11:00:00.000Z",
                                    updatedAt: "2026-05-29T11:00:00.000Z",
                                    plant: {
                                        id: canteiroExample.plant_id,
                                        name: "Brachiaria brizantha",
                                        category: "GRAMINEA_PORTE_ALTO",
                                    },
                                    _count: { formularios: 2 },
                                },
                            ],
                        },
                    },
                },
            },
        },
    },
};
