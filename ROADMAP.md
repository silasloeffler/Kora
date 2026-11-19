# Kora Roadmap

Geplante Weiterentwicklungen (*Down the line*) sowie die wichtigsten Meilensteine der aktuellen App-Iterationen.

---

## Down the Line (Geplante Features)

### 1. Dynamic Island / Live Capsule für Poco (HyperOS / Android)
- **Ziel:** Aktive Trainingssessions und laufende Satzpausen direkt außerhalb der App sichtbar halten — als Live-Capsule / Statusbar-Pill unter HyperOS (Poco / Xiaomi) sowie auf dem Android-Sperrbildschirm.
- **Technischer Ansatz:**
  - Nativer Android Foreground Service über Capacitor-Plugin mit laufender Progress-Notification (`NotificationCompat.Builder` / HyperOS Live Updates / Focus Notification API).
  - Echtzeit-Sync mit `restTimerTargetEndTime` (Wall-Clock-basiert), aktueller Übung und Quick-Actions (`+15s`, `Pause/Weiter`, `Nächster Satz`) direkt aus der Notification / Capsule ohne App-Wechsel.

### 2. Gewichts-Progression & Kraft-Verlauf über die Zeit
- **Ziel:** Langfristige Entwicklung pro Übung statt nur Momentaufnahme (*aktuell vs. All-Time Peak* in `InsightsView`).
- **Geplanter Umfang:**
  - Zeitreihen-Charts pro Übung und Muskelgruppe (Top-Set-Gewicht, geschätztes 1RM / e1RM, Gesamtvolumen pro Session).
  - Automatische Erkennung von Personal Records (PRs), Plateaus und Wiedereinstiegs-Kurven nach Trainingspausen.
  - Vergleich zwischen verschiedenen Studios (z. B. unterschiedliche Maschinenübersetzungen pro Gym).

### 3. Dynamischer Workout-Startscreen („Training starten verändert den Startscreen“)
- **Ziel:** Sobald ein Workout aktiv ist, verwandelt sich der `CoreDashboardView`-Startscreen kontextabhängig in eine fokussierte Live-Steuerzentrale.
- **Geplanter Umfang:**
  - Prominenter Live-Session-Header mit laufender Trainingsdauer, Satz-Fortschritt und direktem Rest-Timer-Widget.
  - Vorschau auf die aktuell fokussierte bzw. nächste offene Übung inkl. Direkt-Log für den nächsten Satz.
  - Automatische Rückkehr zur ruhigen Daily-Readiness-Ansicht nach Abschluss der Session.

---

## Bereits umgesetzt — v1.1 (Gym Instant Fixes)

- **Natürliches Top-Bar-Scrolling & weicher Blur-Übergang:** Der obere Header (`TopGlassHeader`) scrollt sauber mit dem Seiteninhalt mit, während `.kora-statusbar-scrim` dank `mask-image`-Gradient ohne harte Kante unter der Statusleiste/Kamera ausblendet. Gym-Dropdown mit sauber positioniertem Chevron (`ChevronDown`).
- **Größere Mobile-Touch-Targets:** Konsequente `44×44px+` Tippflächen für Dock-Tabs, Floating Workout Pill, Settings/Gym-Header, Core-Buttons, Mind-Tags/Submit sowie alle Set-Stepper (`-`, `+`, `Check`) im Training ohne horizontales Overflow auf `360px–412px`-Displays.
- **Selbstklärende Train-Filter & erledigte Übungen:** Live-Zähler in `Alle (N) / Offen (N) / Erledigt (N)`, Quick-Action-Pill (`N erledigt • ausblenden`), hilfreiche Empty States und automatisches Einklappen & Abdunkeln komplett abgehakter Übungskarten.
- **Dedizierter Kora Coach Chat:** Klare Chat-Ansicht (`CoachView`) mit „Chat gestartet“-Trenner, eindeutigen Chat-Bubbles mit Avataren und Zeitstempeln, automatischem Scrollen ans Chat-Ende sowie Nothing-OS-grauem `.kora-badge` im Dark Mode.
