const MEDIA = "https://media.base44.com/images/public/6aec634f0232d4cd71a02dc5";

export const images = {
  hero: `${MEDIA}/7020d9538_generated_a5fef553.png`,
  bureau: `${MEDIA}/65b7812f4_generated_eb708468.png`,
  cvc: `${MEDIA}/f8c405548_generated_f21a34a5.png`,
  plomberie: `${MEDIA}/9b91d2577_generated_9704d63f.png`,
  chauffage: `${MEDIA}/e8a4aa313_generated_2c060ec3.png`,
  incendie: `${MEDIA}/2f15695d1_generated_a3c52abd.png`,
  desenfumage: `${MEDIA}/44d91c8b4_generated_879dea90.png`,
  piscines: `${MEDIA}/c9762b0ab_generated_72f7021e.png`,
  solaireToiture: `${MEDIA}/67bb9c6e2_generated_28cae7eb.png`,
  solaireChamp: `${MEDIA}/7f8421bd5_generated_96d3a96d.png`,
  onduleurs: `${MEDIA}/8e079c8c0_generated_621694dd.png`,
  laboratoire: `${MEDIA}/121d12a74_generated_69889384.png`,
  controle: `${MEDIA}/5bd989852_generated_62dea8d1.png`,
  hilton: `${MEDIA}/407109a84_generated_45321fb2.png`,
  institutHotellerie: `${MEDIA}/2b4002e18_generated_9d0054e6.png`,
  marina: `${MEDIA}/9a317d4cb_generated_d093c8d7.png`,
  maritime: `${MEDIA}/456f07b79_generated_c1d1606b.png`,
  architecture: `${MEDIA}/ffbd3df0c_generated_9373fd4c.png`,
  euromed: `${MEDIA}/4f69031a0_generated_557a2618.png`,
  chantier: `${MEDIA}/4cc5fb2d7_generated_7a26aae1.png`,
};

