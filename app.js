const scrollcontainer = document.getElementById("scroll-container");
const header = document.getElementById("header");
const c2 = document.querySelector(".c2");
const c1 = document.querySelector(".c1");


const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            if (entry.target === c2) {
                header.classList.add("show");
                c2.classList.add("padding-left");
            } else if (entry.target === c1) {
                header.classList.remove("show");
                c2.classList.remove("padding-left");
            }
        }
    });
}, { root: scrollcontainer, threshold: 0.5 });

document.querySelectorAll(".snap-section").forEach((section) => {
    observer.observe(section);
});