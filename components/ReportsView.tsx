import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { WeightEntry, DailyLog, Macros } from '../types';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import {
    REPORTS_TITLE, REPORTS_DESCRIPTION, REPORTS_DATE_RANGE_LABEL, REPORTS_LAST_7_DAYS, REPORTS_LAST_30_DAYS,
    REPORTS_WEIGHT_VS_CALORIES_TITLE, REPORTS_AVG_CALORIES_LABEL, REPORTS_WEIGHT_CHANGE_LABEL, REPORTS_NO_DATA,
    CALORIES_UNIT, WEIGHT_KG_LABEL
} from '../constants';
import { Calendar, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';

type ChartDataPoint = {
    date: string;
    shortDate: string;
    weight?: number;
    calories?: number;
};

const ReportsView: React.FC = () => {
    const { progressEntries, dailyLogs, theme } = useAppContext();
    const [days, setDays] = useState(7);

    const chartData = useMemo((): ChartDataPoint[] | null => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (days - 1));
        
        const dataMap = new Map<string, ChartDataPoint>();

        // Initialize map with all dates in the range
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            dataMap.set(dateStr, { 
                date: dateStr, 
                shortDate: d.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' })
            });
        }
        
        // Populate with weight entries
        progressEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate >= startDate && entryDate <= endDate) {
                const dateStr = entry.date.split('T')[0];
                if(dataMap.has(dateStr)) {
                    dataMap.get(dateStr)!.weight = entry.weight;
                }
            }
        });

        // Populate with calorie entries
        Object.values(dailyLogs).forEach((log: DailyLog) => {
            const logDate = new Date(log.date);
             if (logDate >= startDate && logDate <= endDate) {
                const dateStr = log.date.split('T')[0];
                const totalCalories = log.food.reduce((sum, item) => sum + item.macros.calories, 0);
                 if (dataMap.has(dateStr)) {
                    dataMap.get(dateStr)!.calories = totalCalories > 0 ? totalCalories : undefined;
                 }
            }
        });
        
        let sortedData = Array.from(dataMap.values()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Fill in missing weight data by carrying the last known value forward
        let lastKnownWeight: number | undefined = undefined;
        const reversedProgress = [...progressEntries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastWeightBeforeRange = reversedProgress.find(e => new Date(e.date) < startDate)?.weight;
        lastKnownWeight = lastWeightBeforeRange;

        sortedData = sortedData.map(d => {
            if(d.weight !== undefined) {
                lastKnownWeight = d.weight;
            } else if (lastKnownWeight !== undefined) {
                d.weight = lastKnownWeight;
            }
            return d;
        });
        
        if (sortedData.every(d => d.calories === undefined && d.weight === undefined)) {
            return null;
        }

        return sortedData;
    }, [days, progressEntries, dailyLogs]);
    
    const summaryStats = useMemo(() => {
        if (!chartData) return { avgCalories: 0, weightChange: 0 };
        
        const calorieEntries = chartData.filter(d => d.calories !== undefined && d.calories > 0);
        const avgCalories = calorieEntries.length > 0
            ? calorieEntries.reduce((sum, d) => sum + d.calories!, 0) / calorieEntries.length
            : 0;
            
        const weightEntries = chartData.filter(d => d.weight !== undefined);
        const startWeight = weightEntries[0]?.weight;
        const endWeight = weightEntries[weightEntries.length - 1]?.weight;
        const weightChange = (startWeight !== undefined && endWeight !== undefined) ? endWeight - startWeight : 0;
            
        return { avgCalories, weightChange };
    }, [chartData]);
    
    const gridColor = theme === 'dark' ? '#334155' : '#E2E8F0';
    const textColor = theme === 'dark' ? '#94A3B8' : '#64748B';
    const axisLineColor = theme === 'dark' ? '#475569' : '#CBD5E1';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="p-2 bg-card/80 border border-border rounded-md shadow-lg backdrop-blur-sm text-xs">
              <p className="label font-semibold text-textBase">{`${label}`}</p>
              {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>
                    {`${p.name}: ${p.value.toFixed(1)}`}
                </p>
              ))}
            </div>
          );
        }
        return null;
    };
    
    return (
        <div className="w-full max-w-4xl space-y-6">
             <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-light flex items-center justify-center gap-3">
                    <BarChart3 size={30} />
                    <span>{REPORTS_TITLE}</span>
                </h2>
                <p className="text-textMuted mt-2 text-sm max-w-lg mx-auto">{REPORTS_DESCRIPTION}</p>
            </div>
            
            <div className="p-4 bg-card/70 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-textMuted"/>
                    <label htmlFor="date-range" className="text-sm font-medium">{REPORTS_DATE_RANGE_LABEL}</label>
                </div>
                <div className="flex bg-inputBg rounded-lg p-1 shadow-inner">
                     <button onClick={() => setDays(7)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${days === 7 ? 'bg-primary text-white shadow' : 'text-textMuted'}`}>{REPORTS_LAST_7_DAYS}</button>
                     <button onClick={() => setDays(30)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${days === 30 ? 'bg-primary text-white shadow' : 'text-textMuted'}`}>{REPORTS_LAST_30_DAYS}</button>
                </div>
            </div>

            {chartData ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-card/80 rounded-xl shadow-lg flex items-center gap-3">
                            <div className="p-2 bg-secondary/20 rounded-full text-secondary"><Calendar size={20} /></div>
                            <div>
                                <p className="text-lg font-bold">{summaryStats.avgCalories.toFixed(0)}</p>
                                <p className="text-xs text-textMuted">{REPORTS_AVG_CALORIES_LABEL}</p>
                            </div>
                        </div>
                         <div className="p-4 bg-card/80 rounded-xl shadow-lg flex items-center gap-3">
                            <div className={`p-2 rounded-full ${summaryStats.weightChange <= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}><TrendingUp size={20} /></div>
                            <div>
                                <p className="text-lg font-bold">{summaryStats.weightChange.toFixed(1)} كجم</p>
                                <p className="text-xs text-textMuted">{REPORTS_WEIGHT_CHANGE_LABEL}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-card/80 rounded-xl shadow-2xl">
                        <h3 className="font-semibold text-primary-light mb-4">{REPORTS_WEIGHT_VS_CALORIES_TITLE}</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                    <XAxis dataKey="shortDate" tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: axisLineColor }} tickLine={{ stroke: axisLineColor }}/>
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: axisLineColor }} tickLine={{ stroke: axisLineColor }} label={{ value: CALORIES_UNIT, angle: -90, position: 'insideLeft', fill: textColor, fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: axisLineColor }} tickLine={{ stroke: axisLineColor }} domain={['dataMin - 1', 'dataMax + 1']} label={{ value: WEIGHT_KG_LABEL, angle: 90, position: 'insideRight', fill: textColor, fontSize: 12 }}/>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{fontSize: '12px'}}/>
                                    <Bar yAxisId="left" dataKey="calories" fill="#8884d8" name={CALORIES_UNIT} barSize={20} />
                                    <Line yAxisId="right" type="monotone" dataKey="weight" stroke="#2DD4BF" name={WEIGHT_KG_LABEL} strokeWidth={2} connectNulls />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-8 bg-card/70 rounded-xl shadow-lg text-center flex flex-col items-center gap-3 text-textMuted">
                    <AlertCircle size={40}/>
                    <p>{REPORTS_NO_DATA}</p>
                </div>
            )}
        </div>
    );
};

export default ReportsView;
