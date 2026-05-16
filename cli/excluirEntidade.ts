import fs from "fs";
import inquirer from "inquirer";
import path from "path";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function deleteFile(filePath: string) {
    if (fs.existsSync(filePath)) {

        fs.unlinkSync(filePath);
        console.log(`🗑️ Arquivo removido: ${filePath}`);
    } else {
        console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    }
}

async function excluirEntidade() {
    const args = process.argv.slice(2);
    const nomeArg = args[0];

    const nomeLimpo = nomeArg?.trim();

    if (!nomeLimpo) {
        return console.log("❌ Informe o nome da entidade. Ex: npm run excluir-entidade User");
    }

    if (!/^[A-Za-z]+$/.test(nomeLimpo)) {
        return console.log("❌ Nome inválido. Use apenas letras.");
    }



    const baseName = nomeLimpo.toLowerCase();



    const paths = {
        routes: path.join(__dirname, '../api/routes', `${baseName}.routes.ts`),
        controller: path.join(__dirname, '../api/controllers', `${baseName}.controller.ts`),
        service: path.join(__dirname, '../api/services', `${baseName}.service.ts`),
        models: path.join(__dirname, '../api/models', `${baseName}.model.prisma`),
    };

    const entidade = await inquirer.prompt([
        {
            type: "input",
            name: "res",
            message: "Tem certeza que deseja excluir essa entidade? (y | n)"
        }
    ]);
    if (entidade.res == "y") {
        deleteFile(paths.models);
        deleteFile(paths.routes);
        deleteFile(paths.controller);
        deleteFile(paths.service);
    } else {
        return console.log("Resposta inválida! Ação cancelada!")
    }

    console.log(`Entidade ${nomeLimpo} deletada com sucesso!`);

}

excluirEntidade();