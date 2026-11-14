import { Exercise, ExercisePattern, MuscleCategory } from '../types/kora';

export type EquipmentType =
  | 'Maschine'
  | 'Kabelzug'
  | 'Kurzhantel'
  | 'Langhantel'
  | 'Bodyweight / Ringe';

export interface ExerciseCatalogItem {
  id: string;
  name: string;
  category: MuscleCategory;
  equipment: EquipmentType;
  pattern: ExercisePattern;
  primaryMuscle: string;
  defaultWeight: number;
  defaultReps: number;
  defaultSets: number;
  defaultRestSeconds: number;
  defaultNote?: string;
}

export const EXERCISE_CATALOG: ExerciseCatalogItem[] = [
  // BEINE (16)
  {
    id: 'cat_leg_press',
    name: 'Beinpresse (Leg Press)',
    category: 'Beine',
    equipment: 'Maschine',
    pattern: 'leg_press',
    primaryMuscle: 'Quadrizeps & Gluteus',
    defaultWeight: 110,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90,
    defaultNote: 'Fußplatte schulterbreit, Knie sauber in Fußrichtung'
  },
  {
    id: 'cat_hack_squat',
    name: 'Hack-Squats / Angled Leg Press',
    category: 'Beine',
    equipment: 'Maschine',
    pattern: 'hack_squat',
    primaryMuscle: 'Quadrizeps',
    defaultWeight: 90,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 120
  },
  {
    id: 'cat_leg_extension',
    name: 'Beinstrecken (Leg Extension)',
    category: 'Beine',
    equipment: 'Maschine',
    pattern: 'leg_extension',
    primaryMuscle: 'Quadrizeps',
    defaultWeight: 70,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_seated_leg_curl',
    name: 'Beinbeuger sitzend (Seated Leg Curl)',
    category: 'Beine',
    equipment: 'Maschine',
    pattern: 'leg_curl',
    primaryMuscle: 'Hamstrings',
    defaultWeight: 55,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_lying_leg_curl',
    name: 'Beinbeuger liegend (Lying Leg Curl)',
    category: 'Beine',
    equipment: 'Maschine',
    pattern: 'leg_curl',
    primaryMuscle: 'Hamstrings',
    defaultWeight: 45,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_hip_abduction',
    name: 'Hüft-Abduktoren (Sitzend)',
    category: 'Beine',
    equipment: 'Maschine',
    pattern: 'hip_abduction',
    primaryMuscle: 'Gluteus Medius & Abduktoren',
    defaultWeight: 55,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_hip_adduction',
    name: 'Hüft-Adduktoren (Sitzend)',
    category: 'Beine',
    equipment: 'Maschine',
    pattern: 'hip_abduction',
    primaryMuscle: 'Adduktoren',
    defaultWeight: 50,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_barbell_squat',
    name: 'Kniebeugen (Langhantel)',
    category: 'Beine',
    equipment: 'Langhantel',
    pattern: 'squat',
    primaryMuscle: 'Quadrizeps, Gluteus & Core',
    defaultWeight: 60,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 120
  },
  {
    id: 'cat_smith_squat',
    name: 'Multipresse Kniebeugen',
    category: 'Beine',
    equipment: 'Maschine',
    pattern: 'squat',
    primaryMuscle: 'Quadrizeps & Gluteus',
    defaultWeight: 50,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 120
  },
  {
    id: 'cat_bulgarian_split',
    name: 'Bulgarian Split Squats',
    category: 'Beine',
    equipment: 'Kurzhantel',
    pattern: 'lunge',
    primaryMuscle: 'Quadrizeps & Gluteus',
    defaultWeight: 16,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_db_lunge',
    name: 'Ausfallschritt mit Kurzhantel',
    category: 'Beine',
    equipment: 'Kurzhantel',
    pattern: 'lunge',
    primaryMuscle: 'Quadrizeps & Gluteus',
    defaultWeight: 16,
    defaultReps: 10,
    defaultSets: 2,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_rdl',
    name: 'Rumänisches Kreuzheben (RDL)',
    category: 'Beine',
    equipment: 'Langhantel',
    pattern: 'back_extension',
    primaryMuscle: 'Hamstrings & Gluteus',
    defaultWeight: 70,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 120
  },
  {
    id: 'cat_hip_thrust',
    name: 'Hip Thrust (Maschine / Langhantel)',
    category: 'Beine',
    equipment: 'Maschine',
    pattern: 'leg_press',
    primaryMuscle: 'Gluteus Maximus',
    defaultWeight: 80,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_calf_raise_standing',
    name: 'Wadenheben stehend',
    category: 'Beine',
    equipment: 'Maschine',
    pattern: 'squat',
    primaryMuscle: 'Waden (Gastrocnemius)',
    defaultWeight: 50,
    defaultReps: 15,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_calf_raise_seated',
    name: 'Wadenheben sitzend',
    category: 'Beine',
    equipment: 'Maschine',
    pattern: 'leg_extension',
    primaryMuscle: 'Waden (Soleus)',
    defaultWeight: 40,
    defaultReps: 15,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_glute_kickback',
    name: 'Glute Kickback am Kabel / Gerät',
    category: 'Beine',
    equipment: 'Kabelzug',
    pattern: 'lunge',
    primaryMuscle: 'Gluteus Maximus',
    defaultWeight: 25,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },

  // RÜCKEN (16)
  {
    id: 'cat_vertical_traction',
    name: 'Latzug / Vertical Traction (Gerät)',
    category: 'Rücken',
    equipment: 'Maschine',
    pattern: 'lat_pulldown',
    primaryMuscle: 'Latissimus & oberer Rücken',
    defaultWeight: 65,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_lat_pulldown_wide',
    name: 'Latziehen weiter Griff (Kabelzug)',
    category: 'Rücken',
    equipment: 'Kabelzug',
    pattern: 'lat_pulldown',
    primaryMuscle: 'Latissimus',
    defaultWeight: 65,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_lat_pulldown_close',
    name: 'Latziehen enger Parallelgriff',
    category: 'Rücken',
    equipment: 'Kabelzug',
    pattern: 'lat_pulldown',
    primaryMuscle: 'Unterer Latissimus & Bizeps',
    defaultWeight: 60,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_pull_ups',
    name: 'Klimmzüge (Pull-Ups)',
    category: 'Rücken',
    equipment: 'Bodyweight / Ringe',
    pattern: 'lat_pulldown',
    primaryMuscle: 'Latissimus & Core',
    defaultWeight: 0,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 120
  },
  {
    id: 'cat_assisted_pull_ups',
    name: 'Klimmzüge unterstützt (Maschine)',
    category: 'Rücken',
    equipment: 'Maschine',
    pattern: 'lat_pulldown',
    primaryMuscle: 'Latissimus',
    defaultWeight: 25,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_low_row_machine',
    name: 'Sitzendes Rudern (Low Row Gerät)',
    category: 'Rücken',
    equipment: 'Maschine',
    pattern: 'seated_row',
    primaryMuscle: 'Mittlerer Rücken & Rhomboiden',
    defaultWeight: 55,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_cable_row',
    name: 'Rudern am Kabelzug (Eng)',
    category: 'Rücken',
    equipment: 'Kabelzug',
    pattern: 'seated_row',
    primaryMuscle: 'Mittlerer Rücken & Latissimus',
    defaultWeight: 65,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_barbell_row',
    name: 'Langhantel-Rudern vorgebeugt',
    category: 'Rücken',
    equipment: 'Langhantel',
    pattern: 'seated_row',
    primaryMuscle: 'Oberer Rücken & Latissimus',
    defaultWeight: 60,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 120
  },
  {
    id: 'cat_tbar_row',
    name: 'T-Bar Rudern',
    category: 'Rücken',
    equipment: 'Maschine',
    pattern: 'seated_row',
    primaryMuscle: 'Mittlerer Rücken & Trapez',
    defaultWeight: 45,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_one_arm_db_row',
    name: 'Einarmiges Kurzhantel-Rudern',
    category: 'Rücken',
    equipment: 'Kurzhantel',
    pattern: 'seated_row',
    primaryMuscle: 'Latissimus & oberer Rücken',
    defaultWeight: 24,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_ring_rows',
    name: 'Ring Rows / Körperrudern',
    category: 'Rücken',
    equipment: 'Bodyweight / Ringe',
    pattern: 'seated_row',
    primaryMuscle: 'Oberer Rücken & hintere Schulter',
    defaultWeight: 0,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_straight_arm_pulldown',
    name: 'Überzüge am Kabelzug (Lat Prayer)',
    category: 'Rücken',
    equipment: 'Kabelzug',
    pattern: 'lat_pulldown',
    primaryMuscle: 'Latissimus Isolation',
    defaultWeight: 25,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_face_pulls',
    name: 'Face Pulls am Kabelzug',
    category: 'Rücken',
    equipment: 'Kabelzug',
    pattern: 'seated_row',
    primaryMuscle: 'Hintere Schulter & Rotatorenmanschette',
    defaultWeight: 20,
    defaultReps: 15,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_back_extension',
    name: 'Back Extension (Rückenstrecker Gerät)',
    category: 'Rücken',
    equipment: 'Maschine',
    pattern: 'back_extension',
    primaryMuscle: 'Unterer Rücken (Erector Spinae)',
    defaultWeight: 85,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_deadlift',
    name: 'Kreuzheben (Deadlift)',
    category: 'Rücken',
    equipment: 'Langhantel',
    pattern: 'back_extension',
    primaryMuscle: 'Gesamte hintere Kette',
    defaultWeight: 90,
    defaultReps: 5,
    defaultSets: 3,
    defaultRestSeconds: 150
  },
  {
    id: 'cat_shrugs',
    name: 'Shrugs (Nackenheben Kurzhantel)',
    category: 'Rücken',
    equipment: 'Kurzhantel',
    pattern: 'lateral_raise',
    primaryMuscle: 'Oberer Trapez',
    defaultWeight: 24,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },

  // BRUST (14)
  {
    id: 'cat_chest_press',
    name: 'Brustpresse (Chest Press)',
    category: 'Brust',
    equipment: 'Maschine',
    pattern: 'chest_press',
    primaryMuscle: 'Pectoralis Major & Trizeps',
    defaultWeight: 45,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_incline_chest_press',
    name: 'Schrägbank-Brustpresse (Maschine)',
    category: 'Brust',
    equipment: 'Maschine',
    pattern: 'chest_press',
    primaryMuscle: 'Obere Brust & vordere Schulter',
    defaultWeight: 40,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_butterfly',
    name: 'Butterfly / Pec Deck am Gerät',
    category: 'Brust',
    equipment: 'Maschine',
    pattern: 'butterfly',
    primaryMuscle: 'Brust (Isolation)',
    defaultWeight: 65,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_bench_press',
    name: 'Bankdrücken (Langhantel)',
    category: 'Brust',
    equipment: 'Langhantel',
    pattern: 'chest_press',
    primaryMuscle: 'Brust, Trizeps & vordere Schulter',
    defaultWeight: 60,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 120
  },
  {
    id: 'cat_db_bench_press',
    name: 'Kurzhantel-Bankdrücken',
    category: 'Brust',
    equipment: 'Kurzhantel',
    pattern: 'chest_press',
    primaryMuscle: 'Brust & Stabilisatoren',
    defaultWeight: 22,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_db_incline_press',
    name: 'Kurzhantel-Schrägbankdrücken',
    category: 'Brust',
    equipment: 'Kurzhantel',
    pattern: 'chest_press',
    primaryMuscle: 'Obere Brust',
    defaultWeight: 20,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_cable_fly_high',
    name: 'Cable Flys (von oben nach unten)',
    category: 'Brust',
    equipment: 'Kabelzug',
    pattern: 'butterfly',
    primaryMuscle: 'Untere & mittlere Brust',
    defaultWeight: 15,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_cable_fly_low',
    name: 'Cable Flys (von unten nach oben)',
    category: 'Brust',
    equipment: 'Kabelzug',
    pattern: 'butterfly',
    primaryMuscle: 'Obere Brust',
    defaultWeight: 12.5,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_push_ups',
    name: 'Liegestütze (Push-Ups)',
    category: 'Brust',
    equipment: 'Bodyweight / Ringe',
    pattern: 'chest_press',
    primaryMuscle: 'Brust, Trizeps & Core',
    defaultWeight: 0,
    defaultReps: 15,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_ring_push_ups',
    name: 'Ring Push-Ups',
    category: 'Brust',
    equipment: 'Bodyweight / Ringe',
    pattern: 'butterfly',
    primaryMuscle: 'Brust & Schulterstabilität',
    defaultWeight: 0,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_chest_dips',
    name: 'Dips vorgebeugt (Brust-Fokus)',
    category: 'Brust',
    equipment: 'Bodyweight / Ringe',
    pattern: 'dip',
    primaryMuscle: 'Untere Brust & Trizeps',
    defaultWeight: 0,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_smith_incline',
    name: 'Multipresse Schrägbankdrücken',
    category: 'Brust',
    equipment: 'Maschine',
    pattern: 'chest_press',
    primaryMuscle: 'Obere Brust',
    defaultWeight: 45,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_db_pullover',
    name: 'Kurzhantel-Überzüge (Pullover)',
    category: 'Brust',
    equipment: 'Kurzhantel',
    pattern: 'chest_press',
    primaryMuscle: 'Brust & Sägemuskel',
    defaultWeight: 20,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_iso_chest_press',
    name: 'Iso-Lateral Chest Press (Plate Loaded)',
    category: 'Brust',
    equipment: 'Maschine',
    pattern: 'chest_press',
    primaryMuscle: 'Brust (Unilateral)',
    defaultWeight: 40,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },

  // SCHULTERN (12)
  {
    id: 'cat_shoulder_press',
    name: 'Schulterpresse (Shoulder Press)',
    category: 'Schultern',
    equipment: 'Maschine',
    pattern: 'shoulder_press',
    primaryMuscle: 'Vordere & mittlere Schulter',
    defaultWeight: 35,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_db_shoulder_press',
    name: 'Kurzhantel-Schulterdrücken',
    category: 'Schultern',
    equipment: 'Kurzhantel',
    pattern: 'shoulder_press',
    primaryMuscle: 'Vordere & mittlere Schulter',
    defaultWeight: 16,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_ohp',
    name: 'Overhead Press (Langhantel stehend)',
    category: 'Schultern',
    equipment: 'Langhantel',
    pattern: 'shoulder_press',
    primaryMuscle: 'Schultern & Core',
    defaultWeight: 35,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 120
  },
  {
    id: 'cat_lateral_raise_seated',
    name: 'Seitheben sitzend (KH / Seilzug)',
    category: 'Schultern',
    equipment: 'Kurzhantel',
    pattern: 'lateral_raise',
    primaryMuscle: 'Seitliche Schulter',
    defaultWeight: 6,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_lateral_raise_standing',
    name: 'Seitheben stehend (Kurzhantel)',
    category: 'Schultern',
    equipment: 'Kurzhantel',
    pattern: 'lateral_raise',
    primaryMuscle: 'Seitliche Schulter',
    defaultWeight: 8,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_cable_lateral_raise',
    name: 'Seitheben einarmig am Kabelzug',
    category: 'Schultern',
    equipment: 'Kabelzug',
    pattern: 'lateral_raise',
    primaryMuscle: 'Seitliche Schulter',
    defaultWeight: 7.5,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_lateral_raise_machine',
    name: 'Seithebe-Maschine',
    category: 'Schultern',
    equipment: 'Maschine',
    pattern: 'lateral_raise',
    primaryMuscle: 'Seitliche Schulter',
    defaultWeight: 25,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_reverse_pec_deck',
    name: 'Reverse Butterfly (Hintere Schulter)',
    category: 'Schultern',
    equipment: 'Maschine',
    pattern: 'butterfly',
    primaryMuscle: 'Hintere Schulter',
    defaultWeight: 35,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_cable_rear_delt',
    name: 'Reverse Cable Flys (Hintere Schulter)',
    category: 'Schultern',
    equipment: 'Kabelzug',
    pattern: 'lateral_raise',
    primaryMuscle: 'Hintere Schulter',
    defaultWeight: 7.5,
    defaultReps: 15,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_arnold_press',
    name: 'Arnold Press (Kurzhantel)',
    category: 'Schultern',
    equipment: 'Kurzhantel',
    pattern: 'shoulder_press',
    primaryMuscle: 'Gesamte Schulter',
    defaultWeight: 14,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_front_raise_cable',
    name: 'Frontheben am Kabelzug',
    category: 'Schultern',
    equipment: 'Kabelzug',
    pattern: 'lateral_raise',
    primaryMuscle: 'Vordere Schulter',
    defaultWeight: 10,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_ring_y_raise',
    name: 'Y-Raises an Ringen / Schrägbank',
    category: 'Schultern',
    equipment: 'Bodyweight / Ringe',
    pattern: 'lateral_raise',
    primaryMuscle: 'Unterer Trapez & Schultergesundheit',
    defaultWeight: 0,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },

  // ARME (14)
  {
    id: 'cat_scott_curl',
    name: 'Scottcurl am Gerät (Preacher Curl)',
    category: 'Arme',
    equipment: 'Maschine',
    pattern: 'bicep_curl',
    primaryMuscle: 'Bizeps (Kurzer Kopf)',
    defaultWeight: 45,
    defaultReps: 11,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_incline_db_curl',
    name: 'Einhändige Curls auf Schrägbank',
    category: 'Arme',
    equipment: 'Kurzhantel',
    pattern: 'bicep_curl',
    primaryMuscle: 'Bizeps (Langer Kopf)',
    defaultWeight: 12,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_db_bicep_curl',
    name: 'Kurzhantel-Bizepscurls',
    category: 'Arme',
    equipment: 'Kurzhantel',
    pattern: 'bicep_curl',
    primaryMuscle: 'Bizeps',
    defaultWeight: 12,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_hammer_curl',
    name: 'Hammer Curls (Kurzhantel)',
    category: 'Arme',
    equipment: 'Kurzhantel',
    pattern: 'bicep_curl',
    primaryMuscle: 'Brachialis & Unterarm',
    defaultWeight: 14,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_cable_bicep_curl',
    name: 'Bizepscurls am Kabelzug',
    category: 'Arme',
    equipment: 'Kabelzug',
    pattern: 'bicep_curl',
    primaryMuscle: 'Bizeps (Konstante Spannung)',
    defaultWeight: 25,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_ez_bar_curl',
    name: 'SZ-Stangen Curls',
    category: 'Arme',
    equipment: 'Langhantel',
    pattern: 'bicep_curl',
    primaryMuscle: 'Bizeps',
    defaultWeight: 25,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_ring_pelican_curl',
    name: 'Ring Bizeps Curls / Pelican Curls',
    category: 'Arme',
    equipment: 'Bodyweight / Ringe',
    pattern: 'bicep_curl',
    primaryMuscle: 'Bizeps & Sehnenkraft',
    defaultWeight: 0,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_triceps_rope',
    name: 'Trizepsdrücken am Kabelzug (Seil)',
    category: 'Arme',
    equipment: 'Kabelzug',
    pattern: 'tricep_pushdown',
    primaryMuscle: 'Trizeps',
    defaultWeight: 30,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_triceps_bar',
    name: 'Trizepsdrücken am Kabelzug (Stange)',
    category: 'Arme',
    equipment: 'Kabelzug',
    pattern: 'tricep_pushdown',
    primaryMuscle: 'Trizeps (Lateraler Kopf)',
    defaultWeight: 35,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_overhead_triceps_cable',
    name: 'Überkopf-Trizepsstrecken am Kabel',
    category: 'Arme',
    equipment: 'Kabelzug',
    pattern: 'tricep_pushdown',
    primaryMuscle: 'Trizeps (Langer Kopf)',
    defaultWeight: 25,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_dip_machine',
    name: 'Dip Machine (Trizeps-Presse)',
    category: 'Arme',
    equipment: 'Maschine',
    pattern: 'dip',
    primaryMuscle: 'Trizeps & untere Brust',
    defaultWeight: 30,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_skullcrushers',
    name: 'French Press / Skullcrushers',
    category: 'Arme',
    equipment: 'Langhantel',
    pattern: 'tricep_pushdown',
    primaryMuscle: 'Trizeps',
    defaultWeight: 25,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 75
  },
  {
    id: 'cat_ring_dips',
    name: 'Ring Dips',
    category: 'Arme',
    equipment: 'Bodyweight / Ringe',
    pattern: 'dip',
    primaryMuscle: 'Trizeps, Brust & Schulterstabilität',
    defaultWeight: 0,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 90
  },
  {
    id: 'cat_close_grip_bench',
    name: 'Enges Bankdrücken',
    category: 'Arme',
    equipment: 'Langhantel',
    pattern: 'chest_press',
    primaryMuscle: 'Trizeps & innere Brust',
    defaultWeight: 50,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 90
  },

  // CORE (10)
  {
    id: 'cat_situp_machine',
    name: 'Situp / Bauchmaschine',
    category: 'Core',
    equipment: 'Maschine',
    pattern: 'core_crunch',
    primaryMuscle: 'Gerade Bauchmuskulatur',
    defaultWeight: 45,
    defaultReps: 15,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_cable_crunch',
    name: 'Kabelzug-Crunches (Kniend)',
    category: 'Core',
    equipment: 'Kabelzug',
    pattern: 'core_crunch',
    primaryMuscle: 'Bauchmuskulatur',
    defaultWeight: 35,
    defaultReps: 15,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_hanging_leg_raise',
    name: 'Beinheben hängend',
    category: 'Core',
    equipment: 'Bodyweight / Ringe',
    pattern: 'core_crunch',
    primaryMuscle: 'Unterer Bauch & Hüftbeuger',
    defaultWeight: 0,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_ab_wheel',
    name: 'Ab-Wheel Rollout',
    category: 'Core',
    equipment: 'Bodyweight / Ringe',
    pattern: 'core_crunch',
    primaryMuscle: 'Tiefer Core (Anti-Extension)',
    defaultWeight: 0,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_plank',
    name: 'Plank / Unterarmstütz (Sekunden)',
    category: 'Core',
    equipment: 'Bodyweight / Ringe',
    pattern: 'core_crunch',
    primaryMuscle: 'Gesamter Core',
    defaultWeight: 0,
    defaultReps: 60,
    defaultSets: 3,
    defaultRestSeconds: 45
  },
  {
    id: 'cat_pallof_press',
    name: 'Pallof Press am Kabelzug',
    category: 'Core',
    equipment: 'Kabelzug',
    pattern: 'core_crunch',
    primaryMuscle: 'Schräge Bauchmuskeln (Anti-Rotation)',
    defaultWeight: 15,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 45
  },
  {
    id: 'cat_l_sit',
    name: 'L-Sit (Ringe / Parallettes)',
    category: 'Core',
    equipment: 'Bodyweight / Ringe',
    pattern: 'core_crunch',
    primaryMuscle: 'Core & Hüftbeuger',
    defaultWeight: 0,
    defaultReps: 20,
    defaultSets: 3,
    defaultRestSeconds: 60
  },
  {
    id: 'cat_russian_twist',
    name: 'Russian Twists',
    category: 'Core',
    equipment: 'Kurzhantel',
    pattern: 'core_crunch',
    primaryMuscle: 'Obliques (Rotation)',
    defaultWeight: 10,
    defaultReps: 16,
    defaultSets: 3,
    defaultRestSeconds: 45
  },
  {
    id: 'cat_dead_bug',
    name: 'Dead Bug (Kontrolliert)',
    category: 'Core',
    equipment: 'Bodyweight / Ringe',
    pattern: 'core_crunch',
    primaryMuscle: 'Tiefe Rumpfmuskulatur',
    defaultWeight: 0,
    defaultReps: 12,
    defaultSets: 2,
    defaultRestSeconds: 45
  },
  {
    id: 'cat_torso_rotation',
    name: 'Rumpfrotation am Gerät',
    category: 'Core',
    equipment: 'Maschine',
    pattern: 'core_crunch',
    primaryMuscle: 'Seitliche Bauchmuskeln',
    defaultWeight: 35,
    defaultReps: 15,
    defaultSets: 3,
    defaultRestSeconds: 45
  }
];

export function createExerciseFromCatalogItem(
  item: ExerciseCatalogItem,
  activeGym: string
): Exercise {
  const now = Date.now();
  return {
    id: `${item.id}_${now}`,
    name: item.name,
    category: item.category,
    pattern: item.pattern,
    primaryMuscle: item.primaryMuscle,
    targetWeight: item.defaultWeight > 0 ? String(item.defaultWeight) : 'Bodyweight',
    topWeight: null,
    gymSettings: item.defaultNote ? { [activeGym]: item.defaultNote } : {},
    defaultRestSeconds: item.defaultRestSeconds,
    sets: Array.from({ length: item.defaultSets }, (_, i) => ({
      id: `s_${now}_${i}`,
      weight: item.defaultWeight,
      reps: item.defaultReps,
      done: false
    }))
  };
}
