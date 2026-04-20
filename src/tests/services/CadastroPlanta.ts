import { Planta, PortePlanta } from "../models/Planta.js";

export class CadastroPlanta {
    private plantas: Planta[] = [];

    adicionarPlanta(planta: Planta): void {
        if (!planta) {
            throw new Error("Planta não pode ser nula");
        }
        this.plantas.push(planta);
    }

    obterQuantidade(): number {
        return this.plantas.length;
    }

    existePlanta(nome: string): boolean {
        return this.plantas.some((p) => p.getNome() === nome);
    }

    buscarPlantaPorNome(nome: string): Planta | undefined {
        return this.plantas.find((p) => p.getNome() === nome);
    }

    classificarPorte(planta: Planta): PortePlanta {
        if (planta.getAlturaEmCm() <= 30) return "PEQUENO";
        if (planta.getAlturaEmCm() <= 100) return "MEDIO";
        return "GRANDE";
    }
}
