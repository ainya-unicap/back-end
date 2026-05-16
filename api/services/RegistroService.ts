// ============================================================
// RegistroService.ts — Implementação
// ============================================================

import { IRegistroRepository } from "../models/repositories";
import { CreateRegistroDTO, RegistroSemanal } from "../models/types";

const CAMPOS_OBRIGATORIOS: (keyof CreateRegistroDTO)[] = [
  "canteirId",
  "alunoId",
  "data",
  "medicoes",
  "observacoes",
  "checklist",
];

export class RegistroService {
  constructor(private readonly registroRepo: IRegistroRepository) {}

  async criarRegistro(dto: CreateRegistroDTO): Promise<RegistroSemanal> {
    this.validarCamposObrigatorios(dto);
    return this.registroRepo.criar(dto);
  }

  async salvarRegistroOffline(dto: CreateRegistroDTO): Promise<RegistroSemanal> {
    // Persiste localmente sem acionar o repositório remoto
    const registroLocal: RegistroSemanal = {
      id: `local-${Date.now()}`,
      ...dto,
      sincronizado: false,
      criadoEm: new Date(),
    };
    return Promise.resolve(registroLocal);
  }

  validarCamposObrigatorios(dto: Partial<CreateRegistroDTO>): void {
    for (const campo of CAMPOS_OBRIGATORIOS) {
      if (dto[campo] === undefined || dto[campo] === null || dto[campo] === "") {
        throw new Error(`${campo} é obrigatório`);
      }
    }
  }
}