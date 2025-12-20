import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      title: "Discover",
      description: "Browse through our curated list of verified homes.",
      icon: "🔍",
    },
    {
      title: "Book",
      description: "Secure your stay instantly with our easy booking system.",
      icon: "📅",
    },
    {
      title: "Enjoy",
      description: "Experience the local vibe and make unforgettable memories.",
      icon: "✨",
    },
  ];

  return (
    <section className="how-it-works-section">
      <div className="container">
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">Simple steps to your perfect stay</p>
        
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
