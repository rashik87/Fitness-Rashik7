
import React, { useState, useMemo } from 'react';
import { FoodItem } from '../types';
import FoodListItem from './FoodListItem';
import AddFoodForm from './AddFoodForm';
import { useAppContext } from '../contexts/AppContext';
import { 
  FOOD_DATABASE_TITLE, ADD_NEW_FOOD_BUTTON, SEARCH_FOOD_PLACEHOLDER,
  NO_FOOD_ITEMS_FOUND, NO_FOOD_ITEMS_YET, NO_CUSTOM_FOOD_ITEMS_YET,
  PUBLIC_DATABASE_TAB, MY_FOODS_TAB, CONFIRM_DELETE_FOOD_MESSAGE,
  CANCEL_BUTTON, CONFIRM_BUTTON, FREE_TIER_CUSTOM_FOOD_LIMIT,
  LIMIT_REACHED_ERROR
} from '../constants';
import { Plus, Search, Lock, Database, DatabaseZap, SearchX } from 'lucide-react';

type ActiveTab = 'public' | 'private';

const FoodDatabaseView: React.FC = () => {
  const { 
    allFoodItems, 
    handleAddNewFoodItem, 
    handleUpdateFoodItem, 
    handleDeleteFoodItem, 
    isPremium, 
    showTemporaryNotification 
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddOrEditForm, setShowAddOrEditForm] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('public');
  const [foodToDelete, setFoodToDelete] = useState<FoodItem | null>(null);

  const publicFoodItems = useMemo(() => allFoodItems.filter(item => !item.isCustom), [allFoodItems]);
  const myFoodItems = useMemo(() => allFoodItems.filter(item => item.isCustom), [allFoodItems]);
  const customFoodCount = myFoodItems.length;
  const isLimitReached = !isPremium && customFoodCount >= FREE_TIER_CUSTOM_FOOD_LIMIT;

  const displayedItems = useMemo(() => {
    const sourceItems = activeTab === 'public' ? publicFoodItems : myFoodItems;
    if (!searchTerm) return sourceItems.sort((a,b) => a.name.localeCompare(b.name));
    return sourceItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [publicFoodItems, myFoodItems, searchTerm, activeTab]);


  const handleOpenAddForm = () => {
    if (isLimitReached) {
        showTemporaryNotification('error', LIMIT_REACHED_ERROR("الأطعمة المخصصة"));
        return;
    }
    setEditingFood(null);
    setShowAddOrEditForm(true);
  };

  const handleOpenEditForm = (food: FoodItem) => {
    setEditingFood(food);
    setShowAddOrEditForm(true);
  };
  
  const handleCopyFood = (food: FoodItem) => {
    if (isLimitReached) {
        showTemporaryNotification('error', LIMIT_REACHED_ERROR("الأطعمة المخصصة"));
        return;
    }
    const { id, isCustom, userId, ...foodData } = food;
    handleAddNewFoodItem(foodData, true);
  };

  const handleSubmitForm = (foodData: Omit<FoodItem, 'id' | 'isCustom' | 'userId'>, idToUpdate?: string) => {
    let success = false;
    if (idToUpdate) {
      success = handleUpdateFoodItem(foodData, idToUpdate);
    } else {
       if (isLimitReached) {
          showTemporaryNotification('error', LIMIT_REACHED_ERROR("الأطعمة المخصصة"));
          return;
       }
      success = handleAddNewFoodItem(foodData);
    }
    if (success) {
      setShowAddOrEditForm(false);
      setEditingFood(null);
    }
  };

  const handleDeleteRequest = (food: FoodItem) => {
    setFoodToDelete(food);
  };

  const handleConfirmDelete = () => {
    if (foodToDelete) {
      handleDeleteFoodItem(foodToDelete.id);
      setFoodToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setFoodToDelete(null);
  };
  
  const tabButtonClass = (isActive: boolean) => 
    `flex-1 py-2.5 text-sm font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:z-10 ${
      isActive
      ? 'bg-primary text-white shadow'
      : 'bg-card/50 hover:bg-primary/20 text-textMuted'
    }`;
  
  const getEmptyState = () => {
    if (searchTerm) {
      return (
        <div className="text-center text-textMuted p-6 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
          <SearchX size={48} className="text-textMuted/70" />
          <p>{NO_FOOD_ITEMS_FOUND}</p>
        </div>
      );
    }
    if (activeTab === 'public') {
      return (
         <div className="text-center text-textMuted p-6 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
            <Database size={48} className="text-textMuted/70" />
            <p>{NO_FOOD_ITEMS_YET}</p>
        </div>
      )
    }
    // activeTab is 'private'
    return (
       <div className="text-center text-textMuted p-8 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
            <DatabaseZap size={48} className="text-textMuted/70" />
            <p>{NO_CUSTOM_FOOD_ITEMS_YET}</p>
            <button 
              onClick={handleOpenAddForm}
              disabled={isLimitReached}
              className="mt-2 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-2 px-5 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 whitespace-nowrap flex items-center justify-center gap-2 transform [@media(hover:hover)]:hover:scale-105 active:scale-100 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:scale-100"
              aria-disabled={isLimitReached}
            >
              {isLimitReached ? <Lock size={16} /> : <Plus size={18} />}
              <span>{ADD_NEW_FOOD_BUTTON}</span>
            </button>
        </div>
    );
  }

  return (
    <div className="w-full max-w-3xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-primary-light">{FOOD_DATABASE_TITLE}</h2>
         <button 
            onClick={handleOpenAddForm}
            disabled={isLimitReached}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-5 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 whitespace-nowrap flex items-center justify-center gap-2 transform [@media(hover:hover)]:hover:scale-105 active:scale-100 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:scale-100"
            aria-disabled={isLimitReached}
          >
            {isLimitReached ? <Lock size={18} /> : <Plus size={20} />}
            <span>{ADD_NEW_FOOD_BUTTON}</span>
          </button>
      </div>

      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted" />
        <input 
          type="text"
          placeholder={SEARCH_FOOD_PLACEHOLDER}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-inputBg border border-border text-textBase rounded-lg py-3 ps-10 pe-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200"
        />
      </div>
      
      <div className="flex border-b border-border">
          <button onClick={() => setActiveTab('public')} className={tabButtonClass(activeTab === 'public')}>
            {PUBLIC_DATABASE_TAB} ({publicFoodItems.length})
          </button>
          <button onClick={() => setActiveTab('private')} className={tabButtonClass(activeTab === 'private')}>
            {MY_FOODS_TAB} ({customFoodCount} / {isPremium ? '∞' : FREE_TIER_CUSTOM_FOOD_LIMIT})
          </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
        {displayedItems.length > 0 ? (
          displayedItems.map(item => (
            <FoodListItem 
              key={item.id} 
              item={item}
              onEdit={activeTab === 'private' ? handleOpenEditForm : undefined}
              onDelete={activeTab === 'private' ? handleDeleteRequest : undefined}
              onCopy={activeTab === 'public' ? handleCopyFood : undefined}
            />
          ))
        ) : (
          getEmptyState()
        )}
      </div>

      {showAddOrEditForm && (
        <AddFoodForm 
          onSubmit={handleSubmitForm} 
          onCancel={() => setShowAddOrEditForm(false)}
          existingFood={editingFood}
        />
      )}
      
      {foodToDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter">
            <div className="bg-card p-6 rounded-xl shadow-2xl w-full max-w-sm ring-1 ring-accent/50">
                <h4 className="text-lg font-semibold text-accent mb-3">{`حذف "${foodToDelete.name}"`}</h4>
                <p className="text-textBase text-sm mb-4">{CONFIRM_DELETE_FOOD_MESSAGE}</p>
                <div className="flex space-x-3 rtl:space-x-reverse">
                    <button onClick={handleConfirmDelete} className="flex-1 bg-accent hover:bg-accent-dark text-white font-semibold py-2 px-4 rounded-md">
                        {CONFIRM_BUTTON}
                    </button>
                    <button onClick={handleCancelDelete} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-2 px-4 rounded-md">
                        {CANCEL_BUTTON}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default FoodDatabaseView;
