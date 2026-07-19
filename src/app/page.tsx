import Banner from "@/features/Home/component/Banner";
import Navbar from "@/components/shared/website/Navbar";
import Footer from "@/components/shared/website/Footer";
import VerifyAnyDevices from "@/features/Home/component/VerifyAnyDevices";
import ImportantWarning from "@/features/Home/component/ImportantWarning";
import ExperienceSmarter from "@/features/Home/component/ExperienceSmarter";
import AIPoweredInsights from "@/features/Home/component/AIPoweredInsights";
import ForTheSmartBuyer from "@/features/Home/component/ForTheSmartBuyer";
import RepairSection from "@/features/Home/component/RepairSection";
import PosSection from "@/features/Home/component/PosSection";
import Pricing from "@/features/Home/component/Pricing";
// import Review from "@/features/Home/component/Review";
import StartChecking from "@/features/Home/component/StartChecking";
import ComparisonTable from "@/features/Home/component/ComparisonTable";

export default function Home() {
  return (
    <main className="">
      <div>
        <Navbar />
        <Banner />
      </div>
      <VerifyAnyDevices />
      <ImportantWarning />
      <ExperienceSmarter />
      <AIPoweredInsights />
      <ForTheSmartBuyer />

      <Pricing />
      <ComparisonTable />
      {/* <Review /> */}
      <div className="mt-24">
        <RepairSection />
      </div>
      <PosSection />
      <StartChecking />
      <Footer />
    </main>
  );
}
