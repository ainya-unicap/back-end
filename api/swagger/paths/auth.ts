export const authPaths = {
    "/users/login": {
        post: {
            tags: ["Auth"],
            summary: "Login",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/LoginRequest" },
                        example: {
                            email: "joao@email.com",
                            password: "senha123",
                        },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Login efetuado, retorna id + tokens",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/TokensResponse" },
                            example: {
                                id: "550e8400-e29b-41d4-a716-446655440000",
                                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3NDgxMjM0NTYsImV4cCI6MTc0ODEyNDM1Nn0.fake-signature",
                                refreshToken: "9f8c1a2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
                            },
                        },
                    },
                },
                "400": {
                    description: "Email/senha ausentes",
                    content: {
                        "application/json": {
                            example: { error: "Email and password are required" },
                        },
                    },
                },
                "401": {
                    description: "Credenciais inválidas",
                    content: {
                        "application/json": {
                            example: { error: "Invalid credentials" },
                        },
                    },
                },
                "429": {
                    description: "Muitas tentativas (rate limit)",
                    content: {
                        "application/json": {
                            example: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
                        },
                    },
                },
            },
        },
    },
    "/users/refresh": {
        post: {
            tags: ["Auth"],
            summary: "Renovar accessToken",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/RefreshRequest" },
                        example: {
                            refreshToken: "9f8c1a2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
                        },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Novos tokens",
                    content: {
                        "application/json": {
                            example: {
                                accessToken: "eyJhbGciOiJIUzI1NiIs...novo",
                                refreshToken: "1a2b3c4d5e6f...novo",
                            },
                        },
                    },
                },
                "400": {
                    description: "refreshToken ausente",
                    content: {
                        "application/json": {
                            example: { error: "refreshToken é obrigatório" },
                        },
                    },
                },
                "401": {
                    description: "Token inválido, expirado ou revogado",
                    content: {
                        "application/json": {
                            example: { error: "Invalid or expired refresh token" },
                        },
                    },
                },
            },
        },
    },
    "/users/logout": {
        post: {
            tags: ["Auth"],
            summary: "Logout",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/RefreshRequest" },
                        example: {
                            refreshToken: "9f8c1a2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
                        },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Logout ok",
                    content: {
                        "application/json": {
                            example: { message: "Logout realizado com sucesso" },
                        },
                    },
                },
                "400": {
                    description: "refreshToken ausente",
                    content: {
                        "application/json": {
                            example: { error: "refreshToken é obrigatório" },
                        },
                    },
                },
            },
        },
    },
};
