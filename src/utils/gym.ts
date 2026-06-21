
export interface BeltType {
  name: string;
  colorClass: string; // Background color
  textColorClass: string;
  borderColorClass: string;
  accentBarColor: string; // Black stripe on end
  description: string;
}

// Map progress percentages to typical Jiu-Jitsu belt ranks
export function getBeltForProgress(progress: number): BeltType {
  if (progress <= 20) {
    return {
      name: 'Faixa Branca',
      colorClass: 'bg-white',
      textColorClass: 'text-slate-900',
      borderColorClass: 'border-slate-300',
      accentBarColor: 'bg-slate-900',
      description: 'Fundamentos & Introdução',
    };
  }
  if (progress <= 40) {
    return {
      name: 'Faixa Azul',
      colorClass: 'bg-blue-600',
      textColorClass: 'text-white',
      borderColorClass: 'border-blue-700',
      accentBarColor: 'bg-slate-900',
      description: 'Defesa Básica & Repertório',
    };
  }
  if (progress <= 60) {
    return {
      name: 'Faixa Roxa',
      colorClass: 'bg-purple-600',
      textColorClass: 'text-white',
      borderColorClass: 'border-purple-700',
      accentBarColor: 'bg-slate-900',
      description: 'Sincronia, Ajustes & Ataques',
    };
  }
  if (progress <= 80) {
    return {
      name: 'Faixa Marrom',
      colorClass: 'bg-amber-800',
      textColorClass: 'text-white',
      borderColorClass: 'border-amber-900',
      accentBarColor: 'bg-slate-900',
      description: 'Aperfeiçoamento & Controle',
    };
  }
  return {
    name: 'Faixa Preta',
    colorClass: 'bg-slate-950',
    textColorClass: 'text-amber-400',
    borderColorClass: 'border-amber-400/30',
    accentBarColor: 'bg-red-600', // Iconic red bar at end
    description: 'Domínio, Refinamento & Fluidez',
  };
}

export function awardColor(progress: number): string {
  if (progress <= 20) return 'text-slate-300';
  if (progress <= 40) return 'text-blue-400';
  if (progress <= 60) return 'text-purple-400';
  if (progress <= 80) return 'text-amber-600';
  return 'text-amber-400';
}

// Convert video URL to embedded preview or standard clean link
export function getCleanVideoUrl(url?: string): { url: string; isYoutube: boolean; embedId?: string } | null {
  if (!url) return null;
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(youtubeRegex);
  
  if (match && match[1]) {
    return {
      url,
      isYoutube: true,
      embedId: match[1],
    };
  }
  return {
    url,
    isYoutube: false,
  };
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
