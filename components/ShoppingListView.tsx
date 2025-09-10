
import React, { useMemo, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FullMealPlan, ShoppingListItem } from '../types';
import {
  SHOPPING_LIST_TITLE,
  SHOPPING_LIST_DESCRIPTION,
  DOWNLOAD_SHOPPING_LIST_BUTTON,
  NO_ITEMS_IN_SHOPPING_LIST,
  SHOPPING_LIST_ITEM_HEADER,
  SHOPPING_LIST_QUANTITY_HEADER,
  LOADING_MESSAGE,
  BACK_TO_PLAN_EDITOR_BUTTON,
  PREMIUM_FEATURE_LABEL
} from '../constants';
import { Download, Loader2, ListOrdered, ArrowLeft, Lock, ShoppingCart } from 'lucide-react';

// Hidden component for PDF generation
const PrintableShoppingList = React.forwardRef<HTMLDivElement, { items: ShoppingListItem[] }>(({ items }, ref) => {
    const containerStyle: React.CSSProperties = { width: '794px', padding: '40px', backgroundColor: '#ffffff', color: '#1E293B', fontFamily: 'Cairo, sans-serif', direction: 'rtl', textAlign: 'right' };
    const h1Style: React.CSSProperties = { fontSize: '24px', fontWeight: 'bold', color: '#4F46E5', marginBottom: '20px', textAlign: 'center' };
    const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '14px' };
    const thStyle: React.CSSProperties = { padding: '10px', borderBottom: '2px solid #6366F1', backgroundColor: '#F1F5F9', fontWeight: 'bold' };
    const tdStyle: React.CSSProperties = { padding: '10px', borderBottom: '1px solid #E2E8F0' };

    return (
        <div ref={ref} style={containerStyle}>
            <h1 style={h1Style}>{SHOPPING_LIST_TITLE}</h1>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={{...thStyle, textAlign: 'right'}}>{SHOPPING_LIST_ITEM_HEADER}</th>
                        <th style={thStyle}>{SHOPPING_LIST_QUANTITY_HEADER}</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.name}>
                            <td style={{...tdStyle, textAlign: 'right'}}>{item.name}</td>
                            <td style={{...tdStyle, textAlign: 'center'}}>{item.totalQuantity.toFixed(0)} {item.unit}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});


interface ShoppingListViewProps {
  fullPlan: FullMealPlan | null;
  onBack: () => void;
  isPremium: boolean;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({ fullPlan, onBack, isPremium }) => {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);

