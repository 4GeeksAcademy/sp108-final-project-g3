import { Outlet } from "react-router-dom"
import ScrollToTop from "../components/ScrollToTop.jsx"
import { Navbar } from "../components/Navbar.jsx"
import { SubNavbar } from "../components/SubNavbar.jsx"
import { Footer } from "../components/Footer.jsx"

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export default function Layout () {
    return (
        <ScrollToTop>
            <Navbar />
            <SubNavbar/>
                <Outlet />
            <Footer />
        </ScrollToTop>
    )
}
