export type LessonSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  alert?: string;
};

export type KnowledgeCheck = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type TrainingModule = {
  moduleNumber: number;
  title: string;
  summary: string;
  objectives: string[];
  estimatedMinutes: number;
  sections: LessonSection[];
  knowledgeCheck: KnowledgeCheck;
  validationNotes?: string[];
};

/**
 * Contenu pédagogique construit à partir du support « Formation nouveau recrutement ».
 * Les informations commerciales sensibles ou nécessitant une procédure actualisée sont
 * signalées pour validation avant publication officielle.
 */
export const trainingModules: TrainingModule[] = [
  {
    moduleNumber: 1,
    title: "Connaître ILBB et la marque COMTESSE",
    summary: "Comprendre l'identité de l'entreprise, sa mission, sa vision et ses valeurs afin de représenter la marque avec cohérence.",
    estimatedMinutes: 12,
    objectives: [
      "Présenter ILBB et COMTESSE avec des informations fiables.",
      "Expliquer la mission, la vision et les valeurs de l'entreprise.",
      "Adopter une présentation professionnelle auprès des clients."
    ],
    sections: [
      {
        title: "1. Présentation de l'entreprise",
        paragraphs: [
          "ILBB SARL signifie Industrie Laitière et de Boissons du Bénin. Le support de formation indique que l'entreprise a été créée en 1972 par Antoine SADELER.",
          "En 2012, l'entreprise a connu une transformation autour de la marque COMTESSE, portant notamment sur les équipements, la logistique, la force commerciale et le logo. Le support cite Monsieur St-Cyr SADELER comme directeur."
        ],
        bullets: ["Activités citées : importation, production et distribution.", "Slogan : « COMTESSE, LE PLAISIR DE TOUS LES JOURS »."],
        alert: "Les fonctions, noms et données institutionnelles doivent être confirmés auprès de la Direction avant une diffusion officielle si le support a évolué."
      },
      {
        title: "2. Mission, vision et valeurs",
        bullets: [
          "Mission présentée dans le support : « Offrir la santé par le laitage à toute la population. »",
          "Vision présentée : réinventer la consommation de yaourt en associant plaisir quotidien et différenciation sur le terrain.",
          "Valeurs : qualité, satisfaction client, innovation, proximité et esprit d'équipe."
        ],
        paragraphs: ["Au quotidien, ces repères se traduisent par une présentation soignée, une information exacte, le respect des procédures et une relation durable avec les clients."]
      },
      {
        title: "3. Comprendre les éléments du logo",
        bullets: [
          "Le bleu est associé à la fraîcheur et à la douceur.",
          "La couronne jaune symbolise la noblesse des produits et des services.",
          "Le lettrage COMTESSE évoque la modernité."
        ],
        alert: "Le support mentionne une conservation entre 4 et 6 °C dans l'explication du bleu. Appliquer les températures figurant sur les procédures et étiquetages actuellement validés, selon le produit concerné."
      },
      {
        title: "4. Le comportement attendu",
        bullets: [
          "Représenter l'entreprise avec respect et professionnalisme.",
          "Ne pas inventer une information lorsqu'on ne connaît pas la réponse.",
          "Orienter les questions sensibles ou techniques vers le responsable compétent.",
          "Faire vivre les valeurs de qualité, proximité et esprit d'équipe dans chaque interaction."
        ]
      }
    ],
    knowledgeCheck: {
      question: "Quelle est la mission formulée dans le support de formation ?",
      options: [
        "Offrir la santé par le laitage à toute la population.",
        "Vendre exclusivement aux grandes surfaces.",
        "Remplacer toutes les boissons par le yaourt."
      ],
      correctIndex: 0,
      explanation: "Le support formule la mission ainsi : « Offrir la santé par le laitage à toute la population. »"
    },
    validationNotes: ["Confirmer les informations institutionnelles et les responsabilités en vigueur.", "Valider les consignes de conservation actuelles par famille de produits."]
  },
  {
    moduleNumber: 2,
    title: "Maîtriser la gamme de produits COMTESSE",
    summary: "Identifier les familles et références de produits, présenter leurs caractéristiques avec justesse et vérifier les informations avant de répondre au client.",
    estimatedMinutes: 18,
    objectives: [
      "Reconnaître les familles de produits présentées dans le support.",
      "Adapter la présentation à la référence réellement disponible.",
      "Éviter les promesses non confirmées sur les bénéfices ou les prix."
    ],
    sections: [
      {
        title: "1. Les familles présentées",
        bullets: [
          "Pots : COMTESSE BÉBÉ, COMTESSE ARÔMES, COMTESSE BONNE SANTÉ, COMTESSE SUCRÉ et COMTESSE NATURE.",
          "Bouteilles de 330 ml citées : COMTESSE GAOU et COMTESSE YO BIO.",
          "Seaux : COMTESSE PLAISIR VANILLE, FRAISE et NATURE.",
          "Poches : COMTESSE DOUCEURS et COMTESSE BÉBÉ CROISSANCE."
        ],
        paragraphs: ["Le support indique « 4 familles – 13 références ». Les noms et formats doivent être rapprochés du catalogue et de la fiche tarifaire actuellement validés avant une présentation commerciale."]
      },
      {
        title: "2. Présenter les produits sans déformer l'information",
        bullets: [
          "COMTESSE SUCRÉ : le support décrit un goût traditionnel, du sucre de canne et un produit de plaisir familial.",
          "COMTESSE NATURE : le support la décrit comme sans sucre ajouté.",
          "COMTESSE ARÔMES : le support met en avant la texture crémeuse et les saveurs variées.",
          "COMTESSE GAOU et COMTESSE YO BIO : boissons lactées présentées dans le support, notamment pour leur praticité et leur caractère gourmand.",
          "COMTESSE PLAISIR : format à partager décrit comme crémeux et familial.",
          "COMTESSE DOUCEURS : poche pratique aux saveurs fruitées selon le support.",
          "COMTESSE BÉBÉ et BÉBÉ CROISSANCE : références présentées comme destinées aux jeunes enfants dans le support."
        ],
        alert: "Les affirmations liées au diabète, à la digestion, à la croissance, aux vitamines, aux minéraux ou à l'âge d'utilisation doivent être confirmées par les équipes Qualité/Réglementaire avant d'être enseignées comme des allégations officielles. Ne donnez pas de conseil médical."
      },
      {
        title: "3. Prix, formats et disponibilité",
        paragraphs: ["Les prix figurant dans un ancien support peuvent ne plus être valables. Avant toute annonce, consulter la fiche tarifaire approuvée en vigueur et vérifier le format, la référence et la disponibilité réelle."],
        bullets: ["Ne pas mémoriser ni communiquer un tarif ancien comme s'il était actuel.", "Confirmer la référence exacte et son format.", "En cas de doute, demander confirmation au responsable commercial."]
      },
      {
        title: "4. Méthode de présentation client",
        steps: [
          "Identifier le besoin du client et le profil de sa clientèle.",
          "Présenter la référence disponible et son format exact.",
          "Expliquer les caractéristiques confirmées et les conditions commerciales en vigueur.",
          "Répondre uniquement aux questions pour lesquelles l'information est vérifiée.",
          "Confirmer le prix et la disponibilité avant de conclure."
        ]
      }
    ],
    knowledgeCheck: {
      question: "Que faire si un client demande un prix et que vous ne savez pas si votre tarif est à jour ?",
      options: ["Annoncer le prix dont vous vous souvenez.", "Vérifier la fiche tarifaire approuvée ou consulter le responsable.", "Proposer un prix au hasard selon le client."],
      correctIndex: 1,
      explanation: "Le tarif doit être confirmé à partir de la source commerciale en vigueur. Un ancien support ne suffit pas à garantir un prix actuel."
    },
    validationNotes: ["Importer la gamme et les formats à partir du catalogue produit officiel actuel.", "Faire valider les allégations produits par Qualité/Réglementaire.", "Remplacer les anciens prix par la fiche tarifaire approuvée en vigueur."]
  },
  {
    moduleNumber: 3,
    title: "Gérer les vitrines et la présentation des produits",
    summary: "Assurer une présentation attractive et propre des produits, surveiller les dates et appliquer les consignes d'hygiène et de maintenance.",
    estimatedMinutes: 14,
    objectives: [
      "Vérifier l'état général de la vitrine et du système de refroidissement.",
      "Organiser les produits selon les règles de facing indiquées.",
      "Repérer et isoler rapidement les produits non conformes."
    ],
    sections: [
      {
        title: "1. Choisir et négocier l'emplacement",
        bullets: ["Rechercher un emplacement visible et attractif.", "Présenter une proposition au client et convenir de l'emplacement avec lui.", "Veiller à ce que l'emplacement permette une présentation accessible et ordonnée."]
      },
      {
        title: "2. Contrôle technique et hygiène",
        bullets: ["Vérifier la propreté de la vitrine.", "Vérifier que le condenseur et le système de refroidissement fonctionnent.", "Contrôler les dates limites de consommation (DLC) des produits.", "Isoler immédiatement les produits abîmés ou périmés selon la procédure en vigueur."],
        alert: "Le support ne détaille pas le protocole technique complet ni la procédure de traitement des retours. Appliquer les instructions internes actuelles et solliciter le responsable en cas d'anomalie."
      },
      {
        title: "3. Facing et rangement",
        paragraphs: ["Le support indique un rangement du haut vers le bas dans l'ordre suivant : pots, poches, bidons, seaux."],
        steps: ["Ranger les références dans l'ordre prescrit.", "Aligner les produits pour que les étiquettes soient visibles.", "Éviter les mélanges qui rendent les références difficiles à identifier.", "Recontrôler la présentation après le réassort."]
      },
      {
        title: "4. Chiffres de CA associés aux vitrines dans le support",
        bullets: ["Séries 7000/8000 : 20 000.", "Westpoint B : 30 000.", "Westpoint moyen : 40 000.", "Westpoint grand : 50 000."],
        alert: "Le support présente ces montants comme des CA hebdomadaires, mais ne précise pas toutes les conditions d'application. Les confirmer auprès du responsable avant de les utiliser comme objectifs ou engagements."
      },
      {
        title: "5. Provision et récupération des vitrines",
        paragraphs: ["Le support renvoie à une procédure distincte de provision et de récupération. Les étapes détaillées ne figurent pas dans le document fourni."],
        alert: "Ne pas improviser cette procédure : demander et suivre la version officielle en vigueur."
      }
    ],
    knowledgeCheck: {
      question: "Que faut-il faire lorsqu'un produit périmé ou abîmé est constaté dans la vitrine ?",
      options: ["Le laisser en place jusqu'à la prochaine visite.", "L'isoler immédiatement et appliquer la procédure interne.", "Le replacer derrière les produits conformes."],
      correctIndex: 1,
      explanation: "Le support demande d'isoler immédiatement les produits abîmés ou périmés et de respecter les consignes internes."
    },
    validationNotes: ["Confirmer la procédure de provision/récupération des vitrines.", "Confirmer les objectifs de CA et leurs conditions d'application.", "Faire valider les consignes de température et de traitement des produits non conformes."]
  },
  {
    moduleNumber: 4,
    title: "Adopter la bonne posture commerciale",
    summary: "Développer une relation de confiance grâce à l'écoute, la persuasion adaptée, la maîtrise de soi et le suivi client.",
    estimatedMinutes: 12,
    objectives: [
      "Pratiquer l'écoute active et poser des questions ouvertes.",
      "Répondre aux objections sans agressivité ni insistance excessive.",
      "Entretenir une relation client professionnelle et durable."
    ],
    sections: [
      {
        title: "1. Écoute active",
        bullets: ["Laisser le client exprimer son besoin.", "Poser des questions ouvertes pour mieux comprendre sa situation.", "Reformuler la demande pour vérifier qu'elle a été comprise.", "Éviter d'interrompre ou de répondre avant d'avoir écouté."]
      },
      {
        title: "2. Persuasion et gestion des objections",
        bullets: ["Mettre en avant les avantages vérifiés et pertinents pour le client.", "Adapter l'argumentaire à ses besoins et à sa clientèle.", "Rester persévérant sans devenir insistant.", "Garder son calme face à un refus ou une objection.", "Si la question dépasse ses connaissances, orienter le client vers le responsable."]
      },
      {
        title: "3. Crédibilité et professionnalisme",
        bullets: ["Avoir une tenue soignée.", "Communiquer clairement, poliment et avec respect.", "Connaître les produits et la zone de tournée.", "Ne pas promettre un prix, un délai ou un avantage non confirmé.", "Respecter les engagements pris et signaler rapidement tout problème."]
      },
      {
        title: "4. Fidélisation et suivi",
        paragraphs: ["La relation client se construit dans la durée. Le support recommande de visiter les clients selon la périodicité définie et de maintenir une relation après-vente."],
        steps: ["Convenir d'une prochaine étape réaliste.", "Noter les besoins ou objections à suivre selon les outils internes.", "Effectuer le suivi à la périodicité définie.", "Partager avec le responsable les difficultés récurrentes ou les demandes non résolues."]
      },
      {
        title: "5. Exemple de reformulation",
        paragraphs: ["Client : « Je ne suis pas sûr que ce produit intéresse mes clients. »", "Commercial : « Si je comprends bien, vous souhaitez être certain que la référence correspond aux habitudes de votre clientèle. Puis-je vous demander quelles saveurs se vendent le mieux ici ? »"],
        bullets: ["La réponse reconnaît la préoccupation.", "Elle cherche à comprendre avant d'argumenter.", "Elle ouvre la discussion au lieu de forcer la vente."]
      }
    ],
    knowledgeCheck: {
      question: "Quelle est la meilleure réaction face à une objection client ?",
      options: ["Couper la parole pour imposer son argumentaire.", "Écouter, reformuler et répondre avec des informations vérifiées.", "Insister jusqu'à ce que le client accepte."],
      correctIndex: 1,
      explanation: "Le support privilégie l'écoute active, la persuasion adaptée et la persévérance sans insistance excessive."
    }
  },
  {
    moduleNumber: 5,
    title: "Préparer la tournée et servir un client existant",
    summary: "Préparer les produits et les outils, contrôler les quantités et suivre les étapes de livraison chez un client déjà actif.",
    estimatedMinutes: 18,
    objectives: [
      "Préparer les produits, documents et outils avant le départ.",
      "Réaliser un contrôle contradictoire des quantités avec le client.",
      "Documenter la livraison et transmettre le bon de livraison selon la consigne."
    ],
    sections: [
      {
        title: "1. Avant le départ en tournée",
        steps: [
          "Retirer les produits de la chambre froide avec le vendeur.",
          "Consulter l'affichage numérique externe pour valider les quantités sorties.",
          "Compter une deuxième fois les produits par référence avec le vendeur.",
          "Ranger les produits dans les glacières avec le vendeur.",
          "Préparer le carnet de bons de livraison (BL), le téléphone, le FCRC et la calculatrice.",
          "Participer au briefing de départ.",
          "Embarquer dans le véhicule ou sur le tricycle affecté."
        ],
        alert: "Le support cite le FCRC sans développer son intitulé. Conserver le nom interne et demander au responsable la définition et les règles d'utilisation officielles."
      },
      {
        title: "2. Accueil et contrôle chez le client existant",
        steps: [
          "Saluer chaleureusement le client et prendre de ses nouvelles.",
          "Examiner les produits, la vitrine réfrigérée et le régulateur.",
          "Faire l'inventaire des produits restants.",
          "Séparer les produits périmés ou abîmés des produits conformes selon la procédure.",
          "Déterminer les quantités par référence et en informer le client.",
          "Préparer le BL en intégrant les retours de produits périmés ou abîmés selon la procédure en vigueur.",
          "Faire valider les quantités par référence avec le client : les deux parties vérifient les quantités ensemble.",
          "Percevoir le montant dû pour la livraison conformément aux règles internes."
        ]
      },
      {
        title: "3. Finaliser la livraison",
        steps: [
          "Photographier le BL.",
          "Envoyer immédiatement la photo à l'équipe de saisie/comptabilisation via WhatsApp, conformément au support.",
          "Réapprovisionner la vitrine en respectant les règles de facing.",
          "Présenter les paniers vides au client pour confirmation.",
          "Prendre congé poliment."
        ],
        alert: "Respecter les règles internes actuelles relatives aux paiements, à la gestion des retours, à la protection des données et à l'envoi de documents via WhatsApp."
      },
      {
        title: "4. Les réflexes qualité",
        bullets: ["Compter par référence, pas seulement le total général.", "Faire confirmer les quantités par le client avant de clôturer le BL.", "Conserver une trace lisible des documents selon les règles internes.", "Signaler immédiatement une différence de quantité ou une anomalie."]
      }
    ],
    knowledgeCheck: {
      question: "À quel moment les quantités de livraison doivent-elles être vérifiées avec le client ?",
      options: ["Après le départ du commercial.", "Avant la validation finale du bon de livraison.", "Uniquement si le client se plaint."],
      correctIndex: 1,
      explanation: "Le support prévoit une validation des quantités par référence avec le client avant de finaliser la livraison."
    },
    validationNotes: ["Confirmer le développement du sigle FCRC.", "Confirmer les règles actuelles de paiement, de retours et d'envoi de BL."]
  },
  {
    moduleNumber: 6,
    title: "Prospecter, clôturer la tournée et gérer les incidents",
    summary: "Présenter l'entreprise à un prospect, respecter l'enregistrement d'un nouveau client, clôturer la journée et signaler les pannes.",
    estimatedMinutes: 18,
    objectives: [
      "Présenter ILBB COMTESSE de façon claire et professionnelle.",
      "Respecter la création du client dans la base IBM avant toute livraison.",
      "Effectuer les opérations de retour et signaler les incidents selon la procédure."
    ],
    sections: [
      {
        title: "1. Aborder un prospect",
        steps: [
          "Saluer le prospect avec le sourire et la politesse.",
          "Établir un climat de confiance.",
          "Présenter l'entreprise : « Je représente la société ILBB COMTESSE, nous produisons et commercialisons des yaourts frais et naturels, ainsi que des eaux. »",
          "Présenter les références disponibles et les caractéristiques confirmées : goût, qualité, prix et intérêt commercial.",
          "Écouter les objections et y répondre sans inventer d'information.",
          "Si le prospect est d'accord, poursuivre avec les étapes de livraison prévues pour un client existant."
        ],
        alert: "Adapter la présentation institutionnelle si l'offre actuelle ou les formulations officielles ont changé."
      },
      {
        title: "2. Créer le nouveau client",
        paragraphs: ["Le support donne une consigne explicite : créer le nouveau client dans la base IBM avant toute livraison, après transmission des informations requises au responsable."],
        steps: ["Recueillir les informations demandées par le processus interne.", "Transmettre les informations au responsable.", "Vérifier que la création dans la base IBM a été effectuée.", "Ne réaliser aucune livraison avant la création du client conformément à la consigne du support."],
        alert: "Les champs requis et le circuit de validation IBM ne sont pas détaillés dans le support fourni. Utiliser la procédure actuelle de création client."
      },
      {
        title: "3. Retour et clôture de journée",
        steps: [
          "Verser à la caisse les espèces et chèques collectés, puis récupérer le reçu.",
          "Remettre le FCRC et les BL au responsable comptable.",
          "Retourner à la chambre froide pour enregistrer et déposer les produits retournés.",
          "Passer au service comptabilité pour restituer le téléphone professionnel et faire le point sur la situation du compte.",
          "Laver le véhicule ou le tricycle affecté et clôturer la journée."
        ],
        alert: "Suivre les horaires, documents, circuits de caisse et règles de remise des produits définis par les procédures internes en vigueur."
      },
      {
        title: "4. En cas de panne",
        paragraphs: ["Le support couvre les pannes de véhicule, de vitrine ou de régulateur."],
        steps: ["Informer le superviseur.", "Consigner la panne dans le registre de panne concerné.", "Attendre les instructions du superviseur.", "Si aucune réponse n'est reçue après 24 heures, informer le superviseur de niveau supérieur selon le circuit indiqué dans le support."]
      },
      {
        title: "5. Organisation commerciale citée dans le support",
        paragraphs: ["Le document présente des tournées à Cotonou et environs ainsi que dans plusieurs villes, notamment Porto-Novo, Bohicon, Dassa, Djougou et Parakou. Il montre également une organisation avec une responsabilité commerciale, des coordinateurs ADV, des chefs d'équipe et des commerciaux en tricycle ou en véhicule."],
        alert: "Les nombres de tournées et l'organigramme peuvent évoluer. Vérifier l'organisation et l'affectation des secteurs auprès du responsable avant de les utiliser pour planifier une tournée."
      }
    ],
    knowledgeCheck: {
      question: "Selon le support, que faut-il faire avant de livrer un nouveau client ?",
      options: ["Créer le client dans la base IBM après transmission des informations requises au responsable.", "Livrer d'abord et compléter la fiche plus tard.", "Demander au client de s'inscrire lui-même sans vérification."],
      correctIndex: 0,
      explanation: "Le support précise que la création du nouveau client dans la base IBM doit être faite avant toute livraison."
    },
    validationNotes: ["Confirmer la procédure et les champs de création client dans IBM.", "Confirmer le circuit de caisse, de retour produits et de remise des documents.", "Vérifier les secteurs, tournées et niveaux hiérarchiques actuels."]
  }
];

export function getTrainingModule(moduleNumber: number): TrainingModule | undefined {
  return trainingModules.find((module) => module.moduleNumber === moduleNumber);
}
