const alunoTurmaExample = {
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    turma_id: "tt1tt1tt-1111-2222-3333-444444444444",
    createdAt: "2026-04-25T09:00:00.000Z",
    updatedAt: "2026-04-25T09:00:00.000Z",
};

export const alunoTurmaPaths = {
    "/aluno-turma": {
        post: {
            tags: ["AlunoTurma"],
            summary: "Vincular aluno a turma",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["user_id", "turma_id"],
                            properties: {
                                user_id: { type: "string" },
                                turma_id: { type: "string" },
                            },
                        },
                        example: {
                            user_id: alunoTurmaExample.user_id,
                            turma_id: alunoTurmaExample.turma_id,
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Vinculado",
                    content: { "application/json": { example: alunoTurmaExample } },
                },
                "404": {
                    description: "Usuário ou turma não encontrado",
                    content: {
                        "application/json": {
                            example: { error: "Turma não encontrada" },
                        },
                    },
                },
                "409": {
                    description: "Aluno já vinculado",
                    content: {
                        "application/json": {
                            example: { error: "Aluno já vinculado a essa turma" },
                        },
                    },
                },
            },
        },
    },
    "/aluno-turma/user/{userId}": {
        get: {
            tags: ["AlunoTurma"],
            summary: "Turmas do aluno",
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
                                    ...alunoTurmaExample,
                                    turma: {
                                        id: alunoTurmaExample.turma_id,
                                        name: "Forragicultura 2026.1 - Turma A",
                                        institution: {
                                            id: "11111111-2222-3333-4444-555555555555",
                                            name: "Universidade Católica de Pernambuco",
                                        },
                                        period: {
                                            id: "period-2026-1",
                                            name: "2026.1",
                                            semester: "PRIMEIRO",
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
};
