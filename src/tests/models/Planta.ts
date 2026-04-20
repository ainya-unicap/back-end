export type PortePlanta = "PEQUENO" | "MEDIO" | "GRANDE";

export class Planta {
    private readonly nome: string;
    private readonly tipo: string;
    private readonly alturaEmCm: number;

    constructor(nome: string, tipo: string, alturaEmCm: number) {
        if (!nome || nome.trim() === "") {
            throw new Error("Nome da planta não pode ser vazio");
        }
        if (!tipo || tipo.trim() === "") {
            throw new Error("Tipo da planta não pode ser vazio");
        }
        if (alturaEmCm < 0) {
            throw new Error("Altura deve ser maior ou igual a zero");
        }

        this.nome = nome.trim();
        this.tipo = tipo.trim();
        this.alturaEmCm = alturaEmCm;
    }

    getNome(): string {
        return this.nome;
    }

    getTipo(): string {
        return this.tipo;
    }

    getAlturaEmCm(): number {
        return this.alturaEmCm;
    }
}
