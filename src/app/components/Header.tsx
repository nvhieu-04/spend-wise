import Link from "next/link";

export default function Header() {
    return (
        <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <div className="text-lg font-bold">Spend Wise</div>
        <nav>
            <ul className="flex space-x-4">
            <li>
                <Link href="/" className="hover:text-gray-400">Home</Link>
            </li>
            <li>
                <a href="/about" className="hover:text-gray-400">About</a>
            </li>
            <li>
                <a href="/contact" className="hover:text-gray-400">Contact</a>
            </li>
            </ul>
        </nav>
        </header>
    );
}