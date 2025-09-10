
import React from 'react';
import { AdvancedPlanResult, Macros, PlanPhaseType } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { APP_TITLE, GOAL_OPTIONS, DAILY_TARGETS_LABEL, PLAN_PHASES_LABEL, IMPORTANT_WARNINGS_LABEL, BMR_LABEL, TDEE_LABEL, IMPORTANT_GUIDELINES_LABEL } from '../constants';

const PrintableGuide = React.forwardRef<HTMLDivElement, { plan: AdvancedPlanResult }>(({ plan }, ref) => {
    
    const containerStyle: React.CSSProperties = { width: '794px', padding: '40px', backgroundColor: '#ffffff', color: '#1E293B', fontFamily: 'Cairo, sans-serif', direction: 'rtl', textAlign: 'right' };
    const h1Style: React.CSSProperties = { fontSize: '24px', fontWeight: 'bold', color: '#4F46E5', marginBottom: '10px', textAlign: 'center' };
    const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 'bold', color: '#14B8A6', marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #E2E8F0', paddingBottom: '5px' };
    const pStyle: React.CSSProperties = { fontSize: '14px', lineHeight: 1.6 };
    const summaryCardStyle: React.CSSProperties = { border: '1px solid #E2E8F0', borderRadius: '8px', padding: '15px', marginBottom: '20px' };
    const phaseCardStyle: React.CSSProperties = { border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '15px', pageBreakInside: 'avoid' };
    const phaseHeaderStyle: React.CSSProperties = { backgroundColor: '#F8FAFC', padding: '10px 15px', borderBottom: '1px solid #E2E8F0', fontWeight: 'bold' };
    const phaseBodyStyle: React.CSSProperties = { padding: '15px', fontSize: '12px' };
    const warningBoxStyle: React.CSSProperties = { border: '1px solid #F43F5E', backgroundColor: '#FFF1F2', padding: '15px', borderRadius: '8px', color: '#9F1239', fontSize: '12px', pageBreakInside: 'avoid' };
    const guidelinesBoxStyle: React.CSSProperties = { border: '1px solid #3B82F6', backgroundColor: '#EFF6FF', padding: '15px', borderRadius: '8px', color: '#1E40AF', fontSize: '12px', pageBreakInside: 'avoid' };
    const guidelineTitleStyle: React.CSSProperties = { fontWeight: 'bold', color: '#1D4ED8', marginTop: '10px' };


    const pieData = [
        { name: "بروتين", value: plan.targetMacros.protein * 4 },
        { name: "كربوهيدرات", value: plan.targetMacros.carbs * 4 },
        { name: "دهون", value: plan.targetMacros.fat * 9 },
    ].filter(d => d.value > 0);
    const COLORS = ['#F87171', '#34D399', '#60A5FA'];

    const goalTitle = GOAL_OPTIONS.find(g => g.value === plan.goal)?.label || "خطتك";

    return (
        <div ref={ref} style={containerStyle}>
            <h1 style={h1Style}>{`دليلك الاستراتيجي من ${APP_TITLE}`}</h1>
            <p style={{...pStyle, textAlign: 'center', color: '#64748B', marginBottom: '25px'}}>خطة مخصصة لهدف: {goalTitle} - تم إنشاؤها بتاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
                <div style={{ flex: 1, ...summaryCardStyle }}>
                    <h3 style={{...h2Style, marginTop: 0, borderBottom: 'none', marginBottom: '15px'}}>{DAILY_TARGETS_LABEL}</h3>
                    <p style={{fontSize: '48px', fontWeight: 'bold', color: '#2DD4BF', textAlign: 'center', margin: 0}}>{plan.targetMacros.calories.toFixed(0)}</p>
                    <p style={{textAlign: 'center', color: '#64748B', fontSize: '14px', marginBottom: '15px'}}>سعرة حرارية/يوم</p>
                    <p style={{...pStyle, textAlign: 'center'}}><strong>{plan.durationContext}:</strong> {plan.estimatedDuration}</p>
                </div>
                <div style={{ flex: 1, ...summaryCardStyle }}>
                     <h3 style={{...h2Style, marginTop: 0, borderBottom: 'none', marginBottom: '5px'}}>توزيع الماكروز</h3>
                     <div style={{ width: '100%', height: '150px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number, name) => [`${(value / plan.targetMacros.calories * 100).toFixed(0)}%`, name]} />
                            </PieChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>

            {plan.warnings.length > 0 && (
                <div>
                    <h2 style={h2Style}>{IMPORTANT_WARNINGS_LABEL}</h2>
                    <div style={warningBoxStyle}>
                        <ul style={{ listStyleType: 'disc', paddingRight: '20px', margin: 0 }}>
                            {plan.warnings.map((warning, i) => <li key={i} style={{marginBottom: '5px'}}>{warning}</li>)}
                        </ul>
                    </div>
                </div>
            )}

            {plan.guidelines && plan.guidelines.length > 0 && (
                 <div>
                    <h2 style={h2Style}>{IMPORTANT_GUIDELINES_LABEL}</h2>
                    <div style={guidelinesBoxStyle}>
                        <ul style={{ listStyleType: 'disc', paddingRight: '20px', margin: 0 }}>
                            {plan.guidelines.map((line, i) =>
                                line.startsWith('### ') ?
                                <h4 key={i} style={guidelineTitleStyle}>{line.substring(4)}</h4> :
                                <li key={i} style={{marginBottom: '5px'}}>{line}</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}

            <div>
                <h2 style={h2Style}>{PLAN_PHASES_LABEL}</h2>
                {plan.phases.map((phase, index) => (
                    <div key={index} style={phaseCardStyle}>
                        <div style={phaseHeaderStyle}>
                            <p style={{margin: 0, color: '#4F46E5'}}>{phase.name} <span style={{fontWeight: 'normal', color: '#64748B'}}>({phase.duration})</span></p>
                        </div>
                        <div style={phaseBodyStyle}>
                            <p><strong>السعرات:</strong> {phase.calories.toFixed(0)} | <strong>الماكروز:</strong> {phase.macros.protein.toFixed(0)}ب, {phase.macros.carbs.toFixed(0)}ك, {phase.macros.fat.toFixed(0)}د</p>
                            {phase.weeklyLoss && <p><strong>النزول الأسبوعي المقدر:</strong> {phase.weeklyLoss}</p>}
                            <h4 style={{fontWeight: 'bold', marginTop: '10px', marginBottom: '5px', fontSize: '12px'}}>ملاحظات:</h4>
                            <ul style={{ listStyleType: 'disc', paddingRight: '20px', margin: 0 }}>
                                {phase.notes.map((note, i) => <li key={i}>{note}</li>)}
                            </ul>
                            {phase.activityRecommendation && <>
                                <h4 style={{fontWeight: 'bold', marginTop: '10px', marginBottom: '5px', fontSize: '12px'}}>توصيات النشاط:</h4>
                                <p style={{margin:0}}>{phase.activityRecommendation}</p>
                            </>}
                            {phase.reviewInstructions && <>
                                <h4 style={{fontWeight: 'bold', marginTop: '10px', marginBottom: '5px', fontSize: '12px'}}>خطوتك التالية:</h4>
                                <p style={{margin:0}}>{phase.reviewInstructions}</p>
                            </>}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{marginTop: '30px', paddingTop: '15px', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '12px', color: '#64748B'}}>
                <p>{BMR_LABEL}: {plan.bmr} | {TDEE_LABEL}: {plan.tdee}</p>
                <p>تذكر، هذه الخطة هي نقطة انطلاق. استمع لجسدك وقم بالتعديل حسب الحاجة.</p>
            </div>
        </div>
    );
});

export default PrintableGuide;
