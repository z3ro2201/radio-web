import { Privacy } from "@/components/privacy/privacyContent";

const AppPrivacyPage = () => {
  return (
    <>
      <div className="p-2 text-lg">
        <span>개인정보 처리방침</span>
      </div>
      <Privacy type="app" />
    </>
  );
};

export default AppPrivacyPage;
