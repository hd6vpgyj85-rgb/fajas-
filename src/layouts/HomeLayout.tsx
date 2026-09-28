import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

export default function HomeLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <Header centered />
      <main key={pathname} className="page-enter">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
