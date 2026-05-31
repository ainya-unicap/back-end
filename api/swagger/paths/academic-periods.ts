const periodExample = {
    id: "period-2026-1",
    name: "2026.1",
    semester: "PRIMEIRO",
    start_date: "2026-02-01T00:00:00.000Z",
    end_date: "2026-06-30T00:00:00.000Z",
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z",
};

export const academicPeriodPaths = {
    "/academic-periods": {
        get: {
            tags: ["AcademicPeriods"],
            summary: "Listar períodos letivos",
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: [
                                periodExample,
                                { ...periodExample, id: "period-2026-2", name: "2026.2", semester: "SEGUNDO" },
                            ],
                        },
                    },
                },
            },
        },
    },
    "/academic-periods/active": {
        get: {
            tags: ["AcademicPeriods"],
            summary: "Período letivo ativo",
            responses: {
                "200": {
                    description: "Período ativo",
                    content: { "application/json": { example: periodExample } },
                },
                "404": {
                    description: "Nenhum período ativo no momento",
                    content: {
                        "application/json": {
                            example: { error: "Nenhum período letivo ativo" },
                        },
                    },
                },
            },
        },
    },
};
