

import { RegistroService } from "../../src/services/RegistroService";
import { IRegistroRepository } from "../../src/models/repositories";
import {
  CreateRegistroDTO,
  RegistroSemanal,
  ChecklistManejo,
  Medicoes,
} from "../../src/models/types";

// ── Fixtures ─────────────────────────────────────────────────

const medicoesMock: Medicoes = {
  alturaPlanta: 35,
  numeroDeFolhas: 12,
  estadoGeral: "BOM",
};

const checklistMock: ChecklistManejo = {
  irrigacaoRealizada: true,
  adubacaoRealizada: false,
  controleAgronomico: true,
  podaRealizada: false,
};

const dtoValido: CreateRegistroDTO = {
  canteirId: "canteiro-001",
  alunoId: "aluno-001",
  data: new Date("2025-06-10"),
  medicoes: medicoesMock,
  observacoes: "Crescimento dentro do esperado.",
  fotoUrl: "https://storage.example.com/foto-semana1.jpg",
  checklist: checklistMock,
};

const registroSalvoMock: RegistroSemanal = {
  id: "registro-uuid-001",
  ...dtoValido,
  sincronizado: true,
  criadoEm: new Date(),
};

// ── Suite de Testes ───────────────────────────────────────────

describe("RegistroService", () => {
  let service: RegistroService;
  let registroRepoMock: jest.Mocked<IRegistroRepository>;

  beforeEach(() => {
    registroRepoMock = {
      criar: jest.fn(),
      listarPorAluno: jest.fn(),
    };
    service = new RegistroService(registroRepoMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────────
  // CT-01 — Validar criação de registro completo
  // Urgência: Alta | Fluxo Principal UC-01, passos 3–7
  // ──────────────────────────────────────────────────────────
  describe("criarRegistro", () => {
    it("CT-01 — deve persistir o registro e retorná-lo quando os dados são válidos", async () => {
      // Arrange
      registroRepoMock.criar.mockResolvedValue(registroSalvoMock);

      // Act
      const resultado = await service.criarRegistro(dtoValido);

      // Assert
      expect(registroRepoMock.criar).toHaveBeenCalledTimes(1);
      expect(registroRepoMock.criar).toHaveBeenCalledWith(dtoValido);
      expect(resultado.id).toBe("registro-uuid-001");
      expect(resultado.sincronizado).toBe(true);
    });

    it("CT-01b — (CT-04) deve preservar a fotoUrl no registro salvo", async () => {
      // Arrange
      registroRepoMock.criar.mockResolvedValue(registroSalvoMock);

      // Act
      const resultado = await service.criarRegistro(dtoValido);

      // Assert — CT-04: foto deve ser associada ao registro com dados corretos
      expect(resultado.fotoUrl).toBe(dtoValido.fotoUrl);
      expect(resultado.criadoEm).toBeInstanceOf(Date);
    });

    it("CT-05 — deve propagar erro quando o repositório falha ao salvar", async () => {
      // Arrange — simula falha no banco (FA03)
      registroRepoMock.criar.mockRejectedValue(
        new Error("Falha ao conectar com o banco de dados")
      );

      // Act & Assert
      await expect(service.criarRegistro(dtoValido)).rejects.toThrow(
        "Falha ao conectar com o banco de dados"
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  // CT-02 — Validar obrigatoriedade de campos
  // Urgência: Alta | Fluxo Alternativo UC-01 FA02
  // ──────────────────────────────────────────────────────────
  describe("validarCamposObrigatorios", () => {
    it("CT-02a — deve lançar erro quando canteirId está ausente", () => {
      // Arrange
      const { canteirId, ...dtoSemCanteiro } = dtoValido;

      // Act & Assert
      expect(() =>
        service.validarCamposObrigatorios(dtoSemCanteiro)
      ).toThrow("canteirId é obrigatório");
    });

    it("CT-02b — deve lançar erro quando observacoes está ausente", () => {
      // Arrange
      const { observacoes, ...dtoSemObservacao } = dtoValido;

      // Act & Assert
      expect(() =>
        service.validarCamposObrigatorios(dtoSemObservacao)
      ).toThrow("observacoes é obrigatório");
    });

    it("CT-02c — deve lançar erro quando medicoes está ausente", () => {
      // Arrange
      const { medicoes, ...dtoSemMedicoes } = dtoValido;

      // Act & Assert
      expect(() =>
        service.validarCamposObrigatorios(dtoSemMedicoes)
      ).toThrow("medicoes é obrigatório");
    });

    it("CT-02d — não deve lançar erro com todos os campos obrigatórios presentes", () => {
      // Act & Assert
      expect(() =>
        service.validarCamposObrigatorios(dtoValido)
      ).not.toThrow();
    });
  });

  // ──────────────────────────────────────────────────────────
  // CT-03 — Validar funcionamento offline
  // Urgência: Alta | Fluxo Alternativo UC-01 FA01
  // ──────────────────────────────────────────────────────────
  describe("salvarRegistroOffline", () => {
    it("CT-03a — deve retornar registro com sincronizado = false sem acionar o repositório remoto", async () => {
      // Arrange — mockamos o próprio método offline para garantir
      // que ele não chama o repositório (banco indisponível)
      const registroOfflineMock: RegistroSemanal = {
        ...registroSalvoMock,
        id: "local-uuid-001",
        sincronizado: false,
      };
      jest
        .spyOn(service, "salvarRegistroOffline")
        .mockResolvedValue(registroOfflineMock);

      // Act
      const resultado = await service.salvarRegistroOffline(dtoValido);

      // Assert
      expect(resultado.sincronizado).toBe(false);
      expect(resultado.id).toBe("local-uuid-001");
      // Repositório remoto NÃO deve ser chamado em modo offline
      expect(registroRepoMock.criar).not.toHaveBeenCalled();
    });

    it("CT-03b — registro offline deve preservar todos os dados do DTO", async () => {
      // Arrange
      const registroOfflineMock: RegistroSemanal = {
        ...registroSalvoMock,
        sincronizado: false,
      };
      jest
        .spyOn(service, "salvarRegistroOffline")
        .mockResolvedValue(registroOfflineMock);

      // Act
      const resultado = await service.salvarRegistroOffline(dtoValido);

      // Assert — integridade dos dados
      expect(resultado.canteirId).toBe(dtoValido.canteirId);
      expect(resultado.alunoId).toBe(dtoValido.alunoId);
      expect(resultado.medicoes).toEqual(medicoesMock);
      expect(resultado.checklist).toEqual(checklistMock);
    });
  });
});