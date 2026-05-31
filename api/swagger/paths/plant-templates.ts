const templateExample = {
    id: "t1t1t1t1-1111-2222-3333-444444444444",
    plant_id: "ffffffff-1111-2222-3333-444444444444",
    field_name: "Altura da planta",
    unit: "cm",
    createdAt: "2026-04-22T08:30:00.000Z",
    updatedAt: "2026-04-22T08:30:00.000Z",
};

export const plantTemplatePaths = {
    "/plant-templates": {
        get: {
            tags: ["PlantTemplates"],
            summary: "Templates por planta (?plant_id=)",
            parameters: [
                { name: "plant_id", in: "query", schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: [
                                templateExample,
                                { ...templateExample, id: "t2", field_name: "Cobertura do solo", unit: "%" },
                            ],
                        },
                    },
                },
            },
        },
        post: {
            tags: ["PlantTemplates"],
            summary: "Criar template",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["plant_id", "field_name", "unit"],
                            properties: {
                                plant_id: { type: "string" },
                                field_name: { type: "string" },
                                unit: { type: "string" },
                            },
                        },
                        example: {
                            plant_id: templateExample.plant_id,
                            field_name: "Número de folhas",
                            unit: "un",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criado",
                    content: { "application/json": { example: templateExample } },
                },
            },
        },
    },
    "/plant-templates/plant/{plantId}": {
        get: {
            tags: ["PlantTemplates"],
            summary: "Templates de uma planta",
            parameters: [
                { name: "plantId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: { "application/json": { example: [templateExample] } },
                },
            },
        },
    },
};
