import { prisma } from "../lib/prisma.js";

type TemplateItem = { field_name: string; unit: string };

type CategoryData = {
    category: string;
    semester_focus: string;
    description: string;
    plants: string[];
    templates: TemplateItem[];
};

const cat1Templates: TemplateItem[] = [
    { field_name: "Altura da planta", unit: "cm" },
    { field_name: "Número de perfilhos", unit: "unidade" },
    { field_name: "Cobertura do solo", unit: "%" },
    { field_name: "Comprimento da folha bandeira", unit: "cm" },
    { field_name: "Largura da folha", unit: "cm" },
    { field_name: "Estádio fenológico", unit: "vegetativo/elongação/florescimento" },
    { field_name: "Irrigação realizada", unit: "checklist" },
    { field_name: "Adubação nitrogenada realizada", unit: "checklist" },
    { field_name: "Adubação fosfatada realizada", unit: "checklist" },
    { field_name: "Capina/controle de plantas daninhas", unit: "checklist" },
    { field_name: "Controle de pragas realizado", unit: "checklist" },
    { field_name: "Corte/roçada realizada", unit: "checklist" },
    { field_name: "Registro de florescimento observado", unit: "checklist" },
    { field_name: "Sinais de estresse hídrico observados", unit: "checklist" },
];

const cat2Templates: TemplateItem[] = [
    { field_name: "Altura da planta", unit: "cm" },
    { field_name: "Número de perfilhos", unit: "unidade" },
    { field_name: "Cobertura do solo", unit: "%" },
    { field_name: "Comprimento do entrenó", unit: "cm" },
    { field_name: "Estádio fenológico", unit: "vegetativo/elongação/florescimento" },
    { field_name: "Irrigação realizada", unit: "checklist" },
    { field_name: "Adubação nitrogenada realizada", unit: "checklist" },
    { field_name: "Capina/controle de plantas daninhas", unit: "checklist" },
    { field_name: "Controle de cigarrinha-das-pastagens", unit: "checklist" },
    { field_name: "Corte/roçada realizada", unit: "checklist" },
    { field_name: "Sinais de senescência foliar observados", unit: "checklist" },
    { field_name: "Sinais de estresse hídrico observados", unit: "checklist" },
];

const cat3Templates: TemplateItem[] = [
    { field_name: "Altura do dossel", unit: "cm" },
    { field_name: "Cobertura do solo", unit: "%" },
    { field_name: "Densidade de perfilhos", unit: "perfilhos/m²" },
    { field_name: "Estádio fenológico", unit: "vegetativo/elongação/florescimento" },
    { field_name: "Irrigação realizada", unit: "checklist" },
    { field_name: "Adubação realizada", unit: "checklist" },
    { field_name: "Capina/controle de plantas daninhas", unit: "checklist" },
    { field_name: "Corte/pastejo simulado realizado", unit: "checklist" },
    { field_name: "Sinais de estresse hídrico observados", unit: "checklist" },
    { field_name: "Presença de pragas observada", unit: "checklist" },
];

const cat4Templates: TemplateItem[] = [
    { field_name: "Altura da planta", unit: "cm" },
    { field_name: "Diâmetro do colmo", unit: "mm" },
    { field_name: "Número de folhas expandidas", unit: "unidade" },
    { field_name: "Número de colmos por touceira", unit: "unidade" },
    { field_name: "Estádio fenológico", unit: "V1/V2.../VT/R1/R2" },
    { field_name: "Irrigação realizada", unit: "checklist" },
    { field_name: "Adubação de cobertura realizada", unit: "checklist" },
    { field_name: "Capina/controle de plantas daninhas", unit: "checklist" },
    { field_name: "Controle de pragas realizado", unit: "checklist" },
    { field_name: "Controle de doenças foliares", unit: "checklist" },
    { field_name: "Sinais de acamamento observados", unit: "checklist" },
    { field_name: "Registro de florescimento/espigamento", unit: "checklist" },
];

const cat5Templates: TemplateItem[] = [
    { field_name: "Altura da planta", unit: "cm" },
    { field_name: "Número de folhas expandidas", unit: "unidade" },
    { field_name: "Diâmetro do caule", unit: "mm" },
    { field_name: "Estádio fenológico", unit: "VE/V1/V2.../R1/R2/R3" },
    { field_name: "Número de ramos laterais", unit: "unidade" },
    { field_name: "Irrigação realizada", unit: "checklist" },
    { field_name: "Adubação realizada", unit: "checklist" },
    { field_name: "Capina/controle de plantas daninhas", unit: "checklist" },
    { field_name: "Controle de pragas (lagartas, percevejos)", unit: "checklist" },
    { field_name: "Controle de doenças", unit: "checklist" },
    { field_name: "Registro de florescimento observado", unit: "checklist" },
    { field_name: "Sinais de deficiência nutricional observados", unit: "checklist" },
];