export const company = {
  name: "GAFOTEC",
  legal: "GAFOTEC — Corps d’État Techniques",
  tagline: "Corps d’État Techniques",
  city: "Fès",
  country: "Maroc",
  phones: ["+212 662 287 996", "+212 635 819 936"],
  phoneHrefs: ["+212662287996", "+212635819936"],
  email: "Ste.gafotec@gmail.com",
  website: "www.gafotec.com",
  address: "2ème étage, appartement gauche, Dr Ouled Youssef Ouled Tayeb, Fès, Maroc",
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
  { label: "À propos", to: "/a-propos" },
  { label: "Nos expertises", to: "/nos-expertises" },
  { label: "Nos réalisations", to: "/nos-realisations" },
  { label: "Photovoltaïque", to: "/energies-photovoltaiques" },
  { label: "Notre équipe", to: "/notre-equipe" },
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
      "Systèmes VRV, production d’eau glacée, centrales de traitement d’air et réseaux de ventilation.",
    description:
      "GAFOTEC étudie, dimensionne et met en œuvre les installations de climatisation et de ventilation des bâtiments : de l’analyse des besoins thermiques jusqu’au réglage final et à la mise en service. Nos équipes travaillent sur les systèmes à détente directe comme sur les installations hydrauliques, en coordination avec les autres corps d’état.",
    interventions: [
      "Systèmes VRV / VRF et unités Split",
      "Groupes d’eau glacée et réseaux hydrauliques",
      "Centrales de traitement d’air (CTA)",
      "Réseaux de gaines et diffusion d’air",
      "Ventilation mécanique et renouvellement d’air",
      "Traitement d’air, filtration et régulation",
    ],
    expertise: [
      "Bilan thermique et dimensionnement des équipements",
      "Sélection technique et coordination avec le bureau d’études",
      "Pose, raccordement, essais et équilibrage",
      "Entretien préventif et dépannage",
    ],
  },
  {
    slug: "plomberie",
    number: "02",
    title: "Plomberie sanitaire",
    short: "Plomberie",
    image: images.plomberie,
    excerpt:
      "Réseaux d’alimentation en eau, évacuations et installations sanitaires complètes.",
    description:
      "Nous concevons et réalisons les réseaux de plomberie sanitaire des bâtiments tertiaires, hôteliers, industriels et résidentiels : alimentation en eau froide et eau chaude sanitaire, évacuation des eaux usées et pluviales, appareils sanitaires et équipements de production d’eau chaude.",
    interventions: [
      "Colonnes montantes et distributions horizontales",
      "Surpresseurs, groupes de pompage et stockage",
      "Production d’eau chaude sanitaire",
      "Réseaux d’évacuation et ventilation primaire",
      "Appareils sanitaires et robinetterie",
      "Comptage, filtration et traitement de l’eau",
    ],
    expertise: [
      "Calcul des débits et dimensionnement des réseaux",
      "Plans d’exécution et coordination des réservations",
      "Essais d’étanchéité et mise en service",
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
      "Production de chaleur, réseaux de distribution et émetteurs adaptés à chaque bâtiment.",
    description:
      "GAFOTEC installe des solutions de chauffage central dimensionnées pour les besoins réels du bâtiment : production de chaleur, distribution, émission et régulation. Nous privilégions les équipements fiables et les réglages qui limitent la consommation d’énergie.",
    interventions: [
      "Chaudières et production de chaleur",
      "Réseaux de distribution et pompes",
      "Radiateurs et corps de chauffe",
      "Planchers chauffants",
      "Aérothermes et unités de chauffage",
      "Traitement de l’eau et régulation",
    ],
    expertise: [
      "Étude des déperditions et dimensionnement",
      "Choix des émetteurs et équilibrage des circuits",
      "Raccordement gaz et sécurité de combustion",
      "Entretien et remise en conformité",
    ],
  },
  {
    slug: "protection-incendie",
    number: "04",
    title: "Protection contre l’incendie",
    short: "Incendie",
    image: images.incendie,
    excerpt:
      "Réseaux sprinkler, RIA, détection et moyens de secours conformes à la réglementation.",
    description:
      "La sécurité incendie fait partie intégrante de nos installations. Nous réalisons les réseaux et équipements de protection incendie des bâtiments recevant du public, industriels et hôteliers, en respectant les prescriptions réglementaires et les exigences des bureaux de contrôle.",
    interventions: [
      "Réseaux sprinkler et robinets d’incendie armés",
      "Poteaux et bouches d’incendie",
      "Extincteurs et moyens de première intervention",
      "Détection automatique et alarme",
      "Compartimentage et portes coupe-feu",
      "Signalisation et éclairage de sécurité",
    ],
    expertise: [
      "Conception des réseaux selon la réglementation en vigueur",
      "Coordination avec les organismes de contrôle",
      "Essais de pression et réception des installations",
      "Vérifications périodiques et maintenance",
    ],
  },
  {
    slug: "desenfumage",
    number: "05",
    title: "Désenfumage",
    short: "Désenfumage",
    image: images.desenfumage,
    excerpt:
      "Évacuation des fumées, cantons de désenfumage et conduits résistants au feu.",
    description:
      "Le désenfumage protège l’évacuation des occupants et facilite l’intervention des secours. GAFOTEC réalise les systèmes de désenfumage naturel et mécanique : exutoires, volets, ventilateurs d’extraction, conduits et commandes asservies.",
    interventions: [
      "Ventilation mécanique de désenfumage",
      "Exutoires de fumée et volets",
      "Conduits et gaines résistantes au feu",
      "Cantons et compartiments de désenfumage",
      "Commandes, asservissements et détection",
      "Systèmes de mise en surpression des escaliers",
    ],
    expertise: [
      "Dimensionnement des débits d’extraction",
      "Étude des cantons et des circuits d’évacuation",
      "Intégration au système de sécurité incendie",
      "Essais fonctionnels et vérifications réglementaires",
    ],
  },
  {
    slug: "piscines",
    number: "06",
    title: "Piscines",
    short: "Piscines",
    image: images.piscines,
    excerpt:
      "Filtration, hydraulique, traitement de l’eau et locaux techniques de piscine.",
    description:
      "GAFOTEC équipe les piscines des hôtels, résidences et équipements sportifs : hydraulique, filtration, traitement de l’eau, chauffage et éclairage. Les locaux techniques sont conçus pour être accessibles, ventilés et simples à entretenir.",
    interventions: [
      "Filtration et traitement de l’eau",
      "Locaux techniques et hydraulique de bassin",
      "Pompes, vannes et rampes de refoulement",
      "Chauffage et régulation de l’eau",
      "Éclairage immergé",
      "Entretien et hivernage",
    ],
    expertise: [
      "Calcul des volumes et des temps de renouvellement",
      "Dimensionnement des groupes de filtration",
      "Coordination avec les lots gros œuvre et carrelage",
      "Suivi de la qualité de l’eau et maintenance",
    ],
  },
  {
    slug: "photovoltaique",
    number: "07",
    title: "Énergie solaire photovoltaïque",
    short: "Photovoltaïque",
    image: images.solaireToiture,
    excerpt:
      "Études de faisabilité, dimensionnement, installation, stockage et maintenance.",
    description:
      "GAFOTEC accompagne les maîtres d’ouvrage dans leurs projets d’autoconsommation solaire : étude de faisabilité, dimensionnement de la centrale, choix des modules et onduleurs, installation, mise en service puis suivi des performances dans le temps.",
    interventions: [
      "Études de faisabilité et de rentabilité",
      "Dimensionnement des installations",
      "Conception des systèmes photovoltaïques",
      "Installation des panneaux solaires",
      "Onduleurs et stockage d’énergie",
      "Mise en service et maintenance",
    ],
    expertise: [
      "Analyse de la consommation et du gisement solaire",
      "Optimisation des performances énergétiques",
      "Raccordement et conformité électrique",
      "Suivi de production et maintenance préventive",
    ],
  },
];

