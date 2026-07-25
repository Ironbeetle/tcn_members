'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getMembershipStats } from '@/lib/actions';
import { useIsDesktop } from '@/hooks/useMediaQuery';


// Pie chart colors
const CHART_COLORS = ['#059669', '#f59e0b', '#9ca3af'];

const tcnststs = () =>{
  const router = useRouter();
  const isDesktop = useIsDesktop();

    // TanStack Query for fetching membership stats
  const {
    data: memberStats,
    isLoading: loadingStats,
  } = useQuery({
    queryKey: ['membershipStats'],
    queryFn: async () => {
      const result = await getMembershipStats();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch stats');
      }
      return result.data;
    },
    enabled: status === 'authenticated',
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Prepare pie chart data
  const pieChartData = memberStats ? [
    { name: 'Activated', value: memberStats.activatedMembers, color: CHART_COLORS[0] },
    { name: 'Pending', value: memberStats.pendingMembers, color: CHART_COLORS[1] },
    { name: 'Not Activated', value: memberStats.noneMembers, color: CHART_COLORS[2] },
  ].filter(item => item.value > 0) : [];

  if (status === "loading") {
    return (
      <div className="w-full min-h-screen genbkg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/TCN_Enter");
    return null;
  }

  // ========== STATS WIDGET ==========
  const StatsWidget = ({ className = '' }: { className?: string }) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-sm border border-amber-200 p-4 ${className}`}
      >
        <h3 className="font-bold text-amber-900 mb-3">Member Activation Status</h3>
        {loadingStats ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        ) : memberStats ? (
          <>
            {isDesktop && (
              <div className="h-48 w-full min-h-[192px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                  <PieChart>
                    <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value.toLocaleString(), 'Members']}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e7e5e4', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="space-y-1.5 mt-2">
              {[
                { label: 'Activated', value: memberStats.activatedMembers, color: 'bg-emerald-600', textColor: 'text-emerald-700' },
                { label: 'Pending', value: memberStats.pendingMembers, color: 'bg-amber-500', textColor: 'text-amber-600' },
                { label: 'Not Activated', value: memberStats.noneMembers, color: 'bg-stone-400', textColor: 'text-stone-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                    <span className="text-xs text-stone-600">{item.label}</span>
                  </div>
                  <span className={`text-xs font-bold ${item.textColor}`}>{item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-amber-200 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-800">Total Members</span>
                  <span className="text-lg font-bold text-amber-700">{memberStats.totalMembers.toLocaleString()}</span>
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  {((memberStats.activatedMembers / memberStats.totalMembers) * 100).toFixed(1)}% activated
                </div>
              </div>
              <Link href="/TCN_Stats" className="mt-2 block w-full py-2 px-4 bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium rounded-lg transition-colors text-center">
                More Stats
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-stone-500 text-sm">Unable to load stats</div>
        )}
      </motion.div>
    );
  };
    
  return <StatsWidget className="w-full lg:w-80" />
}

export default tcnststs