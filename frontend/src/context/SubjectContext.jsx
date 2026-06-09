import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SubjectContext = createContext(null);

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      // 1. Fetch subjects
      const { data: subjectsData } = await api.get('/subjects');
      
      // 2. Fetch all attendance records
      const { data: attendanceData } = await api.get('/attendance');

      // 3. Combine them locally so the frontend math engine has access to the raw records
      const mappedSubjects = subjectsData.map(s => {
        return {
          ...s,
          // Support for both populated subject object and plain string ID
          attendance: attendanceData.filter(a => a.subject?._id === s._id || a.subject === s._id)
        };
      });

      setSubjects(mappedSubjects);
    } catch (err) {
      console.error('Failed to fetch subjects', err);
      toast.error('Failed to sync subjects');
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  const createSubject = useCallback(async (payload) => {
    try {
      const { data } = await api.post('/subjects', payload);
      await fetchSubjects(); // Refresh to get nested data properly structured
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create subject';
      toast.error(msg);
      throw new Error(msg);
    }
  }, [fetchSubjects]);

  const updateSubject = useCallback(async (id, payload) => {
    try {
      await api.put(`/subjects/${id}`, payload);
      await fetchSubjects();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update subject';
      toast.error(msg);
      throw new Error(msg);
    }
  }, [fetchSubjects]);

  const deleteSubject = useCallback(async (id) => {
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
      toast.success('Subject deleted successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete subject';
      toast.error(msg);
      throw new Error(msg);
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await api.delete('/subjects/clear');
      setSubjects([]);
      toast.success('All data cleared successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clear data';
      toast.error(msg);
      throw new Error(msg);
    }
  }, []);

  return (
    <SubjectContext.Provider
      value={{ subjects, loadingSubjects, fetchSubjects, createSubject, updateSubject, deleteSubject, clearAllData }}
    >
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubjects = () => {
  const ctx = useContext(SubjectContext);
  if (!ctx) throw new Error('useSubjects must be used within SubjectProvider');
  return ctx;
};
