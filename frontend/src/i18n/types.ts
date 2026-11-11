export type Locale = 'en' | 'fr'

export type SiteContent = {
  name: string
  title: string
  description: string
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
    }>
    goals: string
    professionalInterests: string[]
    personalInterests: string[]
  }
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
      name: string
      summary: string
      tags: string[]
      href: string
    }>
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
    home: string
    about: string
    skills: string
    experience: string
    projects: string
    contact: string
    primary: string
    openMenu: string
    closeMenu: string
    siteMenu: string
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
  home: {
    introAria: string
    mark: string
    seeProjects: string
    contact: string
    blueprintLabel: string
    highlightsLabel: string
    highlightsHeading: string
    projectsLabel: string
    featuredHeading: string
    allProjects: string
    moreLabel: string
    moreHeading: string
    moreBody: string
    about: string
    highlightItems: Array<{ value: string; label: string }>
  }
  about: {
    subtitle: string
    summary: string
    role: string
    roleAside: string
    education: string
    goals: string
    professionalInterests: string
    personalInterests: string
    invite: string
    contact: string
  }
  skills: {
    subtitle: string
    main: string
    alsoUse: string
    domains: {
      backend: string
      frontend: string
      cloud: string
      databases: string
      tools: string
    }
  }
  experience: {
    title: string
    subtitle: string
  }
  projects: {
    title: string
  }
  contact: {
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
    authError: string
    unreachable: string
  }
}
