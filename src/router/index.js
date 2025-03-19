// Hack as environment specific package.json exports didn't work in parcel
module.exports =
  typeof window !== "undefined"
    ? require("./router.browser.ts")
    : require("./router.node.ts");
