export const createMonogram = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
