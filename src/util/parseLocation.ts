export function parseLocation(location: string) {
    let parsed = String(location)
      .replace(/\\/g, "/")
      .split("/")
      .reverse()
      .map(loc => {
          return (loc.slice(0, 1) === "!")
            ? loc.replace("!", "CN=")
            : `OU=${loc}`;
      })
      .join(",");

    parsed += ",";

    return parsed;
}