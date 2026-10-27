import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { AUDIENCES } from '@/content/landing';

// "Para quem é": a pessoa escolhe a própria atividade e vê o problema, como o sistema ajuda e por onde começar.
export const AudiencePicker: React.FC = () => {
  const [active, setActive] = useState(AUDIENCES[0].id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Escolha a sua atividade">
        {AUDIENCES.map(a => (
          <button
            key={a.id}
            type="button"
            aria-pressed={active === a.id}
            aria-controls={`publico-${a.id}`}
            onClick={() => setActive(a.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors min-h-[44px] ${active === a.id ? 'bg-foreground text-background border-foreground' : 'bg-card text-foreground/80 border-border hover:text-foreground'}`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {AUDIENCES.map(a => (
        <div key={a.id} id={`publico-${a.id}`} hidden={active !== a.id}
          className="max-w-4xl mx-auto bg-card rounded-3xl shadow-medium ring-1 ring-black/5 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-6 sm:p-8 space-y-2 bg-secondary/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">O problema</p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground leading-snug">{a.problem}</h3>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Como o ValidaImóvel ajuda</p>
                <p className="text-[15px] text-foreground/85 leading-relaxed">{a.help}</p>
              </div>
              <ul className="space-y-1.5">
                {a.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground"><Check className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />{f}</li>
                ))}
              </ul>
              <Link to={a.example.to} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline py-1">
                {a.example.label} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
