'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { KnowledgeItem } from './types';
import { MOCK_DATA } from './mock-data';

const STORAGE_KEY = 'knowledge-base-items';

interface KnowledgeState {
  items: KnowledgeItem[];
  initialized: boolean;
}

type Action =
  | { type: 'INIT'; payload: KnowledgeItem[] }
  | { type: 'ADD'; payload: KnowledgeItem }
  | { type: 'UPDATE'; payload: KnowledgeItem }
  | { type: 'DELETE'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'MARK_REVIEWED'; payload: string };

function reducer(state: KnowledgeState, action: Action): KnowledgeState {
  switch (action.type) {
    case 'INIT':
      return { items: action.payload, initialized: true };
    case 'ADD':
      return { ...state, items: [action.payload, ...state.items] };
    case 'UPDATE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, isFavorite: !item.isFavorite, updatedAt: new Date().toISOString() }
            : item
        ),
      };
    case 'MARK_REVIEWED':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? {
                ...item,
                reviewCount: item.reviewCount + 1,
                lastReviewedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : item
        ),
      };
    default:
      return state;
  }
}

interface KnowledgeContextValue {
  items: KnowledgeItem[];
  initialized: boolean;
  addItem: (item: Omit<KnowledgeItem, 'id' | 'isFavorite' | 'reviewCount' | 'lastReviewedAt' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (item: KnowledgeItem) => void;
  deleteItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  markReviewed: (id: string) => void;
  getItem: (id: string) => KnowledgeItem | undefined;
}

const KnowledgeContext = createContext<KnowledgeContextValue | undefined>(undefined);

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], initialized: false });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'INIT', payload: parsed });
          return;
        }
      }
    } catch {
      // ignore parse errors
    }
    dispatch({ type: 'INIT', payload: MOCK_DATA });
  }, []);

  useEffect(() => {
    if (state.initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items, state.initialized]);

  const addItem = useCallback(
    (data: Omit<KnowledgeItem, 'id' | 'isFavorite' | 'reviewCount' | 'lastReviewedAt' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newItem: KnowledgeItem = {
        ...data,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        isFavorite: false,
        reviewCount: 0,
        lastReviewedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD', payload: newItem });
    },
    []
  );

  const updateItem = useCallback((item: KnowledgeItem) => {
    dispatch({ type: 'UPDATE', payload: { ...item, updatedAt: new Date().toISOString() } });
  }, []);

  const deleteItem = useCallback((id: string) => {
    dispatch({ type: 'DELETE', payload: id });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
  }, []);

  const markReviewed = useCallback((id: string) => {
    dispatch({ type: 'MARK_REVIEWED', payload: id });
  }, []);

  const getItem = useCallback(
    (id: string) => state.items.find((item) => item.id === id),
    [state.items]
  );

  return (
    <KnowledgeContext.Provider
      value={{ items: state.items, initialized: state.initialized, addItem, updateItem, deleteItem, toggleFavorite, markReviewed, getItem }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (!context) {
    throw new Error('useKnowledge must be used within a KnowledgeProvider');
  }
  return context;
}
