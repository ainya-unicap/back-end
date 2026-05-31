const relatorioExample = {
    id: "r1r1r1r1-2222-3333-4444-555555555555",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    canteiro_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    list_id: "99999999-aaaa-bbbb-cccc-dddddddddddd",
    status: "RASCUNHO",
    introduction: "",
    objective: "Acompanhar e registrar o desenvolvimento de Brachiaria brizantha ao longo do semestre.",
    development: "",
    final_thoughts: "",
    references: "",
    grade: 0,
    feedback: "",
    createdAt: "2026-05-29T12:00:00.000Z",
    updatedAt: "2026-05-29T12:00:00.000Z",
    submittedAt: "2026-05-29T12:00:00.000Z",
};

export const relatorioPaths = {
    "/relatorios/user/{userId}": {
        get: {
            tags: ["Relatorios"],
            summary: "Relatórios do aluno",
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
                                    ...relatorioExample,
                                    list: {
                                        id: relatorioExample.list_id,
                                        plant: { name: "Brachiaria brizantha" },
                                    },
                                    canteiro: { id: relatorioExample.canteiro_id, name: "Canteiro 01" },
                                },
                            ],
                        },
                    },
                },
            },
        },
    },
    "/relatorios/generate": {
        post: {
            tags: ["Relatorios"],
            summary: "Gerar relatório (user_id do JWT; valida UserCanteiro × canteiro da lista)",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/RelatorioGenerate" },
                        example: { list_id: relatorioExample.list_id },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criado",
                    content: { "application/json": { example: relatorioExample } },
                },
                "400": {
                    description: "list_id ausente",
                    content: {
                        "application/json": {
                            example: { error: "list_id é obrigatório." },
                        },
                    },
                },
                "403": {
                    description: "Usuário não vinculado ao canteiro da lista",
                    content: {
                        "application/json": {
                            example: { error: "Usuário não está vinculado ao canteiro da lista informada" },
                        },
                    },
                },
                "404": {
                    description: "Lista não encontrada",
                    content: {
                        "application/json": {
                            example: { error: "Lista de formulários não encontrada." },
                        },
                    },
                },
            },
        },
    },
    "/relatorios/{id}": {
        get: {
            tags: ["Relatorios"],
            summary: "Relatório por id",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Relatório",
                    content: {
                        "application/json": {
                            example: {
                                ...relatorioExample,
                                list: {
                                    id: relatorioExample.list_id,
                                    plant: { id: "ffffffff-1111-2222-3333-444444444444", name: "Brachiaria" },
                                },
                                canteiro: { id: relatorioExample.canteiro_id, name: "Canteiro 01" },
                            },
                        },
                    },
                },
                "404": {
                    description: "Não encontrado",
                    content: {
                        "application/json": {
                            example: { error: "Relatório não encontrado." },
                        },
                    },
                },
            },
        },
        put: {
            tags: ["Relatorios"],
            summary: "Atualizar múltiplas seções (só o dono, só em rascunho)",
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
                                introduction: { type: "string" },
                                objective: { type: "string" },
                                development: { type: "string" },
                                final_thoughts: { type: "string" },
                                references: { type: "string" },
                            },
                        },
                        example: {
                            introduction: "Este relatório acompanha...",
                            development: "Durante 8 semanas observamos...",
                        },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Atualizado",
                    content: { "application/json": { example: relatorioExample } },
                },
                "403": {
                    description: "Tentativa de editar relatório de outro usuário",
                    content: {
                        "application/json": {
                            example: { error: "Você só pode alterar os próprios relatórios" },
                        },
                    },
                },
                "400": {
                    description: "Relatório já submetido ou sem campos válidos",
                    content: {
                        "application/json": {
                            example: { error: "Não é possível editar um relatório já submetido" },
                        },
                    },
                },
            },
        },
    },
    "/relatorios/{id}/objective": {
        put: {
            tags: ["Relatorios"],
            summary: "Atualizar objetivo (só o dono, salvamento automático)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: { objective: { type: "string" } },
                        },
                        example: { objective: "Novo objetivo do relatório." },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            example: { ...relatorioExample, objective: "Novo objetivo do relatório." },
                        },
                    },
                },
                "403": {
                    description: "Não é dono",
                    content: {
                        "application/json": {
                            example: { error: "Você só pode alterar os próprios relatórios" },
                        },
                    },
                },
            },
        },
    },
    "/relatorios/{id}/introduction": {
        put: {
            tags: ["Relatorios"],
            summary: "Atualizar introdução (só o dono)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: { introduction: { type: "string" } },
                        },
                        example: { introduction: "Texto da introdução." },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            example: { ...relatorioExample, introduction: "Texto da introdução." },
                        },
                    },
                },
            },
        },
    },
    "/relatorios/{id}/development": {
        put: {
            tags: ["Relatorios"],
            summary: "Atualizar desenvolvimento (só o dono)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: { development: { type: "string" } },
                        },
                        example: { development: "Análise das medições semanais." },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            example: { ...relatorioExample, development: "Análise das medições semanais." },
                        },
                    },
                },
            },
        },
    },
    "/relatorios/{id}/final-thoughts": {
        put: {
            tags: ["Relatorios"],
            summary: "Atualizar considerações finais (só o dono)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: { final_thoughts: { type: "string" } },
                        },
                        example: { final_thoughts: "Considerações finais do trabalho." },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            example: { ...relatorioExample, final_thoughts: "Considerações finais." },
                        },
                    },
                },
            },
        },
    },
    "/relatorios/{id}/references": {
        put: {
            tags: ["Relatorios"],
            summary: "Atualizar referências (só o dono)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: { references: { type: "string" } },
                        },
                        example: { references: "EMBRAPA. Manual de forrageiras tropicais. 2020." },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            example: { ...relatorioExample, references: "EMBRAPA. Manual..." },
                        },
                    },
                },
            },
        },
    },
    "/relatorios/{id}/submit": {
        post: {
            tags: ["Relatorios"],
            summary: "Submeter relatório (só o dono)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Submetido",
                    content: {
                        "application/json": {
                            example: { ...relatorioExample, status: "SUBMETIDO" },
                        },
                    },
                },
                "400": {
                    description: "Relatório já submetido",
                    content: {
                        "application/json": {
                            example: { error: "Relatório já foi submetido" },
                        },
                    },
                },
                "403": {
                    description: "Não é dono",
                    content: {
                        "application/json": {
                            example: { error: "Você só pode alterar os próprios relatórios" },
                        },
                    },
                },
            },
        },
    },
    "/relatorios/{id}/export-pdf": {
        get: {
            tags: ["Relatorios"],
            summary: "Exportar relatório em PDF",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "PDF do relatório (download)",
                    content: {
                        "application/pdf": {
                            schema: { type: "string", format: "binary" },
                        },
                    },
                },
                "404": {
                    description: "Relatório não encontrado",
                    content: {
                        "application/json": {
                            example: { error: "Relatório não encontrado." },
                        },
                    },
                },
            },
        },
    },
};
