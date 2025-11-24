import { NoteType } from "./types";
import { AlertCircle, Star, HelpCircle, Eye } from "lucide-react";

export const APP_NAME = "Post-it Smart";

export const PREDEFINED_TAGS = [
  "Sono", "Alimentação", "Barulho", "Interação Social", "Mudança de Rotina", "Medicação", "Escola"
];

export const CONTEXTS = [
  "Casa", "Escola", "Rua", "Terapia", "Casa de Familiares"
];

export const NOTE_TYPE_CONFIG = {
  [NoteType.OBSERVATION]: { color: "bg-blue-100 text-blue-800", icon: Eye, borderColor: "border-blue-200" },
  [NoteType.EPISODE]: { color: "bg-red-100 text-red-800", icon: AlertCircle, borderColor: "border-red-200" },
  [NoteType.VICTORY]: { color: "bg-green-100 text-green-800", icon: Star, borderColor: "border-green-200" },
  [NoteType.QUESTION]: { color: "bg-purple-100 text-purple-800", icon: HelpCircle, borderColor: "border-purple-200" },
};
