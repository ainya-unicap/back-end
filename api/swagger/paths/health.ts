export const healthPaths = {
    "/health": {
        get: {
            tags: ["Health"],
            summary: "Status do servidor",
            security: [],
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            example: {
                                status: "ok",
                                uptime: 123.45,
                                timestamp: "2026-05-29T15:30:00.000Z",
                                environment: "production",
                            },
                        },
                    },
                },
            },
        },
    },
};