export const projectCategories = [
  "Tous",
  "Industrie",
  "Hôtellerie",
  "Enseignement",
  "Tourisme",
  "Résidentiel",
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
      "Référence fondatrice de GAFOTEC dans le domaine des bâtiments techniques industriels : un laboratoire dont les installations doivent répondre à des contraintes de process et de confort strictes.",
    description:
      "Le laboratoire de Jorf Lasfar constitue l’une des premières références techniques de GAFOTEC. Ce type de bâtiment exige une parfaite maîtrise de la ventilation, du renouvellement d’air et des réseaux hydrauliques, avec des équipements dimensionnés pour fonctionner en continu.",
    scope: [
      "Climatisation et ventilation des locaux techniques",
      "Réseaux de plomberie et d’évacuation",
      "Installations sanitaires",
      "Protection contre l’incendie",
    ],
  },
  {
    slug: "usines-espaces-de-vie-salles-de-controle",
    title: "Usines, espaces de vie et salles de contrôle",
    year: 2019,
    category: "Industrie",
    location: "Maroc",
    image: images.controle,
    summary:
      "Interventions sur des sites industriels : confort des espaces de vie du personnel et climatisation des salles de contrôle.",
    description:
      "Les salles de contrôle et les espaces de vie en milieu industriel demandent une climatisation fiable, une ventilation maîtrisée et des installations faciles à maintenir. GAFOTEC y a déployé ses solutions de CVC et de plomberie adaptées aux contraintes d’exploitation des sites.",
    scope: [
      "Climatisation des salles de contrôle",
      "Ventilation des espaces de vie",
      "Réseaux de plomberie sanitaire",
      "Protection contre l’incendie",
    ],
  },
  {
    slug: "hilton-casablanca-sidi-maarouf",
    title: "Hilton Casablanca — Sidi Maarouf",
    year: 2020,
    category: "Hôtellerie",
    location: "Casablanca",
    image: images.hilton,
    summary:
      "Un projet hôtelier d’envergure à Casablanca, où le confort des chambres et la continuité de service sont déterminants.",
    description:
      "L’hôtellerie impose des installations silencieuses, régulées et disponibles en permanence. Sur ce projet, GAFOTEC est intervenue sur les lots techniques du bâtiment, en coordination avec les exigences de l’exploitation hôtelière.",
    scope: [
      "Climatisation et traitement d’air",
      "Plomberie sanitaire et production d’eau chaude",
      "Protection contre l’incendie",
      "Désenfumage des circulations",
    ],
  },
  {
    slug: "institut-specialise-hotellerie-tourisme",
    title: "Institut Spécialisé en Hôtellerie et Tourisme",
    year: 2022,
    category: "Enseignement",
    location: "Maroc",
    image: images.institutHotellerie,
    summary:
      "Un établissement de formation aux métiers de l’hôtellerie, équipé de cuisines, salles de travaux pratiques et espaces d’accueil.",
    description:
      "Les instituts de formation hôtelière combinent des contraintes proches de celles d’un hôtel et des exigences propres aux locaux pédagogiques : cuisines, laboratoires de travaux pratiques et salles de classe. GAFOTEC y a réalisé les installations techniques des différents espaces.",
    scope: [
      "Ventilation des cuisines et locaux techniques",
      "Climatisation des salles de classe",
      "Réseaux de plomberie et évacuations",
      "Protection contre l’incendie",
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
      "Un complexe touristique en bord de mer, dont les installations doivent résister à l’air marin et fonctionner en forte saison.",
    description:
      "En environnement maritime, la nature des matériaux et la qualité des mises en œuvre conditionnent la durabilité des installations. GAFOTEC a pris en charge les lots techniques du complexe en tenant compte de ces contraintes d’exposition.",
    scope: [
      "Climatisation et ventilation",
      "Plomberie sanitaire et réseaux d’eau",
      "Protection contre l’incendie",
      "Désenfumage",
    ],
  },
  {
    slug: "institut-superieur-etudes-maritimes",
    title: "Institut Supérieur d’Études Maritimes",
    year: 2024,
    category: "Enseignement",
    location: "Maroc",
    image: images.maritime,
    summary:
      "Un établissement d’enseignement supérieur tourné vers les métiers de la mer.",
    description:
      "Sur ce projet d’enseignement supérieur, les installations techniques devaient concilier confort des étudiants et exigences de sécurité de bâtiments recevant du public. GAFOTEC est intervenue sur les réseaux de CVC, de plomberie et de sécurité.",
    scope: [
      "Climatisation et ventilation des salles",
      "Réseaux de plomberie et d’évacuation",
      "Protection contre l’incendie",
      "Désenfumage des circulations",
    ],
  },
  {
    slug: "ecole-nationale-architecture-agadir",
    title: "École Nationale d’Architecture — Agadir",
    year: 2025,
    category: "Enseignement",
    location: "Agadir",
    image: images.architecture,
    summary:
      "Un équipement d’enseignement supérieur dans une région au climat exigeant.",
    description:
      "Les bâtiments d’enseignement à Agadir subissent des températures élevées : la performance des installations de rafraîchissement et la qualité de la ventilation y sont essentielles. GAFOTEC a contribué aux lots techniques de l’école.",
    scope: [
      "Climatisation performante et ventilation",
      "Réseaux de plomberie sanitaire",
      "Protection contre l’incendie",
      "Désenfumage",
    ],
  },
  {
    slug: "universite-euromed-fes",
    title: "Université Euromed de Fès",
    year: 2026,
    category: "Enseignement",
    location: "Fès",
    image: images.euromed,
    summary:
      "Un campus universitaire à Fès, à proximité du siège de GAFOTEC.",
    description:
      "Le campus Euromed de Fès réunit amphithéâtres, salles de cours et espaces de vie étudiante. GAFOTEC intervient sur les installations techniques de ce projet universitaire, dans le cadre de son savoir-faire en corps d’état techniques.",
    scope: [
      "Climatisation et traitement d’air",
      "Plomberie sanitaire et évacuations",
      "Protection contre l’incendie",
      "Désenfumage",
    ],
  },
  {
    slug: "hotel-et-residences-en-cours",
    title: "Hôtel et résidences immobilières adossées",
    year: 2026,
    category: "Résidentiel",
    location: "Maroc",
    image: images.chantier,
    status: "En cours",
    summary:
      "Projet en cours : construction d’un hôtel et de résidences immobilières adossées.",
    description:
      "GAFOTEC participe actuellement à la construction d’un ensemble comprenant un hôtel et des résidences immobilières. Ce chantier mobilise l’ensemble de nos métiers : études d’exécution, coordination avec les autres corps d’état, installations techniques et mise en service.",
    scope: [
      "Études d’exécution et coordination technique",
      "Climatisation et ventilation",
      "Plomberie sanitaire et chauffage",
      "Protection contre l’incendie et désenfumage",
    ],
  },
];

