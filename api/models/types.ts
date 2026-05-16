export interface RegistroSemanal {
  id: string;
  canteirId: string;
  alunoId: string;
  data: Date;
  medicoes: Medicoes;
  observacoes: string;
  fotoUrl?: string;
  checklist: ChecklistManejo;
  sincronizado: boolean;
  criadoEm: Date;
}

export interface Medicoes {
  alturaPlanta: number; // cm
  numeroDeFolhas: number;
  estadoGeral: "OTIMO" | "BOM" | "REGULAR" | "RUIM";
}

export interface ChecklistManejo {
  irrigacaoRealizada: boolean;
  adubacaoRealizada: boolean;
  controleAgronomico: boolean;
  podaRealizada: boolean;
}

export interface Relatorio {
  id: string;
  alunoId: string;
  periodoId: string;
  conteudo: string;
  status: "RASCUNHO" | "SUBMETIDO" | "AVALIADO";
  registros: RegistroSemanal[];
  submissaoEm?: Date;
  criadoEm: Date;
}

export interface Periodo {
  id: string;
  inicio: Date;
  fim: Date;
  dataLimiteSubmissao: Date;
}

export interface CreateRegistroDTO {
  canteirId: string;
  alunoId: string;
  data: Date;
  medicoes: Medicoes;
  observacoes: string;
  fotoUrl?: string;
  checklist: ChecklistManejo;
}

export interface UpdateRelatorioDTO {
  conteudo: string;
}

export interface SubmeterRelatorioDTO {
  relatorioId: string;
  alunoId: string;
}