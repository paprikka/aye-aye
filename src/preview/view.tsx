import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import styles from "./view.module.css";
import { linksFromDOM } from "./links-from-dom";

const getHTMLContent = () =>
  new Promise((resolve) => {
    window.addEventListener(
      "message",
      (event) => {
        resolve(linksFromDOM(event.data));
      },
      { once: true }
    );

    window.parent.postMessage("ayeaye::ready", "*");
  });

export const init = () => {
  function App() {
    useEffect(() => {
      getHTMLContent().then(setLinks);
    }, []);
    const [links, setLinks] = useState<{ text: string; href: string }[]>([]);
    return (
      <div className={styles.container}>
        <h1>Links from the page</h1>
        <ul>
          {links.map((link) => {
            return (
              <li>
                <a href={link.href} target="_blank">
                  {link.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const root = document.getElementById("root");
  render(<App />, root!);
};
