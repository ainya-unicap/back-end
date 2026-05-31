const turmaExample = {
    id: "tt1tt1tt-1111-2222-3333-444444444444",
    institution_id: "11111111-2222-3333-4444-555555555555",
    period_id: "period-2026-1",
    name: "Forragicultura 2026.1 - Turma A",
    created_by: "professor-id-uuid",
    createdAt: "2026-04-22T08:30:00.000Z",
    updatedAt: "2026-04-22T08:30:00.000Z",
};

export const turmaPaths = {
    "/turmas": {
        get: {
            tags: ["Turmas"],
            summary: "Listar turmas",
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: [turmaExample],
                        },
                    },
                },
            },
        },
    },
    "/turmas/{id}": {
        get: {
            tags: ["Turmas"],
            summary: "Turma por id",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Turma",
                    content: {
                        "application/json": {
                            example: {
                                ...turmaExample,
                                institution: {
                                    id: turmaExample.institution_id,
                                    name: "Universidade Católica de Pernambuco",
                                },
                                period: {
                                    id: turmaExample.period_id,
                                    name: "2026.1",
                                    semester: "PRIMEIRO",
                                },
                            },
                        },
                    },
                },
                "404": {
                    description: "Turma não encontrada",
                    content: {
                        "application/json": {
                            example: { error: "Turma não encontrada" },
                        },
                    },
                },
            },
        },
    },
};
