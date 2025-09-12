import React, { useState } from 'react';
import { Brand, Location, Filters, DailyMetric, Review, User } from '../types';
// Fix: Changed date-fns imports to use direct paths to fix module resolution issues.
import format from 'date-fns/format';
import subDays from 'date-fns/subDays';
import differenceInDays from 'date-fns/differenceInDays';
import { Download, SlidersHorizontal, BarChartBig, Search, LogOut } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../services/exportService';

interface HeaderProps {
  brands: Brand[];
  locations: Location[];
  filters: Filters;
  onFiltersChange: (newFilters: Partial<Filters>) => void;
  chartData: DailyMetric[];
  reviewsData: Review[];
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ brands, locations, filters, onFiltersChange, chartData, reviewsData, user, onLogout }) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ brandId: e.target.value, locationIds: [] });
  };
  
  const handleLocationToggle = (locationId: string) => {
    const newLocationIds = filters.locationIds.includes(locationId)
      ? filters.locationIds.filter(id => id !== locationId)
      : [...filters.locationIds, locationId];
    onFiltersChange({ locationIds: newLocationIds });
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    const newDateRange = { ...filters.dateRange, [field]: new Date(e.target.value) };
    onFiltersChange({ dateRange: newDateRange });
  };
  
  const handleCompareToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const periodDuration = differenceInDays(filters.dateRange.to, filters.dateRange.from) + 1;
      const from = subDays(filters.dateRange.from, periodDuration);
      const to = subDays(filters.dateRange.to, periodDuration);
      onFiltersChange({ compareDateRange: { from, to } });
    } else {
      onFiltersChange({ compareDateRange: null });
    }
  };

  const handleCompareDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
      if (filters.compareDateRange) {
        const newDateRange = { ...filters.compareDateRange, [field]: new Date(e.target.value) };
        onFiltersChange({ compareDateRange: newDateRange });
      }
  };

  const selectedLocationsText = filters.locationIds.length > 0 
    ? `${filters.locationIds.length} location(s) selected`
    : 'All Locations';

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <header className="bg-white shadow-md p-4 sticky top-0 z-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
            <BarChartBig className="w-8 h-8 text-brand-blue"/>
            <h1 className="text-2xl font-bold text-slate-800">GMB Insights</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-2">
                <div className="flex flex-wrap items-center justify-end gap-2">
                {/* Filters */}
                <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg">
                    <SlidersHorizontal className="w-5 h-5 text-slate-500" />
                    <select
                    value={filters.brandId}
                    onChange={handleBrandChange}
                    className="bg-transparent text-sm font-medium focus:outline-none"
                    >
                    <option value="all">All Brands</option>
                    {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                    </select>

                    <div className="relative">
                    <button onClick={() => setShowLocationDropdown(!showLocationDropdown)} className="bg-transparent text-sm font-medium focus:outline-none">
                        {selectedLocationsText}
                    </button>
                    {showLocationDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white border rounded-lg shadow-xl p-2 z-20">
                            <div className="relative mb-2">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text"
                                    placeholder="Search locations..."
                                    value={locationSearch}
                                    onChange={e => setLocationSearch(e.target.value)}
                                    className="w-full pl-8 pr-2 py-1 border rounded"
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                            {filteredLocations.map(location => (
                                <label key={location.id} className="flex items-center space-x-2 p-1 hover:bg-slate-100 rounded">
                                <input
                                    type="checkbox"
                                    checked={filters.locationIds.includes(location.id)}
                                    onChange={() => handleLocationToggle(location.id)}
                                    className="form-checkbox h-4 w-4 text-brand-blue"
                                />
                                <span>{location.name}</span>
                                </label>
                            ))}
                            </div>
                        </div>
                    )}
                    </div>
                </div>
                
                {/* Export buttons */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => exportToPDF('dashboard-content')}
                        className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        <Download className="w-4 h-4" /> PDF
                    </button>
                    <button 
                        onClick={() => exportToExcel([
                            { sheetName: 'Metrics', data: chartData },
                            { sheetName: 'Reviews', data: reviewsData }
                        ], 'gmb-data.xlsx')}
                        className="flex items-center gap-2 bg-brand-green hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        <Download className="w-4 h-4" /> Excel
                    </button>
                </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-4">
                    <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg">
                        <input 
                            type="date" 
                            value={format(filters.dateRange.from, 'yyyy-MM-dd')} 
                            onChange={e => handleDateChange(e, 'from')}
                            className="bg-transparent text-sm font-medium focus:outline-none"
                        />
                        <span className="text-slate-500">-</span>
                        <input 
                            type="date" 
                            value={format(filters.dateRange.to, 'yyyy-MM-dd')} 
                            onChange={e => handleDateChange(e, 'to')}
                            className="bg-transparent text-sm font-medium focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="compare-toggle"
                            checked={!!filters.compareDateRange}
                            onChange={handleCompareToggle}
                            className="form-checkbox h-4 w-4 text-brand-blue"
                        />
                        <label htmlFor="compare-toggle" className="text-sm font-medium">Compare</label>
                    </div>
                    {filters.compareDateRange && (
                        <div className="flex items-center gap-2 p-2 bg-slate-200 rounded-lg">
                            <input 
                                type="date" 
                                value={format(filters.compareDateRange.from, 'yyyy-MM-dd')} 
                                onChange={e => handleCompareDateChange(e, 'from')}
                                className="bg-transparent text-sm font-medium focus:outline-none"
                            />
                            <span className="text-slate-500">-</span>
                            <input 
                                type="date" 
                                value={format(filters.compareDateRange.to, 'yyyy-MM-dd')} 
                                onChange={e => handleCompareDateChange(e, 'to')}
                                className="bg-transparent text-sm font-medium focus:outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="relative">
                <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 focus:outline-none rounded-full"
                    onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                >
                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                </button>
                {showUserDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border rounded-lg shadow-xl z-20">
                    <div className="p-3 border-b">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full text-left flex items-center space-x-2 p-3 text-sm hover:bg-slate-100 transition"
                    >
                        <LogOut className="w-4 h-4 text-slate-600" />
                        <span>Logout</span>
                    </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;