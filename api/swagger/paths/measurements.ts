const measurementExample = {
    id: "m1m1m1m1-1111-2222-3333-444444444444",
    form_id: "f1f1f1f1-2222-3333-4444-555555555555",
    template_id: "t3t3t3t3-1111-2222-3333-444444444444",
    value: 42.5,
    createdAt: "2026-05-29T11:36:00.000Z",
    updatedAt: "2026-05-29T11:36:00.000Z",
};

export const measurementPaths = {
    "/measurements": {
        post: {
            tags: ["Measurements"],
            summary: "Criar medição",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["form_id", "template_id"],
                            properties: {
                                form_id: { type: "string" },
                                template_id: { type: "string" },
                                value: { type: "number" },
                            },
                        },
                        example: {
                            form_id: measurementExample.form_id,
                            template_id: measurementExample.template_id,
                            value: 42.5,
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criada",
                    content: { "application/json": { example: measurementExample } },
                },
            },
        },
    },
    "/measurements/{id}": {
        put: {
            tags: ["Measurements"],
            summary: "Atualizar value",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["value"],
                            properties: { value: { type: "number" } },
                        },
                        example: { value: 50 },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Atualizada",
                    content: {
                        "application/json": {
                            example: { ...measurementExample, value: 50 },
                        },
                    },
                },
            },
        },
    },
    "/measurements/formulario/{formularioId}": {
        get: {
            tags: ["Measurements"],
            summary: "Medições do formulário",
            parameters: [
                { name: "formularioId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Lista",
                    content: {
                        "application/json": {
                            example: [
                                {
                                    ...measurementExample,
                                    template: {
                                        id: measurementExample.template_id,
                                        field_name: "Altura da planta",
                                        unit: "cm",
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
