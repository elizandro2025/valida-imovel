import React, { useState } from 'react';
import { COMPANY_CONFIG } from '@/config/companyConfig';

// Calculadora de retorno da página inicial. Premissa declarada na tela: com o ValidaImóvel, cada matrícula leva
// cerca de 10 minutos (até 4 de análise e o resto para conferir os trechos citados).
const MINUTES_WITH_TOOL = 10;
const PRICE = COMPANY_CONFIG.offer.priceValue;

const brl = (value: number, digits = 0) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: digits, maximumFractionDigits: digits });
const num = (value: number, digits = 0) => value.toLocaleString('pt-BR', { maximumFractionDigits: digits });

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ id, label, value, min, max, step, display, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="text-sm text-foreground/80">{label}</label>
      <output htmlFor={id} className="text-lg font-semibold text-foreground tabular-nums">{display}</output>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-2 cursor-pointer accent-[hsl(var(--primary))]"
    />
  </div>
);

export const RoiCalculator: React.FC = () => {
  const [perMonth, setPerMonth] = useState(10);
  const [manualMinutes, setManualMinutes] = useState(40);
  const [hourValue, setHourValue] = useState(100);

  const savedMinutesEach = Math.max(0, manualMinutes - MINUTES_WITH_TOOL);
  const savedHours = (savedMinutesEach * perMonth) / 60;
  const savedValue = savedHours * hourValue;
  const valuePerAnalysis = (savedMinutesEach / 60) * hourValue;
  const breakEven = valuePerAnalysis > 0 ? Math.ceil(PRICE / valuePerAnalysis) : null;
  const multiple = savedValue / PRICE;

  return (
    <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
      <div className="bg-card rounded-3xl shadow-soft p-6 sm:p-8 space-y-7">
        <Slider id="roi-mes" label="Matrículas que você analisa por mês" value={perMonth} min={1} max={100} step={1}
          display={num(perMonth)} onChange={setPerMonth} />
        <Slider id="roi-minutos" label="Minutos que você leva lendo cada uma" value={manualMinutes} min={15} max={180} step={5}
          display={`${num(manualMinutes)} min`} onChange={setManualMinutes} />
        <Slider id="roi-hora" label="Quanto vale a sua hora de trabalho" value={hourValue} min={30} max={600} step={10}
          display={brl(hourValue)} onChange={setHourValue} />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Estimativa com os seus números. Consideramos {MINUTES_WITH_TOOL} minutos por matrícula com o ValidaImóvel: até 4 de análise e o
          restante para conferir os trechos citados. O tempo de leitura manual varia com o tamanho da matrícula.
        </p>
      </div>

      <div className="bg-foreground text-background rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-8" aria-live="polite">
        <div className="space-y-2">
          <p className="text-sm text-background/70">Com o plano de {brl(PRICE, 2)}</p>
          <p className="text-[28px] sm:text-4xl font-semibold tracking-tight leading-tight">
            {breakEven === null
              ? 'Mesmo sem ganhar tempo, cada matrícula sai organizada e conferida.'
              : breakEven <= 1
                ? 'O plano se paga já na primeira matrícula.'
                : `O plano se paga com ${num(breakEven)} matrículas.`}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <dt className="text-xs text-background/70">Custo por matrícula</dt>
            <dd className="text-2xl font-semibold tabular-nums">{brl(PRICE / perMonth, 2)}</dd>
          </div>
          <div>
            <dt className="text-xs text-background/70">Horas devolvidas por mês</dt>
            <dd className="text-2xl font-semibold tabular-nums">{num(savedHours, 1)} h</dd>
          </div>
          <div>
            <dt className="text-xs text-background/70">Valor desse tempo</dt>
            <dd className="text-2xl font-semibold tabular-nums">{brl(savedValue)}</dd>
          </div>
          <div>
            <dt className="text-xs text-background/70">Retorno sobre o plano</dt>
            <dd className="text-2xl font-semibold tabular-nums">{multiple >= 1 ? `${num(multiple, 1)}x` : 'menos de 1x'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
