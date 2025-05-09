import {
  Activity,
  Play,
  Pause, 
  Camera,
  AlertTriangle,
  CheckCircle2,
  Dumbbell,
  ArrowDown,
  MoveDown,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  Award,
  Loader2,
  RotateCcw,
  RefreshCw,
  Info,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  activity: Activity,
  play: Play,
  stop: Pause, 
  camera: Camera,
  warning: AlertTriangle,
  success: CheckCircle2,
  dumbbell: Dumbbell,
  arrowDown: ArrowDown,
  arrowUp: ArrowUp,
  moveDown: MoveDown,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  award: Award,
  spinner: Loader2,
  reset: RotateCcw,
  refresh: RefreshCw,
  info: Info,
  zap: Zap,
};