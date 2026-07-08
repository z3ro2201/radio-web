import { redirect, RedirectType } from "next/navigation";

export default function Home() {
  redirect("/web/channel-list", RedirectType.replace);
}
