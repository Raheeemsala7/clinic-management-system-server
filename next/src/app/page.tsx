import { SwitchLanguageBtn } from "@/shared/components/switch-language-btn";
import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <SwitchLanguageBtn />
      <Button>TRTRT</Button>
    </div>
  );
}
