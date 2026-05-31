const plantaExample = {
    id: "ffffffff-1111-2222-3333-444444444444",
    name: "Brachiaria brizantha",
    category: "GRAMINEA_PORTE_ALTO",
    description: "Gramínea perene, de crescimento cespitoso, amplamente usada como forrageira em pastagens.",
    semester_focus: "AMBOS",
    createdAt: "2026-04-22T08:00:00.000Z",
    updatedAt: "2026-04-22T08:00:00.000Z",
};

export const plantaForrageiraPaths = {
    "/plantas-forrageiras": {
        get: {
            tags: ["PlantasForrageiras"],
            summary: "Listar plantas (opcionalmente filtrar por categoria)",
            parameters: [
                {
                    name: "category",
                    in: "query",
                    schema: {
                        type: "string",
                        enum: [
                            "CACTACEA",
                            "CULTURA_ANUAL",
                            "GRAMINEA_PORTE_ALTO",
                            "GRAMINEA_PORTE_BAIXO",
                            "GRAMINEA_PORTE_MEDIO",
                            "LEGUMINOSA_ARBUSTIVA",
                            "LEGUMINOSA_HERBACEA",
                            "OLEAGINOSA_FORRAGEIRA",
                        ],
                    },
                },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: [
                                plantaExample,
                                {
                                    ...plantaExample,
                                    id: "2",
                                    name: "Stylosanthes guianensis",
                                    category: "LEGUMINOSA_HERBACEA",
                                    semester_focus: "SEGUNDO",
                                },
                            ],
                        },
                    },
                },
            },
        },
    },
    "/plantas-forrageiras/{id}": {
        get: {
            tags: ["PlantasForrageiras"],
            summary: "Buscar planta por id",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Planta",
                    content: { "application/json": { example: plantaExample } },
                },
                "404": {
                    description: "Planta não encontrada",
                    content: {
                        "application/json": {
                            example: { error: "Planta não encontrada" },
                        },
                    },
                },
            },
        },
    },
};
