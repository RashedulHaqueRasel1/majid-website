import Banner from "@/features/Home/component/Banner";
import Navbar from "@/components/shared/website/Navbar";
import Footer from "@/components/shared/website/Footer";
import VerifyAnyDevices from "@/features/Home/component/VerifyAnyDevices";
import ImportantWarning from "@/features/Home/component/ImportantWarning";
import ExperienceSmarter from "@/features/Home/component/ExperienceSmarter";
import AIPoweredInsights from "@/features/Home/component/AIPoweredInsights";
import ForTheSmartBuyer from "@/features/Home/component/ForTheSmartBuyer";
import Pricing from "@/features/Home/component/Pricing";
import Review from "@/features/Home/component/Review";
import StartChecking from "@/features/Home/component/StartChecking";

export default function Home() {
  return (
    <main className="">
      <div className="pt-20 md:pt-[100px]">
        <Navbar />
        <Banner />
      </div>
      <VerifyAnyDevices />
      <ImportantWarning />
      <ExperienceSmarter />
      <AIPoweredInsights />
      <ForTheSmartBuyer />
      <Pricing />
      <Review />
      <StartChecking />
      <Footer />
    </main>
  );
}
