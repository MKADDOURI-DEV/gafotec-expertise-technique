
export const images = {
  hero: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/3dd4f99a792d-7020d9538_generated_a5fef553.png`,
  bureau: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/101258139fde-65b7812f4_generated_eb708468.png`,
  cvc: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/a4a868d0e8f1-f8c405548_generated_f21a34a5.png`,
  plomberie: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/e69816f1368a-9b91d2577_generated_9704d63f.png`,
  chauffage: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/518a2a77466f-e8a4aa313_generated_2c060ec3.png`,
  incendie: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/3be490adf9d6-2f15695d1_generated_a3c52abd.png`,
  desenfumage: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/3c66e4dd6a1c-44d91c8b4_generated_879dea90.png`,
  piscines: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/b91e7abc3624-c9762b0ab_generated_72f7021e.png`,
  solaireToiture: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/1f40ca0466a6-67bb9c6e2_generated_28cae7eb.png`,
  solaireChamp: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/a932f3feb710-7f8421bd5_generated_96d3a96d.png`,
  onduleurs: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/5d09edec0592-8e079c8c0_generated_621694dd.png`,
  laboratoire: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/6c5086e963e5-121d12a74_generated_69889384.png`,
  controle: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/470f78913e60-5bd989852_generated_62dea8d1.png`,
  hilton: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/4e5c4f3621c9-407109a84_generated_45321fb2.png`,
  institutHotellerie: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/62c465c59f9d-2b4002e18_generated_9d0054e6.png`,
  marina: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/f864f4554bda-9a317d4cb_generated_d093c8d7.png`,
  maritime: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/6f4863816ea4-456f07b79_generated_c1d1606b.png`,
  architecture: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/2d153c8dd27a-ffbd3df0c_generated_9373fd4c.png`,
  euromed: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/db47ffe00fd6-4f69031a0_generated_557a2618.png`,
  chantier: `https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/a62e3968c589-4cc5fb2d7_generated_7a26aae1.png`,
};

export const company = {
  name: "GAFOTEC",
  legal: "GAFOTEC â€” Corps dâ€™Ã‰tat Techniques",
  tagline: "Corps dâ€™Ã‰tat Techniques",
  city: "FÃ¨s",
  country: "Maroc",
  phones: ["+212 662 287 996", "+212 635 819 936"],
  phoneHrefs: ["+212662287996", "+212635819936"],
  email: "Ste.gafotec@gmail.com",
  website: "www.gafotec.com",
  address: "2Ã¨me Ã©tage, appartement gauche, Dr Ouled Youssef Ouled Tayeb, FÃ¨s, Maroc",
  whatsapp: "212662287996",
  mapsEmbed:
    "https://www.google.com/maps?q=Ouled+Youssef+Ouled+Tayeb,+F%C3%A8s,+Maroc&z=14&output=embed",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Ouled+Youssef+Ouled+Tayeb+F%C3%A8s+Maroc",
};

export const whatsappLink = (message = "Bonjour GAFOTEC, je souhaite obtenir un devis pour un projet technique.") =>
  `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`;

export const navLinks = [
  { label: "Accueil", to: "/" },
  { label: "Ã€ propos", to: "/a-propos" },
  { label: "Nos expertises", to: "/nos-expertises" },
  { label: "Nos rÃ©alisations", to: "/nos-realisations" },
  { label: "PhotovoltaÃ¯que", to: "/energies-photovoltaiques" },
  { label: "Notre Ã©quipe", to: "/notre-equipe" },
  { label: "Contact", to: "/contact" },
];

export const services = [
  {
    slug: "cvc",
    number: "01",
    title: "Climatisation & Ventilation",
    short: "CVC",
    image: images.cvc,
    excerpt:
      "SystÃ¨mes VRV, production dâ€™eau glacÃ©e, centrales de traitement dâ€™air et rÃ©seaux de ventilation.",
    description:
      "GAFOTEC Ã©tudie, dimensionne et met en Å“uvre les installations de climatisation et de ventilation des bÃ¢timents : de lâ€™analyse des besoins thermiques jusquâ€™au rÃ©glage final et Ã  la mise en service. Nos Ã©quipes travaillent sur les systÃ¨mes Ã  dÃ©tente directe comme sur les installations hydrauliques, en coordination avec les autres corps dâ€™Ã©tat.",
    interventions: [
      "SystÃ¨mes VRV / VRF et unitÃ©s Split",
      "Groupes dâ€™eau glacÃ©e et rÃ©seaux hydrauliques",
      "Centrales de traitement dâ€™air (CTA)",
      "RÃ©seaux de gaines et diffusion dâ€™air",
      "Ventilation mÃ©canique et renouvellement dâ€™air",
      "Traitement dâ€™air, filtration et rÃ©gulation",
    ],
    expertise: [
      "Bilan thermique et dimensionnement des Ã©quipements",
      "SÃ©lection technique et coordination avec le bureau dâ€™Ã©tudes",
      "Pose, raccordement, essais et Ã©quilibrage",
      "Entretien prÃ©ventif et dÃ©pannage",
    ],
  },
  {
    slug: "plomberie",
    number: "02",
    title: "Plomberie sanitaire",
    short: "Plomberie",
    image: images.plomberie,
    excerpt:
      "RÃ©seaux dâ€™alimentation en eau, Ã©vacuations et installations sanitaires complÃ¨tes.",
    description:
      "Nous concevons et rÃ©alisons les rÃ©seaux de plomberie sanitaire des bÃ¢timents tertiaires, hÃ´teliers, industriels et rÃ©sidentiels : alimentation en eau froide et eau chaude sanitaire, Ã©vacuation des eaux usÃ©es et pluviales, appareils sanitaires et Ã©quipements de production dâ€™eau chaude.",
    interventions: [
      "Colonnes montantes et distributions horizontales",
      "Surpresseurs, groupes de pompage et stockage",
      "Production dâ€™eau chaude sanitaire",
      "RÃ©seaux dâ€™Ã©vacuation et ventilation primaire",
      "Appareils sanitaires et robinetterie",
      "Comptage, filtration et traitement de lâ€™eau",
    ],
    expertise: [
      "Calcul des dÃ©bits et dimensionnement des rÃ©seaux",
      "Plans dâ€™exÃ©cution et coordination des rÃ©servations",
      "Essais dâ€™Ã©tanchÃ©itÃ© et mise en service",
      "Maintenance des installations existantes",
    ],
  },
  {
    slug: "chauffage",
    number: "03",
    title: "Chauffage central",
    short: "Chauffage",
    image: images.chauffage,
    excerpt:
      "Production de chaleur, rÃ©seaux de distribution et Ã©metteurs adaptÃ©s Ã  chaque bÃ¢timent.",
    description:
      "GAFOTEC installe des solutions de chauffage central dimensionnÃ©es pour les besoins rÃ©els du bÃ¢timent : production de chaleur, distribution, Ã©mission et rÃ©gulation. Nous privilÃ©gions les Ã©quipements fiables et les rÃ©glages qui limitent la consommation dâ€™Ã©nergie.",
    interventions: [
      "ChaudiÃ¨res et production de chaleur",
      "RÃ©seaux de distribution et pompes",
      "Radiateurs et corps de chauffe",
      "Planchers chauffants",
      "AÃ©rothermes et unitÃ©s de chauffage",
      "Traitement de lâ€™eau et rÃ©gulation",
    ],
    expertise: [
      "Ã‰tude des dÃ©perditions et dimensionnement",
      "Choix des Ã©metteurs et Ã©quilibrage des circuits",
      "Raccordement gaz et sÃ©curitÃ© de combustion",
      "Entretien et remise en conformitÃ©",
    ],
  },
  {
    slug: "protection-incendie",
    number: "04",
    title: "Protection contre lâ€™incendie",
    short: "Incendie",
    image: images.incendie,
    excerpt:
      "RÃ©seaux sprinkler, RIA, dÃ©tection et moyens de secours conformes Ã  la rÃ©glementation.",
    description:
      "La sÃ©curitÃ© incendie fait partie intÃ©grante de nos installations. Nous rÃ©alisons les rÃ©seaux et Ã©quipements de protection incendie des bÃ¢timents recevant du public, industriels et hÃ´teliers, en respectant les prescriptions rÃ©glementaires et les exigences des bureaux de contrÃ´le.",
    interventions: [
      "RÃ©seaux sprinkler et robinets dâ€™incendie armÃ©s",
      "Poteaux et bouches dâ€™incendie",
      "Extincteurs et moyens de premiÃ¨re intervention",
      "DÃ©tection automatique et alarme",
      "Compartimentage et portes coupe-feu",
      "Signalisation et Ã©clairage de sÃ©curitÃ©",
    ],
    expertise: [
      "Conception des rÃ©seaux selon la rÃ©glementation en vigueur",
      "Coordination avec les organismes de contrÃ´le",
      "Essais de pression et rÃ©ception des installations",
      "VÃ©rifications pÃ©riodiques et maintenance",
    ],
  },
  {
    slug: "desenfumage",
    number: "05",
    title: "DÃ©senfumage",
    short: "DÃ©senfumage",
    image: images.desenfumage,
    excerpt:
      "Ã‰vacuation des fumÃ©es, cantons de dÃ©senfumage et conduits rÃ©sistants au feu.",
    description:
      "Le dÃ©senfumage protÃ¨ge lâ€™Ã©vacuation des occupants et facilite lâ€™intervention des secours. GAFOTEC rÃ©alise les systÃ¨mes de dÃ©senfumage naturel et mÃ©canique : exutoires, volets, ventilateurs dâ€™extraction, conduits et commandes asservies.",
    interventions: [
      "Ventilation mÃ©canique de dÃ©senfumage",
      "Exutoires de fumÃ©e et volets",
      "Conduits et gaines rÃ©sistantes au feu",
      "Cantons et compartiments de dÃ©senfumage",
      "Commandes, asservissements et dÃ©tection",
      "SystÃ¨mes de mise en surpression des escaliers",
    ],
    expertise: [
      "Dimensionnement des dÃ©bits dâ€™extraction",
      "Ã‰tude des cantons et des circuits dâ€™Ã©vacuation",
      "IntÃ©gration au systÃ¨me de sÃ©curitÃ© incendie",
      "Essais fonctionnels et vÃ©rifications rÃ©glementaires",
    ],
  },
  {
    slug: "piscines",
    number: "06",
    title: "Piscines",
    short: "Piscines",
    image: images.piscines,
    excerpt:
      "Filtration, hydraulique, traitement de lâ€™eau et locaux techniques de piscine.",
    description:
      "GAFOTEC Ã©quipe les piscines des hÃ´tels, rÃ©sidences et Ã©quipements sportifs : hydraulique, filtration, traitement de lâ€™eau, chauffage et Ã©clairage. Les locaux techniques sont conÃ§us pour Ãªtre accessibles, ventilÃ©s et simples Ã  entretenir.",
    interventions: [
      "Filtration et traitement de lâ€™eau",
      "Locaux techniques et hydraulique de bassin",
      "Pompes, vannes et rampes de refoulement",
      "Chauffage et rÃ©gulation de lâ€™eau",
      "Ã‰clairage immergÃ©",
      "Entretien et hivernage",
    ],
    expertise: [
      "Calcul des volumes et des temps de renouvellement",
      "Dimensionnement des groupes de filtration",
      "Coordination avec les lots gros Å“uvre et carrelage",
      "Suivi de la qualitÃ© de lâ€™eau et maintenance",
    ],
  },
  {
    slug: "photovoltaique",
    number: "07",
    title: "Ã‰nergie solaire photovoltaÃ¯que",
    short: "PhotovoltaÃ¯que",
    image: images.solaireToiture,
    excerpt:
      "Ã‰tudes de faisabilitÃ©, dimensionnement, installation, stockage et maintenance.",
    description:
      "GAFOTEC accompagne les maÃ®tres dâ€™ouvrage dans leurs projets dâ€™autoconsommation solaire : Ã©tude de faisabilitÃ©, dimensionnement de la centrale, choix des modules et onduleurs, installation, mise en service puis suivi des performances dans le temps.",
    interventions: [
      "Ã‰tudes de faisabilitÃ© et de rentabilitÃ©",
      "Dimensionnement des installations",
      "Conception des systÃ¨mes photovoltaÃ¯ques",
      "Installation des panneaux solaires",
      "Onduleurs et stockage dâ€™Ã©nergie",
      "Mise en service et maintenance",
    ],
    expertise: [
      "Analyse de la consommation et du gisement solaire",
      "Optimisation des performances Ã©nergÃ©tiques",
      "Raccordement et conformitÃ© Ã©lectrique",
      "Suivi de production et maintenance prÃ©ventive",
    ],
  },
];

export const projectCategories = [
  "Tous",
  "Industrie",
  "HÃ´tellerie",
  "Enseignement",
  "Tourisme",
  "RÃ©sidentiel",
];

export const projects = [
  {
    slug: "laboratoire-jorf-lasfar",
    title: "Laboratoire Jorf Lasfar",
    year: 2018,
    category: "Industrie",
    location: "Jorf Lasfar",
    image: images.laboratoire,
    summary:
      "RÃ©fÃ©rence fondatrice de GAFOTEC dans le domaine des bÃ¢timents techniques industriels : un laboratoire dont les installations doivent rÃ©pondre Ã  des contraintes de process et de confort strictes.",
    description:
      "Le laboratoire de Jorf Lasfar constitue lâ€™une des premiÃ¨res rÃ©fÃ©rences techniques de GAFOTEC. Ce type de bÃ¢timent exige une parfaite maÃ®trise de la ventilation, du renouvellement dâ€™air et des rÃ©seaux hydrauliques, avec des Ã©quipements dimensionnÃ©s pour fonctionner en continu.",
    scope: [
      "Climatisation et ventilation des locaux techniques",
      "RÃ©seaux de plomberie et dâ€™Ã©vacuation",
      "Installations sanitaires",
      "Protection contre lâ€™incendie",
    ],
  },
  {
    slug: "usines-espaces-de-vie-salles-de-controle",
    title: "Usines, espaces de vie et salles de contrÃ´le",
    year: 2019,
    category: "Industrie",
    location: "Maroc",
    image: images.controle,
    summary:
      "Interventions sur des sites industriels : confort des espaces de vie du personnel et climatisation des salles de contrÃ´le.",
    description:
      "Les salles de contrÃ´le et les espaces de vie en milieu industriel demandent une climatisation fiable, une ventilation maÃ®trisÃ©e et des installations faciles Ã  maintenir. GAFOTEC y a dÃ©ployÃ© ses solutions de CVC et de plomberie adaptÃ©es aux contraintes dâ€™exploitation des sites.",
    scope: [
      "Climatisation des salles de contrÃ´le",
      "Ventilation des espaces de vie",
      "RÃ©seaux de plomberie sanitaire",
      "Protection contre lâ€™incendie",
    ],
  },
  {
    slug: "hilton-casablanca-sidi-maarouf",
    title: "Hilton Casablanca â€” Sidi Maarouf",
    year: 2020,
    category: "HÃ´tellerie",
    location: "Casablanca",
    image: images.hilton,
    summary:
      "Un projet hÃ´telier dâ€™envergure Ã  Casablanca, oÃ¹ le confort des chambres et la continuitÃ© de service sont dÃ©terminants.",
    description:
      "Lâ€™hÃ´tellerie impose des installations silencieuses, rÃ©gulÃ©es et disponibles en permanence. Sur ce projet, GAFOTEC est intervenue sur les lots techniques du bÃ¢timent, en coordination avec les exigences de lâ€™exploitation hÃ´teliÃ¨re.",
    scope: [
      "Climatisation et traitement dâ€™air",
      "Plomberie sanitaire et production dâ€™eau chaude",
      "Protection contre lâ€™incendie",
      "DÃ©senfumage des circulations",
    ],
  },
  {
    slug: "institut-specialise-hotellerie-tourisme",
    title: "Institut SpÃ©cialisÃ© en HÃ´tellerie et Tourisme",
    year: 2022,
    category: "Enseignement",
    location: "Maroc",
    image: images.institutHotellerie,
    summary:
      "Un Ã©tablissement de formation aux mÃ©tiers de lâ€™hÃ´tellerie, Ã©quipÃ© de cuisines, salles de travaux pratiques et espaces dâ€™accueil.",
    description:
      "Les instituts de formation hÃ´teliÃ¨re combinent des contraintes proches de celles dâ€™un hÃ´tel et des exigences propres aux locaux pÃ©dagogiques : cuisines, laboratoires de travaux pratiques et salles de classe. GAFOTEC y a rÃ©alisÃ© les installations techniques des diffÃ©rents espaces.",
    scope: [
      "Ventilation des cuisines et locaux techniques",
      "Climatisation des salles de classe",
      "RÃ©seaux de plomberie et Ã©vacuations",
      "Protection contre lâ€™incendie",
    ],
  },
  {
    slug: "marina-tanger",
    title: "Marina Tanger",
    year: 2023,
    category: "Tourisme",
    location: "Tanger",
    image: images.marina,
    summary:
      "Un complexe touristique en bord de mer, dont les installations doivent rÃ©sister Ã  lâ€™air marin et fonctionner en forte saison.",
    description:
      "En environnement maritime, la nature des matÃ©riaux et la qualitÃ© des mises en Å“uvre conditionnent la durabilitÃ© des installations. GAFOTEC a pris en charge les lots techniques du complexe en tenant compte de ces contraintes dâ€™exposition.",
    scope: [
      "Climatisation et ventilation",
      "Plomberie sanitaire et rÃ©seaux dâ€™eau",
      "Protection contre lâ€™incendie",
      "DÃ©senfumage",
    ],
  },
  {
    slug: "institut-superieur-etudes-maritimes",
    title: "Institut SupÃ©rieur dâ€™Ã‰tudes Maritimes",
    year: 2024,
    category: "Enseignement",
    location: "Maroc",
    image: images.maritime,
    summary:
      "Un Ã©tablissement dâ€™enseignement supÃ©rieur tournÃ© vers les mÃ©tiers de la mer.",
    description:
      "Sur ce projet dâ€™enseignement supÃ©rieur, les installations techniques devaient concilier confort des Ã©tudiants et exigences de sÃ©curitÃ© de bÃ¢timents recevant du public. GAFOTEC est intervenue sur les rÃ©seaux de CVC, de plomberie et de sÃ©curitÃ©.",
    scope: [
      "Climatisation et ventilation des salles",
      "RÃ©seaux de plomberie et dâ€™Ã©vacuation",
      "Protection contre lâ€™incendie",
      "DÃ©senfumage des circulations",
    ],
  },
  {
    slug: "ecole-nationale-architecture-agadir",
    title: "Ã‰cole Nationale dâ€™Architecture â€” Agadir",
    year: 2025,
    category: "Enseignement",
    location: "Agadir",
    image: images.architecture,
    summary:
      "Un Ã©quipement dâ€™enseignement supÃ©rieur dans une rÃ©gion au climat exigeant.",
    description:
      "Les bÃ¢timents dâ€™enseignement Ã  Agadir subissent des tempÃ©ratures Ã©levÃ©es : la performance des installations de rafraÃ®chissement et la qualitÃ© de la ventilation y sont essentielles. GAFOTEC a contribuÃ© aux lots techniques de lâ€™Ã©cole.",
    scope: [
      "Climatisation performante et ventilation",
      "RÃ©seaux de plomberie sanitaire",
      "Protection contre lâ€™incendie",
      "DÃ©senfumage",
    ],
  },
  {
    slug: "universite-euromed-fes",
    title: "UniversitÃ© Euromed de FÃ¨s",
    year: 2026,
    category: "Enseignement",
    location: "FÃ¨s",
    image: images.euromed,
    summary:
      "Un campus universitaire Ã  FÃ¨s, Ã  proximitÃ© du siÃ¨ge de GAFOTEC.",
    description:
      "Le campus Euromed de FÃ¨s rÃ©unit amphithÃ©Ã¢tres, salles de cours et espaces de vie Ã©tudiante. GAFOTEC intervient sur les installations techniques de ce projet universitaire, dans le cadre de son savoir-faire en corps dâ€™Ã©tat techniques.",
    scope: [
      "Climatisation et traitement dâ€™air",
      "Plomberie sanitaire et Ã©vacuations",
      "Protection contre lâ€™incendie",
      "DÃ©senfumage",
    ],
  },
  {
    slug: "hotel-et-residences-en-cours",
    title: "HÃ´tel et rÃ©sidences immobiliÃ¨res adossÃ©es",
    year: 2026,
    category: "RÃ©sidentiel",
    location: "Maroc",
    image: images.chantier,
    status: "En cours",
    summary:
      "Projet en cours : construction dâ€™un hÃ´tel et de rÃ©sidences immobiliÃ¨res adossÃ©es.",
    description:
      "GAFOTEC participe actuellement Ã  la construction dâ€™un ensemble comprenant un hÃ´tel et des rÃ©sidences immobiliÃ¨res. Ce chantier mobilise lâ€™ensemble de nos mÃ©tiers : Ã©tudes dâ€™exÃ©cution, coordination avec les autres corps dâ€™Ã©tat, installations techniques et mise en service.",
    scope: [
      "Ã‰tudes dâ€™exÃ©cution et coordination technique",
      "Climatisation et ventilation",
      "Plomberie sanitaire et chauffage",
      "Protection contre lâ€™incendie et dÃ©senfumage",
    ],
  },
];

export const approach = [
  {
    step: "01",
    title: "Ã‰tudes",
    text: "Analyse du besoin, relevÃ©s sur site, bilan thermique et Ã©tudes dâ€™exÃ©cution rÃ©alisÃ©s par notre bureau dâ€™Ã©tudes.",
  },
  {
    step: "02",
    title: "Conception",
    text: "Dimensionnement des rÃ©seaux, sÃ©lection des Ã©quipements, plans et coordination avec les autres corps dâ€™Ã©tat.",
  },
  {
    step: "03",
    title: "ExÃ©cution",
    text: "Installation, raccordements, essais, rÃ©glages et mise en service, sous la conduite dâ€™un chef de chantier dÃ©diÃ©.",
  },
  {
    step: "04",
    title: "Maintenance",
    text: "Contrats dâ€™entretien prÃ©ventif, dÃ©pannage et suivi des performances pour des installations durables.",
  },
];

export const values = [
  {
    title: "Confiance",
    text: "Nous engageons notre responsabilitÃ© sur chaque installation livrÃ©e, avec une communication transparente du premier Ã©change jusquâ€™Ã  la rÃ©ception du chantier.",
  },
  {
    title: "Engagement",
    text: "Des Ã©quipes prÃ©sentes sur le terrain, un suivi rigoureux des travaux et des dÃ©lais respectÃ©s, y compris lorsque les conditions du chantier se compliquent.",
  },
  {
    title: "Ã‰thique",
    text: "Des choix techniques honnÃªtes, des prix justes et le strict respect des normes en vigueur dans chacun de nos mÃ©tiers.",
  },
];

export const serviceOptions = services.map((s) => s.title).concat(["Autre / Plusieurs mÃ©tiers"]);
