import Header from "@/components/header/header";
import DriverRegisterForm from "@/components/driver-register/DriverRegisterForm";

export const metadata = {
  title: "Driver & Fleet Registration - Echohorn",
  description: "Register as a driver or fleet owner with Echohorn. Join our network and start earning.",
};

export default function DriverRegisterPage() {
  return (
    <div>
      <Header />
      <DriverRegisterForm />
    </div>
  );
}