const cat6Templates: TemplateItem[] = [
    { field_name: "Altura da planta", unit: "cm" },
    { field_name: "Diâmetro do caule na base", unit: "mm" },
    { field_name: "Número de folhas compostas", unit: "unidade" },
    { field_name: "Número de ramos primários", unit: "unidade" },
    { field_name: "Comprimento do ramo principal", unit: "cm" },
    { field_name: "Irrigação realizada", unit: "checklist" },
    { field_name: "Adubação fosfatada realizada", unit: "checklist" },
    { field_name: "Capina/controle de plantas daninhas", unit: "checklist" },
    { field_name: "Poda de formação realizada", unit: "checklist" },
    { field_name: "Controle de pragas (desfolhadores)", unit: "checklist" },
    { field_name: "Registro de florescimento/vagem observado", unit: "checklist" },
    { field_name: "Sinais de nodulação radicular observados", unit: "checklist" },
];

const cat7Templates: TemplateItem[] = [
    { field_name: "Comprimento dos ramos", unit: "cm" },
    { field_name: "Cobertura do solo", unit: "%" },
    { field_name: "Número de nós com folhas", unit: "unidade" },
    { field_name: "Estádio fenológico", unit: "vegetativo/florescimento/frutificação" },
    { field_name: "Irrigação realizada", unit: "checklist" },
    { field_name: "Adubação fosfatada realizada", unit: "checklist" },
    { field_name: "Capina/controle de plantas daninhas", unit: "checklist" },
    { field_name: "Controle de pragas foliares", unit: "checklist" },
    { field_name: "Registro de florescimento observado", unit: "checklist" },
    { field_name: "Sinais de nodulação observados", unit: "checklist" },
    { field_name: "Presença de trepadeira/haste enrolante verificada", unit: "checklist" },
];

const cat8Templates: TemplateItem[] = [
    { field_name: "Altura da planta", unit: "cm" },
    { field_name: "Largura da planta", unit: "cm" },
    { field_name: "Número total de cladódios", unit: "unidade" },
    { field_name: "Comprimento do cladódio", unit: "cm" },
    { field_name: "Largura do cladódio", unit: "cm" },
    { field_name: "Espessura do cladódio", unit: "cm" },
    { field_name: "Número de cladódios primários", unit: "unidade" },
    { field_name: "Número de cladódios secundários", unit: "unidade" },
    { field_name: "Adubação orgânica realizada", unit: "checklist" },
    { field_name: "Adubação mineral realizada", unit: "checklist" },
    { field_name: "Controle de cochonilha-do-carmim", unit: "checklist" },
    { field_name: "Capina/controle de plantas daninhas", unit: "checklist" },
    { field_name: "Replantio de cladódios perdidos", unit: "checklist" },
    { field_name: "Sinais de podridão observados", unit: "checklist" },
    { field_name: "Sinais de desidratação dos cladódios observados", unit: "checklist" },
];

