export type Locale = 'en' | 'fr'

export type SiteContent = {
  name: string
  title: string
  shortTitle: string
  description: string
  metaLine: string
  githubUrl: string
  linkedInUrl: string
  about: {
    summary: string
    education: Array<{
      school: string
      city: string
      degree: string
      country: string
      startDate: string
      endDate: string
      yearLabel: string
    }>
    goals: string
    professionalInterests: string[]
    personalInterests: string[]
  }
  languages: string[]
  skills: Array<{ category: string; items: string[] }>
  experience: Array<{
    company: string
    role: string
    startDate: string
    endDate: string
    location: string
    highlights: string[]
  }>
  projects: {
    title: string
    subtitle: string
    items: Array<{
      slug: string
      name: string
      summary: string
      tags: string[]
      href: string
      mark: string
      category: string
      status: string
      coverImageUrl: string
      liveDemoUrl: string
      role: string
      overview: string
      problem: string
      architectureImageUrl: string
      architectureCaption: string
      features: string[]
      tradeoffs: string[]
      challenges: string[]
      testing: string
      galleryUrls: string[]
      lessons: string[]
    }>
  }
  mobility: {
    basedIn: string
    headline: string
    destinations: Array<{ code: string; name: string; body: string }>
    boardRows: string[][]
    boardFoot: string
  }
  contact: {
    title: string
    subtitle: string
    email: string
    blurb: string
  }
}

export type UiCopy = {
  skipToContent: string
  nav: {
    primary: string
    sections: string
    openMenu: string
    closeMenu: string
    siteMenu: string
  }
  sections: {
    profile: string
    experience: string
    projects: string
    skills: string
    education: string
    mobility: string
    contact: string
  }
  settings: {
    open: string
    title: string
    theme: string
    dark: string
    light: string
    language: string
    english: string
    french: string
  }
  social: {
    github: string
    linkedIn: string
  }
  cv: {
    en: string
    fr: string
    download: string
    downloadEn: string
    downloadFr: string
  }
  home: {
    introAria: string
    getInTouch: string
    boardAria: string
    departures: string
    languages: string
    copyEmail: string
    copied: string
  }
  experience: {
    title: string
    present: string
  }
  projects: {
    title: string
    viewRepo: string
    explore: string
    liveDemo: string
    github: string
    category: string
    status: string
  }
  caseStudy: {
    breadcrumbHome: string
    breadcrumbProjects: string
    overview: string
    metadata: string
    role: string
    tech: string
    status: string
    source: string
    demo: string
    problem: string
    architecture: string
    features: string
    tradeoffs: string
    challenges: string
    testing: string
    gallery: string
    lessons: string
    links: string
    nextProject: string
    sectionNav: string
    missingCover: string
    missingImage: string
    notFound: string
    backToProjects: string
  }
  skills: {
    title: string
  }
  education: {
    title: string
  }
  mobility: {
    title: string
  }
  contact: {
    title: string
    name: string
    email: string
    message: string
    send: string
    sending: string
    success: string
    sendFailed: string
    unreachable: string
    rateLimited: string
    honeypotRejected: string
    nameError: string
    emailError: string
    messageError: string
  }
  notFound: {
    title: string
    subtitle: string
    body: string
    goHome: string
    contact: string
  }
  footer: {
    location: string
  }
  apiBanner: {
    warming: string
    offline: string
    loading: string
    dismiss: string
  }
  contentUpdate: {
    message: string
    dismiss: string
  }
  admin: {
    title: string
    signedIn: string
    signedOut: string
    username: string
    password: string
    load: string
    loading: string
    refresh: string
    refreshing: string
    empty: string
    listHeading: string
    tabsLabel: string
    messagesTab: string
    cvTab: string
    deleteMessage: string
    deletingMessage: string
    deleteMessageFailed: string
    prevPage: string
    nextPage: string
    pageStatus: string
    messagesCount: string
    authError: string
    tooManyRequests: string
    logout: string
    unreachable: string
    contentHeading: string
    experienceHeading: string
    projectsHeading: string
    skillsHeading: string
    educationHeading: string
    add: string
    save: string
    saving: string
    remove: string
    saved: string
    saveFailed: string
    langEn: string
    langFr: string
    company: string
    role: string
    startDate: string
    endDate: string
    location: string
    highlights: string
    highlightsHint: string
    sortOrder: string
    name: string
    summary: string
    tags: string
    tagsHint: string
    href: string
    slug: string
    coverImage: string
    coverImageHint: string
    coverImageUpload: string
    coverImageUrl: string
    coverImagePick: string
    coverImageFailed: string
    coverImageSaved: string
    liveDemoUrl: string
    mark: string
    overview: string
    problem: string
    architectureImage: string
    architectureCaption: string
    features: string
    tradeoffs: string
    challenges: string
    testing: string
    gallery: string
    galleryHint: string
    lessons: string
    category: string
    status: string
    school: string
    city: string
    degree: string
    country: string
    cvHeading: string
    cvHint: string
    cvEn: string
    cvFr: string
    cvUploadEn: string
    cvUploadFr: string
    cvPickFile: string
    cvUploadFailed: string
    cvSaved: string
  }
}
