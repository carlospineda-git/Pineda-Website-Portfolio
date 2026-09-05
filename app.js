const scrollcontainer = document.getElementById("scroll-container");
const header = document.getElementById("header");
const c2 = document.querySelector(".c2");
const c1 = document.querySelector(".c1");
const themeToggleBtn = document.getElementById("theme-toggle");
const hamburgerToggle = document.getElementById("hamburger-toggle");
const navMenu = document.getElementById("nav-menu");

function getPreferredTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) return savedTheme;
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (themeToggleBtn) {
    const isDark = theme === "dark";
    themeToggleBtn.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme",
    );
    themeToggleBtn.innerHTML = isDark
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }
}

if (themeToggleBtn) {
  applyTheme(getPreferredTheme());
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") ||
      getPreferredTheme();
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

if (hamburgerToggle && header) {
  hamburgerToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("mobile-open");
    hamburgerToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );
    hamburgerToggle.innerHTML = isOpen
      ? '<i class="fi fi-rr-arrow-right"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  if (navMenu) {
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        // Smooth scroll to target section ------------
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const targetId = href.slice(1);
          scrollToSection(targetId);
        }
        // Close mobile menu ------------
        header.classList.remove("mobile-open");
        hamburgerToggle.setAttribute("aria-label", "Open navigation menu");
        hamburgerToggle.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }
}

// Header Show/Hide Based on Container Intersection -------------
if (header && c1) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === c1) {
            // Hide header when container 1 is visible ------------
            c2.classList.remove("padding-left");
            header.classList.remove("show");
          } else {
            // Show header when other sections are visible ------------
            c2.classList.add("padding-left");
            header.classList.add("show");
          }
        }
      });
    },
    {
      root: null,
      threshold: 0.2,
    },
  );

  document.querySelectorAll(".snap-section").forEach((section) => {
    observer.observe(section);
  });
}

// Scroll Reveal Observer for Smooth Section Animations -----------
const revealElements = document.querySelectorAll(".reveal-on-scroll");
if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: scrollcontainer || null,
      threshold: 0.15,
    },
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}

// Email Copy to Clipboard ------------
const copyEmailBtn = document.getElementById("copy-email-btn");
const emailText = document.getElementById("email-text");

if (copyEmailBtn && emailText) {
  copyEmailBtn.addEventListener("click", () => {
    const email = emailText.textContent.trim();
    navigator.clipboard
      .writeText(email)
      .then(() => {
        const originalHTML = copyEmailBtn.innerHTML;
        copyEmailBtn.innerHTML =
          '<i class="fas fa-check"></i> <span>Copied!</span>';
        setTimeout(() => {
          copyEmailBtn.innerHTML = originalHTML;
        }, 2000);
      })
      .catch((err) => {
        console.error("Clipboard copy failed:", err);
      });
  });
}

// Contact Form Handler
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formStatus.textContent =
      "Thank you! Your message has been sent successfully.";
    formStatus.style.color = "var(--bg)";
    contactForm.reset();
    setTimeout(() => {
      formStatus.textContent = "";
    }, 5000);
  });
}

// Interactive Hero Terminal Engine ------------
const termInput = document.getElementById("terminal-input");
const termOutput = document.getElementById("terminal-output");
const cmdHistory = [];
let historyIndex = -1;

const availableCommands = [
  "help",
  "about",
  "skills",
  "projects",
  "contact",
  "theme",
  "clear",
  "sudo",
];

if (termInput && termOutput) {
  termInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const rawCmd = termInput.value.trim();
      const cmd = rawCmd.toLowerCase();

      if (rawCmd.length > 0) {
        cmdHistory.push(rawCmd);
        historyIndex = cmdHistory.length;
      }

      // Render prompt entry
      const cmdEntry = document.createElement("div");
      cmdEntry.className = "term-cmd-entry";
      cmdEntry.innerHTML = `<span class="term-prompt">carlospineda@dev:~$</span><span>${escapeHTML(rawCmd)}</span>`;
      termOutput.appendChild(cmdEntry);

      termInput.value = "";
      executeTerminalCommand(cmd);
      scrollToBottom();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyIndex > 0) {
        historyIndex--;
        termInput.value = cmdHistory[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        historyIndex++;
        termInput.value = cmdHistory[historyIndex];
      } else {
        historyIndex = cmdHistory.length;
        termInput.value = "";
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const currentVal = termInput.value.trim().toLowerCase();
      if (currentVal.length > 0) {
        const match = availableCommands.find((c) => c.startsWith(currentVal));
        if (match) {
          termInput.value = match;
        }
      }
    }
  });
}

function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        tag
      ] || tag,
  );
}

function scrollToBottom() {
  if (termOutput && termOutput.parentElement) {
    termOutput.parentElement.scrollTop = termOutput.parentElement.scrollHeight;
  }
}

function printTermLine(text, isHTML = false) {
  const line = document.createElement("p");
  line.className = "term-line";
  if (isHTML) {
    line.innerHTML = text;
  } else {
    line.textContent = text;
  }
  termOutput.appendChild(line);
}

function executeTerminalCommand(cmd) {
  switch (cmd) {
    case "help":
      printTermLine(
        `
                <div class="term-help-grid">
                    <span class="term-help-cmd">help</span><span class="term-help-desc">List available commands</span>
                    <span class="term-help-cmd">about</span><span class="term-help-desc">View developer profile summary</span>
                    <span class="term-help-cmd">skills</span><span class="term-help-desc">List technical skills & stack</span>
                    <span class="term-help-cmd">projects</span><span class="term-help-desc">Explore featured projects</span>
                    <span class="term-help-cmd">contact</span><span class="term-help-desc">Get in touch via email or form</span>
                    <span class="term-help-cmd">theme</span><span class="term-help-desc">Toggle light/dark mode</span>
                    <span class="term-help-cmd">clear</span><span class="term-help-desc">Clear terminal buffer</span>
                    <span class="term-help-cmd">sudo</span><span class="term-help-desc">Execute superuser action</span>
                </div>
            `,
        true,
      );
      break;

    case "about":
    case "bio":
      printTermLine(
        "Full-Stack Software Engineer building web applications, automation tools, and systems.",
      );
      scrollToSection("about");
      break;

    case "skills":
    case "tech":
      printTermLine(
        "Skills: HTML5, CSS3, JavaScript ES6+, Node.js, Python, Git",
      );
      scrollToSection("skills");
      break;

    case "projects":
    case "work":
      printTermLine("Navigating to featured projects showcase...");
      scrollToSection("projects");
      break;

    case "contact":
      printTermLine("Email: pinedacarlosmiguel06@gmail.com | Form available below");
      scrollToSection("contact");
      break;

    case "theme":
      const currentTheme =
        document.documentElement.getAttribute("data-theme") ||
        getPreferredTheme();
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      printTermLine(`Switched theme mode to: ${nextTheme.toUpperCase()}`);
      break;

    case "clear":
      termOutput.innerHTML = "";
      break;

    case "sudo":
      printTermLine("Permission denied: Carlos is the only superuser!");
      break;

    case "":
      break;

    default:
      printTermLine(
        `Command not found: '${cmd}'. Type 'help' for available commands.`,
      );
      break;
  }
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth" });
  }
}
