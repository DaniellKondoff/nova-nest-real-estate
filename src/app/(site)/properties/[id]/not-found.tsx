import { SearchX } from "lucide-react";
import NotFoundContent from "@/components/layout/NotFoundContent";

export default function NotFound() {
  return (
    <NotFoundContent
      icon={SearchX}
      title="Имотът не е намерен"
      description="Този имот не съществува или вече е продаден/отдаден. Разгледайте нашите актуални оферти."
    />
  );
}
