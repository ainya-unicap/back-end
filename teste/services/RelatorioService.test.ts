
import { RelatorioService } from "../../src/services/RelatorioService";
import {
  IRelatorioRepository,
  IRegistroRepository,
  IPeriodoRepository,
} from "../../src/models/repositories";
import {
  Relatorio,
  RegistroSemanal,
  ChecklistManejo,
  Medicoes,
  Periodo,
  UpdateRelatorioDTO,
  SubmeterRelatorioDTO,
} from "../../src/models/types";

// ── Fixtures ─────────────────────────────────────────────────

const medicoesMock: Medicoes = {
  alturaPlanta: 40,
  numeroDeFolhas: 15,
  estadoGeral: "OTIMO",
};

const checklistMock: ChecklistManejo = {
  irrigacaoRealizada: true,
  adubacaoRealizada: true,
  controleAgronomico: true,
  podaRealizada: false,
};

const registrosMock: RegistroSemanal[] = [
  {
    id: "reg-001",
    canteirId: "canteiro-001",
    alunoId: "aluno-001",
    data: new Date("2025-06-03"),
    medicoes: medicoesMock,
    observacoes: "Semana 1: brotação inicial.",
    fotoUrl: "https://storage.example.com/foto-s1.jpg",
    checklist: checklistMock,
    sincronizado: true,
    criadoEm: new Date("2025-06-03"),
  },
  {
    id: "reg-002",
    canteirId: "canteiro-001",
    alunoId: "aluno-001",
    data: new Date("2025-06-10"),
    medicoes: { ...medicoesMock, alturaPlanta: 50 },
    observacoes: "Semana 2: crescimento acelerado.",
    checklist: checklistMock,
    sincronizado: true,
    criadoEm: new Date("2025-06-10"),
  },
];

// Período cujo prazo já passou → submissão permitida
const periodoExpirado: Periodo = {
  id: "periodo-001",
  inicio: new Date("2025-06-01"),
  fim: new Date("2025-06-30"),
  dataLimiteSubmissao: new Date("2025-07-05"),
};

// Período cujo prazo ainda não chegou → submissão bloqueada
const periodoFuturo: Periodo = {
  ...periodoExpirado,
  dataLimiteSubmissao: new Date("2099-12-31"),
};

const relatorioRascunhoMock: Relatorio = {
  id: "relatorio-001",
  alunoId: "aluno-001",
  periodoId: "periodo-001",
  conteudo: "Relatório gerado automaticamente com 2 registros.",
  status: "RASCUNHO",
  registros: registrosMock,
  criadoEm: new Date(),
};

// ── Suite de Testes ───────────────────────────────────────────

