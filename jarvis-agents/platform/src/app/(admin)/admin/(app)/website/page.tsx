import { currentBusiness } from "@/lib/auth";
import { Page } from "@/components/admin/ui";
import { WebsiteForm } from "@/components/admin/website-form";
import { TRADE_DEFAULTS } from "@/lib/site-data";
import { templateFor, templatesFor } from "@/templates";

export default async function Website() {
  const { biz } = await currentBusiness();
  const templates = templatesFor(biz.niche).map((t) => ({ id: t.id, label: t.label, preview: `/templates/${t.id}?niche=${biz.niche}` }));
  return (
    <Page title="My website" sub="Change your words, colours and photos. Services, hours and contact details update from their own pages.">
      <WebsiteForm c={{ ...TRADE_DEFAULTS, ...biz.content }} template={templateFor(biz.theme, biz.niche).id} templates={templates}
        niche={biz.niche} siteUrl={`/s/${biz.slug}`} />
    </Page>
  );
}
