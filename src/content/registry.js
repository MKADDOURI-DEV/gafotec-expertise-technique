import { images } from "@/data/site";

/**
 * Every editable text/image on the public site.
 * A field's `default` is the copy shipped with the site; the admin panel stores
 * only what the owner changed, in the SiteContent entity, so a field never
 * becomes empty just because nobody touched it.
 */
export const contentGroups = [
  {
    id: "identite",
    label: "Identité & coordonnées",
    hint: "Ces informations alimentent l’en-tête, le pied de page et la page Contact.",
    fields: [
      { key: "company.phone1", label: "Téléphone principal", type: "text", default: "+212 662 287 996" },
      { key: "company.phone2", label: "Téléphone secondaire", type: "text", default: "+212 635 819 936" },
      { key: "company.email", label: "E-mail", type: "text", default: "Ste.gafotec@gmail.com" },
      { key: "company.website", label: "Site web", type: "text", default: "www.gafotec.com" },
      {
        key: "company.address",
        label: "Adresse",
        type: "textarea",
        wide: true,
        default: "2ème étage, appartement gauche, Dr Ouled Youssef Ouled Tayeb, Fès, Maroc",
      },
      { key: "company.hours", label: "Horaires", type: "text", default: "Du lundi au vendredi, 8h30 – 18h00" },
      { key: "company.hours_note", label: "Horaires — précision", type: "text", default: "Samedi matin sur rendez-vous" },
      {
        key: "footer.description",
        label: "Présentation (pied de page)",
        type: "textarea",
        wide: true,
        default:
          "Entreprise marocaine de corps d’état techniques : CVC, plomberie, chauffage, protection incendie, désenfumage, piscines et énergie solaire photovoltaïque.",
      },
    ],
  },
  {
    id: "accueil-bandeau",
    label: "Accueil — bandeau",
    hint: "Le grand visuel d’ouverture de la page d’accueil.",
    fields: [
      { key: "home.hero.eyebrow", label: "Sur-titre", type: "text", default: "Gafotec · Corps d’État Techniques · Fès" },
      {
        key: "home.hero.title",
        label: "Titre principal",
        type: "textarea",
        wide: true,
        default: "L’EXPERTISE TECHNIQUE AU SERVICE DE VOS PROJETS.",
      },
      {
        key: "home.hero.subtitle",
        label: "Accroche",
        type: "textarea",
        wide: true,
        default:
          "Des solutions techniques performantes et durables dans les domaines du CVC, de la plomberie, de la protection incendie et des énergies renouvelables.",
      },
      { key: "home.hero.image", label: "Image de fond", type: "image", wide: true, default: images.hero },
    ],
  },
  {
    id: "accueil-intro",
    label: "Accueil — présentation",
    hint: "Le bloc « Qui sommes-nous » sous le bandeau.",
    fields: [
      { key: "home.intro.eyebrow", label: "Sur-titre", type: "text", default: "Qui sommes-nous" },
      {
        key: "home.intro.title",
        label: "Titre",
        type: "textarea",
        wide: true,
        default: "Une entreprise technique, au service des bâtiments qui doivent durer.",
      },
      {
        key: "home.intro.paragraph1",
        label: "Paragraphe principal",
        type: "textarea",
        wide: true,
        default:
          "GAFOTEC est une entreprise marocaine spécialisée dans les corps d’état techniques du bâtiment. Depuis Fès, nos équipes conçoivent, réalisent et maintiennent les installations qui font fonctionner les bâtiments : climatisation et ventilation, plomberie sanitaire, chauffage central, protection contre l’incendie, désenfumage, piscines et énergies renouvelables.",
      },
      {
        key: "home.intro.paragraph2",
        label: "Paragraphe secondaire",
        type: "textarea",
        wide: true,
        default:
          "Notre approche associe l’étude technique, le chiffrage, la coordination de chantier et le suivi dans le temps. Nous intervenons sur des projets d’hôtellerie, d’enseignement, d’industrie et de résidentiel, aux côtés des maîtres d’ouvrage, des architectes et des bureaux d’études.",
      },
      { key: "home.intro.image", label: "Image", type: "image", wide: true, default: images.bureau },
    ],
  },
  {
    id: "page-propos",
    label: "Page À propos — en-tête",
    fields: [
      { key: "propos.hero.eyebrow", label: "Sur-titre", type: "text", default: "À propos" },
      {
        key: "propos.hero.title",
        label: "Titre",
        type: "textarea",
        wide: true,
        default: "Une entreprise technique, ancrée dans le terrain.",
      },
      {
        key: "propos.hero.description",
        label: "Description",
        type: "textarea",
        wide: true,
        default:
          "GAFOTEC réunit les compétences nécessaires pour prendre en charge les corps d’état techniques d’un bâtiment, de l’étude à la maintenance.",
      },
      { key: "propos.hero.image", label: "Image de fond", type: "image", wide: true, default: images.chantier },
    ],
  },
  {
    id: "page-expertises",
    label: "Page Nos expertises — en-tête",
    fields: [
      { key: "expertises.hero.eyebrow", label: "Sur-titre", type: "text", default: "Nos expertises" },
      {
        key: "expertises.hero.title",
        label: "Titre",
        type: "textarea",
        wide: true,
        default: "Les métiers techniques que nous maîtrisons.",
      },
      {
        key: "expertises.hero.description",
        label: "Description",
        type: "textarea",
        wide: true,
        default:
          "Chaque activité est prise en charge de l’étude à la maintenance, avec le même niveau d’exigence sur le dimensionnement, la mise en œuvre et la réception.",
      },
      { key: "expertises.hero.image", label: "Image de fond", type: "image", wide: true, default: images.cvc },
    ],
  },
  {
    id: "page-realisations",
    label: "Page Nos réalisations — en-tête",
    fields: [
      { key: "realisations.hero.eyebrow", label: "Sur-titre", type: "text", default: "Nos réalisations" },
      {
        key: "realisations.hero.title",
        label: "Titre",
        type: "textarea",
        wide: true,
        default: "Des références qui parlent d’elles-mêmes.",
      },
      {
        key: "realisations.hero.description",
        label: "Description",
        type: "textarea",
        wide: true,
        default:
          "Laboratoires industriels, hôtels, instituts et universités : nos installations équipent des bâtiments exigeants, partout au Maroc.",
      },
      { key: "realisations.hero.image", label: "Image de fond", type: "image", wide: true, default: images.hilton },
    ],
  },
  {
    id: "page-photovoltaique",
    label: "Page Photovoltaïque — en-tête",
    fields: [
      {
        key: "photovoltaique.hero.eyebrow",
        label: "Sur-titre",
        type: "text",
        default: "Énergies photovoltaïques",
      },
      {
        key: "photovoltaique.hero.title",
        label: "Titre",
        type: "textarea",
        wide: true,
        default: "Accélérer la transition énergétique.",
      },
      {
        key: "photovoltaique.hero.description",
        label: "Description",
        type: "textarea",
        wide: true,
        default:
          "Études de faisabilité, dimensionnement, conception, installation et maintenance de vos centrales solaires photovoltaïques.",
      },
      {
        key: "photovoltaique.hero.image",
        label: "Image de fond",
        type: "image",
        wide: true,
        default: images.solaireChamp,
      },
    ],
  },
  {
    id: "page-equipe",
    label: "Page Notre équipe — en-tête",
    fields: [
      { key: "equipe.hero.eyebrow", label: "Sur-titre", type: "text", default: "Notre équipe" },
      {
        key: "equipe.hero.title",
        label: "Titre",
        type: "textarea",
        wide: true,
        default: "Une organisation courte, technique et responsable.",
      },
      {
        key: "equipe.hero.description",
        label: "Description",
        type: "textarea",
        wide: true,
        default:
          "Chez GAFOTEC, chaque projet est suivi par des interlocuteurs identifiés : direction, bureau d’études, conduite de chantier et fonctions support.",
      },
      { key: "equipe.hero.image", label: "Image de fond", type: "image", wide: true, default: images.euromed },
    ],
  },
  {
    id: "page-contact",
    label: "Page Contact — en-tête",
    fields: [
      { key: "contact.hero.eyebrow", label: "Sur-titre", type: "text", default: "Contact" },
      {
        key: "contact.hero.title",
        label: "Titre",
        type: "textarea",
        wide: true,
        default: "Parlons de votre projet.",
      },
      {
        key: "contact.hero.description",
        label: "Description",
        type: "textarea",
        wide: true,
        default:
          "Un devis, une consultation technique ou une question sur une installation existante : nos équipes vous répondent.",
      },
      { key: "contact.hero.image", label: "Image de fond", type: "image", wide: true, default: images.chantier },
    ],
  },
];

export const contentFields = contentGroups.flatMap((group) => group.fields);

export const contentDefaults = Object.fromEntries(contentFields.map((field) => [field.key, field.default]));

export const contentKeys = contentFields.map((field) => field.key);