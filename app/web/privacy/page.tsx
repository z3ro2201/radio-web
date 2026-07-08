import { Privacy } from "@/components/privacy/privacyContent";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

const WebPrivacyPage = () => {
  return (
    <>
      <div className="p-2 text-lg">
        <Link href="/web/settings" className="flex items-center gap-2">
          <ArrowLeftIcon />
          <span>개인정보 처리방침</span>
        </Link>
      </div>
      <Privacy type="web" />
    </>
  );
};

export default WebPrivacyPage;
