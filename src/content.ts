(async () => {
  const make = () => {
    const closeButtonElement = document.createElement("button");
    closeButtonElement.classList.add(`ayeaye__close-button`);
    closeButtonElement.textContent = "Close";
    closeButtonElement.onclick = () => api.dispose();

    const frame = document.createElement("iframe");
    frame.classList.add(`ayeaye__frame`);
    frame.src = chrome.runtime.getURL("preview.html");

    const dialogElement = document.createElement("dialog");
    dialogElement.classList.add("ayeaye__dialog");

    dialogElement.appendChild(frame);
    dialogElement.appendChild(closeButtonElement);
    document.body.appendChild(dialogElement);

    const onHandshake = (event) => {
      console.log({ event });
      if (event.data === "ayeaye::ready") {
        const html = document.querySelector("body")!.innerHTML;
        frame.contentWindow!.postMessage(
          {
            htmlContent: html,
            baseURL: window.location.href,
          },
          "*"
        );
      }
    };

    const api = {
      show: () => {
        window.addEventListener("message", onHandshake);
        dialogElement.showModal();
      },
      hide: () => {
        dialogElement.close();
      },
      dispose: () => {
        // we could use {once: true} in addEventListener, but this way we can
        // support lifereload when testing the page without setting up an entire
        // test env.
        window.removeEventListener("message", onHandshake);
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
