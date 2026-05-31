export const institutionPaths = {
    "/institutions": {
        get: {
            tags: ["Institutions"],
            summary: "Listar instituições (público, usado na tela de cadastro)",
            security: [],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: [
                                {
                                    id: "11111111-2222-3333-4444-555555555555",
                                    name: "Universidade Católica de Pernambuco",
                                    createdAt: "2026-04-22T08:00:00.000Z",
                                    updatedAt: "2026-04-22T08:00:00.000Z",
                                },
                            ],
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Institutions"],
            summary: "Criar instituição",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name"],
                            properties: { name: { type: "string" } },
                        },
                        example: { name: "Faculdade São Miguel" },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criada",
                    content: {
                        "application/json": {
                            example: {
                                id: "22222222-3333-4444-5555-666666666666",
                                name: "Faculdade São Miguel",
                                createdAt: "2026-05-29T12:00:00.000Z",
                                updatedAt: "2026-05-29T12:00:00.000Z",
                            },
                        },
                    },
                },
            },
        },
    },
};
