import RepairRequestDetails from "@/features/shopkeeper/repairRequest/component/RepairRequestDetails";

export default async function RepairRequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RepairRequestDetails id={id} />;
}
