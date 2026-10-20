import { useState } from "react";
import "./App.css";

const modules = [
  { id: 1, title: "Identité & culture", subtitle: "Découvrir COMTESSE et ses valeurs", icon: "🏢", duration: "15 min", lessons: 4 },
  { id: 2, title: "Connaissance des produits", subtitle: "Maîtriser les gammes et les références", icon: "🥛", duration: "25 min", lessons: 6 },
  { id: 3, title: "Vitrine & conservation", subtitle: "Garantir la qualité et la bonne présentation", icon: "❄️", duration: "20 min", lessons: 5 },
  { id: 4, title: "Posture commerciale", subtitle: "Écouter, conseiller et convaincre", icon: "🤝", duration: "25 min", lessons: 5 },
  { id: 5, title: "Préparation & tournée", subtitle: "Organiser les visites et les livraisons", icon: "🛵", duration: "25 min", lessons: 6 },
  { id: 6, title: "Prospection & clôture", subtitle: "Développer les ventes et clôturer sa journée", icon: "📋", duration: "20 min", lessons: 5 },
];

function App() {
  const [role, setRole] = useState<"commercial" | "manager">("commercial");
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  const filteredModules = modules.filter((module) =>
    `${module.title} ${module.subtitle}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="COMTESSE Academy accueil" onClick={(event) => { event.preventDefault(); setActiveModule(null); }}>
          <span className="brand-mark">C</span>
          <span className="brand-copy"><strong>COMTESSE</strong><small>ACADEMY</small></span>
        </a>

        <div className="side-label">ESPACE FORMATION</div>
        <button className={`nav-item ${activeModule === null ? "selected" : ""}`} onClick={() => setActiveModule(null)}>
          <span>▦</span> Tableau de bord
        </button>
        <button className="nav-item" onClick={() => { setActiveModule(null); setNotice("Le parcours complet sera activé dans la prochaine version."); }}>
          <span>▤</span> Mon parcours
        </button>
        <button className="nav-item" onClick={() => setNotice("Les évaluations seront disponibles après intégration du moteur d'examen sécurisé.")}>
          <span>✓</span> Mes évaluations
        </button>
        <button className="nav-item" onClick={() => setNotice("Les certificats seront accessibles après réussite d'un examen officiel.")}>
          <span>♧</span> Mes certificats
        </button>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">✦</span>
            <strong>Besoin d'aide ?</strong>
            <p>Votre responsable de formation peut vous accompagner.</p>
            <button onClick={() => setNotice("Contactez votre responsable de formation COMTESSE.")}>Obtenir de l'aide ↗</button>
          </div>
          <div className="sidebar-foot">COMTESSE · LE PLAISIR DE TOUS LES JOURS</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Formation <span>/</span> <strong>{activeModule ? "Module" : "Tableau de bord"}</strong></div>
          <div className="top-actions">
            <span className="status-dot"></span><span className="status-text">Espace de démonstration</span>
            <div className="avatar">CA</div>
          </div>
        </header>

        <div className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">COMTESSE ACADEMY · FORMATION COMMERCIALE</div>
              <h1>{activeModule ? modules.find((item) => item.id === activeModule)?.title : "Bienvenue dans votre académie"}</h1>
              <p className="lead">{activeModule ? "Découvrez les objectifs de ce module et préparez votre apprentissage." : "Développez vos compétences, maîtrisez nos produits et faites grandir votre expertise terrain."}</p>
            </div>
            <div className="role-switch">
              <label htmlFor="role-select">Vue de démonstration</label>
              <select id="role-select" value={role} onChange={(event) => { setRole(event.target.value as "commercial" | "manager"); setNotice(""); }}>
                <option value="commercial">Commercial</option>
                <option value="manager">Responsable formation</option>
              </select>
            </div>
          </div>

          {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Fermer">×</button></div>}

          {activeModule ? (
            <section className="module-detail panel">
              <button className="back-link" onClick={() => setActiveModule(null)}>← Retour au tableau de bord</button>
              <div className="detail-icon">{modules.find((item) => item.id === activeModule)?.icon}</div>
              <div className="eyebrow">MODULE {String(activeModule).padStart(2, "0")}</div>
              <h2>{modules.find((item) => item.id === activeModule)?.title}</h2>
              <p>{modules.find((item) => item.id === activeModule)?.subtitle}</p>
              <div className="detail-stats">
                <span>◷ {modules.find((item) => item.id === activeModule)?.duration}</span>
                <span>▤ {modules.find((item) => item.id === activeModule)?.lessons} séquences prévues</span>
              </div>
              <div className="coming-soon">
                <strong>Contenu en préparation</strong>
                <p>Les leçons et les supports seront ajoutés après validation du contenu par les responsables de COMTESSE.</p>
              </div>
              <button className="primary-button" onClick={() => setNotice("Le contenu pédagogique n'est pas encore disponible dans cette maquette.")}>Accéder à la formation <span>→</span></button>
            </section>
          ) : (
            <>
              {role === "manager" ? (
                <section className="manager-banner">
                  <div className="banner-symbol">♙</div>
                  <div><span className="banner-tag">ESPACE RESPONSABLE</span><h2>Préparez votre équipe à la réussite.</h2><p>Le suivi des apprenants, la gestion des questions et les rapports seront intégrés dans une prochaine étape.</p></div>
                  <button onClick={() => setNotice("Le tableau de gestion sera activé après la mise en place du backend sécurisé.")}>Voir les fonctions prévues ↗</button>
                </section>
              ) : (
                <section className="hero">
                  <div className="hero-copy">
                    <div className="hero-tag"><span>✦</span> VOTRE PARCOURS COMMENCE ICI</div>
                    <h2>Apprendre aujourd'hui.<br /><em>Exceller sur le terrain.</em></h2>
                    <p>Un parcours pour mieux connaître nos produits, servir nos clients et progresser chaque jour.</p>
                    <button className="hero-button" onClick={() => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })}>Découvrir les formations <span>→</span></button>
                  </div>
                  <div className="hero-art" aria-hidden="true">
                    <div className="art-ring ring-one"></div><div className="art-ring ring-two"></div>
                    <div className="art-center"><span>✦</span><strong>C</strong><small>COMTESSE</small></div>
                    <div className="art-note note-top">QUALITÉ <span>✦</span></div>
                    <div className="art-note note-bottom">PROXIMITÉ <span>✓</span></div>
                  </div>
                </section>
              )}

              <section className="stats-grid">
                <div className="stat-card"><div className="stat-icon purple">▤</div><div><span>Modules disponibles</span><strong>06</strong><small>Parcours de formation</small></div></div>
                <div className="stat-card"><div className="stat-icon green">◷</div><div><span>Durée estimée</span><strong>2 h 10</strong><small>Pour les six modules</small></div></div>
                <div className="stat-card"><div className="stat-icon gold">◎</div><div><span>Objectif examen</span><strong>80 %</strong><small>Avec questions critiques validées</small></div></div>
              </section>

              <section className="modules-section" id="modules">
                <div className="section-heading">
                  <div><div className="eyebrow">VOTRE PARCOURS</div><h2>Les modules de formation</h2><p>Six étapes pour maîtriser les fondamentaux du métier.</p></div>
                  <div className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un module..." aria-label="Rechercher un module" /></div>
                </div>
                <div className="module-grid">
                  {filteredModules.map((module) => (
                    <article className="module-card" key={module.id}>
                      <div className="module-card-top"><div className={`module-icon tone-${module.id}`}>{module.icon}</div><span className="module-number">MODULE {String(module.id).padStart(2, "0")}</span></div>
                      <h3>{module.title}</h3><p>{module.subtitle}</p>
                      <div className="module-meta"><span>◷ {module.duration}</span><span>▤ {module.lessons} séquences</span></div>
                      <button className="module-link" onClick={() => setActiveModule(module.id)}>Explorer le module <span>→</span></button>
                    </article>
                  ))}
                  {filteredModules.length === 0 && <div className="empty-state">Aucun module ne correspond à votre recherche.</div>}
                </div>
              </section>
            </>
          )}
          <footer className="page-footer"><span>© {new Date().getFullYear()} COMTESSE Academy</span><span>Qualité · Engagement · Proximité</span><span>Version de démonstration</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
