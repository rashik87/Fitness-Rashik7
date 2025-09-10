
import React from 'react';
import { ProcessedAiRecipe } from '../types';

interface ImportRecipeModalProps {
  onClose: () => void;
  onRecipeGenerated: (recipe: ProcessedAiRecipe) => void;
}


const ImportRecipeModal: React.FC<ImportRecipeModalProps> = () => {
    // This feature has been removed as per the user's request.
    return null;
};

export default ImportRecipeModal;
