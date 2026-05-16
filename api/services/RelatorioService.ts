// ============================================================
// RelatorioService.ts — Implementação
// ============================================================

import {
  IRelatorioRepository,
  IRegistroRepository,
  IPeriodoRepository,
} from "../models/repositories";
import { Relatorio, UpdateRelatorioDTO, SubmeterRelatorioDTO } from "../models/types";

export class RelatorioService {
  constructor(
    private readonly relatorioRepo: IRelatorioRepository,
    private readonly registroRepo: IRegistroRepository,
    private readonly periodoRepo: IPeriodoRepository
  ) {}

  async gerarRelatorio(alunoId: string, periodoId: string): Promise<Relatorio> {
    const registros = await this.registroRepo.listarPorAluno(alunoId);

    if (registros.length === 0) {
      throw new Error(
        "Não é possível gerar relatório: nenhum registro semanal encontrado"
      );
    }

    return this.relatorioRepo.criar({
      alunoId,
      periodoId,
      conteudo: `Relatório gerado automaticamente com ${registros.length} registros.`,
      status: "RASCUNHO",
      registros,
    });
  }

  async editarRelatorio(
    relatorioId: string,
    dto: UpdateRelatorioDTO
  ): Promise<Relatorio> {
    const relatorio = await this.relatorioRepo.buscarPorId(relatorioId);

    if (relatorio?.status === "SUBMETIDO" || relatorio?.status === "AVALIADO") {
      throw new Error("Não é possível editar um relatório já submetido");
    }

    return this.relatorioRepo.atualizar(relatorioId, { conteudo: dto.conteudo });
  }

  async submeterRelatorio(dto: SubmeterRelatorioDTO): Promise<Relatorio> {
    const relatorio = await this.relatorioRepo.buscarPorId(dto.relatorioId);
    const periodo = await this.periodoRepo.buscarPorId(relatorio!.periodoId);

    const agora = new Date();
    if (periodo && agora < periodo.dataLimiteSubmissao) {
      throw new Error(
        "Submissão bloqueada: o prazo de envio ainda não foi atingido"
      );
    }

    return this.relatorioRepo.atualizar(dto.relatorioId, {
      status: "SUBMETIDO",
      submissaoEm: agora,
    });
  }
}