const categories: CategoryData[] = [
    {
        category: "GRAMINEA",
        semester_focus: "AMBOS",
        description: "Gramínea tropical de porte alto, com alta capacidade de produção de biomassa e adaptação ao cultivo intensivo.",
        plants: [
            "Capim Massai",
            "Capim Tanzânia",
            "Capim Mombaça",
            "BRS Capiaçu",
            "Capim-elefante cv. Merker",
            "Capim-elefante cv. Mott",
            "Capim-elefante cv. IRI-381",
            "Capim-elefante cv. Roxo",
            "Taiwan A-146 2.37",
            "BRS Kurumi",
        ],
        templates: cat1Templates,
    },
    {
        category: "GRAMINEA",
        semester_focus: "AMBOS",
        description: "Gramínea tropical de porte médio (Brachiaria/Urochloa), amplamente utilizada em pastagens extensivas e sistemas de integração lavoura-pecuária.",
        plants: [
            "Brachiaria ruziziensis",
            "Brachiaria decumbens",
            "Xaraés c/ adubação orgânica",
            "Xaraés s/ adubação",
            "Xaraés c/ adubação química",
            "Xaraés + Amendoim forrageiro",
            "BRS Piatã",
        ],
        templates: cat2Templates,
    },
    {
        category: "GRAMINEA",
        semester_focus: "AMBOS",
        description: "Gramínea de porte baixo ou rasteira, indicada para pastejo contínuo e cobertura do solo em pastagens extensivas.",
        plants: [
            "Tifton",
            "Pangolão",
            "Swazi",
            "Aruana",
            "Capim de planta",
            "Capim gordura",
            "Capim corrente",
            "Andropogon",
            "BRS Quênia",
            "Híbrido HV-241",
        ],
        templates: cat3Templates,
    },
    {
        category: "GRAMINEA",
        semester_focus: "PRIMEIRO",
        description: "Cultura anual ou semiperene, utilizada para produção de forragem e ensilagem na suplementação alimentar do rebanho.",
        plants: [
            "Sorgo SF 15",
            "Sorgo 2502",
            "Sudão",
            "Milho São José",
            "Milho CMS-36",
            "Milheto",
            "Cana-de-açúcar",
            "Capim buffel",
            "Capim Guatemala",
        ],
        templates: cat4Templates,
    },
    {
        category: "OUTRO",
        semester_focus: "PRIMEIRO",
        description: "Oleaginosa forrageira cultivada tanto para produção de grãos quanto para uso como forragem verde ou ensilagem.",
        plants: [
            "Girassol",
            "Soja",
        ],
        templates: cat5Templates,
    },
    {
        category: "LEGUMINOSA",
        semester_focus: "SEGUNDO",
        description: "Leguminosa arbustiva ou arbórea, com alta fixação biológica de nitrogênio e uso múltiplo em sistemas silvipastoris.",
        plants: [
            "Gliricídia",
            "Leucena",
            "Guandu",
            "Jureminha",
            "Pornunça",
        ],
        templates: cat6Templates,
    },
    {
        category: "LEGUMINOSA",
        semester_focus: "SEGUNDO",
        description: "Leguminosa herbácea rasteira, utilizada em consórcio com gramíneas para enriquecimento proteico da pastagem.",
        plants: [
            "Centrosema",
            "Calopogônio",
            "Kudzu",
            "Cunhã",
            "Estilosantes cv. Campo Grande",
            "Amendoim Forrageiro",
            "Feijão de rola",
            "Mucuna",
            "Orelha de onça",
        ],
        templates: cat7Templates,
    },
    {
        category: "CACTACEA",
        semester_focus: "AMBOS",
        description: "Cactácea forrageira adaptada ao semiárido nordestino, utilizada como fonte hídrica e energética para o rebanho em períodos de estiagem.",
        plants: [
            "Palma Gigante",
            "Palma Miúda",
            "Palma IPA Sertânia",
            "Palma Orelha Africana",
            "Palma Orelha Mexicana",
            "Cactáceas nativas",
        ],
        templates: cat8Templates,
    },
    {
        category: "GRAMINEA",
        semester_focus: "AMBOS",
        description: "Forrageira especial de porte alto, com características de alta produtividade e adaptação às condições tropicais e semiáridas.",
        plants: [
            "Camelo",
            "Capim Buffel",
        ],
        templates: cat1Templates,
    },
];

async function main() {
    console.log("Iniciando seed do banco de dados...");

    const institutionName = "UFRPE — Departamento de Zootecnia";
    const existingInstitution = await prisma.institution.findFirst({
        where: { name: institutionName },
    });
    const institution = existingInstitution ?? await prisma.institution.create({
        data: { name: institutionName },
    });
    console.log(`Instituição: ${institution.name} (${existingInstitution ? "já existia" : "criada"})`);

    let plantsCreated = 0;
    let plantsSkipped = 0;
    let templatesCreated = 0;

    for (const cat of categories) {
        for (const plantName of cat.plants) {
            const existingPlant = await prisma.plantaForrageira.findFirst({
                where: { name: plantName },
            });

            const plant = existingPlant ?? await prisma.plantaForrageira.create({
                data: {
                    name: plantName,
                    category: cat.category,
                    description: cat.description,
                    semester_focus: cat.semester_focus,
                },
            });

            if (existingPlant) {
                plantsSkipped++;
            } else {
                plantsCreated++;
            }

            const templateCount = await prisma.plantTemplate.count({
                where: { plant_id: plant.id },
            });

            if (templateCount === 0) {
                for (const tmpl of cat.templates) {
                    await prisma.plantTemplate.create({
                        data: {
                            plant_id: plant.id,
                            field_name: tmpl.field_name,
                            unit: tmpl.unit,
                        },
                    });
                    templatesCreated++;
                }
            }
        }
    }

    console.log("\nResumo:");
    console.log(`  Plantas criadas:      ${plantsCreated}`);
    console.log(`  Plantas já existiam:  ${plantsSkipped}`);
    console.log(`  Templates criados:    ${templatesCreated}`);
    console.log("\nSeed concluído com sucesso!");
}

main()
    .catch((e) => {
        console.error("Erro no seed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
