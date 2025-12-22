import React from "react";
import { useTranslations } from "next-intl";

export default function HowItWorks() {
  const t = useTranslations('HowItWorks');
  
  const steps = [
    {
      title: t('steps.discover.title'),
      description: t('steps.discover.description'),
      icon: "🔍",
    },
    {
      title: t('steps.book.title'),
      description: t('steps.book.description'),
      icon: "📅",
    },
    {
      title: t('steps.enjoy.title'),
      description: t('steps.enjoy.description'),
      icon: "✨",
    },
  ];

  return (
    <section className="how-it-works-section">
      <div className="container">
        <h2 className="section-title">{t('title')}</h2>
        <p className="section-subtitle">{t('subtitle')}</p>
        
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="icon-wrapper">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < steps.length - 1 && <div className="connector mobile-hidden"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
