import styles from "./content.module.css";

(async () => {
  const make = () => {
    const closeButtonElement = document.createElement("button");
    closeButtonElement.classList.add(styles.closeButton);
    closeButtonElement.textContent = "Close";
    closeButtonElement.onclick = () => api.dispose();

    const frame = document.createElement("iframe");
    frame.classList.add(styles.frame);
    frame.src = chrome.runtime.getURL("preview.html");

    const dialogElement = document.createElement("dialog");
    dialogElement.classList.add(styles.dialog);

    dialogElement.appendChild(frame);
    dialogElement.appendChild(closeButtonElement);
    document.body.appendChild(dialogElement);

    const api = {
      show: () => {
        window.addEventListener(
          "message",
          (event) => {
            console.log({ event });
            if (event.data === "ayeaye::ready") {
              const html = document.querySelector("body")!.innerHTML;
              frame.contentWindow!.postMessage(html, "*");
            }
          },
          {
            once: true,
          }
        );
        dialogElement.showModal();
      },
      hide: () => {
        dialogElement.close();
      },
      dispose: () => {
        api.hide();
        dialogElement.remove();
      },
    };

    return api;
  };

  if ("ayeaye" in window) {
    (window as any).ayeaye.dispose();
  }

  (window as any).ayeaye = make();
  (window as any).ayeaye.show();
})();
