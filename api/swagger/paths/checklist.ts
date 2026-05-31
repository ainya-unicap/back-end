const checklistExample = {
    id: "c1c1c1c1-1111-2222-3333-444444444444",
    form_id: "f1f1f1f1-2222-3333-4444-555555555555",
    template_id: "t1t1t1t1-1111-2222-3333-444444444444",
    checked: true,
    createdAt: "2026-05-29T11:35:00.000Z",
    updatedAt: "2026-05-29T11:35:00.000Z",
};

export const checklistPaths = {
    "/checklist": {
        post: {
            tags: ["Checklist"],
            summary: "Criar item de checklist",
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
                                checked: { type: "boolean" },
                            },
                        },
                        example: {
                            form_id: checklistExample.form_id,
                            template_id: checklistExample.template_id,
                            checked: true,
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criado",
                    content: { "application/json": { example: checklistExample } },
                },
            },
        },
    },
    "/checklist/{id}": {
        put: {
            tags: ["Checklist"],
            summary: "Atualizar checked",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["checked"],
                            properties: { checked: { type: "boolean" } },
                        },
                        example: { checked: false },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Atualizado",
                    content: {
                        "application/json": {
                            example: { ...checklistExample, checked: false },
                        },
                    },
                },
            },
        },
    },
    "/checklist/formulario/{formularioId}": {
        get: {
            tags: ["Checklist"],
            summary: "Checklist do formulário",
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
                                    ...checklistExample,
                                    template: {
                                        id: checklistExample.template_id,
                                        field_name: "Irrigação realizada",
                                        unit: null,
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
