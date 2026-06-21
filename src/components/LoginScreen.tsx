import { Award, Shield, Monitor } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function LoginScreen({ onLoginSuccess, isLoading, setIsLoading }: LoginScreenProps) {
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onLoginSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      {/* Background glow animations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left side: Premium branding & description */}
      <div className="hidden lg:flex lg:w-7/12 flex-col justify-between p-16 relative border-r border-slate-900 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Award className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Dojo Portal
          </span>
        </div>

        <div className="my-auto max-w-lg space-y-6">
          <h1 className="text-5xl font-black leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Domine seu Jiu-Jitsu no computador.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Seu ambiente de cursos e diário técnico unificado. Assista suas posições em tela cheia, faça anotações detalhadas e acompanhe suas estatísticas de treino em tempo real.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm">
              <Monitor className="w-5 h-5 text-blue-400 mb-2" />
              <h3 className="font-bold text-sm text-slate-200">Tela de Cursos</h3>
              <p className="text-xs text-slate-400">Layout de módulos adaptado para aulas e vídeos maiores.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm">
              <Shield className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="font-bold text-sm text-slate-200">Sincronização Total</h3>
              <p className="text-xs text-slate-400">Integrado instantaneamente com o seu aplicativo de celular.</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          OSS! BJJ Portal © 2026 - Desenvolvido para campeões.
        </div>
      </div>

      {/* Right side: Login Panel */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-md p-8 rounded-3xl border border-slate-900 bg-slate-900/20 backdrop-blur-xl shadow-2xl flex flex-col justify-center gap-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] mx-auto mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Bem-vindo ao Portal</h2>
            <p className="text-slate-400 text-sm">
              Faça login com sua conta Google para sincronizar suas posições e acessar a plataforma de cursos.
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-950 font-bold py-3.5 px-6 rounded-xl hover:bg-slate-100 active:scale-[0.99] transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.05)] disabled:opacity-50 cursor-pointer text-sm"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.7 0 3.2.6 4.4 1.8l3.3-3.3C17.7 1.6 15 1 12 1 7.3 1 3.4 3.7 1.5 7.7l3.9 3C6.3 7.7 8.9 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.4 14.7c-.25-.76-.4-1.57-.4-2.4s.15-1.64.4-2.4l-3.9-3C.6 8.7 0 10.3 0 12s.6 3.3 1.5 5.1l3.9-3z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.9 0 5.4-1 7.2-2.7l-3.7-2.9c-1 .7-2.3 1.1-3.5 1.1-3.1 0-5.7-2.66-6.6-5.66l-3.9 3C3.4 20.3 7.3 23 12 23z"
                  />
                </svg>
                <span>Acessar com o Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-900"></div>
            </div>
            <span className="relative bg-slate-950/20 px-3 text-xs text-slate-600 uppercase font-bold tracking-wider">
              Segurança
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 text-left">
              <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-300">Conexão Criptografada</h4>
                <p className="text-[10px] text-slate-500">Seus dados são transmitidos com segurança de ponta a ponta pelo Google Cloud Firebase.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
