import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

export default function SearchLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <Header />
      <main key={pathname} className="page-enter">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
