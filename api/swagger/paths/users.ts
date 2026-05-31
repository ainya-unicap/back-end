export const userPaths = {
    "/users": {
        get: {
            tags: ["Users"],
            summary: "Listar todos os usuários",
            responses: {
                "200": {
                    description: "Lista de usuários",
                    content: {
                        "application/json": {
                            example: [
                                {
                                    id: "550e8400-e29b-41d4-a716-446655440000",
                                    name: "João Silva",
                                    email: "joao@email.com",
                                    role: "aluno",
                                    institution_id: "11111111-2222-3333-4444-555555555555",
                                    avatarUrl: null,
                                    createdAt: "2026-05-29T10:00:00.000Z",
                                    updatedAt: "2026-05-29T10:00:00.000Z",
                                },
                            ],
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Users"],
            summary: "Cadastrar usuário",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/UserCreate" },
                        example: {
                            name: "João Silva",
                            email: "joao@email.com",
                            password: "senha123",
                            role: "aluno",
                            institutionId: "11111111-2222-3333-4444-555555555555",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Criado",
                    content: {
                        "application/json": {
                            example: { message: "created successfully" },
                        },
                    },
                },
                "400": {
                    description: "Campos obrigatórios ausentes",
                    content: {
                        "application/json": {
                            example: { error: "Name, email and password are required" },
                        },
                    },
                },
            },
        },
    },
    "/users/{id}": {
        get: {
            tags: ["Users"],
            summary: "Buscar usuário por id",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
                "200": {
                    description: "Usuário",
                    content: {
                        "application/json": {
                            example: {
                                id: "550e8400-e29b-41d4-a716-446655440000",
                                name: "João Silva",
                                email: "joao@email.com",
                                role: "aluno",
                                institution_id: "11111111-2222-3333-4444-555555555555",
                                avatarUrl: "https://xyz.public.blob.vercel-storage.com/avatars/foto.jpg",
                                createdAt: "2026-05-29T10:00:00.000Z",
                                updatedAt: "2026-05-29T10:00:00.000Z",
                                institution: {
                                    id: "11111111-2222-3333-4444-555555555555",
                                    name: "Universidade Católica de Pernambuco",
                                    createdAt: "2026-04-22T08:00:00.000Z",
                                    updatedAt: "2026-04-22T08:00:00.000Z",
                                },
                            },
                        },
                    },
                },
                "404": {
                    description: "Usuário não encontrado",
                    content: {
                        "application/json": {
                            example: { error: "Usuário não encontrado" },
                        },
                    },
                },
            },
        },
    },
    "/users/{id}/profile": {
        put: {
            tags: ["Users"],
            summary: "Atualizar nome ou senha (só do próprio usuário)",
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
                                password: { type: "string" },
                            },
                        },
                        example: { name: "João Silva Souza" },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Atualizado",
                    content: {
                        "application/json": {
                            example: {
                                id: "550e8400-e29b-41d4-a716-446655440000",
                                name: "João Silva Souza",
                                email: "joao@email.com",
                                role: "aluno",
                                institution_id: "11111111-2222-3333-4444-555555555555",
                            },
                        },
                    },
                },
                "400": {
                    description: "Validação (name curto, password curto, body vazio)",
                    content: {
                        "application/json": {
                            example: { error: "name deve ter pelo menos 2 caracteres" },
                        },
                    },
                },
                "403": {
                    description: "Tentativa de editar perfil de outro usuário",
                    content: {
                        "application/json": {
                            example: { error: "Você só pode atualizar o próprio perfil" },
                        },
                    },
                },
            },
        },
    },
    "/users/{id}/avatar": {
        put: {
            tags: ["Users"],
            summary: "Atualizar foto de perfil (upload multipart, só do próprio usuário)",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["avatar"],
                            properties: {
                                avatar: { type: "string", format: "binary" },
                            },
                        },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Avatar atualizado",
                    content: {
                        "application/json": {
                            example: {
                                id: "550e8400-e29b-41d4-a716-446655440000",
                                name: "João Silva",
                                email: "joao@email.com",
                                avatarUrl: "https://xyz.public.blob.vercel-storage.com/avatars/foto-nova.jpg",
                            },
                        },
                    },
                },
                "400": {
                    description: "Arquivo ausente ou tipo inválido",
                    content: {
                        "application/json": {
                            example: { error: "Arquivo de avatar é obrigatório" },
                        },
                    },
                },
                "403": {
                    description: "Tentativa de trocar avatar de outro usuário",
                    content: {
                        "application/json": {
                            example: { error: "Você só pode atualizar o próprio avatar" },
                        },
                    },
                },
                "404": {
                    description: "Usuário não encontrado",
                    content: {
                        "application/json": {
                            example: { error: "Usuário não encontrado" },
                        },
                    },
                },
            },
        },
    },
};
