# COMTESSE Academy — Cahier des charges fonctionnel

**Version :** 1.0  
**Statut :** Validé par le commanditaire  
**Périmètre de cette livraison :** Documentation et préparation pédagogique uniquement. Aucun développement applicatif n'est inclus.

## 1. Contexte et objectifs

COMTESSE Academy transforme le support PowerPoint de formation des nouveaux commerciaux Yaourt en un parcours numérique interactif, autonome et accessible sur téléphone et ordinateur.

Objectifs :
- faciliter l'apprentissage à son propre rythme ;
- consolider les connaissances au moyen d'exercices et d'évaluations ;
- mesurer les acquis et la maîtrise des compétences critiques ;
- conserver la progression et l'historique des tentatives ;
- permettre aux responsables habilités de suivre les apprenants et de gérer les contenus ;
- délivrer une attestation après réussite.

## 2. Périmètre initial

La première version comprend :
- une plateforme web responsive ;
- un compte individuel par apprenant ;
- six modules pédagogiques ;
- une narration audio facultative via la synthèse vocale du navigateur, avec contenu écrit toujours disponible ;
- des exercices et un examen final ;
- une banque de questions organisée par compétence, avec variantes ;
- un tableau de bord des responsables ;
- un espace d'administration ;
- une attestation PDF et une vérification en ligne ;
- la sauvegarde de la progression et de l'historique.

La formation vise initialement les nouveaux commerciaux Yaourt. L'extension à d'autres gammes n'est pas incluse à ce stade.

## 3. Rôles et autorisations

### Apprenant
- se connecter avec un identifiant individuel et un code secret ;
- suivre les modules et reprendre sa progression ;
- lire les contenus et, facultativement, écouter leur narration ;
- réaliser les exercices et l'examen ;
- consulter ses propres résultats et son historique ;
- télécharger son attestation après réussite.

Un apprenant ne peut pas consulter les données d'un autre apprenant, modifier ses scores ni consulter les réponses de l'examen avant soumission.

### Responsable de formation habilité
Selon les autorisations qui lui sont accordées :
- suivre les apprenants, leur progression et leurs résultats ;
- rédiger et modifier les contenus et les questions ;
- identifier les questions critiques ;
- valider et publier les contenus ;
- consulter les attestations ;
- réinitialiser un code secret après vérification de l'identité du demandeur.

Un même responsable habilité peut rédiger et valider un contenu. La plateforme conserve une trace de l'auteur, du validateur, des dates et de la version publiée.

### Administrateur principal
- gérer les comptes et les rôles ;
- gérer les paramètres généraux ;
- superviser les contenus, évaluations et attestations ;
- consulter les journaux nécessaires à la sécurité et à l'audit ;
- déclencher les réinitialisations de codes secrets selon la procédure approuvée.

## 4. Organisation pédagogique

La structure de travail retenue comprend six modules, à rapprocher du PowerPoint et à valider par les responsables métier avant publication.

1. **Identité et culture d'entreprise** : histoire de l'ILBB, identité COMTESSE, mission, vision, valeurs et slogan.
2. **Connaissance des produits Yaourt** : familles, références, caractéristiques, arguments de vente autorisés et prix officiels en vigueur.
3. **Conservation et gestion de la vitrine** : chaîne du froid, hygiène, contrôles techniques, facing, DLC et traitement des produits non conformes.
4. **Posture et techniques commerciales** : écoute active, persuasion, persévérance respectueuse, gestion des objections et relation client.
5. **Préparation et conduite de la tournée** : préparation des produits, double comptage, matériel, visite du client existant, quantités, BL, encaissement et rangement.
6. **Prospection et clôture de journée** : présentation au prospect, traitement des objections, création du client dans IBM avant livraison, caisse, documents, retours et entretien du matériel.

## 5. Contenus et narration audio

Chaque module peut contenir des textes, visuels, exemples, mises en situation, exercices et synthèses. La narration audio est facultative et dépend de la disponibilité de la synthèse vocale dans le navigateur ou l'appareil. L'accès au contenu écrit ne doit pas dépendre de l'audio.

## 6. Examen final

- 20 questions par tentative ;
- seuil global de réussite : au moins 80 %, soit 16 réponses correctes sur 20 ;
- nombre de tentatives illimité ;
- tirage renouvelé à chaque tentative selon la banque disponible ;
- ordre aléatoire des questions et, lorsque pertinent, des réponses ;
- correction et explications disponibles après soumission complète ;
- historique conservant les questions présentées, les réponses, le score, le résultat, la date et la version des contenus.

La plateforme doit éviter, autant que la taille de la banque le permet, de reproduire intégralement un questionnaire déjà passé. L'unicité complète de chaque tentative ne peut être garantie si la banque est insuffisante.

### Questions critiques
La réussite nécessite à la fois :
1. au moins 80 % au score global ;
2. la réussite de toutes les questions critiques présentées dans la tentative.

