import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

/** Legacy /pages/{slug} URLs → /{slug} */
export default async function LegacyCmsPageRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/${slug}`);
}
