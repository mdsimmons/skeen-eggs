import { redirect } from "next/navigation";

export default async function TabRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/customers/${id}`);
}
