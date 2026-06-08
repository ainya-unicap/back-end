const institutionExample = {
    id: "11111111-2222-3333-4444-555555555555",
    name: "Universidade Católica de Pernambuco",
    createdAt: "2026-04-22T08:00:00.000Z",
    updatedAt: "2026-04-22T08:00:00.000Z",
};

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
                            example: [institutionExample],
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
                            example: { message: "created successfully" },
                        },
                    },
                },
                "400": {
                    description: "Name ausente",
                    content: {
                        "application/json": {
                            example: { error: "Name is required" },
                        },
                    },
                },
            },
        },
    },
    "/institutions/{id}": {
        get: {
            tags: ["Institutions"],
            summary: "Buscar instituição por id (com contagem de users/turmas)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Instituição",
                    content: {
                        "application/json": {
                            example: {
                                ...institutionExample,
                                _count: { users: 3, turmas: 2 },
                            },
                        },
                    },
                },
                "404": {
                    description: "Não encontrada",
                    content: {
                        "application/json": {
                            example: { error: "Instituição não encontrada" },
                        },
                    },
                },
            },
        },
        put: {
            tags: ["Institutions"],
            summary: "Atualizar instituição",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name"],
                            properties: { name: { type: "string" } },
                        },
                        example: { name: "Universidade Católica de Pernambuco (Unicap)" },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Atualizada",
                    content: {
                        "application/json": {
                            example: {
                                ...institutionExample,
                                name: "Universidade Católica de Pernambuco (Unicap)",
                            },
                        },
                    },
                },
                "400": {
                    description: "Validação",
                    content: {
                        "application/json": {
                            example: { error: "name é obrigatório e deve ter pelo menos 2 caracteres" },
                        },
                    },
                },
                "404": {
                    description: "Não encontrada",
                    content: {
                        "application/json": {
                            example: { error: "Instituição não encontrada" },
                        },
                    },
                },
            },
        },
        delete: {
            tags: ["Institutions"],
            summary: "Remover instituição (bloqueado se houver users ou turmas vinculados)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Removida",
                    content: {
                        "application/json": {
                            example: {
                                message: "Instituição removida com sucesso",
                                data: institutionExample,
                            },
                        },
                    },
                },
                "404": {
                    description: "Não encontrada",
                    content: {
                        "application/json": {
                            example: { error: "Instituição não encontrada" },
                        },
                    },
                },
                "409": {
                    description: "Tem users ou turmas vinculados",
                    content: {
                        "application/json": {
                            example: {
                                error: "Não é possível excluir: instituição tem 3 usuário(s) e 2 turma(s) vinculados",
                            },
                        },
                    },
                },
            },
        },
    },
};
