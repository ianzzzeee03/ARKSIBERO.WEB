const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const navLinks = [...document.querySelectorAll(".nav-link")];
const pageViews = {
  game: [document.querySelector(".hero"), document.querySelector(".ticker"), document.querySelector("#game")],
  characters: [document.querySelector("#characters")],
  guide: [document.querySelector("#guide")],
  archive: [document.querySelector("#lore")]
};
const pageAnchors = { game: "game", characters: "characters", guide: "guide", archive: "lore" };
const pageOrder = Object.keys(pageViews);
const allPageElements = Object.values(pageViews).flat();
let activePage = "";

function closeMenu() {
  mainNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}

function setActiveLink(page) {
  navLinks.forEach((link) => {
    const isActive = link.dataset.page === page;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function showPage(page, { animate = true, updateHistory = false, sectionNavigation = true } = {}) {
  if (!pageViews[page]) return;
  const isSamePage = page === activePage;
  if (isSamePage) {
    if (sectionNavigation) {
      document.getElementById(pageAnchors[page])?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    }
    closeMenu();
    return;
  }

  const direction = pageOrder.indexOf(page) >= pageOrder.indexOf(activePage) ? 1 : -1;
  allPageElements.forEach((element) => {
    element.hidden = true;
    element.inert = true;
    element.setAttribute("aria-hidden", "true");
    element.classList.remove("page-enter");
    element.style.removeProperty("--page-shift");
    element.style.removeProperty("--page-delay");
  });

  pageViews[page].forEach((element, index) => {
    element.hidden = false;
    element.inert = false;
    element.removeAttribute("aria-hidden");
    if (animate) {
      element.style.setProperty("--page-shift", `${direction * 22}px`);
      element.style.setProperty("--page-delay", `${index * 65}ms`);
      element.classList.add("page-enter");
    }
  });

  activePage = page;
  setActiveLink(page);
  closeMenu();
  if (updateHistory) history.pushState({ page }, "", `#${pageAnchors[page]}`);
  window.scrollTo({ left: 0, top: 0, behavior: "instant" });
}

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;

  const page = link.dataset.page || Object.keys(pageAnchors).find((key) => `#${pageAnchors[key]}` === link.hash);
  if (!page) return;

  event.preventDefault();
  showPage(page, { updateHistory: true, sectionNavigation: !link.classList.contains("nav-link") });
});

window.addEventListener("popstate", () => {
  const page = Object.keys(pageAnchors).find((key) => `#${pageAnchors[key]}` === window.location.hash) || "game";
  showPage(page, { animate: true });
});

document.querySelectorAll(".lore-entry").forEach((entry) => {
  entry.addEventListener("toggle", () => {
    if (!entry.open) return;
    document.querySelectorAll(".lore-entry").forEach((otherEntry) => {
      if (otherEntry !== entry) otherEntry.open = false;
    });
  });
});

const dispatches = [
  {
    date: "MANILA / 14 FEBRUARY 1899",
    file: "01-A",
    title: "A bridge gone quiet",
    byline: "FROM A LETTER LEFT AT THE NEWSROOM",
    copy: "A carter arriving from the south says the bridge was closed before sunrise. He heard that armed men had stopped every wagon and turned families back toward the city. By noon, a second messenger repeated the account. No one at the newsroom has spoken to the carter himself.",
    sourceType: "UNSIGNED LETTER / SECONDHAND ACCOUNT",
    source: "The letter has no signature or return address. Its writer says the account came from a carter, but gives no name or exact location. A separate morning ledger records ordinary deliveries on the south road.",
    prompt: "Two versions, neither complete. What would you verify before printing?"
  },
  {
    date: "BINONDO / 16 FEBRUARY 1899",
    file: "02-C",
    title: "Names missing from the count",
    byline: "COPIED FROM A CLINIC NOTEBOOK",
    copy: "A handwritten list records eleven people treated after the night’s firing. The public notice names four. A clerk says the remaining names were carried to another ward, though the receiving book has not been found. One entry appears twice, in two different hands.",
    sourceType: "NOTEBOOK COPY / UNCONFIRMED CLERK",
    source: "The copy is dated and initialed, but it is not the clinic’s original book. The clerk has not agreed to be named. The repeated entry may be a duplicate—or two people with the same name.",
    prompt: "The gap is real. The reason for it is still uncertain."
  },
  {
    date: "MANILA / 18 FEBRUARY 1899",
    file: "03-B",
    title: "Three papers, one sentence",
    byline: "COMPARED FROM THE MORNING EDITIONS",
    copy: "Three newspapers describe the same gathering as a planned attack. Each uses the phrase “according to reliable information.” None names a witness. The sentence is identical—even the unusual comma after “gathering” appears in all three editions.",
    sourceType: "THREE PRINTED EDITIONS / SOURCE UNLISTED",
    source: "The papers are separate publications, but their wording matches exactly. One edition arrived by wire service; the other two do not credit a source. Repetition does not establish that the reports were independently checked.",
    prompt: "Three mastheads can still trace back to one unverified account."
  },
  {
    date: "TONDO / 21 FEBRUARY 1899",
    file: "04-D",
    title: "The warning before the shots",
    byline: "RECORDED AFTER AN EVENING INTERVIEW",
    copy: "A resident remembers a warning bell, then two shots from the direction of the river. A second resident remembers the shots first. Both agree that the street emptied before the patrol arrived. Neither will have their name printed.",
    sourceType: "TWO ORAL ACCOUNTS / NO SIGNED STATEMENT",
    source: "The interviews were recorded separately on the same evening. The witnesses agree on what happened afterward, but not on the order of events. The interviewer could not confirm where either person stood.",
    prompt: "Agreement on one detail does not settle the details they remember differently."
  }
];

const storyPaper = document.querySelector("#story-paper");
const storySource = document.querySelector("#story-source");
let currentDispatch = 0;
let isTurningPage = false;

function renderDispatch(index, animationClass = "") {
  const dispatch = dispatches[index];
  currentDispatch = index;
  document.querySelector("#story-counter").textContent = `${String(index + 1).padStart(2, "0")} / ${String(dispatches.length).padStart(2, "0")}`;
  document.querySelector("[data-story-date]").textContent = dispatch.date;
  document.querySelector("[data-story-file]").textContent = dispatch.file;
  document.querySelector("[data-story-title]").textContent = dispatch.title;
  document.querySelector("[data-story-byline]").textContent = dispatch.byline;
  document.querySelector("[data-story-copy]").textContent = dispatch.copy;
  document.querySelector("[data-source-type]").textContent = dispatch.sourceType;
  document.querySelector("[data-source-copy]").textContent = dispatch.source;
  document.querySelector("[data-source-prompt]").textContent = dispatch.prompt;
  storySource.hidden = true;
  document.querySelectorAll(".story-vote").forEach((button) => {
    button.classList.remove("is-selected");
    button.setAttribute("aria-pressed", "false");
  });
  document.querySelector("#story-previous").disabled = index === 0;
  document.querySelector("#story-next").disabled = index === dispatches.length - 1;
  if (animationClass) storyPaper.classList.add(animationClass);
}

document.querySelectorAll(".story-vote").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".story-vote").forEach((vote) => {
      const isSelected = vote === button;
      vote.classList.toggle("is-selected", isSelected);
      vote.setAttribute("aria-pressed", String(isSelected));
    });
    storySource.hidden = false;
  });
});

function turnDispatch(direction) {
  if (isTurningPage) return;
  const nextIndex = currentDispatch + direction;
  if (nextIndex < 0 || nextIndex >= dispatches.length) return;

  isTurningPage = true;
  storyPaper.classList.remove("is-arriving");
  storyPaper.classList.add("is-turning");
  window.setTimeout(() => {
    storyPaper.classList.remove("is-turning");
    renderDispatch(nextIndex, "is-arriving");
    window.setTimeout(() => {
      storyPaper.classList.remove("is-arriving");
      isTurningPage = false;
    }, 520);
  }, 520);
}

document.querySelector("#story-previous").addEventListener("click", () => turnDispatch(-1));
document.querySelector("#story-next").addEventListener("click", () => turnDispatch(1));
storyPaper.addEventListener("animationend", () => {
  if (storyPaper.classList.contains("is-turning")) return;
  storyPaper.classList.remove("is-arriving");
});
renderDispatch(currentDispatch);

const initialPage = Object.keys(pageAnchors).find((key) => `#${pageAnchors[key]}` === window.location.hash) || "game";
showPage(initialPage, { animate: false });
window.addEventListener("load", () => window.scrollTo({ left: 0, top: 0, behavior: "instant" }), { once: true });