export const initVantaBackground = (homeSection) => {
  if (!homeSection || !window.VANTA || typeof window.VANTA.NET !== "function") {
    return;
  }

  window.VANTA.NET({
    el: "#home",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200,
    minWidth: 200,
    scale: 1,
    scaleMobile: 1,
    color: 0x1e88e5,
    backgroundColor: 0x031427,
    points: 12,
    maxDistance: 22,
    spacing: 18,
    showDots: true
  });
};
