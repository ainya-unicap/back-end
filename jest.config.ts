export default {
    preset: "ts-jest",
    testEnvironment: "node",
    clearMocks: true,
    "moduleNameMapper": {
        "^(\\.{1,2}/.*)\\.js$": "$1"
    }
};