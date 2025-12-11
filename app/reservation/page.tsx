import Header from "@/components/header/header";
import ReservationForm from "@/components/reservation/ReservationForm";

export const metadata = {
  title: "Book A Trial - Echohorn",
  description: "Experience the future of fleet management. Book your trial today.",
};

export default function ReservationPage() {
  return (
    <div>
      <Header />
      <ReservationForm />
    </div>
  );
}
