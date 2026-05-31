const vinculoExample = {
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    canteiro_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    created_at: "2026-05-29T11:15:00.000Z",
    updated_at: "2026-05-29T11:15:00.000Z",
};

export const userCanteiroPaths = {
    "/user-canteiros": {
        post: {
            tags: ["UserCanteiro"],
            summary: "Vincular usuário autenticado a canteiro",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/UserCanteiroRequest" },
                        example: { canteiro_id: vinculoExample.canteiro_id },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Vínculo criado",
                    content: { "application/json": { example: vinculoExample } },
                },
                "404": {
                    description: "Usuário ou canteiro não encontrado",
                    content: {
                        "application/json": {
                            example: { error: "Canteiro não encontrado" },
                        },
                    },
                },
                "409": {
                    description: "Vínculo já existe",
                    content: {
                        "application/json": {
                            example: { error: "Vínculo já existe" },
                        },
                    },
                },
            },
        },
        delete: {
            tags: ["UserCanteiro"],
            summary: "Remover o próprio vínculo",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/UserCanteiroRequest" },
                        example: { canteiro_id: vinculoExample.canteiro_id },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Removido",
                    content: {
                        "application/json": {
                            example: { message: "Vínculo removido com sucesso" },
                        },
                    },
                },
                "404": {
                    description: "Vínculo não encontrado",
                    content: {
                        "application/json": {
                            example: { error: "Vínculo não encontrado" },
                        },
                    },
                },
            },
        },
    },
    "/user-canteiros/user/{userId}": {
        get: {
            tags: ["UserCanteiro"],
            summary: "Listar canteiros de um usuário",
            parameters: [
                { name: "userId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: [
                                {
                                    ...vinculoExample,
                                    canteiro: {
                                        id: vinculoExample.canteiro_id,
                                        plant_id: "ffffffff-1111-2222-3333-444444444444",
                                        name: "Canteiro 01 - Brachiaria",
                                        plant: {
                                            id: "ffffffff-1111-2222-3333-444444444444",
                                            name: "Brachiaria brizantha",
                                            category: "GRAMINEA_PORTE_ALTO",
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
    },
    "/user-canteiros/canteiro/{canteiroId}": {
        get: {
            tags: ["UserCanteiro"],
            summary: "Listar usuários de um canteiro",
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
                                    ...vinculoExample,
                                    user: {
                                        id: vinculoExample.user_id,
                                        name: "João Silva",
                                        email: "joao@email.com",
                                        role: "aluno",
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
    },
};
