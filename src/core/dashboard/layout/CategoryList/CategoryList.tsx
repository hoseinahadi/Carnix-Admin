'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/redux/features/Category/categoryThunks';

import CategoryHeader from '../../components/CategoryHeader/CategoryHeader';
import CategoryTable from '../CategoryTable/CategoryTable';
import CategoryModal from '../../components/CategoryModal/CategoryModal';
import ConfirmModal from '@/layout/components/dasboard/ConfirmModal/ConfirmModal';
import { Category } from '@/models/category/Category';

const CategoryList: React.FC = () => {
  const dispatch = useDispatch<any>();
  
  // دریافت استیت از ریداکس
  const { categories: rawCategories, loading } = useSelector((state: any) => state.category);

  // استخراج ایمن داده‌ها بر اساس ساختار واقعی API
  let safeCategories: Category[] = [];
  if (Array.isArray(rawCategories)) {
    safeCategories = rawCategories;
  } else if (rawCategories && Array.isArray(rawCategories.data)) {
    safeCategories = rawCategories.data;
  }

  // استیت‌های محلی
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // تابع رفرش داده‌ها
  const handleRefresh = () => {
    dispatch(fetchCategories());
  };

  // فراخوانی اولیه
  useEffect(() => {
    handleRefresh();
  }, [dispatch]);

  // فیلتر کردن بر اساس فیلد name و slug (مطابق اینترفیس جدید)
  const filteredCategories = safeCategories.filter((cat) => {
    if (!cat) return false;
    const nameMatch = cat.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const slugMatch = cat.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || slugMatch;
  });

  // هندلرهای مودال فرم
  const handleOpenAddModal = () => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  // بسته شدن مودال فرم همراه با رفرش خودکار
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedCategory(null);
    handleRefresh(); 
  };

  const handleFormSubmit = (formData: any) => {
    if (selectedCategory) {
      // استفاده از فیلد payload برای هماهنگی با Thunk شما
      dispatch(updateCategory({ 
        categoryId: selectedCategory.categoryId, 
        payload: formData 
      }))
      .unwrap()
      .then(() => handleCloseFormModal())
      .catch((err) => console.error("Error updating:", err));
    } else {
      dispatch(createCategory(formData))
      .unwrap()
      .then(() => handleCloseFormModal())
      .catch((err) => console.error("Error creating:", err));
    }
  };

  // هندلرهای مودال حذف
  const handleOpenDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  // بسته شدن مودال حذف همراه با رفرش خودکار
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
    handleRefresh();
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      dispatch(deleteCategory(categoryToDelete.categoryId))
        .unwrap()
        .then(() => {
          handleCloseDeleteModal();
        })
        .catch((err) => console.error("Error deleting:", err));
    }
  };

  return (
    <div className="category-list-container">
      <CategoryHeader 
        onSearch={setSearchQuery} 
        onAdd={handleOpenAddModal} 
        onRefresh={handleRefresh}
      />
      
      {loading && safeCategories.length === 0 ? (
        <div className="loading-state">در حال بارگذاری...</div>
      ) : (
        <CategoryTable 
          categories={filteredCategories} 
          onEdit={handleOpenEditModal} 
          onDelete={handleOpenDeleteModal} 
        />
      )}

      <CategoryModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={selectedCategory}
        availableCategories={safeCategories}
        isLoading={loading}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="حذف دسته‌بندی"
        message={`آیا از حذف دسته‌بندی "${categoryToDelete?.name}" اطمینان دارید؟`}
        type="danger"
        isLoading={loading}
      />
    </div>
  );
};

export default CategoryList;
