import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";
import { UserCanteiroService } from "./usercanteiro.service.js";

const SECOES_VALIDAS = [
    "introduction",
    "objective",
    "development",
    "final_thoughts",
    "references",
] as const;

type Secao = (typeof SECOES_VALIDAS)[number];

export class RelatorioService {

    // ATIVIDADE 1: Buscar todos os relatórios do aluno
    static async getRelatoriosByUser(userId: string) {
        return await prisma.relatorio.findMany({
            where: { user_id: userId },
            include: {
                list: {
                    include: {
                        plant: {
                            select: { name: true }
                        }
                    }
                },
                canteiro: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // ATIVIDADE 1: Gerar um novo relatório a partir da lista
    static async createRelatorio(userId: string, listId: string) {
        const lista = await prisma.listaDeFormularios.findUnique({
            where: { id: listId },
            include: { plant: true }
        });

        if (!lista) {
            throw new HttpError("Lista de formulários não encontrada.", 404);
        }

        const vinculado = await UserCanteiroService.exists(userId, lista.canteiro_id);
        if (!vinculado) {
            throw new HttpError(
                "Usuário não está vinculado ao canteiro da lista informada",
                403
            );
        }

        const textoObjetivoGerado = `Acompanhar e registrar o desenvolvimento de ${lista.plant.name} ao longo do semestre, documentando medições semanais de altura, cobertura do solo e estádio fenológico.`;

        return await prisma.relatorio.create({
            data: {
                user_id: userId,
                list_id: listId,
                canteiro_id: lista.canteiro_id,
                status: 'RASCUNHO',
                objective: textoObjetivoGerado,
                introduction: '',
                development: '',
                final_thoughts: '',
                references: '',
                grade: 0.0,
                feedback: '',
                submittedAt: new Date(),
            },
        });
    }

    // Atividade 2 - Buscar um relatório específico pelo ID
    static async getRelatorioById(id: string) {
        const relatorio = await prisma.relatorio.findUnique({
            where: { id: id },
            include: {
                list: {
                    include: { plant: true }
                },
                canteiro: true,
            }
        });

        if (!relatorio) {
            throw new HttpError("Relatório não encontrado.", 404);
        }

        return relatorio;
    }

    // Atualiza apenas o texto do objetivo (salvamento automático) — só o dono pode.
    static async updateObjective(id: string, userId: string, novoObjetivo: string) {
        const relatorio = await this.assertOwnership(id, userId);
        if (relatorio.status === "SUBMETIDO" || relatorio.status === "CORRIGIDO") {
            throw new HttpError("Não é possível editar um relatório já submetido", 400);
        }
        return prisma.relatorio.update({
            where: { id },
            data: { objective: novoObjetivo },
        });
    }

    static async updateSection(id: string, userId: string, secao: Secao, valor: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);
        if (!SECOES_VALIDAS.includes(secao)) {
            throw new HttpError(`Seção inválida. Use: ${SECOES_VALIDAS.join(", ")}`, 400);
        }
        if (typeof valor !== "string") {
            throw new HttpError("O valor da seção deve ser texto", 400);
        }

        const relatorio = await this.assertOwnership(id, userId);
        if (relatorio.status === "SUBMETIDO" || relatorio.status === "CORRIGIDO") {
            throw new HttpError("Não é possível editar um relatório já submetido", 400);
        }

        return prisma.relatorio.update({
            where: { id },
            data: { [secao]: valor },
        });
    }

    static async update(id: string, userId: string, body: any) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const relatorio = await this.assertOwnership(id, userId);
        if (relatorio.status === "SUBMETIDO" || relatorio.status === "CORRIGIDO") {
            throw new HttpError("Não é possível editar um relatório já submetido", 400);
        }

        const data: Record<string, string> = {};
        for (const secao of SECOES_VALIDAS) {
            if (typeof body[secao] === "string") {
                data[secao] = body[secao];
            }
        }

        if (Object.keys(data).length === 0) {
            throw new HttpError("Nenhum campo válido enviado para atualização", 400);
        }

        return prisma.relatorio.update({
            where: { id },
            data,
        });
    }

    static async submit(id: string, userId: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const relatorio = await this.assertOwnership(id, userId);
        if (relatorio.status === "SUBMETIDO" || relatorio.status === "CORRIGIDO") {
            throw new HttpError("Relatório já foi submetido", 400);
        }

        return prisma.relatorio.update({
            where: { id },
            data: {
                status: "SUBMETIDO",
                submittedAt: new Date(),
            },
        });
    }

    // Remove o relatório — só o dono e só em RASCUNHO.
    // Submetido/Corrigido não pode apagar pra preservar histórico acadêmico.
    static async delete(id: string, userId: string) {
        const relatorio = await this.assertOwnership(id, userId);
        if (relatorio.status !== "RASCUNHO") {
            throw new HttpError(
                "Não é possível excluir um relatório já submetido ou corrigido",
                400
            );
        }
        return prisma.relatorio.delete({ where: { id } });
    }

    // Carrega o relatório e garante que pertence ao usuário autenticado.
    // 403 se não for dono, 404 se não existir.
    private static async assertOwnership(id: string, userId: string) {
        const relatorio = await prisma.relatorio.findUnique({ where: { id } });
        if (!relatorio) throw new HttpError("Relatório não encontrado", 404);
        if (relatorio.user_id !== userId) {
            throw new HttpError("Você só pode alterar os próprios relatórios", 403);
        }
        return relatorio;
    }
}
