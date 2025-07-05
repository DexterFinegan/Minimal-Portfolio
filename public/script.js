const projecstBtn = document.getElementById("projects-btn");
const contactBtn = document.getElementById("contact-btn");
const aboutBtn = document.getElementById("about-btn");

projecstBtn.addEventListener("click", () => {
    window.scrollBy({
    top: 300,            
    left: 0,
    behavior: "smooth"   
  });
})

contactBtn.addEventListener("click", () => {
    window.scrollBy({
    top: 2000,            
    left: 0,
    behavior: "smooth"   
  });
})

aboutBtn.addEventListener("click", () => {
    window.scrollBy({
    top: 100,            
    left: 0,
    behavior: "smooth"   
  });
})