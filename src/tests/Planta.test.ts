import { describe, it, expect, beforeEach } from "vitest";
import { Planta } from "./models/Planta.js";
import { CadastroPlanta } from "./services/CadastroPlanta.js";

describe("CadastroPlanta", () => {
    let cadastro: CadastroPlanta;

    beforeEach(() => {
        cadastro = new CadastroPlanta();
    });

    it("deve criar uma planta com atributos corretos", () => {
        const planta = new Planta("Rosa", "Ornamental", 45);

        expect(planta.getNome()).toBe("Rosa");
        expect(planta.getTipo()).toBe("Ornamental");
        expect(planta.getAlturaEmCm()).toBe(45);
    });

    it("deve adicionar plantas ao cadastro e retornar a quantidade correta", () => {
        const rosa = new Planta("Rosa", "Ornamental", 45);
        const cacto = new Planta("Cacto", "Suculenta", 20);

        cadastro.adicionarPlanta(rosa);
        cadastro.adicionarPlanta(cacto);

        expect(cadastro.obterQuantidade()).toBe(2);
    });

    it("deve encontrar uma planta existente no cadastro pelo nome", () => {
        const orquidea = new Planta("Orquídea", "Epífita", 30);
        cadastro.adicionarPlanta(orquidea);

        expect(cadastro.existePlanta("Orquídea")).toBe(true);
    });

    it("deve classificar corretamente o porte da planta pela altura", () => {
        const pequena = new Planta("Violeta", "Ornamental", 15);
        const media = new Planta("Girassol", "Ornamental", 80);
        const grande = new Planta("Bananeira", "Frutífera", 200);

        expect(cadastro.classificarPorte(pequena)).toBe("PEQUENO");
        expect(cadastro.classificarPorte(media)).toBe("MEDIO");
        expect(cadastro.classificarPorte(grande)).toBe("GRANDE");
    });

    it("deve lançar exceção ao criar uma planta com nome vazio", () => {
        expect(() => new Planta("", "Ornamental", 50)).toThrow(
            "Nome da planta não pode ser vazio"
        );
    });
});
