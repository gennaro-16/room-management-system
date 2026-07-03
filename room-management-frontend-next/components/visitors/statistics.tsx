"use client"

import { useState, useEffect } from "react"
import { statisticsApi, StatsData } from "@/lib/api"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year' | 'custom'>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [timeRange, startDate, endDate])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const data = await statisticsApi.getVisitorStats({ timeRange, startDate, endDate })
      setStatsData(data)
      console.log("stats",data)
    } catch (error) {
      console.error(error)
      setStatsData(null)
    } finally {
      setLoading(false)
    }
  }

  const exportStatistics = () => {
    if (!statsData) return
    const rows: string[] = []

    rows.push(`Résumé`)
    rows.push(`Total visiteurs,${statsData.summary.totalVisitors}`)
    rows.push(`Durée moyenne,${statsData.summary.avgVisitDuration.toFixed(2)} min`)
    rows.push(`Visiteurs moyens par jour,${statsData.summary.avgDailyVisitors.toFixed(2)}`)
    rows.push(`Heure de pointe,${statsData.summary.peakHour}`)
    rows.push(`Département le plus visité,${statsData.summary.mostVisitedDepartment}`)
    rows.push(`Salle la plus visitée,${statsData.summary.mostVisitedRoom}`)
    rows.push('')

    rows.push(`Salles,Visiteurs,Pourcentage`)
    statsData.roomStats.forEach((room) => {
      const name = room.room.toLowerCase() === 'unknown' ? 'Visiteur à la réception' : room.room
      rows.push(`${name},${room.visitors},${room.percentage}%`)
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `statistiques_visiteurs_${new Date().toISOString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ⬇️ handle loading & no data states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!statsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Aucune statistique disponible
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* ✅ now it's safe: statsData is guaranteed not null */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Statistiques et Rapports des Visiteurs</h1>
          <p className="text-gray-600">Analyse complète pour la gestion des visiteurs</p>
          <div className="flex justify-end mb-4">
            <button
              onClick={exportStatistics}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Exporter les statistiques
            </button>
          </div>
        </div>
        {/* Time Range Selector */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {(['day', 'month', 'year', 'custom'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    timeRange === range
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === 'day' ? 'Jour' : range === 'month' ? 'Mois' : range === 'year' ? 'Année' : 'Personnalisé'}
                </button>
              ))}
            </div>

            {timeRange === 'custom' && (
              <div className="flex gap-3 items-center">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg px-3 py-2 border border-gray-300"
                />
                <span className="text-gray-500">à</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg px-3 py-2 border border-gray-300"
                />
              </div>
            )}

            <button
              onClick={fetchStats}
              className="ml-auto bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Rafraîchir
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
<div className="bg-card p-6 rounded-lg shadow-sm border-l-4 border-blue-500 
                transform transition-all duration-500 hover:scale-105 hover:shadow-md cursor-pointer">
  <h3 className="text-lg font-semibold text-gray-700">Nombre total de visiteurs</h3>
  <p className="text-3xl font-bold text-gray-900">{statsData.summary.totalVisitors.toLocaleString()}</p>
  <p className="text-sm text-gray-500">Depuis le début</p>
</div>

          <div className="bg-card p-6 rounded-lg shadow-sm border-l-4 border-green-500 transform transition-all duration-500 hover:scale-105 hover:shadow-md cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-700">Durée moyenne</h3>
            <p className="text-3xl font-bold text-gray-900">{statsData.summary.avgVisitDuration.toFixed(2)} min</p>
            <p className="text-sm text-gray-500">Par visite</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border-l-4 border-purple-500 transform transition-all duration-500 hover:scale-105 hover:shadow-md cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-700">Visiteurs moyens par jour</h3>
            <p className="text-3xl font-bold text-gray-900">{statsData.summary.avgDailyVisitors.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Période actuelle</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border-l-4 border-orange-500 transform transition-all duration-500 hover:scale-105 hover:shadow-md cursor-pointer ">
            <h3 className="text-lg font-semibold text-gray-700">Heure de pointe</h3>
            <p className="text-3xl font-bold text-gray-900">{statsData.summary.peakHour}</p>
            <p className="text-sm text-gray-500">Moment le plus actif</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Visitors Over Time */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Visiteurs au fil du temps</h3>
            <div className="h-80">
              
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={statsData.dailyStats}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="visitors" stroke="#8884d8" />
    </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-card p-6  rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Heures de visite les plus fréquentées</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Visiteurs par département</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData.departmentStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ department, percentage }) => `${department.toLowerCase() === 'unknown' ? 'Visiteur à la réception' : department} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="visitors"
                  >
                    {statsData.departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Purpose of Visit */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Motif de la visite</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.purposeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="purpose" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Statistics */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Salles les plus visitées</h3>
            <div className="space-y-3">
              {statsData.roomStats.map((room, index) => (
                <div key={room.room} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="font-medium">
                      {room.room.toLowerCase() === 'unknown' ? 'Visiteur à la réception' : room.room}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{room.visitors.toLocaleString()}</span>
                    <span className="text-gray-500 ml-2">({room.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Departments */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Départements principaux</h3>
            <div className="space-y-3">
              {statsData.departmentStats.map((dept, index) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="font-medium">
                       {dept.department.toLowerCase() === 'unknown' ? 'Visiteur à la réception' : dept.department}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{dept.visitors.toLocaleString()}</span>
                    <span className="text-gray-500 ml-2">({dept.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
