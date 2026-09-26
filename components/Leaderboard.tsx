'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface UnionMetric {
  union_id: string;
  total_score: number;
  status_label: string;
  trend: string;
  college_unions: {
    union_name: string;
    academic_year: string;
  };
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<UnionMetric[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch the Top 10 Unions
  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('union_metrics')
      .select(`
        union_id,
        total_score,
        status_label,
        trend,
        college_unions (
          union_name,
          academic_year
        )
      `)
      .order('total_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      // @ts-ignore - Supabase types can be tricky, ignoring strict type map for now
      setLeaders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // 1. Fetch initial data on load
    fetchLeaderboard();

    // 2. Set up the Realtime Subscription (WebSockets)
    const subscription = supabase
      .channel('public:union_metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'union_metrics' }, (payload) => {
        console.log('Real-time update received!', payload);
        fetchLeaderboard(); // Re-fetch to get the newly sorted top 10
      })
      .subscribe();

    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const getTrendIcon = (trend: string) => {
    if (trend === 'UP') return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (trend === 'DOWN') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-slate-400" />;
  };

  if (loading) return <div className="text-center py-8 text-slate-500 animate-pulse">Loading live standings...</div>;

  if (leaders.length === 0) return <div className="text-center py-8 text-slate-500">No union data available yet.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
            <th className="p-4 font-semibold text-center w-16">Rank</th>
            <th className="p-4 font-semibold">College Union</th>
            <th className="p-4 font-semibold hidden md:table-cell">Current Status</th>
            <th className="p-4 font-semibold text-center">Trend</th>
            <th className="p-4 font-semibold text-right">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leaders.map((union, index) => (
            <tr key={union.union_id} className="hover:bg-slate-50 transition-colors group">
              <td className="p-4 text-center">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                  index === 0 ? 'bg-amber-100 text-amber-700' :
                  index === 1 ? 'bg-slate-200 text-slate-700' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-slate-50 text-slate-500'
                }`}>
                  {index + 1}
                </span>
              </td>
              <td className="p-4">
                <div className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
                  {union.college_unions?.union_name}
                </div>
              </td>
              <td className="p-4 hidden md:table-cell">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {union.status_label}
                </span>
              </td>
              <td className="p-4">
                <div className="flex justify-center">
                  {getTrendIcon(union.trend)}
                </div>
              </td>
              <td className="p-4 text-right">
                <span className="font-bold text-slate-900 text-xl">{union.total_score}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}