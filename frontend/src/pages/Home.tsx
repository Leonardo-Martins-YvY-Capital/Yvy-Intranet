import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";

const PLACEHOLDER_MODULES = [
  { title: "Portfólio", description: "Visão consolidada dos ativos sob gestão." },
  { title: "Relatórios", description: "Demonstrativos e relatórios regulatórios." },
  { title: "Compliance", description: "Monitoramento de políticas e limites operacionais." },
  { title: "Investidores", description: "Gestão da base de cotistas e comunicados." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-yvy-navy font-barlow">
      <header className="bg-yvy-navy text-white py-12 px-6 border-b border-black/25">
        <div className="max-w-[1366px] mx-auto">
          <p className="text-xs font-barlowcn uppercase tracking-widest text-white/55 mb-2">
            Plataforma Digital
          </p>
          <h1 className="text-4xl md:text-5xl font-light font-barlowcn uppercase tracking-wider">
            Dashboard
          </h1>
        </div>
      </header>

      <div className="max-w-[1366px] mx-auto px-6 py-16">
        <p className="text-sm font-light text-yvy-navy/60 mb-10">
          Módulos em desenvolvimento. Navegue pelas seções disponíveis abaixo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLACEHOLDER_MODULES.map((mod) => (
            <Card key={mod.title} className="opacity-50 cursor-not-allowed select-none">
              <CardHeader>
                <CardTitle className="text-base">{mod.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-light text-yvy-navy/60 leading-relaxed">
                  {mod.description}
                </p>
                <span className="mt-4 inline-block text-xs font-barlowcn uppercase tracking-widest text-yvy-navy/35">
                  Em breve
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 border-t border-black/10 pt-10">
          <p className="text-xs font-barlowcn uppercase tracking-widest text-yvy-navy/40 mb-4">
            Recursos disponíveis
          </p>
          <Link
            to="/design-system"
            className="inline-flex items-center gap-x-2 text-sm text-yvy-royal hover:underline font-barlowcn uppercase tracking-widest"
          >
            Ver Design System
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
