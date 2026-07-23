import { HomeWorkbench } from "@/components/home-workbench";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const query = await searchParams;
  return <HomeWorkbench initialTab={query.tab === "verify" ? "verify" : "register"} />;
}
