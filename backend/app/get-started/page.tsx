import Header from "@/components/header/header";
import UserTypeSelection from "@/components/get-started/UserTypeSelection";

export const metadata = {
  title: "Get Started - Echohorn",
  description: "Choose your path - Consumer or Truck Driver/Fleet Owner",
};

export default function GetStartedPage() {
  return (
    <div>
      <Header />
      <UserTypeSelection />
    </div>
  );
}
