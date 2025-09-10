
import React, { useState, useMemo } from 'react';
import { FoodItem, Recipe, Macros, LoggedFoodItem } from '../types';
import { useAppContext } from '../contexts/AppContext';
import {
    ADD_FOOD_TO_DIARY_BUTTON, SEARCH_RECIPES_AND_FOODS, QUANTITY_LABEL, CALORIES_LABEL,
    PROTEIN_LABEL, CARBS_LABEL, FAT_LABEL, QUICK_ADD_FOOD_TITLE, ADD_LOG_ENTRY_BUTTON,
    CANCEL_BUTTON, POSITIVE_NUMBER_ERROR, REQUIRED_FIELD_ERROR
} from '../constants';
import { Search, Utensils, X, AlertTriangle } from 'lucide-react';
import { parseServingSizeToGrams } from '../services/recipeService';

interface AddFoodLogModalProps {
    onClose: () => void;
    onAddFood: (food: Omit<LoggedFoodItem, 'logId'|'loggedAt'>) => void;
}

type SearchableItem = {
    type: 'food' | 'recipe';
    id: string;
    name: string;
    source: FoodItem | Recipe;
};

const AddFoodLogModal: React.FC<AddFoodLogModalProps> = ({ onClose, onAddFood }) => {
    const { allFoodItems, allRecipes } = useAppContext();
    const [activeTab, setActiveTab] = useState<'search' | 'quick'>('search');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<SearchableItem | null>(null);
    const [quantity, setQuantity] = useState('1');
    const [quickAddData, setQuickAddData] = useState({ name: 'وجبة سريعة', calories: '', protein: '', carbs: '', fat: '' });
    const [error, setError] = useState<string | null>(null);

    const searchableItems = useMemo((): SearchableItem[] => {
        const foods: SearchableItem[] = allFoodItems
            .filter(f => parseServingSizeToGrams(f.servingSize) !== null)
            .map(f => ({ type: 'food', id: f.id, name: f.name, source: f }));
        const recipes: SearchableItem[] = allRecipes.map(r => ({ type: 'recipe', id: r.id, name: r.name, source: r }));
        const combined = [...foods, ...recipes].sort((a,b) => a.name.localeCompare(b.name));
        
        if (!searchTerm) return combined;
        return combined.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allFoodItems, allRecipes, searchTerm]);
    
    const handleSelectItem = (item: SearchableItem) => {
        setSelectedItem(item);
        setSearchTerm(item.name);
        if (item.type === 'food') setQuantity('100');
        else setQuantity('1');
    };

    const handleAddFromSearch = () => {
        setError(null);
        if (!selectedItem) return;

        const qtyNum = parseFloat(quantity);
        if (isNaN(qtyNum) || qtyNum <= 0) {
            setError(POSITIVE_NUMBER_ERROR);
            return;
        }

        let loggedFood: Omit<LoggedFoodItem, 'logId'|'loggedAt'>;

        if (selectedItem.type === 'recipe') {
            const recipe = selectedItem.source as Recipe;
            loggedFood = {
                type: 'recipe',
                sourceId: recipe.id,
                name: recipe.name,
                quantity: qtyNum,
                unit: 'servings',
                macros: {
                    calories: recipe.perServingMacros.calories * qtyNum,
                    protein: recipe.perServingMacros.protein * qtyNum,
                    carbs: recipe.perServingMacros.carbs * qtyNum,
                    fat: recipe.perServingMacros.fat * qtyNum,
                }
            };
        } else { // type is 'food'
            const food = selectedItem.source as FoodItem;
            const baseGrams = parseServingSizeToGrams(food.servingSize) || 100;
            const multiplier = qtyNum / baseGrams;
             loggedFood = {
                type: 'food',
                sourceId: food.id,
                name: food.name,
                quantity: qtyNum,
                unit: 'grams',
                macros: {
                    calories: food.calories * multiplier,
                    protein: food.protein * multiplier,
                    carbs: food.carbs * multiplier,
                    fat: food.fat * multiplier,
                }
            };
        }
        onAddFood(loggedFood);
        onClose();
    };

    const handleAddFromQuick = () => {
        setError(null);
        const {name, calories, protein, carbs, fat} = quickAddData;
        const calNum = parseFloat(calories);
        const proNum = parseFloat(protein) || 0;
        const carbNum = parseFloat(carbs) || 0;
        const fatNum = parseFloat(fat) || 0;

        if (isNaN(calNum) || calNum < 0) {
            setError(`${CALORIES_LABEL}: ${POSITIVE_NUMBER_ERROR}`);
            return;
        }
        
        const loggedFood: Omit<LoggedFoodItem, 'logId'|'loggedAt'> = {
            type: 'quick',
            name: name.trim() || 'وجبة سريعة',
            quantity: 1,
            unit: 'entry',
            macros: { calories: calNum, protein: proNum, carbs: carbNum, fat: fatNum }
        };
        onAddFood(loggedFood);
        onClose();
    };
    
    const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm";

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter" role="dialog" aria-modal="true">
            <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-lg ring-1 ring-primary/20 relative animate-scaleIn max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 left-4 text-textMuted hover:text-textBase transition-colors p-1" aria-label="إغلاق"><X size={20} /></button>
                <div className="text-center mb-4">
                    <div className="mx-auto w-fit p-3 bg-primary/20 rounded-full mb-3"><Utensils size={28} className="text-primary" /></div>
                    <h2 className="text-xl font-bold text-primary-light">{ADD_FOOD_TO_DIARY_BUTTON}</h2>
                </div>
                
                 <div className="flex border-b border-border mb-4">
                    <button onClick={() => setActiveTab('search')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'search' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:bg-primary/10'}`}>بحث</button>
                    <button onClick={() => setActiveTab('quick')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'quick' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:bg-primary/10'}`}>{QUICK_ADD_FOOD_TITLE}</button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    {activeTab === 'search' && (
                        <div className="space-y-3">
                            <div className="relative">
                                <input type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setSelectedItem(null); }} placeholder={SEARCH_RECIPES_AND_FOODS} className={`${inputClass} ps-10`} />
                                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted" />
                            </div>
                            <div className="max-h-48 overflow-y-auto border border-border rounded-md">
                                {searchableItems.map(item => (
                                    <button key={item.id} onClick={() => handleSelectItem(item)} className={`w-full text-right p-2 text-sm hover:bg-primary/20 ${selectedItem?.id === item.id ? 'bg-primary/20' : ''}`}>
                                        {item.name} <span className="text-xs text-textMuted">({item.type === 'recipe' ? 'وصفة' : 'طعام'})</span>
                                    </button>
                                ))}
                            </div>
                            {selectedItem && (
                                <div className="p-3 bg-inputBg/50 rounded-lg space-y-2 animate-fadeIn">
                                    <label htmlFor="quantity" className="text-sm font-medium">{QUANTITY_LABEL} ({selectedItem.type === 'recipe' ? 'حصص' : 'جرام'})</label>
                                    <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} className={inputClass} step={selectedItem.type === 'recipe' ? '0.1' : '1'}/>
                                </div>
                            )}
                        </div>
                    )}
                     {activeTab === 'quick' && (
                        <div className="space-y-3">
                             <input type="text" placeholder="اسم الوجبة (اختياري)" value={quickAddData.name} onChange={e => setQuickAddData({...quickAddData, name: e.target.value})} className={inputClass} />
                             <div className="grid grid-cols-2 gap-3">
                                <input type="number" placeholder={CALORIES_LABEL} value={quickAddData.calories} onChange={e => setQuickAddData({...quickAddData, calories: e.target.value})} className={inputClass} />
                                <input type="number" placeholder={PROTEIN_LABEL} value={quickAddData.protein} onChange={e => setQuickAddData({...quickAddData, protein: e.target.value})} className={inputClass} />
                                <input type="number" placeholder={CARBS_LABEL} value={quickAddData.carbs} onChange={e => setQuickAddData({...quickAddData, carbs: e.target.value})} className={inputClass} />
                                <input type="number" placeholder={FAT_LABEL} value={quickAddData.fat} onChange={e => setQuickAddData({...quickAddData, fat: e.target.value})} className={inputClass} />
                             </div>
                        </div>
                    )}
                    {error && (
                         <div className="flex items-center gap-2 p-2 mt-2 bg-accent/10 text-accent text-sm rounded-md border border-accent/20">
                            <AlertTriangle size={16}/>
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-auto">
                    <button type="button" onClick={onClose} className="sm:w-1/3 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-3 px-4 rounded-lg shadow">{CANCEL_BUTTON}</button>
                    <button type="button" onClick={activeTab === 'search' ? handleAddFromSearch : handleAddFromQuick} disabled={activeTab === 'search' && !selectedItem} className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-primary/40 disabled:opacity-50">{ADD_LOG_ENTRY_BUTTON}</button>
                </div>
            </div>
        </div>
    );
};

export default AddFoodLogModal;