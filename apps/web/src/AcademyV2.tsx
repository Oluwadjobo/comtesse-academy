import { useMemo, useState } from "react";
import "./academy-v2.css";

type Role = "admin" | "trainer" | "learner";
type Page = "overview" | "formations" | "learners" | "results" | "certificates" | "settings";

const roleLabels: Record<Role, string> = {
  admin: "Administrateur",
  trainer: "Formateur",
  learner: "Apprenant",
};

const navByRole: Record<Role, { id: Page; label: string; icon: string }[]> = {
  admin: [
    { id: "overview", label: "Vue d'ensemble", icon: "▦" },
    { id: "formations", label: "Formations", icon: "▤" },
    { id: "learners", label: "Utilisateurs", icon: "♙" },
    { id: "results", label: "Résultats", icon: "▥" },
    { id: "certificates", label: "Certificats", icon: "◇" },
    { id: "settings", label: "Paramètres", icon: "⚙" },
  ],
  trainer: [
    { id: "overview", label: "Mon espace", icon: "▦" },
    { id: "formations", label: "Mes formations", icon: "▤" },
    { id: "learners", label: "Mes apprenants", icon: "♙" },
    { id: "results", label: "Évaluations", icon: "▥" },
    { id: "certificates", label: "Certificats", icon: "◇" },
  ],
  learner: [
    { id: "overview", label: "Mon parcours", icon: "▦" },
    { id: "formations", label: "Mes formations", icon: "▤" },
    { id: "results", label: "Mes résultats", icon: "▥" },
    { id: "certificates", label: "Mes certificats", icon: "◇" },
  ],
};

const courses = [
  { title: "Découvrir COMTESSE", category: "Intégration", modules: 4, learners: 28, progress: 82, status: "Publiée", tone: "blue" },
  { title: "Maîtriser nos produits", category: "Commercial", modules: 6, learners: 42, progress: 64, status: "Publiée", tone: "gold" },
  { title: "Les fondamentaux de la vente", category: "Commercial", modules: 5, learners: 16, progress: 38, status: "Brouillon", tone: "green" },
];

function Brand() {
  return <div className="academy-brand">
    <div className="brand-symbol"><span>♛</span></div>
    <div><strong>COMTESSE</strong><small>ACADEMY</small></div>
  </div>;
}

