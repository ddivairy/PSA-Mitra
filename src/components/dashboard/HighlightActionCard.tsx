import React from 'react';

interface HighlightActionCardProps {
  eyebrow?: string;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export const HighlightActionCard: React.FC<HighlightActionCardProps> = ({
  eyebrow = 'MORE ROOM TO CREATE',
  title,
  description,
  buttonText,
  onButtonClick,
}) => {
  return (
    <section className="card premium" aria-labelledby="premium-heading">
      <div className="eyebrow text-xs font-extrabold tracking-widest text-[#bcd2ed] uppercase">
        {eyebrow}
      </div>
      <h2
        id="premium-heading"
        className="text-xl font-extrabold text-white mt-2 mb-2 tracking-tight"
      >
        {title}
      </h2>
      <p className="text-xs text-[#d6e3f2] leading-relaxed max-w-xs mb-3">
        {description}
      </p>
      <button
        type="button"
        onClick={onButtonClick}
        className="font-extrabold text-xs"
      >
        {buttonText} &rarr;
      </button>
    </section>
  );
};