export const approach = [
  {
    step: "01",
    title: "Études",
    text: "Analyse du besoin, relevés sur site, bilan thermique et études d’exécution réalisés par notre bureau d’études.",
  },
  {
    step: "02",
    title: "Conception",
    text: "Dimensionnement des réseaux, sélection des équipements, plans et coordination avec les autres corps d’état.",
  },
  {
    step: "03",
    title: "Exécution",
    text: "Installation, raccordements, essais, réglages et mise en service, sous la conduite d’un chef de chantier dédié.",
  },
  {
    step: "04",
    title: "Maintenance",
    text: "Contrats d’entretien préventif, dépannage et suivi des performances pour des installations durables.",
  },
];

export const values = [
  {
    title: "Confiance",
    text: "Nous engageons notre responsabilité sur chaque installation livrée, avec une communication transparente du premier échange jusqu’à la réception du chantier.",
  },
  {
    title: "Engagement",
    text: "Des équipes présentes sur le terrain, un suivi rigoureux des travaux et des délais respectés, y compris lorsque les conditions du chantier se compliquent.",
  },
  {
    title: "Éthique",
    text: "Des choix techniques honnêtes, des prix justes et le strict respect des normes en vigueur dans chacun de nos métiers.",
  },
];

export const team = [
  { name: "GAOUZI ABDELHAK", role: "Gérant", group: "Direction" },
  { name: "BARHRMI YOUSSEF", role: "Chargé d’études techniques et chiffrage", group: "Études" },
  { name: "MERINI MOHAMMED", role: "Chef projet", group: "Études" },
  { name: "BARHRMI IBRAHIM", role: "Dessinateur technique", group: "Études" },
  { name: "KAITA ABDENNACER", role: "Chef chantier", group: "Chantier" },
  { name: "FAIZ AMINA", role: "Service comptabilité", group: "Support" },
  { name: "FAIZ ZINEB", role: "Service d’achat", group: "Support" },
];

export const serviceOptions = services.map((s) => s.title).concat(["Autre / Plusieurs métiers"]);