import { P, match } from "ts-pattern";
import { useServerFallback } from "~/misc/useServerFallback";
import { systemVersionSignal } from "~/state/nav";
import type { SystemVersion } from "~/type";

const pathMappings = [
  {
    v1: {
      matcher: /^\/api\/rest-v1/,
      url: "/api/rest-v1",
    },
    v2: {
      matcher: /^\/api\/rest-v2/,
      url: "/api/rest-v2",
    },
  },
  {
    v1: "/docs/ko/readme",
    v2: "/docs/ko/readme-v2",
  },
];

const hiddenPaths = ["/release-notes"];

export interface VersionSwitchProps {
  url: string;
  className?: string;
}
export function VersionSwitch({ url, className }: VersionSwitchProps) {
  if (hiddenPaths.some((path) => new URL(url).pathname.startsWith(path)))
    return null;

  const systemVersion = systemVersionSignal.value;
  return (
    <div
      style={{ transition: "margin 0.1s" }}
      onClick={() => {
        const newVersion = systemVersion !== "v1" ? "v1" : "v2";
        systemVersionSignal.value = newVersion;
        const mapping = pathMappings.find((mapping) => {
          const origin = mapping[systemVersion as "v1" | "v2"];
          if (typeof origin === "string") return location.pathname === origin;
          return origin.matcher.test(location.pathname);
        });
        if (mapping) {
          location.href = match(mapping[newVersion])
            .with(P.string, (url) => url)
            .with({ url: P.string }, ({ url }) => url)
            .exhaustive();
          return;
        }
        if (location.pathname.startsWith("/docs/")) return;
        location.href = "/";
      }}
      class={`bg-slate-1 border-slate-3 text-12px text-slate-5 p-1px border-1 flex cursor-pointer select-none overflow-hidden whitespace-pre rounded-[6px] text-center font-bold ${
        className || ""
      }`}
    >
      <div class={getVersionClass("v1")}>V1</div>
      <div class={getVersionClass("v2")}>V2</div>
    </div>
  );
}
export default VersionSwitch;

function getVersionClass(thisVersion: SystemVersion) {
  const systemVersion = useServerFallback(systemVersionSignal.value, "all");
  return `py-4px rounded-[4px] ${
    systemVersion === thisVersion
      ? "bg-orange-500 flex-1 text-white px-12px"
      : "flex-1 px-8px"
  }`;
}
