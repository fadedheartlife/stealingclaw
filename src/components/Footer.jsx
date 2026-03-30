export default function Footer()
{
    return (
        <footer className="border-t border-gray-800 px-6 py-4 text-center text-xs text-gray-500">
            <p>Trading involves risk. Always verify transaction details before signing.</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} Wallet dApp Trading. All rights reserved.</p>
        </footer>
    );
}
