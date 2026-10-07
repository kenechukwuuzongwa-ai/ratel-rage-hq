import { SiteHeader, SiteFooter } from "./site-shell";
export function PageFrame({ kicker, title, intro, children }: { kicker: string; title: string; intro: string; children: React.ReactNode }) {
  return <><SiteHeader/><main><header className="page-hero"><div className="container"><p className="kicker">{"// "}{kicker}</p><h1>{title}</h1><p>{intro}</p></div></header>{children}</main><SiteFooter/></>;
}
