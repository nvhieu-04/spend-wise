const Footer = () => {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="sm:flex sm:flex-col sm:items-center sm:justify-center sm:space-x-3">
          <h3 className="mb-3 text-lg font-semibold text-blue-600 sm:mb-4">
            SpendWise
          </h3>
          <p className="text-sm leading-relaxed text-gray-600">
            Manage your bank cards, track spending, and maximize rewards in one
            place.
          </p>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6 sm:mt-8 sm:pt-8">
          <p className="text-center text-xs text-gray-500 sm:text-sm">
            © {new Date().getFullYear()} SpendWise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
