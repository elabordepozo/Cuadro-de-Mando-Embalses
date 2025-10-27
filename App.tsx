
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CSV_DATA_1, CSV_DATA_2, MONTHS, SOURCES } from './constants';
import { parseCSV } from './services/dataParser';
import type { YearlyData, ChartDataPoint } from './types';
import KPICard from './components/KPICard';
import HistoricalLineChart from './components/HistoricalLineChart';
import YearlyComparisonBarChart from './components/YearlyComparisonBarChart';
import { IconChartLine, IconTrendingUp, IconStack2, IconDropletHalf2, IconDownload } from './components/Icons';
import MapPlaceholder from './components/MapPlaceholder';
import YearSelector from './components/YearSelector';

const App: React.FC = () => {
  const [allData, setAllData] = useState<{ source: string, data: YearlyData[] }[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  // State for filters
  const [selectedSources, setSelectedSources] = useState<string[]>(SOURCES);
  const [selectedYear, setSelectedYear] = useState<number>(2023);

  // State for auto-refresh
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data1 = parseCSV(CSV_DATA_1);
    const data2 = parseCSV(CSV_DATA_2);
    const combinedData = [
      { source: SOURCES[0], data: data1 },
      { source: SOURCES[1], data: data2 }
    ];
    setAllData(combinedData);

    const allYears = [...new Set(combinedData.flatMap(d => d.data.map(y => y.year)))].sort((a,b)=>a-b);
    const validYears = allYears.filter(y => y >= 1978);
    setAvailableYears(validYears);

    if (validYears.length > 0) {
      const maxYear = validYears[validYears.length - 1];
      setSelectedYear(maxYear);
    }
  }, []);

  // Auto-refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, []);
  
  const filteredAndCombinedData = useMemo(() => {
    if (allData.length === 0) return [];

    const dataFromSelectedSources = allData
      .filter(d => selectedSources.includes(d.source))
      .flatMap(d => d.data);
      
    const combinedDataMap = new Map<number, (number | null)[]>();
    dataFromSelectedSources.forEach(yearData => {
        const existing = combinedDataMap.get(yearData.year);
        if (existing) {
          const newValues = existing.map((val, i) => {
            const newVal = yearData.values[i];
            if (val === null && newVal === null) return null;
            return (val || 0) + (newVal || 0);
          });
          combinedDataMap.set(yearData.year, newValues);
        } else {
          combinedDataMap.set(yearData.year, yearData.values);
        }
      });

    return Array.from(combinedDataMap.entries())
      .map(([year, values]) => ({ year, values }))
      .sort((a, b) => a.year - b.year);
  }, [allData, selectedSources]);


  const {
    capacity,
    currentReserve,
    capacityPercentage,
    monthlyVariation
  } = useMemo(() => {
    if (filteredAndCombinedData.length === 0) {
      return { capacity: 0, currentReserve: 0, capacityPercentage: 0, monthlyVariation: 0 };
    }

    const allValues = filteredAndCombinedData.flatMap(d => d.values).filter(v => v !== null) as number[];
    const capacity = Math.max(...allValues, 0);

    const sortedData = [...filteredAndCombinedData].sort((a,b) => b.year - a.year);
    let latestYearData = null;
    
    for(const yearData of sortedData) {
        const validValues = yearData.values.filter(v => v !== null);
        if(validValues.length > 0){
            latestYearData = yearData;
            break;
        }
    }

    let currentReserve = 0;
    let prevMonthReserve = 0;

    if (latestYearData) {
        const validValues = latestYearData.values.filter(v => v !== null) as number[];
        if (validValues.length > 0) {
            currentReserve = validValues[validValues.length - 1];
            if(validValues.length > 1) {
                prevMonthReserve = validValues[validValues.length - 2];
            }
        }
    }
    
    const capacityPercentage = capacity > 0 ? (currentReserve / capacity) * 100 : 0;
    const monthlyVariation = currentReserve - prevMonthReserve;

    return { capacity, currentReserve, capacityPercentage, monthlyVariation };
  }, [filteredAndCombinedData]);

  const historicalStats = useMemo(() => {
    const stats = {
      avg: Array(12).fill(0),
      min: Array(12).fill(Infinity),
      max: Array(12).fill(-Infinity),
    };
    const counts = Array(12).fill(0);

    filteredAndCombinedData.forEach(yearData => {
      yearData.values.forEach((value, monthIndex) => {
        if (value !== null) {
          stats.avg[monthIndex] += value;
          stats.min[monthIndex] = Math.min(stats.min[monthIndex], value);
          stats.max[monthIndex] = Math.max(stats.max[monthIndex], value);
          counts[monthIndex]++;
        }
      });
    });

    stats.avg = stats.avg.map((sum, i) => (counts[i] > 0 ? sum / counts[i] : 0));
    stats.min = stats.min.map(val => val === Infinity ? 0 : val);
    stats.max = stats.max.map(val => val === -Infinity ? 0 : val);

    return stats;
  }, [filteredAndCombinedData]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    const selectedYearData = filteredAndCombinedData.find(d => d.year === selectedYear);
    return MONTHS.map((month, i) => ({
      month,
      'Mínima Histórica': historicalStats.min[i],
      'Media Histórica': historicalStats.avg[i],
      'Máxima Histórica': historicalStats.max[i],
      [selectedYear]: selectedYearData?.values[i] ?? null,
    }));
  }, [selectedYear, filteredAndCombinedData, historicalStats]);

  const handleSourceChange = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleExportPNG = async (elementRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!elementRef.current) return;
    const svgElement = elementRef.current.querySelector('svg');
    if (!svgElement) {
      console.error("SVG element not found for export.");
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
        ctx.fillStyle = '#1e293b'; // slate-800 background for the PNG
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    img.onerror = () => {
        console.error("Failed to load SVG image for PNG conversion.");
        URL.revokeObjectURL(url);
    };
    img.src = url;
  };
  
  const handleExportCSV = useCallback(() => {
    if (chartData.length === 0) return;
    
    const headers = Object.keys(chartData[0]);
    const csvRows = [
      headers.join(','),
      ...chartData.map(row => 
        headers.map(header => {
          const value = row[header];
          const escaped = value === null ? '' : String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datos_embalses_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [chartData, selectedYear]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex flex-wrap justify-between items-center gap-2">
             <h1 className="text-3xl font-bold text-cyan-400">Cuadro de Mando Hidrológico</h1>
             <p className="text-sm text-slate-500">
                Última actualización: {lastUpdated.toLocaleTimeString()}
             </p>
          </div>
          <p className="text-slate-400 mt-1">Análisis de los niveles de embalses combinados</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Columna Izquierda: Mapa y Filtros */}
          <aside className="lg:col-span-1 flex flex-col gap-6">
            <MapPlaceholder />
            
            <section className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h3 className="font-semibold text-slate-200 mb-3 text-lg border-b border-slate-700 pb-2">Controles</h3>
              
              <div className="mb-4">
                <h4 className="font-semibold text-slate-300 mb-2">Filtro por Embalse</h4>
                <div className="flex gap-4">
                  {SOURCES.map(source => (
                    <label key={source} className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedSources.includes(source)}
                        onChange={() => handleSourceChange(source)}
                        className="form-checkbox h-5 w-5 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600"
                      />
                      <span>{source}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-slate-300 mb-2">Seleccionar Año de Comparación</h4>
                <YearSelector years={availableYears} selected={selectedYear} onSelect={setSelectedYear} />
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                <button onClick={handleExportCSV} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm w-full justify-center">
                    <IconDownload />
                    Descargar Datos (CSV)
                </button>
              </div>
            </section>
          </aside>

          {/* Columna Derecha: KPIs y Gráficos */}
          <main className="lg:col-span-2 flex flex-col gap-6">
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <KPICard title="Capacidad Total" value={capacity.toFixed(2)} unit="hm³" icon={<IconStack2 />} color="text-blue-400" />
              <KPICard title="Reserva Actual" value={currentReserve.toFixed(2)} unit="hm³" icon={<IconDropletHalf2 />} color="text-green-400" />
              <KPICard title="Capacidad" value={capacityPercentage.toFixed(2)} unit="%" icon={<IconChartLine />} color="text-yellow-400" />
              <KPICard title="Variación Mensual" value={monthlyVariation.toFixed(2)} unit="hm³" icon={<IconTrendingUp />} variation={monthlyVariation} color="text-purple-400" />
            </section>

            <section className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700 shadow-lg">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-100">Variación Histórica vs. {selectedYear}</h2>
                  <button onClick={() => handleExportPNG(lineChartRef, `variacion_historica_${selectedYear}.png`)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-md" title="Descargar como PNG">
                      <IconDownload />
                  </button>
               </div>
              <div ref={lineChartRef}>
                <HistoricalLineChart data={chartData} selectedYear={selectedYear} />
              </div>
            </section>
            
            <section className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-100">Comparativa Mensual: {selectedYear} vs. Media Histórica</h2>
                <button onClick={() => handleExportPNG(barChartRef, `comparativa_mensual_${selectedYear}.png`)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-md" title="Descargar como PNG">
                    <IconDownload />
                </button>
              </div>
              <div ref={barChartRef}>
                <YearlyComparisonBarChart data={chartData} selectedYear={selectedYear} />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
