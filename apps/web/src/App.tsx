import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import { getTrainingModule } from "./moduleContent";

type Role = "learner" | "manager" | "admin";
type User = { id: string; employeeCode: string; fullName: string; role: Role };
type PublicationStatus = "draft" | "proposed" | "approved" | "published" | "rejected";
type Module = {
  module_number: number;
  title: string;
  description: string;
  publication_status: "draft" | "approved" | "published";
};
type Option = {
  id: string;
  text: string;
};
type ExamQuestion = { number: number; id: string; text: string; options: Option[] };
type ExamSession = { attemptId: string; totalQuestions: number; questions: ExamQuestion[] };
type ExamCorrection = { questionId: string; question: string; selectedOptionIds: string[]; correctOptionIds: string[]; explanation: string; isCritical: boolean; correct: boolean };
type ExamResult = { attemptId: string; score: number; total: number; passed: boolean; criticalFailure: boolean; message: string; certificateVerificationCode: string | null; corrections: ExamCorrection[] };
type Question = {
  id: string;
  module_id: string;
  question_text: string;
  answer_options: Option[];
  correct_option_ids: string[];
  explanation: string;
  publication_status: PublicationStatus;
  is_critical: boolean;
  approved_by: string | null;
  approved_at: string | null;
};
const API = "";
const icons = ["🏢", "🥛", "❄️", "🤝", "🛵", "📋"];

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
  if (!response.ok) {
    let message = `Erreur ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Réponse sans JSON
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [employeeCode, setEmployeeCode] = useState("");
  const [secret, setSecret] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [checkAnswer, setCheckAnswer] = useState<number | null>(null);
  const [view, setView] = useState<"dashboard" | "questions" | "exam">("dashboard");
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string[]>>({});
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const isManager = user?.role === "manager" || user?.role === "admin";

  const loadModules = useCallback(async () => {
    const data = await request<{ modules: Module[] }>("/modules");
    setModules(data.modules);
  }, []);

  const loadQuestions = useCallback(async () => {
    const data = await request<{ questions: Question[] }>("/admin/questions");
    setQuestions(data.questions);
  }, []);

  useEffect(() => {
    request<{ user: User }>("/auth/me")
      .then(({ user: current }) => setUser(current))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadModules().catch((e: Error) => setNotice(e.message));
    if (user.role === "admin" || user.role === "manager") {
      loadQuestions().catch(() => {
        // La liste des questions est réservée aux responsables.
      });
    }
  }, [user, loadModules, loadQuestions]);

  const filtered = useMemo(
    () => modules.filter((m) => `${m.title} ${m.description}`.toLowerCase().includes(query.toLowerCase())),
    [modules, query],
  );
  const selected = modules.find((m) => m.module_number === activeModule);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const result = await request<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ employeeCode: employeeCode.trim(), secret }),
      });
      setUser(result.user);
      setSecret("");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await request("/auth/logout", { method: "POST" });
    } catch {
      // Déconnexion locale même si l'API est indisponible
    } finally {
      setUser(null);
      setModules([]);
      setQuestions([]);
      setSelectedQuestion(null);
      setActiveModule(null);
      setCheckAnswer(null);
      setExamSession(null);
      setExamAnswers({});
      setExamResult(null);
      setView("dashboard");
      setBusy(false);
    }
  }

  async function startExam() {
    setBusy(true);
    setNotice("");
    setExamResult(null);
    setExamAnswers({});
    try {
      const session = await request<ExamSession>("/exams/start", { method: "POST", body: JSON.stringify({}) });
      setExamSession(session);
      setView("exam");
      setActiveModule(null);
      setNotice("Examen démarré. Vos réponses sont enregistrées au fur et à mesure.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Impossible de démarrer l'examen.");
      setView("exam");
      setActiveModule(null);
    } finally {
      setBusy(false);
    }
  }

  async function saveExamAnswer(questionId: string, selectedOptionIds: string[]) {
    if (!examSession || examResult) return;
    setExamAnswers((previous) => ({ ...previous, [questionId]: selectedOptionIds }));
    try {
      await request(`/exams/${examSession.attemptId}/answers`, {
        method: "PUT",
        body: JSON.stringify({ questionId, selectedOptionIds }),
      });
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "La réponse n'a pas pu être enregistrée.");
    }
  }

  async function submitExam() {
    if (!examSession || examResult) return;
    setBusy(true);
    setNotice("");
    try {
      const result = await request<ExamResult>(`/exams/${examSession.attemptId}/submit`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setExamResult(result);
      setNotice(result.message || "Examen corrigé.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Impossible de soumettre l'examen.");
    } finally {
      setBusy(false);
    }
  }

  async function changeQuestionStatus(questionId: string, publicationStatus: "approved" | "rejected" | "draft") {
    setBusy(true);
    setNotice("");
    try {
      await request(`/admin/questions/${questionId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ publicationStatus }),
      });
      await loadQuestions();
      setNotice(
        publicationStatus === "approved"
          ? "Question approuvée. Elle n'est pas encore publiée."
          : publicationStatus === "rejected"
            ? "Question rejetée."
            : "Question remise en brouillon.",
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Impossible de modifier cette question.");
    } finally {
      setBusy(false);
    }
  }

  async function approveModule(moduleNumber: number) {
    setBusy(true);
    setNotice("");
    try {
      await request(`/modules/${moduleNumber}/approval`, { method: "PATCH" });
      await loadModules();
      setNotice(`Module ${moduleNumber} approuvé. Il peut maintenant être publié.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Impossible d'approuver le module.");
    } finally {
      setBusy(false);
    }
  }

  async function changeModulePublication(
    moduleNumber: number,
    publicationStatus: "draft" | "published",
  ) {
    setBusy(true);
    setNotice("");
    try {
      await request(`/modules/${moduleNumber}/publication`, {
        method: "PATCH",
        body: JSON.stringify({ publicationStatus }),
      });
      await loadModules();
      await loadQuestions().catch(() => undefined);
      setNotice(
        publicationStatus === "published"
          ? `Module ${moduleNumber} publié avec succès.`
          : `Module ${moduleNumber} remis en brouillon.`,
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Impossible de modifier la publication du module.");
    } finally {
      setBusy(false);
    }
  }

  async function publishQuestion(questionId: string) {
    setBusy(true);
    setNotice("");
    try {
      await request(`/admin/questions/${questionId}/publish`, { method: "PATCH" });
      await loadQuestions();
      setNotice("Question publiée avec succès.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Impossible de publier cette question.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <main className="center-screen"><div className="spinner" /><p>Chargement de COMTESSE Academy…</p></main>;
  }

  if (!user) {
    return (
      <main className="login-page">
        <section className="login-brand">
          <div className="crown">♛</div>
          <div className="brand-name">COMTESSE <span>ACADEMY</span></div>
          <h1>Grandissons en compétences.<br /><em>Ensemble.</em></h1>
          <p>Votre espace de formation commerciale, pour mieux connaître nos produits et exceller sur le terrain.</p>
          <div className="login-foot">QUALITÉ · ENGAGEMENT · PROXIMITÉ</div>
        </section>
        <form className="login-card" onSubmit={login}>
          <div className="eyebrow">ESPACE SÉCURISÉ</div>
          <h2>Bienvenue</h2>
          <p>Connectez-vous avec votre identifiant et votre code secret.</p>
          <label htmlFor="employeeCode">Identifiant professionnel</label>
          <input id="employeeCode" autoComplete="username" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="Ex. : COMTESSE-001" required />
          <label htmlFor="secret">Code secret</label>
          <input id="secret" type="password" autoComplete="current-password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Votre code secret" required />
          <button className="primary-button full" disabled={busy}>{busy ? "Connexion…" : "Se connecter →"}</button>
          {notice && <div className="notice error" role="alert">{notice}</div>}
          <small>Accès réservé aux apprenants et responsables autorisés.</small>
        </form>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); setActiveModule(null); setView("dashboard"); }}>
          <span className="brand-mark">C</span><span className="brand-copy"><strong>COMTESSE</strong><small>ACADEMY</small></span>
        </a>
        <div className="side-label">ESPACE FORMATION</div>
        <button className={`nav-item ${view === "dashboard" ? "selected" : ""}`} onClick={() => { setView("dashboard"); setActiveModule(null); setCheckAnswer(null); }}>▦ &nbsp; Tableau de bord</button>
        {user.role === "learner" && <button className={`nav-item ${view === "exam" ? "selected" : ""}`} onClick={() => { setView("exam"); setActiveModule(null); setNotice(""); }}>✓ &nbsp; Évaluation finale</button>}
        {isManager && <button className={`nav-item ${view === "questions" ? "selected" : ""}`} onClick={() => { setView("questions"); setActiveModule(null); }}>☷ &nbsp; Questions d'examen</button>}
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon">✦</span><strong>Besoin d'aide ?</strong><p>Votre responsable de formation peut vous accompagner.</p></div>
          <div className="sidebar-foot">COMTESSE · LE PLAISIR DE TOUS LES JOURS</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Formation <span>/</span> <strong>{view === "questions" ? "Questions d'examen" : view === "exam" ? "Évaluation finale" : selected ? selected.title : "Tableau de bord"}</strong></div>
          <div className="top-actions">
            <span className="status-dot" /><span className="status-text">Connecté</span>
            <div className="avatar">{user.fullName.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase()}</div>
            <div className="user-block"><strong>{user.fullName}</strong><small>{user.role === "admin" ? "Administrateur" : isManager ? "Responsable formation" : "Apprenant"}</small></div>
            <button className="logout" onClick={logout} disabled={busy}>Déconnexion</button>
          </div>
        </header>

        <div className="page-content">
          {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Fermer">×</button></div>}

          {view === "questions" && isManager ? (
            <section className="modules-section">
              <div className="section-heading">
                <div><div className="eyebrow">ADMINISTRATION PÉDAGOGIQUE</div><h1>Questions d'examen</h1><p>Vérifiez le contenu avant de l'approuver. L'approbation ne publie pas automatiquement une question.</p></div>
                <button className="secondary-button" onClick={() => loadQuestions().catch((e: Error) => setNotice(e.message))}>Actualiser</button>
              </div>
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-icon purple">?</div><div><span>Total des questions</span><strong>{questions.length}</strong><small>Questions chargées</small></div></div>
                <div className="stat-card"><div className="stat-icon gold">✓</div><div><span>À valider</span><strong>{questions.filter(q => q.publication_status === "proposed" || q.publication_status === "draft").length}</strong><small>Brouillons et propositions</small></div></div>
                <div className="stat-card"><div className="stat-icon green">↗</div><div><span>Publiées</span><strong>{questions.filter(q => q.publication_status === "published").length}</strong><small>Disponibles pour les examens</small></div></div>
              </div>
              <div className="module-grid">
                {questions.map((question) => {
                  return (
                    <article className="module-card" key={question.id}>
                      <div className="module-card-top"><span className="module-number">QUESTION</span><span className={`status-pill ${question.publication_status}`}>{question.publication_status}</span></div>
                      <h3>{question.question_text}</h3>
                      <p>{question.is_critical ? "Question critique obligatoire" : "Question standard"}</p>
                      <div className="manager-actions">
                        <button className="secondary-button" onClick={() => setSelectedQuestion(question)}>Voir le détail</button>
                      </div>
                      <div className="manager-actions">
                        {(question.publication_status === "proposed" || question.publication_status === "draft") && <>
                          <button className="primary-button" disabled={busy} onClick={() => changeQuestionStatus(question.id, "approved")}>Approuver</button>
                          <button className="secondary-button" disabled={busy} onClick={() => changeQuestionStatus(question.id, "rejected")}>Rejeter</button>
                        </>}
                        {question.publication_status === "approved" && <button className="primary-button" disabled={busy} onClick={() => publishQuestion(question.id)}>Publier la question</button>}
                        {question.publication_status === "rejected" && <button className="secondary-button" disabled={busy} onClick={() => changeQuestionStatus(question.id, "draft")}>Remettre en brouillon</button>}
                        {question.publication_status === "published" && <span>Question publiée</span>}
                      </div>
                      {question.publication_status === "approved" && <p className="small-note">La publication finale dépend aussi de la publication du module associé.</p>}
                    </article>
                  );
                })}
                {questions.length === 0 && <div className="empty-state">Aucune question récupérée. Actualisez la liste ou vérifiez l'API.</div>}
              </div>
            </section>
          ) : view === "exam" && user.role === "learner" ? (
            <section className="modules-section">
              <div className="section-heading">
                <div><div className="eyebrow">COMTESSE ACADEMY · CERTIFICATION</div><h1>Évaluation finale</h1><p>Répondez aux 20 questions. Le seuil de réussite est de 16/20 et toute question critique doit être réussie.</p></div>
              </div>
              {!examSession && !examResult && <section className="panel" style={{ padding: 24 }}>
                <h2>Prêt à évaluer vos acquis ?</h2>
                <p>L'examen utilise des questions publiées associées à des modules publiés. Vos réponses sont enregistrées au fur et à mesure.</p>
                <button className="primary-button" onClick={startExam} disabled={busy}>{busy ? "Préparation…" : "Démarrer l'examen →"}</button>
              </section>}
              {examSession && !examResult && <>
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-icon purple">?</div><div><span>Questions</span><strong>{examSession.totalQuestions}</strong><small>Examen général</small></div></div>
                  <div className="stat-card"><div className="stat-icon gold">✓</div><div><span>Réponses sélectionnées</span><strong>{examSession.questions.filter(q => (examAnswers[q.id] || []).length > 0).length}/{examSession.questions.length}</strong><small>Vous pouvez modifier vos choix</small></div></div>
                </div>
                <div style={{ display: "grid", gap: 18, marginTop: 22 }}>
                  {examSession.questions.map((question, index) => <article className="panel" key={question.id} style={{ padding: 22 }}>
                    <div className="eyebrow">QUESTION {question.number || index + 1} / {examSession.totalQuestions}</div>
                    <h3 style={{ margin: "8px 0 16px", lineHeight: 1.5 }}>{question.text}</h3>
                    <p style={{ color: "#667085", fontSize: 13 }}>Sélectionnez la ou les réponses appropriées.</p>
                    <div style={{ display: "grid", gap: 10 }}>
                      {question.options.map((option, optionIndex) => {
                        const checked = (examAnswers[question.id] || []).includes(option.id);
                        return <label key={option.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 13, borderRadius: 10, border: `1px solid ${checked ? "#52764d" : "#d1d5db"}`, background: checked ? "#f1f7ee" : "#fff", cursor: "pointer", lineHeight: 1.55 }}>
                          <input type="checkbox" checked={checked} disabled={busy} onChange={(event) => {
                            const current = examAnswers[question.id] || [];
                            const next = event.target.checked ? [...current, option.id] : current.filter(id => id !== option.id);
                            void saveExamAnswer(question.id, next);
                          }} />
                          <span><strong>{String.fromCharCode(65 + optionIndex)}.</strong> {option.text}</span>
                        </label>;
                      })}
                    </div>
                  </article>)}
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}><button className="primary-button" onClick={submitExam} disabled={busy}>{busy ? "Correction…" : "Soumettre et obtenir mon résultat"}</button><span style={{ alignSelf: "center", color: "#667085", fontSize: 13 }}>Vérifiez vos réponses avant la soumission.</span></div>
              </>}
              {examResult && <section className="panel" style={{ padding: 24, marginTop: 20 }}>
                <div className="eyebrow">RÉSULTAT DE L'ÉVALUATION</div>
                <h2 style={{ color: examResult.passed ? "#287348" : "#b42318" }}>{examResult.passed ? "Félicitations, examen réussi !" : "Examen non réussi"}</h2>
                <div className="stats-grid"><div className="stat-card"><div className="stat-icon purple">★</div><div><span>Votre score</span><strong>{examResult.score}/{examResult.total}</strong><small>{Math.round((examResult.score / Math.max(examResult.total, 1)) * 100)} %</small></div></div><div className="stat-card"><div className="stat-icon gold">✓</div><div><span>Seuil requis</span><strong>16/20</strong><small>Sans échec sur une question critique</small></div></div></div>
                <p style={{ lineHeight: 1.7 }}>{examResult.message}</p>
                {examResult.criticalFailure && <p style={{ color: "#b42318", fontWeight: 700 }}>Une question critique a été manquée : cela entraîne l'échec de l'examen.</p>}
                {examResult.certificateVerificationCode && <div style={{ padding: 16, borderRadius: 12, background: "#edf9f0", margin: "16px 0" }}><strong>Code de vérification du certificat</strong><p style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>{examResult.certificateVerificationCode}</p></div>}
                <h3>Correction détaillée</h3>
                <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
                  {examResult.corrections.map((correction, index) => {
                    const question = examSession?.questions.find(item => item.id === correction.questionId);
                    const optionText = (id: string) => question?.options.find(option => option.id === id)?.text || id;
                    return <article key={correction.questionId} style={{ padding: 16, borderRadius: 12, border: `1px solid ${correction.correct ? "#b7dfc2" : "#f0c4c0"}`, background: correction.correct ? "#f4fbf5" : "#fff7f6" }}>
                      <strong>{index + 1}. {correction.question}</strong><p style={{ marginBottom: 6 }}>Votre réponse : {correction.selectedOptionIds.length ? correction.selectedOptionIds.map(optionText).join(" ; ") : "Aucune réponse"}</p><p style={{ marginBottom: 6 }}>Bonne réponse : {correction.correctOptionIds.map(optionText).join(" ; ")}</p>{correction.isCritical && <span className="status-pill proposed">Question critique</span>}<p style={{ lineHeight: 1.6 }}>{correction.explanation}</p>
                    </article>;
                  })}
                </div>
                <button className="secondary-button" style={{ marginTop: 20 }} onClick={() => { setExamSession(null); setExamAnswers({}); setExamResult(null); setNotice(""); }}>Retour à l'évaluation</button>
              </section>}
            </section>
          ) : selected ? (
            <section className="panel module-detail">
              <button className="back-link" onClick={() => { setActiveModule(null); setCheckAnswer(null); }}>← Retour aux modules</button>
              <div className="detail-icon">{icons[selected.module_number - 1]}</div>
              <div className="eyebrow">MODULE {String(selected.module_number).padStart(2, "0")}</div>
              <h2>{selected.title}</h2><p>{selected.description}</p>
              <div className={`status-pill ${selected.publication_status}`}>{selected.publication_status === "published" ? "Publié" : selected.publication_status === "approved" ? "Approuvé — prêt à publier" : "Brouillon — en préparation"}</div>
              {isManager && (
                <div className="manager-actions" style={{ marginTop: 16 }}>
                  {selected.publication_status === "draft" && (
                    <button
                      className="primary-button"
                      disabled={busy}
                      onClick={() => approveModule(selected.module_number)}
                    >
                      Approuver le module
                    </button>
                  )}
                  {selected.publication_status === "approved" && (
                    <button
                      className="primary-button"
                      disabled={busy}
                      onClick={() => changeModulePublication(selected.module_number, "published")}
                    >
                      Publier le module
                    </button>
                  )}
                  {selected.publication_status === "published" && (
                    <button
                      className="secondary-button"
                      disabled={busy}
                      onClick={() => changeModulePublication(selected.module_number, "draft")}
                    >
                      Retirer de la publication
                    </button>
                  )}
                </div>
              )}
              {(() => {
                const course = getTrainingModule(selected.module_number);
                if (!course) {
                  return <div className="coming-soon"><strong>Contenu introuvable</strong><p>Le contenu pédagogique de ce module n'est pas configuré.</p></div>;
                }
                return (
                  <div style={{ display: "grid", gap: 22, marginTop: 24 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                      <span className="status-pill approved">{course.estimatedMinutes} min environ</span>
                      <span className="status-pill draft">{course.sections.length} séquences</span>
                      <span className="status-pill proposed">Contenu à valider avant publication</span>
                    </div>
                    <section style={{ padding: 22, borderRadius: 16, background: "#f5f7f3", border: "1px solid #e1e8dd" }}>
                      <div className="eyebrow">PRÉSENTATION DU MODULE</div>
                      <p style={{ marginTop: 8 }}>{course.summary}</p>
                      <h3 style={{ marginTop: 18 }}>À la fin de ce module, vous serez capable de :</h3>
                      <ul style={{ paddingLeft: 22, lineHeight: 1.8 }}>
                        {course.objectives.map((objective) => <li key={objective}>{objective}</li>)}
                      </ul>
                    </section>
                    {course.sections.map((section, index) => (
                      <section key={section.title} style={{ padding: 22, borderRadius: 16, border: "1px solid #e5e7eb", background: "#fff" }}>
                        <div className="eyebrow">SÉQUENCE {String(index + 1).padStart(2, "0")}</div>
                        <h3 style={{ margin: "8px 0 14px" }}>{section.title}</h3>
                        {section.paragraphs?.map((paragraph, paragraphIndex) => <p key={`${section.title}-p-${paragraphIndex}`} style={{ lineHeight: 1.75 }}>{paragraph}</p>)}
                        {section.bullets && <ul style={{ paddingLeft: 22, lineHeight: 1.8 }}>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                        {section.steps && <ol style={{ paddingLeft: 22, lineHeight: 1.8 }}>{section.steps.map((step) => <li key={step}>{step}</li>)}</ol>}
                        {section.alert && <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: "#fff7e6", border: "1px solid #f2d7a3", color: "#684d17", lineHeight: 1.65 }}><strong>Point de vigilance</strong><p style={{ margin: "6px 0 0" }}>{section.alert}</p></div>}
                      </section>
                    ))}
                    <section style={{ padding: 22, borderRadius: 16, background: "#f8fafc", border: "1px solid #dbe3ea" }}>
                      <div className="eyebrow">VÉRIFICATION DES ACQUIS</div>
                      <h3 style={{ margin: "8px 0 16px" }}>{course.knowledgeCheck.question}</h3>
                      <div style={{ display: "grid", gap: 10 }}>
                        {course.knowledgeCheck.options.map((option, index) => {
                          const answered = checkAnswer !== null;
                          const correct = index === course.knowledgeCheck.correctIndex;
                          const chosen = checkAnswer === index;
                          return <button key={option} type="button" onClick={() => setCheckAnswer(index)} disabled={answered} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 10, border: `1px solid ${answered && correct ? "#27834a" : chosen ? "#b45309" : "#d1d5db"}`, background: answered && correct ? "#edf9f0" : chosen ? "#fff7ed" : "#fff", color: "#243128", cursor: answered ? "default" : "pointer", lineHeight: 1.6 }}><strong>{String.fromCharCode(65 + index)}.</strong> {option}</button>;
                        })}
                      </div>
                      {checkAnswer !== null && <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: checkAnswer === course.knowledgeCheck.correctIndex ? "#edf9f0" : "#fff7ed", lineHeight: 1.65 }}><strong>{checkAnswer === course.knowledgeCheck.correctIndex ? "Bonne réponse !" : "Pas tout à fait."}</strong><p style={{ margin: "6px 0 0" }}>{course.knowledgeCheck.explanation}</p><button type="button" className="secondary-button" style={{ marginTop: 10 }} onClick={() => setCheckAnswer(null)}>Recommencer la question</button></div>}
                    </section>
                    {course.validationNotes && course.validationNotes.length > 0 && isManager && <section style={{ padding: 22, borderRadius: 16, border: "1px solid #e7c879", background: "#fffaf0" }}><div className="eyebrow">VALIDATIONS AVANT PUBLICATION</div><p>Ces points doivent être vérifiés par les responsables concernés avant la mise à disposition officielle du module.</p><ul style={{ paddingLeft: 22, lineHeight: 1.8 }}>{course.validationNotes.map((note) => <li key={note}>{note}</li>)}</ul></section>}
                    <div style={{ padding: 16, borderTop: "1px solid #e5e7eb", color: "#667085", fontSize: 13, lineHeight: 1.6 }}>Contenu pédagogique préparé à partir du support de formation fourni. Les procédures internes, tarifs, allégations produits et données organisationnelles signalés doivent être validés avant publication officielle.</div>
                  </div>
                );
              })()}
            </section>
          ) : (
            <>
              <div className="welcome-row"><div><div className="eyebrow">COMTESSE ACADEMY · FORMATION COMMERCIALE</div><h1>Bonjour {user.fullName.split(" ")[0]}</h1><p className="lead">Développez vos compétences, maîtrisez nos produits et progressez chaque jour sur le terrain.</p></div></div>
              <section className="hero"><div className="hero-copy"><div className="hero-tag">✦ &nbsp; VOTRE PARCOURS COMMENCE ICI</div><h2>Apprendre aujourd'hui.<br /><em>Exceller sur le terrain.</em></h2><p>Un parcours pour mieux connaître nos produits, servir nos clients et progresser chaque jour.</p><button className="hero-button" onClick={() => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })}>Voir les modules →</button></div><div className="hero-art"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-center"><span>✦</span><strong>C</strong><small>COMTESSE</small></div><div className="art-note note-top">QUALITÉ ✦</div><div className="art-note note-bottom">PROXIMITÉ ✓</div></div></section>
              <section className="stats-grid">
                <div className="stat-card"><div className="stat-icon purple">▤</div><div><span>Modules dans le catalogue</span><strong>{String(modules.length).padStart(2, "0")}</strong><small>Chargés depuis le serveur</small></div></div>
                <div className="stat-card"><div className="stat-icon green">✓</div><div><span>Modules publiés</span><strong>{modules.filter((m) => m.publication_status === "published").length}</strong><small>Visibles par les apprenants</small></div></div>
                <div className="stat-card"><div className="stat-icon gold">◉</div><div><span>Objectif examen</span><strong>80 %</strong><small>Questions critiques obligatoires</small></div></div>
              </section>
              <section className="modules-section" id="modules">
                <div className="section-heading"><div><div className="eyebrow">VOTRE PARCOURS</div><h2>{isManager ? "Gestion des modules" : "Les modules de formation"}</h2><p>{isManager ? "Consultez les modules et contrôlez leur état de publication." : "Les modules publiés par votre responsable apparaîtront ici."}</p></div><div className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un module…" aria-label="Rechercher un module" /></div></div>
                <div className="module-grid">
                  {filtered.map((module) => <article className="module-card" key={module.module_number}><div className="module-card-top"><div className={`module-icon tone-${module.module_number}`}>{icons[module.module_number - 1] || "📘"}</div><span className="module-number">MODULE {String(module.module_number).padStart(2, "0")}</span></div><h3>{module.title}</h3><p>{module.description}</p><div className={`status-pill ${module.publication_status}`}>{module.publication_status === "published" ? "Publié" : module.publication_status === "approved" ? "Approuvé" : "Brouillon"}</div><button className="module-link" onClick={() => { setActiveModule(module.module_number); setCheckAnswer(null); }}>{isManager ? "Consulter le module" : "Consulter le module"} <span>→</span></button></article>)}
                  {filtered.length === 0 && <div className="empty-state">Aucun module disponible pour cette recherche.</div>}
                </div>
              </section>
            </>
          )}
          {selectedQuestion && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="question-detail-title"
              onClick={(event) => { if (event.target === event.currentTarget) setSelectedQuestion(null); }}
              style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(20, 30, 25, 0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}
            >
              <section style={{ width: "min(680px, 100%)", maxHeight: "90vh", overflowY: "auto", padding: 28, borderRadius: 16, background: "#fff", color: "#243128", boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                  <div><div className="eyebrow">VÉRIFICATION PÉDAGOGIQUE</div><h2 id="question-detail-title">Détail de la question</h2></div>
                  <button className="secondary-button" onClick={() => setSelectedQuestion(null)} aria-label="Fermer le détail">Fermer</button>
                </div>
                <p><span className={`status-pill ${selectedQuestion.publication_status}`}>{selectedQuestion.publication_status}</span></p>
                <h3>{selectedQuestion.question_text}</h3>
                <h4>Options de réponse</h4>
                <div style={{ display: "grid", gap: 12, lineHeight: 1.5 }}>
                  {(selectedQuestion.answer_options || []).map((option, index) => (
                    <div
                      key={option.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <strong
                        style={{
                          display: "inline-flex",
                          justifyContent: "center",
                          alignItems: "center",
                          minWidth: 28,
                          height: 28,
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        {String.fromCharCode(65 + index)}
                      </strong>
                      <div>
                        <span>{option.text}</span>
                        {(selectedQuestion.correct_option_ids || []).includes(option.id) && (
                          <strong style={{ color: "#287348" }}>
                            {" "}— Bonne réponse
                          </strong>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <h4>Explication</h4>
                <p>{selectedQuestion.explanation || "Aucune explication renseignée."}</p>
                <p><strong>Question critique :</strong> {selectedQuestion.is_critical ? "Oui" : "Non"}</p>
                <div className="manager-actions"><button className="secondary-button" onClick={() => setSelectedQuestion(null)}>Fermer</button></div>
              </section>
            </div>
          )}
          <footer className="page-footer"><span>© {new Date().getFullYear()} COMTESSE Academy</span><span>Qualité · Engagement · Proximité</span><span>Connecté au serveur</span></footer>
        </div>
      </main>
    </div>
  );
}
