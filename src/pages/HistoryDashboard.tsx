import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, AlertCircle, Clock, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { getLockerUsageHistory, getLockerStats } from '../services/historyService';
import { StatsPanel } from '../components/admin/StatsPanel';
import { UsageTable } from '../components/admin/UsageTable';
import { AlertsList } from '../components/admin/AlertsList';
import type { LockerUsageRecord, LockerStats } from '../types';

const HistoryDashboard = () => {
  const [usageRecords, setUsageRecords] = useState<LockerUsageRecord[]>([]);
  const [stats, setStats] = useState<LockerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'active' | 'abandoned'>('all');
  const [currentTab, setCurrentTab] = useState<'usage' | 'alerts'>('usage');
  
  // Aplicar clase admin-page y remover kiosk-display al montar el componente
  useEffect(() => {
    // Remover clase de kiosk-display
    document.body.classList.remove('kiosk-display');
    // Añadir clase para admin
    document.body.classList.add('admin-page');
    
    // Limpiar al desmontar
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);
  
  // Cargar datos
  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      try {
        const records = getLockerUsageHistory();
        const statsData = getLockerStats();
        setUsageRecords(records);
        setStats(statsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filtrar registros
  const filteredRecords = usageRecords.filter(record => {
    const matchesSearch = 
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.lockerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calcular todas las alertas
  const allAlerts = usageRecords.flatMap(record => record.alerts);
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-slate-800 text-white p-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Locker Smart</h1>
              <p className="text-gray-300">Panel de Administración</p>
            </div>
          </div>
          
          <Link to="/" className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al Kiosko</span>
          </Link>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Historial de Uso</h2>
          <p className="text-gray-600">Monitoreo de actividad de lockers y alertas de seguridad</p>
        </div>
        
        {/* Estadísticas */}
        {stats && <StatsPanel stats={stats} />}
        
        {/* Controles */}
        <div className="mt-10 mb-6 flex flex-wrap gap-4 justify-between items-center">
          {/* Buscador */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por correo o ID del locker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-4">
            {/* Filtro de estado */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block pl-10 pr-8 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completados</option>
                <option value="active">Activos</option>
                <option value="abandoned">Abandonados</option>
              </select>
            </div>
            
            {/* Botón de exportar */}
            <button className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-4 py-3 shadow-sm transition-colors">
              <Download className="h-5 w-5 text-gray-500" />
              <span>Exportar</span>
            </button>
            
            {/* Botón de refrescar */}
            <button className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg px-4 py-3 shadow-sm transition-colors">
              <RefreshCw className="h-5 w-5" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentTab('usage')}
              className={`py-4 px-1 border-b-2 font-medium text-lg ${
                currentTab === 'usage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>Historial de Uso</span>
              </div>
            </button>
            
            <button
              onClick={() => setCurrentTab('alerts')}
              className={`py-4 px-1 border-b-2 font-medium text-lg ${
                currentTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Alertas de Seguridad</span>
                {allAlerts.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2.5 rounded-full text-sm">
                    {allAlerts.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
        
        {/* Contenido según tab activa */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : (
          <>
            {currentTab === 'usage' && (
              <UsageTable records={filteredRecords} />
            )}
            
            {currentTab === 'alerts' && (
              <AlertsList alerts={allAlerts} records={usageRecords} />
            )}
          </>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>© 2025 Smart Locker System - Panel de Administración v1.0</p>
          <p className="mt-2">Desarrollado por Locker Smart Technologies S.L.</p>
        </div>
      </footer>
    </div>
  );
};

export default HistoryDashboard;