describe("RelatorioService", () => {
  let service: RelatorioService;
  let relatorioRepoMock: jest.Mocked<IRelatorioRepository>;
  let registroRepoMock: jest.Mocked<IRegistroRepository>;
  let periodoRepoMock: jest.Mocked<IPeriodoRepository>;

  beforeEach(() => {
    relatorioRepoMock = {
      criar: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
    };
    registroRepoMock = {
      criar: jest.fn(),
      listarPorAluno: jest.fn(),
    };
    periodoRepoMock = {
      buscarPorId: jest.fn(),
    };

    service = new RelatorioService(
      relatorioRepoMock,
      registroRepoMock,
      periodoRepoMock
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────────
  // CT-06 — Geração de relatório com registros existentes
  // Urgência: Alta | Fluxo Principal UC-02, passos 1–3
  // ──────────────────────────────────────────────────────────
  describe("gerarRelatorio", () => {
    it("CT-06 — deve gerar o relatório corretamente quando há registros cadastrados", async () => {
      // Arrange
      registroRepoMock.listarPorAluno.mockResolvedValue(registrosMock);
      relatorioRepoMock.criar.mockResolvedValue(relatorioRascunhoMock);

      // Act
      const resultado = await service.gerarRelatorio("aluno-001", "periodo-001");

      // Assert
      expect(registroRepoMock.listarPorAluno).toHaveBeenCalledWith("aluno-001");
      expect(relatorioRepoMock.criar).toHaveBeenCalledTimes(1);
      expect(resultado.id).toBe("relatorio-001");
      expect(resultado.status).toBe("RASCUNHO");
      expect(resultado.registros).toHaveLength(2);
    });

    // ──────────────────────────────────────────────────────
    // CT-07 — Bloqueio de geração sem registros
    // Urgência: Alta | Fluxo Alternativo UC-02 FA01
    // ──────────────────────────────────────────────────────
    it("CT-07 — deve lançar erro quando o aluno não possui registros cadastrados", async () => {
      // Arrange — repositório retorna lista vazia
      registroRepoMock.listarPorAluno.mockResolvedValue([]);

      // Act & Assert
      await expect(
        service.gerarRelatorio("aluno-sem-registros", "periodo-001")
      ).rejects.toThrow(
        "Não é possível gerar relatório: nenhum registro semanal encontrado"
      );

      // Relatório NÃO deve ser criado no banco
      expect(relatorioRepoMock.criar).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────
  // CT-08 — Edição do conteúdo do relatório
  // Urgência: Média | Fluxo Principal UC-02, passo 3
  // ──────────────────────────────────────────────────────────
  describe("editarRelatorio", () => {
    it("CT-08a — deve salvar as alterações de conteúdo com sucesso", async () => {
      // Arrange
      const novoConteudo = "Conteúdo revisado pelo aluno.";
      const dto: UpdateRelatorioDTO = { conteudo: novoConteudo };
      const relatorioAtualizado: Relatorio = {
        ...relatorioRascunhoMock,
        conteudo: novoConteudo,
      };

      relatorioRepoMock.buscarPorId.mockResolvedValue(relatorioRascunhoMock);
      relatorioRepoMock.atualizar.mockResolvedValue(relatorioAtualizado);

      // Act
      const resultado = await service.editarRelatorio("relatorio-001", dto);

      // Assert
      expect(relatorioRepoMock.atualizar).toHaveBeenCalledTimes(1);
      expect(relatorioRepoMock.atualizar).toHaveBeenCalledWith(
        "relatorio-001",
        expect.objectContaining({ conteudo: novoConteudo })
      );
      expect(resultado.conteudo).toBe(novoConteudo);
    });

    it("CT-08b — deve lançar erro ao tentar editar relatório já submetido", async () => {
      // Arrange
      const relatorioSubmetido: Relatorio = {
        ...relatorioRascunhoMock,
        status: "SUBMETIDO",
      };
      relatorioRepoMock.buscarPorId.mockResolvedValue(relatorioSubmetido);

      // Act & Assert
      await expect(
        service.editarRelatorio("relatorio-001", { conteudo: "Tentativa inválida" })
      ).rejects.toThrow("Não é possível editar um relatório já submetido");

      expect(relatorioRepoMock.atualizar).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────
  // CT-09 — Submissão correta após o prazo
  // Urgência: Alta | Fluxo Principal UC-02, passos 4–6
  // ──────────────────────────────────────────────────────────
  describe("submeterRelatorio", () => {
    it("CT-09 — deve submeter o relatório com sucesso quando o prazo foi atingido", async () => {
      // Arrange
      const relatorioSubmetidoMock: Relatorio = {
        ...relatorioRascunhoMock,
        status: "SUBMETIDO",
        submissaoEm: new Date(),
      };

      relatorioRepoMock.buscarPorId.mockResolvedValue(relatorioRascunhoMock);
      periodoRepoMock.buscarPorId.mockResolvedValue(periodoExpirado);
      relatorioRepoMock.atualizar.mockResolvedValue(relatorioSubmetidoMock);

      const dto: SubmeterRelatorioDTO = {
        relatorioId: "relatorio-001",
        alunoId: "aluno-001",
      };

      // Act
      const resultado = await service.submeterRelatorio(dto);

      // Assert
      expect(resultado.status).toBe("SUBMETIDO");
      expect(resultado.submissaoEm).toBeInstanceOf(Date);
      expect(relatorioRepoMock.atualizar).toHaveBeenCalledWith(
        "relatorio-001",
        expect.objectContaining({ status: "SUBMETIDO" })
      );
    });

    // ──────────────────────────────────────────────────────
    // CT-10 — Bloqueio de submissão antes do prazo
    // Urgência: Alta | Fluxo Alternativo UC-02 FA02
    // ──────────────────────────────────────────────────────
    it("CT-10 — deve bloquear a submissão quando o prazo ainda não chegou", async () => {
      // Arrange — período com data de submissão no futuro
      relatorioRepoMock.buscarPorId.mockResolvedValue(relatorioRascunhoMock);
      periodoRepoMock.buscarPorId.mockResolvedValue(periodoFuturo);

      const dto: SubmeterRelatorioDTO = {
        relatorioId: "relatorio-001",
        alunoId: "aluno-001",
      };

      // Act & Assert
      await expect(service.submeterRelatorio(dto)).rejects.toThrow(
        "Submissão bloqueada: o prazo de envio ainda não foi atingido"
      );

      // Banco NÃO deve ser atualizado
      expect(relatorioRepoMock.atualizar).not.toHaveBeenCalled();
    });
  });
});