import React, { useState, useRef, useEffect } from "react";
import { Search, X, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useSymbolSearch, useMultipleQuotes } from "../../hooks/useMarketData";

const StockSearch = ({ onStockSelect, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymbols, setSelectedSymbols] = useState([
    "AAPL",
    "GOOGL",
    "TSLA",
    "AMZN",
    "MSFT",
  ]);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const { results, loading: searchLoading, search } = useSymbolSearch();
  const { quotes, loading: quotesLoading } = useMultipleQuotes(selectedSymbols);

  // Handle search input
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.length >= 2) {
        search(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !searchRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStockSelect = (stock) => {
    onStockSelect?.(stock);
    setSearchTerm("");
    setIsOpen(false);

    // Add to selected symbols if not already there
    if (!selectedSymbols.includes(stock.symbol)) {
      setSelectedSymbols((prev) => [...prev.slice(0, 4), stock.symbol]);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search stocks (e.g., AAPL, Tesla)..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {searchLoading && (
            <div className="p-4 text-center">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
              <p className="text-gray-400 mt-2">Searching...</p>
            </div>
          )}

          {!searchLoading && searchTerm.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-gray-400">
              No results found for "{searchTerm}"
            </div>
          )}

          {!searchLoading && results.length > 0 && (
            <div>
              <div className="p-3 border-b border-gray-700">
                <h3 className="text-sm font-medium text-gray-300">
                  Search Results
                </h3>
              </div>
              {results.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock)}
                  className="w-full p-4 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-400 truncate">
                        {stock.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {stock.type} • {stock.region}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{stock.currency}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Popular Stocks */}
          {!searchTerm && (
            <div>
              <div className="p-3 border-b border-gray-700">
                <h3 className="text-sm font-medium text-gray-300">
                  Popular Stocks
                </h3>
              </div>
              {quotesLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                  <p className="text-gray-400 mt-2">Loading quotes...</p>
                </div>
              ) : (
                selectedSymbols.map((symbol) => {
                  const quote = quotes[symbol];
                  if (!quote || quote.error) return null;

                  return (
                    <button
                      key={symbol}
                      onClick={() => handleStockSelect(quote)}
                      className="w-full p-4 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-white">{symbol}</p>
                          <p className="text-sm text-gray-400">
                            ${quote.price?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p
                              className={`text-sm font-medium ${
                                (quote.change || 0) >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {(quote.change || 0) >= 0 ? "+" : ""}$
                              {Math.abs(quote.change || 0).toFixed(2)}
                            </p>
                            <p
                              className={`text-xs ${
                                (quote.change || 0) >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {(quote.changePercent || 0) >= 0 ? "+" : ""}
                              {(quote.changePercent || 0).toFixed(2)}%
                            </p>
                          </div>
                          {(quote.change || 0) >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearch;
