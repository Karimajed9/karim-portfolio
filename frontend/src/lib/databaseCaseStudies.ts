/** Case studies copied from the public projects API. Covers are bundled files, not /media/uploads. */

export const flowforgeCaseStudyEn = {
  "slug": "flowforge",
  "name": "FlowForge",
  "summary": "A workflow automation app built with Spring Boot, React, PostgreSQL, and RabbitMQ. It lets users create workflows triggered by webhooks, run tasks in the background, and track their results.",
  "tags": [
    "Java",
    "Spring Boot",
    "React",
    "TypeScript",
    "PostgreSQL",
    "RabbitMQ",
    "Docker",
    "REST API",
    "Testcontainers",
    "Tailwind CSS"
  ],
  "href": "https://github.com/Karimajed9/flowforge",
  "mark": "",
  "category": "Full-Stack Web App",
  "status": "In Progress",
  "coverImageUrl": "projects/flowforge-cover.png",
  "liveDemoUrl": "",
  "role": "Solo Developer · Architecture and Full Stack",
  "overview": "FlowForge is a personal project I'm building to learn more about Java, Spring Boot, and distributed systems.\n\nThe idea is simple: users create workflows that run automatically when a webhook is received. A workflow can validate incoming data, make HTTP requests, and keep track of what happened.\n\nI built the backend with Spring Boot, PostgreSQL, and RabbitMQ, and the frontend with React and TypeScript.\n\nA big part of the project has been making sure workflows behave properly when something goes wrong, like a failed request, a duplicate message, or a worker crashing.",
  "problem": "Running a workflow is easy when everything works. Things get more complicated when a message arrives twice, an API stops responding, or a worker crashes halfway through.\n\nI wanted to build something that could handle these situations without losing track of executions or repeating steps that had already finished.",
  "architectureImageUrl": "",
  "architectureCaption": "Webhooks are received by Spring Boot, saved in PostgreSQL, and queued through RabbitMQ. Background workers execute the workflow steps and save their results.",
  "features": [
    "Create and manage workflows from a React dashboard",
    "Trigger workflows using webhooks",
    "Validate data and make HTTPS GET requests",
    "Process tasks asynchronously with RabbitMQ",
    "Track execution status and individual steps",
    "Handle duplicate messages and failed executions",
    "Retry failed messages and send them to a dead-letter queue",
    "Recover interrupted executions through admin tools"
  ],
  "tradeoffs": [
    "I chose RabbitMQ to process workflows in the background instead of running everything inside the webhook request. It makes the system more flexible, but also adds complexity.",
    "I also kept database transactions short so HTTP requests don't hold database locks while waiting for a response.",
    "For now, HTTP steps only support GET requests to approved domains. I wanted to get the execution and failure handling right before supporting requests that could change data in external systems."
  ],
  "challenges": [
    "The hardest part was making sure executions stayed consistent between PostgreSQL and RabbitMQ.",
    "I used the transactional outbox pattern to avoid losing messages when publishing fails.",
    "Another challenge was handling duplicate messages and crashes. I added checkpoints to track completed steps and prevent them from running again.",
    "I also had to change how database transactions worked before adding HTTP requests, since I didn't want to keep a database lock open while waiting for an external API."
  ],
  "testing": "I wrote unit and integration tests using JUnit and Testcontainers. The backend reached 291 passing tests, including tests with real PostgreSQL and RabbitMQ containers.\n\nI tested things like duplicate messages, concurrent requests, database rollbacks, and failed executions.\n\nDocker Compose is used to run PostgreSQL and RabbitMQ locally. The project is still in development and hasn't been publicly deployed yet.",
  "galleryUrls": [] as string[],
  "lessons": [
    "This project taught me a lot about RabbitMQ, Spring Boot, and how distributed systems work.",
    "I also learned that making something work is only half the job. You have to think about what happens when a request fails, a message arrives twice, or an application crashes.",
    "It was also a good opportunity to use Java for a larger project and compare Spring Boot with the .NET technologies I use professionally."
  ]
}

