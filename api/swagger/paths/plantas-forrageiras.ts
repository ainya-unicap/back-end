const plantaExample = {
    id: "ffffffff-1111-2222-3333-444444444444",
    name: "Brachiaria brizantha",
    category: "GRAMINEA_PORTE_ALTO",
    description: "Gramínea perene, de crescimento cespitoso, amplamente usada como forrageira em pastagens.",
    semester_focus: "AMBOS",
    createdAt: "2026-04-22T08:00:00.000Z",
    updatedAt: "2026-04-22T08:00:00.000Z",
};

const CATEGORIES = [
    "CACTACEA",
    "CULTURA_ANUAL",
    "GRAMINEA_PORTE_ALTO",
    "GRAMINEA_PORTE_BAIXO",
    "GRAMINEA_PORTE_MEDIO",
    "LEGUMINOSA_ARBUSTIVA",
    "LEGUMINOSA_HERBACEA",
    "OLEAGINOSA_FORRAGEIRA",
];

const SEMESTERS = ["PRIMEIRO", "SEGUNDO", "AMBOS"];

export const plantaForrageiraPaths = {
    "/plantas-forrageiras": {
        get: {
            tags: ["PlantasForrageiras"],
            summary: "Listar plantas (opcionalmente filtrar por categoria)",
            parameters: [
                {
                    name: "category",
                    in: "query",
                    schema: { type: "string", enum: CATEGORIES },
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
        post: {
            tags: ["PlantasForrageiras"],
            summary: "Criar planta forrageira",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name", "category", "description", "semester_focus"],
                            properties: {
                                name: { type: "string" },
                                category: { type: "string", enum: CATEGORIES },
                                description: { type: "string" },
                                semester_focus: { type: "string", enum: SEMESTERS },
                            },
                        },
                        example: {
                            name: "Capim Mombaça",
                            category: "GRAMINEA_PORTE_ALTO",
                            description: "Gramínea perene de alto rendimento.",
                            semester_focus: "PRIMEIRO",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criada",
                    content: { "application/json": { example: plantaExample } },
                },
                "400": {
                    description: "Campos obrigatórios ou inválidos",
                    content: {
                        "application/json": {
                            example: { error: "Categoria inválida. Use: CACTACEA, ..." },
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
                    description: "Não encontrada",
                    content: {
                        "application/json": {
                            example: { error: "Planta forrageira não encontrada" },
                        },
                    },
                },
            },
        },
        put: {
            tags: ["PlantasForrageiras"],
            summary: "Atualizar planta forrageira (campos parciais)",
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
                                name: { type: "string" },
                                category: { type: "string", enum: CATEGORIES },
                                description: { type: "string" },
                                semester_focus: { type: "string", enum: SEMESTERS },
                            },
                        },
                        example: { description: "Descrição atualizada." },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Atualizada",
                    content: { "application/json": { example: plantaExample } },
                },
                "400": {
                    description: "Validação",
                    content: {
                        "application/json": {
                            example: { error: "Nenhum campo válido enviado para atualização" },
                        },
                    },
                },
                "404": {
                    description: "Não encontrada",
                    content: {
                        "application/json": {
                            example: { error: "Planta forrageira não encontrada" },
                        },
                    },
                },
            },
        },
        delete: {
            tags: ["PlantasForrageiras"],
            summary: "Remover planta (bloqueado se houver canteiros/listas/templates vinculados)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Removida",
                    content: {
                        "application/json": {
                            example: {
                                message: "Planta forrageira removida com sucesso",
                                data: plantaExample,
                            },
                        },
                    },
                },
                "404": {
                    description: "Não encontrada",
                    content: {
                        "application/json": {
                            example: { error: "Planta forrageira não encontrada" },
                        },
                    },
                },
                "409": {
                    description: "Tem dependências",
                    content: {
                        "application/json": {
                            example: {
                                error: "Não é possível excluir: planta tem 2 canteiro(s), 3 lista(s) e 4 template(s) vinculados",
                            },
                        },
                    },
                },
            },
        },
    },
};
