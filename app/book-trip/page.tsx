import Header from "@/components/header/header";
import BookTripForm from "@/components/book-trip/BookTripForm";

export const metadata = {
  title: "Book A Trip - Echohorn",
  description: "Book your trip with Echohorn. Experience seamless travel with our fleet of vehicles.",
};

export default function BookTripPage() {
  return (
    <div>
      <Header />
      <BookTripForm />
    </div>
  );
}