export const flowforgeCaseStudyFr = {
  "slug": "flowforge",
  "name": "FlowForge",
  "summary": "Une application d’automatisation développée avec Spring Boot, React, PostgreSQL et RabbitMQ. Elle permet de créer des workflows déclenchés par des webhooks, d’exécuter des tâches en arrière-plan et de suivre leurs résultats.",
  "tags": [
    "Java",
    "Spring Boot",
    "React",
    "TypeScript",
    "PostgreSQL",
    "RabbitMQ",
    "Docker",
    "API REST",
    "Testcontainers",
    "Tailwind CSS"
  ],
  "href": "https://github.com/Karimajed9/flowforge",
  "mark": "",
  "category": "Application web full-stack",
  "status": "En développement",
  "coverImageUrl": "projects/flowforge-cover.png",
  "liveDemoUrl": "",
  "role": "Développeur solo · Architecture et full-stack",
  "overview": "FlowForge est un projet personnel que je développe pour approfondir mes connaissances en Java, Spring Boot et systèmes distribués.\n\nLe principe est simple : les utilisateurs créent des workflows qui s’exécutent automatiquement lorsqu’un webhook est reçu. Un workflow peut valider des données, effectuer des requêtes HTTP et suivre les résultats.\n\nJ’ai développé le backend avec Spring Boot, PostgreSQL et RabbitMQ, et le frontend avec React et TypeScript.\n\nUne bonne partie du travail consiste à gérer correctement les erreurs, les messages dupliqués et les interruptions pendant l’exécution.",
  "problem": "Exécuter un workflow est assez simple quand tout fonctionne. Ça devient plus compliqué lorsqu’un message arrive deux fois, qu’une API ne répond plus ou qu’un worker s’arrête en plein traitement.\n\nJe voulais créer une application capable de gérer ces situations sans perdre le suivi des exécutions ni répéter les étapes déjà terminées.",
  "architectureImageUrl": "",
  "architectureCaption": "Les webhooks sont reçus par Spring Boot, enregistrés dans PostgreSQL, puis envoyés à RabbitMQ. Des workers exécutent les étapes des workflows et enregistrent les résultats.",
  "features": [
    "Créer et gérer des workflows depuis une interface React",
    "Déclencher des workflows avec des webhooks",
    "Valider des données et effectuer des requêtes HTTPS GET",
    "Exécuter des tâches en arrière-plan avec RabbitMQ",
    "Suivre le statut des exécutions et de chaque étape",
    "Gérer les messages dupliqués et les erreurs",
    "Réessayer les messages en échec et utiliser une dead-letter queue",
    "Reprendre certaines exécutions interrompues avec des outils d’administration"
  ],
  "tradeoffs": [
    "J’ai choisi RabbitMQ pour exécuter les workflows en arrière-plan plutôt que directement dans la requête webhook. C’est plus flexible, mais aussi plus complexe à gérer.",
    "J’ai également limité la durée des transactions pour éviter de garder des verrous en base de données pendant les appels HTTP.",
    "Pour le moment, les étapes HTTP supportent uniquement les requêtes GET vers des domaines autorisés. Je préfère bien gérer les exécutions et les erreurs avant d’ajouter des opérations qui modifient des données externes."
  ],
  "challenges": [
    "La partie la plus difficile était de garder les exécutions cohérentes entre PostgreSQL et RabbitMQ.",
    "J’ai utilisé le pattern Transactional Outbox pour éviter de perdre des messages lorsqu’une publication échoue.",
    "J’ai aussi dû gérer les messages dupliqués et les interruptions. Pour ça, j’ai ajouté des checkpoints qui permettent de suivre les étapes terminées et d’éviter de les exécuter à nouveau.",
    "Enfin, j’ai revu la gestion des transactions avant d’ajouter les requêtes HTTP, pour ne pas garder de verrou en base de données pendant un appel externe."
  ],
  "testing": "J’ai ajouté des tests unitaires et d’intégration avec JUnit et Testcontainers. Le backend a atteint 291 tests réussis, dont plusieurs avec de vrais conteneurs PostgreSQL et RabbitMQ.\n\nJ’ai notamment testé les messages dupliqués, les requêtes concurrentes, les rollbacks et les erreurs d’exécution.\n\nJ’utilise Docker Compose pour lancer PostgreSQL et RabbitMQ en local. Le projet est encore en développement et n’est pas encore déployé publiquement.",
  "galleryUrls": [] as string[],
  "lessons": [
    "Ce projet m’a permis d’en apprendre beaucoup sur RabbitMQ, Spring Boot et le fonctionnement des systèmes distribués.",
    "J’ai aussi réalisé que faire fonctionner une application n’est qu’une partie du travail. Il faut également penser aux requêtes qui échouent, aux messages dupliqués et aux interruptions.",
    "C’était aussi une bonne occasion de travailler sur un projet plus important en Java et de comparer Spring Boot avec les technologies .NET que j’utilise au travail."
  ]
}

