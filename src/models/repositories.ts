// ============================================================
// repositories.ts — Interfaces de repositório
// Desacopla os serviços do Prisma, facilitando mocks nos testes
// ============================================================

import { CreateRegistroDTO, Periodo, Relatorio, RegistroSemanal, UpdateRelatorioDTO } from "./types";

export interface IRegistroRepository {
  criar(dto: CreateRegistroDTO): Promise<RegistroSemanal>;
  listarPorAluno(alunoId: string): Promise<RegistroSemanal[]>;
}

export interface IRelatorioRepository {
  criar(dados: Omit<Relatorio, "id" | "criadoEm">): Promise<Relatorio>;
  buscarPorId(id: string): Promise<Relatorio | null>;
  atualizar(id: string, dados: Partial<Relatorio>): Promise<Relatorio>;
}

export interface IPeriodoRepository {
  buscarPorId(id: string): Promise<Periodo | null>;
}