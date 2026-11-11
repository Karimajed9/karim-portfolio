import type { SiteContent, UiCopy } from './types'

export const siteFr: SiteContent = {
  name: 'Karim Majed',
  title: 'Développeur logiciel – Backend | C# / .NET | Azure | SQL',
  shortTitle: 'Développeur logiciel backend',
  description:
    'Développeur backend à Montréal avec plus de 5 ans d’expérience en C#/.NET, Azure et SQL.',
  metaLine: 'C# / .NET / Azure / SQL · 5+ ans d’expérience · Montréal, Canada',
  githubUrl: 'https://github.com/Karimajed9',
  linkedInUrl: 'https://www.linkedin.com/in/karimajed9',
  about: {
    summary:
      'Développeur backend avec plus de 5 ans d’expérience en applications d’entreprise C#/.NET, intégrations cloud et traitement de données SQL à grande échelle. Travail sur des frameworks réutilisables, API REST, messagerie asynchrone, traitements financiers idempotents, diagnostic en production et optimisation.',
    education: [
      {
        school: 'Université Concordia',
        city: 'Montréal',
        degree: 'Diplôme de 2e cycle en informatique',
        country: 'Canada',
        startDate: 'septembre 2020',
        endDate: 'août 2021',
        yearLabel: '2021',
      },
      {
        school: 'Université américaine de Beyrouth',
        city: 'Beyrouth',
        degree: 'Baccalauréat en administration des affaires, systèmes d’information',
        country: 'Liban',
        startDate: 'septembre 2016',
        endDate: 'mai 2020',
        yearLabel: '2020',
      },
    ],
    goals: 'Continuer à bâtir des systèmes backend solides avec C#/.NET, Azure et SQL.',
    professionalInterests: [
      'Ingénierie backend',
      'C# / .NET',
      'Intégrations Azure',
      'SQL et flux de données',
      'API REST et messagerie',
      'Fiabilité en production',
    ],
    personalInterests: [
      'Muay Thai',
      'Camping',
      'Randonnée',
      'Voyage',
      'Découvrir de nouveaux endroits',
      'Technologie',
      'Programmation',
    ],
  },
  languages: ['Anglais', 'Français', 'Arabe'],
  skills: [
    {
      category: 'Backend et données',
      items: ['C#', '.NET Framework', 'ASP.NET', 'SQL Server', 'Procédures stockées', 'API REST', 'Java'],
    },
    {
      category: 'Azure et intégrations',
      items: [
        'Azure Functions',
        'Azure Logic Apps',
        'Azure Web Apps',
        'Azure Blob Storage',
        'Azure Key Vault',
        'Application Insights',
        'Files',
        'API Sage',
        'SFTP',
      ],
    },
    {
      category: 'Fiabilité et livraison',
      items: ['Idempotence', 'ETL CSV/Excel', 'Datadog', 'Git', 'Jenkins', 'Jira'],
    },
    {
      category: 'Projets personnels',
      items: ['React', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'JavaScript'],
    },
  ],
  experience: [
    {
      company: 'Redmane Technology',
      role: 'Développeur logiciel',
      startDate: 'novembre 2022',
      endDate: 'aujourd’hui',
      location: 'Montréal, Canada',
      highlights: [
        'Framework C#/.NET réutilisable de gestion des échéances, règles configurables et conformité. De courts handlers d’événements personnalisés restent nécessaires par enregistrement ou liste.',
        'Calculs de versements aux familles d’accueil (placements, âge, niveaux de soins, services, barèmes).',
        'Azure Functions vers API Sage : traitements nocturnes, HTTP, files, identifiants de transaction uniques pour une synchro idempotente et un rapprochement.',
        'Nouvelles tentatives, reprise Blob Storage, Application Insights, alertes ciblées.',
        'Migration Logic Apps : millions d’enregistrements, SQL, procédures stockées, CSV/Excel, validation, dédoublonnage et rapports d’erreurs.',
        'Handlers C# optimisés en retirant du traitement redondant ; exports nocturnes SFTP gouvernemental.',
      ],
    },
    {
      company: 'Wiley Edge, en mission à la Banque Nationale du Canada',
      role: 'Développeur Java',
      startDate: 'septembre 2021',
      endDate: 'septembre 2022',
      location: 'Montréal, Canada',
      highlights: [
        'Plus de 50 fonctionnalités Java pour une application interne utilisée par plus de 100 employés.',
        'Plus de 100 anomalies fonctionnelles et d’interface corrigées.',
        'Équipe Agile/Scrum de 15 personnes.',
      ],
    },
  ],
  projects: {
    title: 'Projets personnels',
    subtitle: 'Travaux et apprentissages',
    items: [
      {
        name: 'Plateforme de portfolio personnel',
        summary:
          'Portfolio avec frontend React/TypeScript, API Java/Spring Boot et PostgreSQL. Un espace pour expliquer les décisions de design, l’architecture et les projets personnels ; Docker et le déploiement Azure font partie de la feuille de route.',
        tags: ['React', 'TypeScript', 'Java', 'Spring Boot', 'PostgreSQL'],
        href: 'https://github.com/Karimajed9/karim-portfolio',
        mark: 'KM',
      },
    ],
  },
  mobility: {
    basedIn: 'Basé à Montréal, Canada.',
    headline: 'Ouvert à une mobilité en Europe, en particulier en France et en Suisse.',
    destinations: [
      {
        code: 'FR',
        name: 'France',
        body: 'Intéressé par des postes backend et .NET/Azure en France ; ouvert à discuter relocation et autorisation de travail avec les employeurs.',
      },
      {
        code: 'CH',
        name: 'Suisse',
        body: 'Explore aussi des opportunités backend en Suisse, sous réserve de parrainage employeur et des exigences locales.',
      },
    ],
    boardRows: [
      ['YUL', 'CDG', 'OUVERT'],
      ['YUL', 'GVA', 'OUVERT'],
      ['YUL', 'ZRH', 'OUVERT'],
    ],
    boardFoot: 'Ouvert à une mobilité en Europe, en particulier en France et en Suisse.',
  },
  contact: {
    title: 'Contact',
    subtitle: 'Écrivez-moi',
    email: 'karim_majed@outlook.com',
    blurb: 'Ouvert aux discussions sur des postes ou des projets. Courriel ou formulaire ci-dessous.',
  },
}