Une réponse incorrecte à une question critique entraîne l'échec de la tentative, même si le score global atteint 80 %. Le statut critique doit être attribué explicitement par un responsable habilité et validé par COMTESSE ; il ne doit pas être déduit automatiquement.

## 7. Banque de questions

La banque doit être conséquente, comporter plusieurs variantes par compétence et être dimensionnée après audit du support et des compétences. Chaque question doit comporter, selon son type :
- un identifiant ;
- le module et la compétence ;
- l'énoncé et les éventuelles variantes ;
- les choix de réponse et la réponse correcte ;
- une explication pédagogique ;
- un statut critique ;
- la référence à la source ;
- un statut de validation et une version.

Les questions proposées dans la première livraison ne sont pas homologuées. Les règles métier, les tarifs et les consignes opérationnelles doivent être vérifiés par les responsables concernés avant publication officielle.

## 8. Attestation

L'attestation est délivrée uniquement après réussite des deux critères d'examen. Elle comprend :
- un PDF institutionnel ;
- une attestation vérifiable sur la plateforme avec identifiant ou code unique.

La vérification publique ne doit exposer que les informations nécessaires à la confirmation de validité. Les réponses, scores détaillés et données non nécessaires ne sont pas publics. Les modalités de révocation d'une attestation devront être définies avant mise en production.

## 9. Gestion des codes secrets

La récupération est effectuée par un administrateur ou responsable habilité après vérification du demandeur. Les codes secrets ne doivent pas être stockés en clair ni consultables par les responsables. Le mécanisme exact de remise du nouveau code doit être défini avant le développement.

## 10. Tableau de bord et historique

Le tableau de bord doit présenter les inscriptions, l'activité, la progression par module, les examens, les tentatives, les résultats par compétence, les échecs aux questions critiques et les attestations. L'accès aux données doit respecter les rôles. Les modifications ultérieures des questions ne doivent pas réécrire les résultats historiques.

## 11. Publication et versions

Cycle proposé : **Brouillon → Validation → Publication → Révision ou archivage**.

Les contenus non publiés restent invisibles aux apprenants. Toute modification substantielle crée une nouvelle version. L'historique d'examen conserve la version effectivement utilisée. Un responsable habilité peut rédiger et valider le même contenu, avec traçabilité des actions.

## 12. Identité visuelle et ergonomie

L'interface adopte une présentation institutionnelle premium, cohérente avec l'identité COMTESSE, lisible et adaptée aux téléphones, tablettes et ordinateurs. Les logos, couleurs et visuels officiels doivent être fournis ou validés par COMTESSE.

## 13. Connexion, sécurité et conservation

Une connexion Internet est nécessaire pour l'accès, la synchronisation, les examens et les résultats. Les mesures de sécurité doivent couvrir les sessions, les rôles, les codes secrets, les données personnelles, les journaux d'activité, les attestations et les sauvegardes. Les durées de conservation des comptes, résultats et journaux devront être validées par COMTESSE.

## 14. Sources métier à confirmer

Le PowerPoint « FORMATION NOUVO RECRUTEMENT.pptx » est la base pédagogique initiale. Avant publication, les responsables compétents doivent confirmer les documents et consignes à jour, notamment :
- le règlement intérieur ;
- les procédures de mise à disposition, reprise et gestion des vitrines ;
- les consignes de conservation et de chaîne du froid ;
- la liste de prix officielle ;
- les procédures relatives aux BL, aux retours et aux encaissements ;
- la procédure de création d'un client dans IBM.

Le PowerPoint indique une conservation constante entre 4 et 6 °C. Cette consigne doit être confirmée par le responsable compétent avant d'être utilisée comme règle officielle. Aucune règle métier absente des sources ne doit être inventée.

## 15. Critères de recette

La recette devra notamment vérifier :
1. le respect des droits de chaque rôle ;
2. l'isolation des données entre apprenants ;
3. la sauvegarde et la reprise de progression ;
4. l'accès aux six modules ;
5. le caractère facultatif de l'audio ;
6. les 20 questions par tentative ;
7. le seuil de 80 % ;
8. l'échec si une question critique est ratée ;
9. le tirage renouvelé dans les limites de la banque ;
10. la correction accessible seulement après soumission ;
11. l'historique des tentatives et des versions ;
12. l'émission du PDF après réussite ;
13. la vérification en ligne de l'attestation ;
14. l'inaccessibilité des contenus non publiés ;
15. la réinitialisation sécurisée du code secret ;
16. l'ergonomie sur mobile et ordinateur ;
17. la validation des règles métier publiées.

## 16. Hors périmètre à ce stade

Le choix final de technologie et d'hébergement, la base de données définitive, les interfaces, les API, le déploiement en production et l'intégration à des systèmes internes ne sont pas définis par ce document. Ils seront étudiés dans la conception technique. Cette livraison n'inclut aucun code applicatif.

## 17. Statut

Le cahier des charges fonctionnel version 1.0 a été validé par le commanditaire. Les contenus métier et les questions doivent néanmoins faire l'objet de leur validation propre avant publication.
