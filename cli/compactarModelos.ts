import fs from "fs";
import inquirer from "inquirer";
import path from "path";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function compactarModelos() {
    // junta modelos no schema.prisma
    const modelsDir = path.join(__dirname, '../api/models');
    const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.model.prisma'));

    let combinedModels = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

`;
    for (const file of modelFiles) {
        const content = fs.readFileSync(path.join(modelsDir, file), 'utf-8');
        combinedModels += content;
    }

    const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
    fs.writeFileSync(schemaPath, combinedModels);
}

compactarModelos();