export const uiFr: UiCopy = {
  skipToContent: 'Aller au contenu',
  nav: {
    primary: 'Principal',
    sections: 'Sections',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    siteMenu: 'Menu du site',
  },
  sections: {
    profile: 'Profil',
    experience: 'Expérience',
    projects: 'Projets',
    skills: 'Compétences',
    education: 'Formation',
    mobility: 'Mobilité',
    contact: 'Contact',
  },
  settings: {
    open: 'Paramètres',
    title: 'Paramètres',
    theme: 'Thème',
    dark: 'Sombre',
    light: 'Clair',
    language: 'Langue',
    english: 'English',
    french: 'Français',
  },
  social: {
    github: 'GitHub',
    linkedIn: 'LinkedIn',
  },
  cv: {
    en: 'CV (EN)',
    fr: 'CV (FR)',
    download: 'Télécharger le CV (PDF)',
    downloadEn: 'Télécharger le CV — anglais',
    downloadFr: 'Télécharger le CV — français',
  },
  home: {
    introAria: 'Introduction',
    getInTouch: 'Me contacter',
    boardAria:
      'Tableau des départs : de Montréal, Canada vers la France et la Suisse. Ouvert à une mobilité en Europe.',
    departures: 'Départs',
    languages: 'Langues',
    copyEmail: 'Copier',
    copied: 'Copié',
  },
  experience: {
    title: 'Expérience professionnelle',
    present: 'Aujourd’hui',
  },
  projects: {
    title: 'Projets personnels',
    viewRepo: 'Voir le dépôt',
  },
  skills: {
    title: 'Compétences techniques',
  },
  education: {
    title: 'Formation',
  },
  mobility: {
    title: 'Mobilité internationale',
  },
  contact: {
    title: 'Contact',
    name: 'Nom',
    email: 'Courriel',
    message: 'Message',
    send: 'Envoyer',
    sending: 'Envoi…',
    success: 'Message envoyé. Merci.',
    sendFailed: 'Envoi impossible. Écrivez-moi à {email}.',
    unreachable: 'API inaccessible. Écrivez-moi à {email}.',
    rateLimited:
      'Un seul message par minute depuis ce réseau. Attendez une minute et réessayez.',
    honeypotRejected: 'Envoi impossible. Réessayez.',
    nameError: 'Entrez au moins 2 caractères.',
    emailError: 'Entrez une adresse courriel valide.',
    messageError: 'Le message doit contenir au moins 10 caractères.',
  },
  notFound: {
    title: 'Page introuvable',
    subtitle: 'Cette page n’existe pas.',
    body: 'Vérifiez le lien, ou retournez à l’accueil.',
    goHome: 'Accueil',
    contact: 'Contact',
  },
  footer: {
    location: 'Montréal, QC',
  },
  apiBanner: {
    warming: 'L’API démarre. Affichage du contenu enregistré pour le moment.',
    offline: 'Impossible de joindre l’API. Affichage du contenu enregistré.',
    loading: 'Chargement des données. Affichage du contenu enregistré un instant.',
    dismiss: 'Fermer le message sur l’API',
  },
  admin: {
    title: 'Messages',
    signedIn: 'Messages de contact du site.',
    signedOut: 'Connectez-vous pour voir les messages.',
    username: 'Nom d’utilisateur',
    password: 'Mot de passe',
    load: 'Charger les messages',
    loading: 'Chargement…',
    refresh: 'Actualiser',
    refreshing: 'Actualisation…',
    empty: 'Aucun message pour le moment.',
    listHeading: 'Messages de contact',
    authError: 'Nom d’utilisateur ou mot de passe invalide.',
    unreachable: 'Impossible de joindre l’API. Le backend tourne-t-il sur le port 8080 ?',
  },
}