    const shoppingListItems = useMemo((): ShoppingListItem[] => {
        if (!fullPlan) return [];

        const aggregatedIngredients: { [name: string]: number } = {};

        fullPlan.forEach(dayPlan => {
            dayPlan.meals.forEach(meal => {
                if (meal.recipeSnapshot) {
                    const servingsInRecipe = meal.recipeSnapshot.definedServingsInRecipe || 1;
                    meal.recipeSnapshot.ingredients.forEach(ing => {
                        const adjustedQuantity = (ing.quantityGram / servingsInRecipe) * meal.quantityOfRecipeServings;
                        aggregatedIngredients[ing.foodItemName] = (aggregatedIngredients[ing.foodItemName] || 0) + adjustedQuantity;
                    });
                }
            });
        });

        return Object.entries(aggregatedIngredients)
            .map(([name, totalQuantity]): ShoppingListItem => ({
                name,
                totalQuantity,
                unit: 'جرام'
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    }, [fullPlan]);

    const handleDownloadPdf = async () => {
        if (isGeneratingPdf || !printableRef.current || !isPremium) return;
        setIsGeneratingPdf(true);

        const root = window.document.documentElement;
        const wasDarkMode = root.classList.contains('dark');
        if (wasDarkMode) {
            root.classList.remove('dark');
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 50));

            const canvas = await html2canvas(printableRef.current, { 
                scale: 1.2, // Reduced from 2 for memory performance
                useCORS: true, 
                logging: false, 
                backgroundColor: '#ffffff',
                windowHeight: printableRef.current.scrollHeight,
                scrollY: -window.scrollY
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const imgHeight = canvasHeight / ratio;
            
            const totalPages = Math.ceil(imgHeight / pdf.internal.pageSize.getHeight());

            for (let i = 0; i < totalPages; i++) {
                if (i > 0) pdf.addPage();
                const yPos = -i * pdf.internal.pageSize.getHeight();
                pdf.addImage(imgData, 'PNG', 0, yPos, pdfWidth, imgHeight);
            }
            
            pdf.save(`shopping-list-${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error("Error generating shopping list PDF:", error);
        } finally {
            setIsGeneratingPdf(false);
            if (wasDarkMode) {
                root.classList.add('dark');
            }
        }
    };


    return (
        <div className="w-full max-w-2xl space-y-6">
            <div style={{ position: 'absolute', left: '-9999px', top: 0, direction: 'rtl' }}>
                <PrintableShoppingList ref={printableRef} items={shoppingListItems} />
            </div>

            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-light flex items-center justify-center gap-3">
                    <ListOrdered size={30} />
                    <span>{SHOPPING_LIST_TITLE}</span>
                </h2>
                <p className="text-textMuted mt-2 text-sm max-w-lg mx-auto">{SHOPPING_LIST_DESCRIPTION}</p>
            </div>
            
            <div className="p-4 sm:p-6 bg-card/80 rounded-xl shadow-2xl border-t-4 border-primary">
                {shoppingListItems.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        <div className="flow-root">
                            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                    <table className="min-w-full divide-y divide-border/50">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="py-3.5 pr-4 text-right text-sm font-semibold text-textBase sm:pr-0">{SHOPPING_LIST_ITEM_HEADER}</th>
                                                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-textBase">{SHOPPING_LIST_QUANTITY_HEADER}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {shoppingListItems.map((item) => (
                                                <tr key={item.name} className="hover:bg-primary/10">
                                                    <td className="whitespace-nowrap py-4 pr-4 text-sm font-medium text-textBase sm:pr-0">{item.name}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-textMuted">{item.totalQuantity.toFixed(0)} {item.unit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-textMuted p-8 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
                        <ShoppingCart size={48} className="text-textMuted/70" />
                        <p className="max-w-xs">{NO_ITEMS_IN_SHOPPING_LIST}</p>
                        <button 
                          onClick={onBack} 
                          className="mt-2 bg-primary text-white font-semibold py-2 px-5 rounded-lg transition-transform duration-200 shadow-lg [@media(hover:hover)]:hover:shadow-primary/40 flex items-center justify-center gap-2 transform [@media(hover:hover)]:hover:scale-105 active:scale-100"
                        >
                            <ArrowLeft className="me-1" size={16}/>
                            <span>{BACK_TO_PLAN_EDITOR_BUTTON}</span>
                        </button>
                    </div>
                )}
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3">
                 <div className="flex-1 relative group">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf || shoppingListItems.length === 0 || !isPremium}
                        className="w-full bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg [@media(hover:hover)]:hover:shadow-secondary/40 transform [@media(hover:hover)]:hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingPdf ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                        {isGeneratingPdf ? LOADING_MESSAGE : DOWNLOAD_SHOPPING_LIST_BUTTON}
                    </button>
                    {!isPremium && 
                        <div className="absolute inset-0 bg-card/60 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center text-xs font-semibold text-accent bg-accent/20 px-3 py-1.5 shadow">
                            <Lock size={12} className="me-1.5"/>
                            {PREMIUM_FEATURE_LABEL}
                        </div>
                    }
                </div>
                 <button onClick={onBack} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow hover:shadow-md flex items-center justify-center gap-2">
                    <ArrowLeft size={20} />
                    <span>{BACK_TO_PLAN_EDITOR_BUTTON}</span>
                </button>
            </div>

        </div>
    );
};

export default ShoppingListView;