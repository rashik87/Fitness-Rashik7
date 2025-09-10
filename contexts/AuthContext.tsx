
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { AppUser, AuthView } from '../types';
import * as LocalStorageService from '../services/localStorageService';
import { 
    AUTH_SUCCESS_REGISTER, UPGRADE_SUCCESS_MESSAGE, USER_ALREADY_EXISTS_ERROR, INVALID_CREDENTIALS_ERROR, 
    INVALID_CURRENT_PASSWORD_ERROR, EMAIL_NOT_FOUND_ERROR
} from '../constants';

interface AuthContextType {
  currentUser: AppUser | null;
  authView: AuthView;
  isLoadingAuth: boolean;
  isPremium: boolean;
  handleLogin: (email: string, password?: string) => { success: boolean; message?: string; };
  handleRegister: (email: string, password?: string) => { success: boolean; message?: string; };
  handleLogout: () => void;
  handleUpgrade: (showNotification: (type: 'success' | 'error', message: string) => void) => void;
  handleChangePassword: (oldPassword: string, newPassword: string) => { success: boolean; message?: string };
  handleDowngrade: () => void;
  handleForgotPassword: (email: string) => { success: boolean; password?: string; message?: string; };
  setAuthView: React.Dispatch<React.SetStateAction<AuthView>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [authView, setAuthView] = useState<AuthView>('login');
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    const isPremium = currentUser?.profile.subscription === 'premium';

    useEffect(() => {
        setIsLoadingAuth(true);
        const currentUserId = LocalStorageService.getCurrentUserId();
        if (currentUserId) {
            const users = LocalStorageService.getUsers();
            const user = users.find(u => u.id === currentUserId);
            if (user) {
                setCurrentUser(user);
            } else {
                // Data inconsistency, clear session
                LocalStorageService.setCurrentUserId(null);
                setCurrentUser(null);
            }
        }
        setIsLoadingAuth(false);
    }, []);

    const handleLogin = (email: string, password?: string): {success: boolean; message?: string} => {
        const users = LocalStorageService.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && user.password === password) {
            LocalStorageService.setCurrentUserId(user.id);
            setCurrentUser(user);
            return { success: true };
        }
        return { success: false, message: INVALID_CREDENTIALS_ERROR };
    };

    const handleRegister = (email: string, password?: string): {success: boolean; message?: string} => {
        if (!password) return { success: false, message: "Password is required" };
        const users = LocalStorageService.getUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, message: USER_ALREADY_EXISTS_ERROR };
        }
        const newUser: AppUser = {
            id: email, // Use email as ID for simplicity in local setup
            email,
            password,
            profile: {
                id: email,
                email,
                subscription: 'free'
            }
        };
        LocalStorageService.saveUsers([...users, newUser]);
        return { success: true, message: AUTH_SUCCESS_REGISTER };
    };

    const handleLogout = () => {
        LocalStorageService.setCurrentUserId(null);
        setCurrentUser(null);
    };
    
    const handleUpgrade = (showNotification: (type: 'success' | 'error', message: string) => void) => {
        if (!currentUser) return;
        const users = LocalStorageService.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex > -1) {
            const updatedUser = { ...users[userIndex], profile: { ...users[userIndex].profile, subscription: 'premium' as const }};
            users[userIndex] = updatedUser;
            LocalStorageService.saveUsers(users);
            setCurrentUser(updatedUser);
            showNotification('success', UPGRADE_SUCCESS_MESSAGE);
        }
    };

    const handleChangePassword = (oldPassword: string, newPassword: string): {success: boolean, message?: string} => {
        if (!currentUser) return { success: false, message: "No user logged in." };
        
        const users = LocalStorageService.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
    
        if (userIndex === -1) return { success: false, message: "User not found." };
        
        const user = users[userIndex];
    
        if (user.password !== oldPassword) {
            return { success: false, message: INVALID_CURRENT_PASSWORD_ERROR };
        }
    
        user.password = newPassword;
        users[userIndex] = user;
        LocalStorageService.saveUsers(users);
        
        setCurrentUser(user);
        
        return { success: true };
    };

    const handleDowngrade = () => {
        if (!currentUser) return;
        const users = LocalStorageService.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex > -1) {
            const updatedUser = { ...users[userIndex], profile: { ...users[userIndex].profile, subscription: 'free' as const }};
            users[userIndex] = updatedUser;
            LocalStorageService.saveUsers(users);
            setCurrentUser(updatedUser);
        }
    };
    
    const handleForgotPassword = (email: string): { success: boolean; password?: string; message?: string; } => {
        const users = LocalStorageService.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
        if (user && user.password) {
            return { success: true, password: user.password };
        }
    
        return { success: false, message: EMAIL_NOT_FOUND_ERROR };
    };

    const contextValue: AuthContextType = {
        currentUser, authView, isLoadingAuth, isPremium, handleLogin, handleRegister, handleLogout, handleUpgrade, 
        handleChangePassword, handleDowngrade, handleForgotPassword, setAuthView,
    };
    
    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};