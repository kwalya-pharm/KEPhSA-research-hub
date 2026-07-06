export const initSectionEffects = ({ aboutTimeline, aboutSteps, leadershipTitle, leadershipCards }) => {
  if (aboutTimeline && aboutSteps.length) {
    aboutSteps.forEach((step) => step.classList.add("is-visible"));
    aboutTimeline.style.setProperty("--about-progress", "1");
  }

  if (leadershipTitle) {
    leadershipTitle.classList.add("is-visible");
  }

  leadershipCards.forEach((card) => card.classList.add("is-visible"));
};
