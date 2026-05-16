import fs from "fs";
import inquirer from "inquirer";
import path from "path";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function novaEntidade() {
    const args = process.argv.slice(2);
    const nomeArg = args[0];

    const nomeLimpo = nomeArg?.trim();

    if (!nomeLimpo) {
        return console.log("❌ Informe o nome da entidade. Ex: npm run nova-entidade User");
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

    fs.writeFileSync(paths.routes, `
import { Router } from "express";
import { ${nomeLimpo}Controller } from "../controllers/${baseName}.controller.js";
            
const ${baseName}Router = Router();
            
//${baseName}Router.post("/", ${nomeLimpo}Controller.createUser);
            
export default ${baseName}Router;
    `);
    fs.writeFileSync(paths.controller, `
import { Request, Response } from "express";
import { HttpError } from "../core/httpError.js";
import { ${nomeLimpo}Service } from "../services/${baseName}.service.js";
        
export class ${nomeLimpo}Controller {
    static async create(req: Request, res: Response) {
        try {
            await ${nomeLimpo}Service.create(req.body);
            return res.status(201).json({ message: "created successfully" });
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            return res.status(err.status || 500).json({ error: err.message });
        }
    }
}
    `);
    fs.writeFileSync(paths.service, `
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";

export class ${nomeLimpo}Service {
    static async create(body: any) {
        //const { name, email, password } = body;

        //if (!name || !email || !password) {
        //    throw new HttpError("Name, email, and password are required", 400);
        //}

        //const ${baseName} = await prisma.${baseName}.create({
        //    data: {
        //        
        //    },
        //    include: {
        //        
        //    },
        //});
    }
}
    `);
    fs.writeFileSync(paths.models, `
model ${nomeLimpo} {
    id        String   @id @default(uuid())
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

    `);

    console.log(`Entidade ${nomeLimpo} criada com sucesso!`);

}

novaEntidade();