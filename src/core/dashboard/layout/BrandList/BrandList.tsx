// src/core/dashboard/brand/layout/BrandList/BrandList.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks/hooks' 
import { 
  getAllBrands, 
  createBrand, 
  updateBrand, 
  deleteBrand
} from '@/redux/features/brand/BrandThunks' 
import { 
  selectBrands, 
  selectBrandsLoading 
} from '@/redux/features/brand/BrandSelectors'
import { Brand } from '@/models/Brand/Brand'

import BrandHeader from '../../components/BrandHeader/BrandHeader'
import BrandTable from '../BrandTable/BrandTable'
import BrandModal from '../../components/BrandModal/BrandModal'
import ConfirmModal from '@/layout/components/dasboard/ConfirmModal/ConfirmModal'

import styles from './BrandList.module.scss'

const BrandList: React.FC = () => {
  const dispatch = useAppDispatch()
  
  const brands = useAppSelector(selectBrands) || []
  const isLoading = useAppSelector(selectBrandsLoading)

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // فراخوانی اولیه لیست
  useEffect(() => {
    dispatch(getAllBrands())
  }, [dispatch])

  const filteredBrands = useMemo(() => {
    if (!Array.isArray(brands)) return [];

    return brands.filter((brand: Brand) => {
      if (!brand) return false; 
      
      const brandName = brand.name || '';
      const brandCountry = brand.countryOfOrigin || '';
      const query = searchQuery.toLowerCase();

      return (
        brandName.toLowerCase().includes(query) ||
        brandCountry.toLowerCase().includes(query)
      );
    });
  }, [brands, searchQuery])

  const handleOpenCreateModal = () => {
    setSelectedBrand(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBrand(null)
  }

  const handleModalSubmit = async (brandData: Brand) => {
    try {
      if (selectedBrand?.brandId) {
        // عملیات ویرایش
        await dispatch(updateBrand({ 
          id: selectedBrand.brandId, 
          data: brandData 
        })).unwrap()
      } else {
        // عملیات ساخت
        const { brandId, ...createPayload } = brandData; 
        
        const sanitizedPayload = {
          ...createPayload,
          displayOrder: Number(createPayload.displayOrder) || 0,
          isActive: Boolean(createPayload.isActive)
        } as Brand;

        if(!sanitizedPayload.name) {
            alert("لطفاً نام برند را وارد کنید");
            return;
        }

        await dispatch(createBrand(sanitizedPayload)).unwrap()
      }
      
      // بستن مودال
      handleCloseModal()
      
      // فراخوانی مجدد کل لیست از سرور (بدون وابستگی به دیتای برگردانده شده از create/update)
      await dispatch(getAllBrands()).unwrap()
      
    } catch (error: any) {
      alert(error?.message || error || "خطا در برقراری ارتباط با سرور");
    }
  }

  const handleOpenDeleteModal = (brand: Brand) => {
    setBrandToDelete(brand)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!brandToDelete?.brandId) return
    setIsDeleting(true)
    try {
      await dispatch(deleteBrand(brandToDelete.brandId)).unwrap()
      setIsDeleteModalOpen(false)
      setBrandToDelete(null)
      
      // فراخوانی مجدد لیست پس از حذف
      await dispatch(getAllBrands()).unwrap()
    } catch (error: any) {
      console.error('خطا در حذف برند:', error)
      alert(error?.message || "خطا در حذف برند")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={styles.roleListContainer}>
      
      <BrandHeader 
        totalCount={brands.length}
        filteredCount={filteredBrands.length}
        search={searchQuery}
        onSearchChange={setSearchQuery}
        onAddBrand={handleOpenCreateModal}
        onRefresh={() => dispatch(getAllBrands())}
        loading={isLoading}
      />

      <div className={styles.tableWrapper}>
        {isLoading && brands.length === 0 ? (
          <div className={styles.loadingContainer}>
             <div className={styles.spinner}></div>
             <p>در حال بارگذاری لیست برندها...</p>
          </div>
        ) : (
          <BrandTable 
            brands={filteredBrands} 
            onEdit={handleOpenEditModal} 
            onDelete={handleOpenDeleteModal}
          />
        )}
      </div>

      {isModalOpen && (
        <BrandModal
          isOpen={isModalOpen}
          brand={selectedBrand}
          onClose={handleCloseModal}
          onSubmit={handleModalSubmit}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="حذف برند از سیستم"
        message={
          <>
            آیا از حذف برند <strong>{brandToDelete?.name}</strong> اطمینان دارید؟
            <br />
            این عمل غیرقابل بازگشت است.
          </>
        }
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default BrandList
