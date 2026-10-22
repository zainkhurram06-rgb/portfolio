import { currentBusiness } from "@/lib/auth";
import { Page } from "@/components/admin/ui";
import { WebsiteForm } from "@/components/admin/website-form";
import { THEMES } from "@/themes";

export default async function Website() {
  const { biz } = await currentBusiness();
  const themes = Object.values(THEMES).filter((t) => t.niche === biz.niche).map((t) => ({ name: t.name, label: t.label }));
  return (
    <Page title="My website" sub="Change your words, colours and photos. Services, hours and contact details update from their own pages.">
      <WebsiteForm c={biz.content} theme={biz.theme} themes={themes} niche={biz.niche} siteUrl={`/s/${biz.slug}`} />
    </Page>
  );
}