export const evaCaseStudyEn = {
  "slug": "eva",
  "name": "EVA — Personal AI Assistant",
  "summary": "A futuristic personal AI assistant designed to hold natural voice conversations, perform tasks on your computer, and help manage everyday activities while keeping you in control of your personal data.",
  "tags": [
    "Java",
    "Spring Boot",
    "React",
    "TypeScript",
    "Electron",
    "Tailwind CSS",
    "Vite",
    "Maven",
    "GitHub Actions"
  ],
  "href": "https://github.com/Karimajed9/eva",
  "mark": "AI",
  "category": "AI and Desktop Application",
  "status": "In Development",
  "coverImageUrl": "projects/eva-cover.png",
  "liveDemoUrl": "",
  "role": "Full-Stack Developer",
  "overview": "EVA (Electronic Virtual Assistant) is a personal project that aims to make artificial intelligence a natural part of everyday computer use.\n\nInspired by JARVIS from Iron Man, EVA is designed to go beyond a traditional chatbot by interacting with users through voice, performing computer tasks, managing emails, and remembering personal preferences.\n\nBuilt with Java, React, and Electron, the application follows a local-first architecture with a focus on privacy, security, and user control. The project is being developed in stages, starting with the desktop application and its core architecture.",
  "problem": "Most traditional AI chatbots focus on answering questions rather than helping users perform tasks directly on their computers. Giving AI assistants access to personal files and accounts can also introduce privacy and security concerns.\n\nEVA aims to address these challenges by combining conversational AI, computer automation, and controlled access to personal information within a single desktop application.",
  "architectureImageUrl": "",
  "architectureCaption": "",
  "features": [
    "Futuristic desktop interface with an animated AI orb",
    "Local Java backend powered by Spring Boot",
    "Authenticated communication between application layers",
    "Real-time backend connection monitoring",
    "Sandboxed Electron environment",
    "Automatic backend startup and shutdown",
    "Local-first architecture focused on privacy",
    "Modular architecture designed for future AI integrations"
  ],
  "tradeoffs": [],
  "challenges": [],
  "testing": "EVA currently includes 41 automated tests passing locally across the backend, frontend, and desktop application. Integration tests cover communication between components, application startup, error handling, and process management.\n\nA GitHub Actions pipeline is configured to automatically build and test the application on pull requests. Development is organized into separate milestones and feature branches to maintain a stable and reliable codebase.",
  "galleryUrls": [] as string[],
  "lessons": []
}

export const evaCaseStudyFr = {
  "slug": "eva",
  "name": "EVA — Assistante IA personnelle",
  "summary": "Une assistante IA personnelle et futuriste, conçue pour permettre des conversations vocales naturelles, effectuer des tâches sur votre ordinateur et faciliter votre quotidien tout en vous laissant le contrôle de vos données personnelles.",
  "tags": [
    "Java",
    "Spring Boot",
    "React",
    "TypeScript",
    "Electron",
    "Tailwind CSS",
    "Vite",
    "Maven",
    "GitHub Actions"
  ],
  "href": "https://github.com/Karimajed9/eva",
  "mark": "AI",
  "category": "IA et application de bureau",
  "status": "En développement",
  "coverImageUrl": "projects/eva-cover.png",
  "liveDemoUrl": "",
  "role": "Développeur full-stack",
  "overview": "EVA (Electronic Virtual Assistant) est un projet personnel qui vise à intégrer naturellement l'intelligence artificielle dans l'utilisation quotidienne d'un ordinateur.\n\nInspirée de JARVIS dans Iron Man, EVA est conçue pour aller au-delà d'un simple chatbot en interagissant avec l'utilisateur par la voix, en effectuant des tâches informatiques, en gérant des courriels et en mémorisant ses préférences.\n\nDéveloppée avec Java, React et Electron, l'application repose sur une architecture locale qui privilégie la confidentialité, la sécurité et le contrôle des données par l'utilisateur. Le projet est développé progressivement, en commençant par l'application de bureau et son architecture de base.",
  "problem": "La plupart des chatbots traditionnels se concentrent sur les réponses aux questions plutôt que sur l'exécution de tâches directement sur l'ordinateur de l'utilisateur. Donner à une intelligence artificielle accès aux fichiers et aux comptes personnels peut également soulever des préoccupations liées à la confidentialité et à la sécurité.\n\nEVA vise à répondre à ces défis en combinant intelligence artificielle conversationnelle, automatisation informatique et accès contrôlé aux informations personnelles dans une seule application de bureau.",
  "architectureImageUrl": "",
  "architectureCaption": "",
  "features": [
    "Interface de bureau futuriste avec une sphère IA animée",
    "Backend Java local basé sur Spring Boot",
    "Communication authentifiée entre les composants de l'application",
    "Surveillance en temps réel de la connexion au backend",
    "Environnement Electron isolé",
    "Démarrage et arrêt automatiques du backend",
    "Architecture locale axée sur la confidentialité",
    "Architecture modulaire conçue pour les futures intégrations IA"
  ],
  "tradeoffs": [],
  "challenges": [],
  "testing": "EVA compte actuellement 41 tests automatisés réussis localement couvrant le backend, le frontend et l'application de bureau. Les tests d'intégration couvrent la communication entre les composants, le démarrage de l'application, la gestion des erreurs et des processus.\n\nUn pipeline GitHub Actions est configuré pour automatiser la compilation et les tests lors des pull requests. Le développement est organisé en différentes étapes et branches de fonctionnalités afin de maintenir une base de code stable et fiable.",
  "galleryUrls": [] as string[],
  "lessons": []
}

