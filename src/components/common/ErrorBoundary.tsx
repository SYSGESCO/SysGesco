import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SysGesco Uncaught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg font-bold text-[#00236f]">SysGesco — Récupération</h1>
              <p className="text-xs text-slate-500">
                Une interruption est survenue lors de l'initialisation de l'application.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left">
                <p className="text-[11px] font-mono text-rose-700 font-semibold break-words">
                  {this.state.error.message || 'Erreur inconnue'}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full h-11 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rafraîchir l'application</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearStorage}
                className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Réinitialiser le cache local</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400">
              SysGesco fonctionne en mode offline-first (IndexedDB &amp; LocalStorage).
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
