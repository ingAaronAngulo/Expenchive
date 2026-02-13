import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  getDocs,
  QueryDocumentSnapshot,
  limitToLast
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';
import type { Expense } from '@/types';

const PAGE_SIZE = 10;

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [firstDoc, setFirstDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchExpenses = useCallback(async (
    direction: 'first' | 'next' | 'prev' = 'first',
    cursorDoc?: QueryDocumentSnapshot<DocumentData>
  ) => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let q = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(PAGE_SIZE + 1) // Fetch one extra to check if there's a next page
      );

      if (direction === 'next' && cursorDoc) {
        q = query(
          collection(db, 'expenses'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          startAfter(cursorDoc),
          limit(PAGE_SIZE + 1)
        );
      } else if (direction === 'prev' && cursorDoc) {
        q = query(
          collection(db, 'expenses'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          endBefore(cursorDoc),
          limitToLast(PAGE_SIZE + 1)
        );
      }

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      // Check if there are more results
      const hasMore = docs.length > PAGE_SIZE;
      const displayDocs = hasMore ? docs.slice(0, PAGE_SIZE) : docs;

      const expensesData: Expense[] = displayDocs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Expense));

      setExpenses(expensesData);

      if (displayDocs.length > 0) {
        setFirstDoc(displayDocs[0]);
        setLastDoc(displayDocs[displayDocs.length - 1]);
      } else {
        setFirstDoc(null);
        setLastDoc(null);
      }

      // Update pagination state
      if (direction === 'next') {
        setHasNextPage(hasMore);
        setHasPrevPage(true);
        setCurrentPage(prev => prev + 1);
      } else if (direction === 'prev') {
        setHasNextPage(true);
        setHasPrevPage(currentPage > 2);
        setCurrentPage(prev => prev - 1);
      } else {
        // First page
        setHasNextPage(hasMore);
        setHasPrevPage(false);
        setCurrentPage(1);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses');
      setLoading(false);
    }
  }, [user, currentPage]);

  const nextPage = useCallback(() => {
    if (lastDoc && hasNextPage) {
      fetchExpenses('next', lastDoc);
    }
  }, [lastDoc, hasNextPage, fetchExpenses]);

  const prevPage = useCallback(() => {
    if (firstDoc && hasPrevPage) {
      fetchExpenses('prev', firstDoc);
    }
  }, [firstDoc, hasPrevPage, fetchExpenses]);

  const resetPagination = useCallback(() => {
    fetchExpenses('first');
  }, [fetchExpenses]);

  useEffect(() => {
    fetchExpenses('first');
  }, [user]);

  return {
    expenses,
    loading,
    error,
    pagination: {
      currentPage,
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage,
      resetPagination,
      pageSize: PAGE_SIZE
    }
  };
}
