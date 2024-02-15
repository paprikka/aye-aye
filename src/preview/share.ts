export const share = (url: string) => {
  if (typeof navigator.clipboard.writeText !== "function")
    return Promise.reject(new Error("Clipboard access not supported"));
  return navigator.clipboard.writeText(url);
};
