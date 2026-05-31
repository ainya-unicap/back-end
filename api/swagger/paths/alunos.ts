export const alunoPaths = {
    "/alunos/{id}/resumo": {
        get: {
            tags: ["Alunos"],
            summary: "Resumo do aluno (totais)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Resumo",
                    content: {
                        "application/json": {
                            example: {
                                total_formularios: 12,
                                total_semanas: 8,
                                total_relatorios: 2,
                            },
                        },
                    },
                },
            },
        },
    },
    "/alunos/{userId}/home": {
        get: {
            tags: ["Alunos"],
            summary: "Home do aluno (canteiros via UserCanteiro + totais)",
            parameters: [
                { name: "userId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Home",
                    content: {
                        "application/json": {
                            example: {
                                formularios_recentes: [
                                    {
                                        id: "f1f1f1f1-2222-3333-4444-555555555555",
                                        type: "SEMANAL",
                                        synced: true,
                                        started_at: "2026-05-29T11:30:00.000Z",
                                        ended_at: "2026-05-29T11:45:00.000Z",
                                        createdAt: "2026-05-29T11:30:00.000Z",
                                        list: {
                                            id: "99999999-aaaa-bbbb-cccc-dddddddddddd",
                                            name: "Semana 1",
                                            plant: {
                                                id: "ffffffff-1111-2222-3333-444444444444",
                                                name: "Brachiaria brizantha",
                                                category: "GRAMINEA_PORTE_ALTO",
                                            },
                                        },
                                    },
                                ],
                                canteiros: [
                                    {
                                        id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
                                        plant_id: "ffffffff-1111-2222-3333-444444444444",
                                        name: "Canteiro 01",
                                        plant: {
                                            id: "ffffffff-1111-2222-3333-444444444444",
                                            name: "Brachiaria brizantha",
                                            category: "GRAMINEA_PORTE_ALTO",
                                        },
                                        _count: { listaDeFormularios: 3 },
                                    },
                                ],
                                total_listas: 3,
                                total_formularios: 12,
                                total_semanas: 8,
                                total_relatorios: 2,
                            },
                        },
                    },
                },
            },
        },
    },
};
