import { Link } from 'wouter';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="text-center">
        <Compass size={34} className="mx-auto text-[hsl(var(--primary))]" />
        <div className="ql-mono mt-4 text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">Error 404</div>
        <h1 className="ql-display mt-2 text-4xl font-bold">Este laboratorio no existe.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          La ruta que buscas no forma parte del módulo. Vuelve al inicio y retoma desde donde quedaste.
        </p>
        <Link
          href="/"
          data-testid="link-volver-inicio"
          className="mt-6 inline-flex rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-[hsl(var(--primary-foreground))]"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