function Login({ onEnter }: { onEnter: (role: Role) => void }) {
  const [role, setRole] = useState<Role>("trainer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  return <main className="login-screen">
    <section className="login-brand-panel">
      <Brand />
      <div className="login-message">
        <span className="eyebrow light">L'ACADÉMIE DE LA PERFORMANCE</span>
        <h1>Apprendre.<br /><em>Progresser.</em><br />Réussir.</h1>
        <p>Une expérience de formation conçue pour accompagner les talents COMTESSE.</p>
      </div>
      <div className="login-footer">COMTESSE · FORMATION & DÉVELOPPEMENT</div>
    </section>
    <section className="login-form-panel">
      <div className="login-form-wrap">
        <div className="mobile-brand"><Brand /></div>
        <span className="eyebrow">BIENVENUE SUR VOTRE ESPACE</span>
        <h2>Connectez-vous</h2>
        <p className="muted">Sélectionnez votre espace pour continuer.</p>
        <div className="role-picker">
          {(["admin", "trainer", "learner"] as Role[]).map((item) =>
            <button key={item} className={role === item ? "role-option active" : "role-option"} onClick={() => setRole(item)}>
              <span>{item === "admin" ? "♙" : item === "trainer" ? "▤" : "◎"}</span>{roleLabels[item]}
            </button>
          )}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); onEnter(role); }}>
          <label>Identifiant</label>
          <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={role === "learner" ? "Votre identifiant apprenant" : "Votre identifiant professionnel"} required />
          {role !== "learner" && <><label>Mot de passe</label><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" required /></>}
          {role === "learner" && <p className="field-hint">L'accès apprenant sera configuré avec le mécanisme de code sécurisé validé dans le cahier des charges.</p>}
          <button className="button-primary login-submit" type="submit">Accéder à mon espace <span>→</span></button>
        </form>
        <p className="demo-note">Prototype d'interface — authentification et données de démonstration non connectées.</p>
      </div>
    </section>
  </main>;
}

function Stat({ label, value, detail, icon, color }: { label: string; value: string; detail: string; icon: string; color: string }) {
  return <article className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></article>;
}

function CourseCard({ course, onOpen }: { course: typeof courses[number]; onOpen: () => void }) {
  return <article className="course-card">
    <div className={`course-cover ${course.tone}`}><span className="cover-mark">C</span><span className="cover-label">{course.category}</span></div>
    <div className="course-body">
      <div className="course-meta"><span>{course.modules} modules</span><span className={course.status === "Publiée" ? "status published" : "status draft"}>{course.status}</span></div>
      <h3>{course.title}</h3>
      <div className="course-progress"><div><span>Progression moyenne</span><strong>{course.progress}%</strong></div><div className="progress-track"><i style={{ width: `${course.progress}%` }} /></div></div>
      <div className="course-bottom"><span>♙ {course.learners} apprenants</span><button className="text-button" onClick={onOpen}>Voir le détail →</button></div>
    </div>
  </article>;
}

function Overview({ role, onNavigate }: { role: Role; onNavigate: (page: Page) => void }) {
  const isLearner = role === "learner";
  const isAdmin = role === "admin";
  return <>
    <div className="welcome-heading"><div><span className="eyebrow">{isAdmin ? "PILOTAGE DE LA PLATEFORME" : isLearner ? "VOTRE ESPACE D'APPRENTISSAGE" : "ESPACE PÉDAGOGIQUE"}</span><h1>{isLearner ? "Bonjour, bienvenue !" : isAdmin ? "Vue d'ensemble" : "Bonjour, Formateur"}</h1><p>{isLearner ? "Reprenez votre parcours là où vous l'avez laissé." : "Voici ce qu'il se passe sur votre espace COMTESSE Academy."}</p></div><span className="date-chip">● Espace actif</span></div>
    {isLearner ? <section className="learner-hero"><div><span className="eyebrow light">VOTRE FORMATION EN COURS</span><h2>Maîtriser les produits<br /><em>COMTESSE</em></h2><p>Continuez votre apprentissage et progressez étape par étape.</p><button className="button-yellow" onClick={() => onNavigate("formations")}>Reprendre ma formation →</button></div><div className="hero-progress"><strong>64%</strong><span>de progression</span><div className="progress-track"><i style={{ width: "64%" }} /></div></div></section>
      : <section className="welcome-banner"><div><span className="eyebrow light">{isAdmin ? "VOTRE PLATEFORME DE FORMATION" : "CRÉEZ ET ANIMEZ VOS FORMATIONS"}</span><h2>{isAdmin ? "La connaissance fait grandir nos équipes." : "Transmettez le savoir. Développez les talents."}</h2><p>{isAdmin ? "Pilotez les formations, les utilisateurs et les performances depuis un espace unique." : "Construisez des parcours pédagogiques engageants et suivez la progression de vos apprenants."}</p></div><div className="banner-seal"><span>♛</span><small>COMTESSE<br />ACADEMY</small></div></section>}
    <div className="stats-grid">
      <Stat label={isLearner ? "Formations attribuées" : isAdmin ? "Formations actives" : "Mes formations"} value={isLearner ? "03" : isAdmin ? "12" : "08"} detail={isLearner ? "Dans votre parcours" : "Sur la plateforme"} icon="▤" color="stat-blue" />
      <Stat label={isLearner ? "Modules validés" : "Apprenants"} value={isLearner ? "05 / 08" : isAdmin ? "248" : "86"} detail={isLearner ? "Continuez vos efforts" : "Comptes actifs"} icon="♙" color="stat-gold" />
      <Stat label={isLearner ? "Score moyen" : "Taux de réussite"} value={isLearner ? "86%" : isAdmin ? "84%" : "89%"} detail={isLearner ? "Sur vos quiz" : "Aux évaluations finales"} icon="◇" color="stat-green" />
    </div>
    <div className="section-title"><div><span className="eyebrow">{isLearner ? "POUR VOUS" : "SUIVI PÉDAGOGIQUE"}</span><h2>{isLearner ? "Mes formations" : "Formations récentes"}</h2></div><button className="text-button" onClick={() => onNavigate("formations")}>Tout afficher →</button></div>
    <div className="course-grid">{courses.slice(0, isLearner ? 2 : 3).map((course) => <CourseCard key={course.title} course={course} onOpen={() => onNavigate("formations")} />)}</div>
  </>;
}

function GenericPage({ page, role, onCreate }: { page: Page; role: Role; onCreate: () => void }) {
  const [filter, setFilter] = useState("");
  const title: Record<Page, string> = { overview: "Vue d'ensemble", formations: role === "learner" ? "Mes formations" : role === "trainer" ? "Mes formations" : "Toutes les formations", learners: role === "trainer" ? "Mes apprenants" : "Gestion des utilisateurs", results: role === "learner" ? "Mes résultats" : "Évaluations et résultats", certificates: role === "learner" ? "Mes certificats" : "Certificats", settings: "Paramètres" };
  if (page === "formations") return <><div className="welcome-heading"><div><span className="eyebrow">ESPACE PÉDAGOGIQUE</span><h1>{title[page]}</h1><p>Organisez, consultez et suivez vos parcours de formation.</p></div>{role !== "learner" && <button className="button-primary" onClick={onCreate}>＋ Créer une formation</button>}</div><div className="toolbar"><input placeholder="Rechercher une formation..." value={filter} onChange={(e) => setFilter(e.target.value)} /><span>{courses.filter(c => c.title.toLowerCase().includes(filter.toLowerCase())).length} formations</span></div><div className="course-grid">{courses.filter(c => c.title.toLowerCase().includes(filter.toLowerCase())).map(c => <CourseCard key={c.title} course={c} onOpen={onCreate} />)}</div></>;
  const rows = page === "learners" ? [["Aïcha HOUNKPATIN","a.hounkpatin","Active"],["Benoît ADJOVI","b.adjovi","Active"],["Clarisse SOGLO","c.soglo","À inviter"]] : page === "results" ? [["Aïcha HOUNKPATIN","Maîtriser nos produits · 92/100","Réussi"],["Benoît ADJOVI","Maîtriser nos produits · 68/100","À reprendre"],["Clarisse SOGLO","Découvrir COMTESSE · En cours","En cours"]] : [["COM-2026-00128","Aïcha HOUNKPATIN","Délivré"],["COM-2026-00129","Benoît ADJOVI","En attente"],["COM-2026-00130","Clarisse SOGLO","Délivré"]];
  return <><div className="welcome-heading"><div><span className="eyebrow">GESTION & SUIVI</span><h1>{title[page]}</h1><p>Consultez les informations et suivez les activités de votre espace.</p></div>{(page === "learners" || page === "certificates") && role !== "learner" && <button className="button-primary" onClick={onCreate}>＋ {page === "learners" ? "Ajouter un apprenant" : "Exporter"}</button>}</div><div className="panel table-panel"><div className="table-heading"><h3>{title[page]}</h3><span className="date-chip">Données de démonstration</span></div><div className="table-scroll"><table><thead><tr><th>{page === "certificates" ? "Référence" : "Nom"}</th><th>{page === "certificates" ? "Bénéficiaire" : page === "results" ? "Formation / Score" : "Identifiant"}</th><th>Statut</th></tr></thead><tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{index === 2 ? <span className={cell === "Réussi" || cell === "Active" || cell === "Délivré" ? "status published" : "status draft"}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div></div></>;
}

export default function AcademyV2() {
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState<Page>("overview");
  const [toast, setToast] = useState("");
  const activeNav = useMemo(() => role ? navByRole[role] : [], [role]);
  if (!role) return <Login onEnter={(selectedRole) => { setRole(selectedRole); setPage("overview"); }} />;
  const userName = role === "admin" ? "Administration" : role === "trainer" ? "Espace Formateur" : "Apprenant";
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3000); };
  return <div className="academy-shell">
    <aside className="academy-sidebar"><Brand /><span className="nav-caption">MENU PRINCIPAL</span><nav>{activeNav.map(item => <button key={item.id} className={page === item.id ? "nav-link selected" : "nav-link"} onClick={() => setPage(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav><div className="sidebar-bottom"><div className="support-card"><span>✦</span><strong>Besoin d'aide ?</strong><p>Votre espace de formation vous accompagne au quotidien.</p></div><button className="nav-link logout-link" onClick={() => setRole(null)}>↪ Déconnexion</button><small>COMTESSE ACADEMY · V2</small></div></aside>
    <main className="academy-main"><header className="academy-topbar"><div className="crumb">COMTESSE ACADEMY <span>/</span> {activeNav.find(item => item.id === page)?.label}</div><div className="top-user"><span className="online-dot" />{userName}<div className="user-avatar">{role === "admin" ? "A" : role === "trainer" ? "F" : "É"}</div></div></header><div className="academy-content">{page === "overview" ? <Overview role={role} onNavigate={setPage} /> : <GenericPage page={page} role={role} onCreate={() => notify("Cette fonctionnalité sera connectée au backend dans le prochain lot de développement.")} />}</div><footer className="academy-footer">© COMTESSE ACADEMY · Plateforme de formation professionnelle</footer></main>
    {toast && <div className="toast-message">{toast}</div>}
  </div>;
}
