import React, { useState } from 'react';
import { Brand, Location, Filters, DailyMetric, Review } from '../types';
// Fix: Import date-fns functions from their specific submodules for consistency and to prevent module loading issues.
import format from 'date-fns/format';
import { Download, SlidersHorizontal, BarChartBig } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../services/exportService';

interface HeaderProps {
  brands: Brand[];
  locations: Location[];
  filters: Filters;
  onFiltersChange: (newFilters: Partial<Filters>) => void;
  chartData: DailyMetric[];
  reviewsData: Review[];
}

const Header: React.FC<HeaderProps> = ({ brands, locations, filters, onFiltersChange, chartData, reviewsData }) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  
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

  const selectedLocationsText = filters.locationIds.length > 0 
    ? `${filters.locationIds.length} location(s) selected`
    : 'All Locations';

  return (
    <header className="bg-white shadow-md p-4 sticky top-0 z-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
            <BarChartBig className="w-8 h-8 text-brand-blue"/>
            <h1 className="text-2xl font-bold text-slate-800">GMB Insights</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
                <div className="absolute top-full mt-2 w-64 bg-white border rounded-lg shadow-xl p-2 z-20">
                  {locations.map(location => (
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
              )}
            </div>
            
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
          
          {/* Export buttons */}
          <div className="flex items-center gap-2">
              <button 
                onClick={() => exportToPDF('dashboard-content')}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                  <Download className="w-4 h-4" /> PDF
              </button>
              {/* Fix: Updated exportToExcel call to pass chart data and reviews data as separate sheets, resolving the type error. */}
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
      </div>
    </header>
  );
};

export default Header;