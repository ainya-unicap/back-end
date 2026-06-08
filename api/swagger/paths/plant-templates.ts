const templateExample = {
    id: "t1t1t1t1-1111-2222-3333-444444444444",
    plant_id: "ffffffff-1111-2222-3333-444444444444",
    field_name: "Altura da planta",
    unit: "cm",
    createdAt: "2026-04-22T08:30:00.000Z",
    updatedAt: "2026-04-22T08:30:00.000Z",
};

const envelope = (data: any, msg: string) => ({ data, error: null, message: msg });

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
                            example: envelope(
                                [
                                    templateExample,
                                    { ...templateExample, id: "t2", field_name: "Cobertura do solo", unit: "%" },
                                ],
                                "Templates da planta encontrados com sucesso"
                            ),
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
                    content: {
                        "application/json": {
                            example: envelope(templateExample, "Template da planta criado com sucesso"),
                        },
                    },
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
                    content: {
                        "application/json": {
                            example: envelope([templateExample], "Templates da planta encontrados com sucesso"),
                        },
                    },
                },
            },
        },
    },
    "/plant-templates/{id}": {
        get: {
            tags: ["PlantTemplates"],
            summary: "Buscar template por id",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Template",
                    content: {
                        "application/json": {
                            example: envelope(
                                {
                                    ...templateExample,
                                    planta_forrageira: {
                                        id: templateExample.plant_id,
                                        name: "Brachiaria brizantha",
                                        category: "GRAMINEA_PORTE_ALTO",
                                    },
                                },
                                "Template encontrado com sucesso"
                            ),
                        },
                    },
                },
                "404": {
                    description: "Não encontrado",
                    content: {
                        "application/json": {
                            example: envelope(null, "Erro ao buscar template"),
                        },
                    },
                },
            },
        },
        put: {
            tags: ["PlantTemplates"],
            summary: "Atualizar template (field_name ou unit)",
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
                                field_name: { type: "string" },
                                unit: { type: "string" },
                            },
                        },
                        example: { unit: "mm" },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Atualizado",
                    content: {
                        "application/json": {
                            example: envelope(templateExample, "Template atualizado com sucesso"),
                        },
                    },
                },
                "400": {
                    description: "Body vazio",
                    content: {
                        "application/json": {
                            example: envelope(null, "Erro ao atualizar template"),
                        },
                    },
                },
                "404": {
                    description: "Não encontrado",
                    content: {
                        "application/json": {
                            example: envelope(null, "Erro ao atualizar template"),
                        },
                    },
                },
            },
        },
        delete: {
            tags: ["PlantTemplates"],
            summary: "Remover template (bloqueado se houver checklists/measurements vinculados)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Removido",
                    content: {
                        "application/json": {
                            example: envelope(templateExample, "Template removido com sucesso"),
                        },
                    },
                },
                "404": {
                    description: "Não encontrado",
                    content: {
                        "application/json": {
                            example: envelope(null, "Erro ao remover template"),
                        },
                    },
                },
                "409": {
                    description: "Tem dependências",
                    content: {
                        "application/json": {
                            example: envelope(null, "Erro ao remover template"),
                        },
                    },
                },
            },
        },
    },
};
