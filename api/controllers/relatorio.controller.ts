import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { HttpError } from "../core/httpError.js";
import { RelatorioService } from "../services/relatorio.service.js";

export class RelatorioController {

    static async findByUser(req: Request, res: Response) {
        try {
            const userId = req.params.userId as string;
            const relatorios = await RelatorioService.getRelatoriosByUser(userId);
            return res.status(200).json(relatorios);
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async generate(req: Request, res: Response) {
        try {
            // user_id sempre vem do JWT (requireAuth) — body não controla mais.
            const userId = req.user!.id;
            const { list_id } = req.body;

            if (!list_id) {
                return res.status(400).json({ error: "list_id é obrigatório." });
            }

            const novoRelatorio = await RelatorioService.createRelatorio(userId, list_id);
            return res.status(201).json(novoRelatorio);
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async findById(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const relatorio = await RelatorioService.getRelatorioById(id);
            return res.status(200).json(relatorio);
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async updateObjective(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { objective } = req.body;

            if (objective === undefined) {
                return res.status(400).json({ error: "O campo objective é obrigatório para atualização." });
            }

            const relatorioAtualizado = await RelatorioService.updateObjective(
                id,
                req.user!.id,
                objective
            );
            return res.status(200).json(relatorioAtualizado);
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async updateIntroduction(req: Request, res: Response) {
        return RelatorioController.handleSection(req, res, "introduction");
    }

    static async updateDevelopment(req: Request, res: Response) {
        return RelatorioController.handleSection(req, res, "development");
    }

    static async updateFinalThoughts(req: Request, res: Response) {
        return RelatorioController.handleSection(req, res, "final_thoughts");
    }

    static async updateReferences(req: Request, res: Response) {
        return RelatorioController.handleSection(req, res, "references");
    }

    static async update(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const atualizado = await RelatorioService.update(id, req.user!.id, req.body);
            return res.status(200).json(atualizado);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async submit(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const submetido = await RelatorioService.submit(id, req.user!.id);
            return res.status(200).json(submetido);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const deleted = await RelatorioService.delete(id, req.user!.id);
            return res.status(200).json({
                message: "Relatório removido com sucesso",
                data: deleted,
            });
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async exportPdf(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const relatorio: any = await RelatorioService.getRelatorioById(id);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="relatorio-${id}.pdf"`
            );

            const doc = new PDFDocument({ size: "A4", margin: 50 });
            doc.pipe(res);

            const planta = relatorio.list?.plant?.name ?? "—";
            const canteiro = relatorio.canteiro?.name ?? "—";

            doc.fontSize(18).text("Relatório", { align: "center" });
            doc.moveDown();
            doc.fontSize(10).text(`ID: ${relatorio.id}`);
            doc.text(`Status: ${relatorio.status}`);
            doc.text(`Planta: ${planta}`);
            doc.text(`Canteiro: ${canteiro}`);
            doc.text(
                `Gerado em: ${new Date(relatorio.createdAt).toLocaleString("pt-BR")}`
            );
            doc.moveDown();

            const secoes: Array<{ titulo: string; campo: string }> = [
                { titulo: "Introdução", campo: "introduction" },
                { titulo: "Objetivo", campo: "objective" },
                { titulo: "Desenvolvimento", campo: "development" },
                { titulo: "Considerações Finais", campo: "final_thoughts" },
                { titulo: "Referências", campo: "references" },
            ];

            for (const { titulo, campo } of secoes) {
                doc.fontSize(14).text(titulo, { underline: true });
                doc.moveDown(0.3);
                doc.fontSize(11).text(relatorio[campo] || "(vazio)", {
                    align: "justify",
                });
                doc.moveDown();
            }

            doc.end();
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            if (!res.headersSent) {
                return res
                    .status(err.status || 500)
                    .json({ error: err.message });
            }
            res.end();
        }
    }

    private static async handleSection(
        req: Request,
        res: Response,
        secao: "introduction" | "objective" | "development" | "final_thoughts" | "references"
    ) {
        try {
            const id = req.params.id as string;
            const valor = req.body[secao];

            if (valor === undefined) {
                return res.status(400).json({
                    error: `O campo ${secao} é obrigatório para atualização.`,
                });
            }

            const atualizado = await RelatorioService.updateSection(id, req.user!.id, secao, valor);
            return res.status(200).json(atualizado);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }
}
