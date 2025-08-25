// src/components/marketing/Footer.tsx
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#295E4F] text-white py-10 text-center">
      {" "}
      {/* Use Tailwind color */}
      <p className="text-xl font-semibold mb-4">KBHS HIGH SCHOOL</p>
      <nav>
        <ul className="flex flex-wrap gap-4 list-none justify-center">
          <li>
            <Link
              href="/"
              className="text-white no-underline hover:underline text-sm"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="text-white no-underline hover:underline text-sm"
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              href="/admissions-page"
              className="text-white no-underline hover:underline text-sm"
            >
              Admission
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-white no-underline hover:underline text-sm"
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/facilities"
              className="text-white no-underline hover:underline text-sm"
            >
              Facilities
            </Link>
          </li>
          {/* Add other relevant links */}
        </ul>
      </nav>
      <div className="mt-6 text-xs text-gray-300">
        © {new Date().getFullYear()} KBHS High School. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
