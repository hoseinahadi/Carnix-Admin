// features/products/components/ProductList.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store/index';
import {
  selectProducts,
  selectProductsLoading,
  selectProductsActionLoading,
  selectProductsError,
  selectProductDetails,
  selectDetailsLoading 
} from '@/redux/features/product/ProductSelectors';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductDetails,
} from '@/redux/features/product/ProductThunks';
import { 
  setSelectedProduct, 
  clearError,
  clearProductDetails 
} from '@/redux/features/product/ProductSlice';
import type { Product, CreateProductDto, UpdateProductDto } from '@/models/product/Product';

import ProductHeader from '../../components/ProductHeader/ProductHeader';
import ProductTable from '../ProductTable/ProductTable';
import ProductModal from '../../components/ProductModal/ProductModal';
import ConfirmModal from '../../../../layout/components/dasboard/ConfirmModal/ConfirmModal';
import ProductDetailsModal from '../../components/ProductDetailsModal/ProductDetailsModal';

import { CategoryApi } from '@/api/category/routes'; 
import { ProductMediaApi } from '@/api/product/ProductMediaApi';
import type { Category } from '@/models/category/Category'; 

import styles from './ProductList.module.scss';
import toast from 'react-hot-toast';

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductsLoading);
  const actionLoading = useSelector(selectProductsActionLoading);
  const error = useSelector(selectProductsError);
  
  const productDetails = useSelector(selectProductDetails);
  const detailsLoading = useSelector(selectDetailsLoading);

  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  // 🟢 استیت مخصوص آپلود عکس در زمان ایجاد محصول (لودینگ جانبی)
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    dispatch(getAllProducts(undefined));

    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const response = await CategoryApi.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, { duration: 4000 });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const filteredProducts = useMemo(() => {
    if (!searchValue.trim()) return products;
    const query = searchValue.toLowerCase();
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(query) ||
        p.categoryName?.toLowerCase().includes(query) ||
        p.brandName?.toLowerCase().includes(query)
    );
  }, [products, searchValue]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    dispatch(setSelectedProduct(product));
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (product: Product) => {
    setDeletingProduct(product);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      await dispatch(deleteProduct(deletingProduct.productId)).unwrap();
      toast.success('محصول با موفقیت حذف شد', { duration: 3000 });
      setIsConfirmOpen(false);
      setDeletingProduct(null);
    } catch (err) {
      toast.error(err as string, { duration: 4000 });
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await dispatch(toggleProductStatus(product.productId)).unwrap();
      toast.success(`وضعیت محصول به ${!product.isActive ? 'فعال' : 'غیرفعال'} تغییر یافت`);
    } catch (err) {
      toast.error(err as string);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    dispatch(setSelectedProduct(null));
  };

  // 🟢 هندل کردن سابمیت محصول و آپلود همزمان عکس
  const handleModalSubmit = async (data: CreateProductDto | UpdateProductDto, file?: File | null) => {
    try {
      if (editingProduct) {
        // برای ویرایش فقط دیتا رو میفرستیم (عکس از تب رسانه مدیریت میشه)
        await dispatch(updateProduct(data as UpdateProductDto)).unwrap();
        toast.success('محصول با موفقیت ویرایش شد');
        handleModalClose();
      } else {
        // ۱. اول محصول رو میسازیم
        const result: any = await dispatch(createProduct(data as CreateProductDto)).unwrap();
        
        // پیدا کردن ID محصول جدید از توی خروجی
        const newProductId = result?.productId || result?.id || result?.data?.productId;

        // ۲. اگر فایلی انتخاب شده بود و ID محصول رو داشتیم، آپلود می‌کنیم
        if (file && newProductId) {
          setIsUploadingImage(true);
          const formData = new FormData();
          formData.append('file', file);
          formData.append('MediaType', 'Image');
          formData.append('ProductId', newProductId.toString());
          formData.append('IsPrimary', 'true');
          formData.append('DisplayOrder', '0');

          await ProductMediaApi.uploadMedia(formData);
          setIsUploadingImage(false);
          toast.success('محصول و تصویر اصلی با موفقیت ذخیره شدند');
          // بعد از آپلود عکس، رفرش میکنیم تا عکس توی لیست بیاد
          dispatch(getAllProducts(undefined)); 
        } else {
          toast.success('محصول با موفقیت ایجاد شد');
        }
        handleModalClose();
      }
    } catch (err) {
      toast.error(err as string, { duration: 5000 }); 
      setIsUploadingImage(false);
    }
  };

  const handleView = (product: Product) => {
    setIsDetailsModalOpen(true);
    dispatch(getProductDetails(product.productId));
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    dispatch(clearProductDetails());
  };

  return (
    <div className={styles.container}>
      <ProductHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onAddNew={handleAddNew}
        onRefresh={() => dispatch(getAllProducts(undefined))}
        totalCount={filteredProducts.length} 
        loading={loading || isUploadingImage} 
      />

      <ProductTable
        products={filteredProducts || []}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onToggleStatus={handleToggleStatus}
        onView={handleView}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingProduct={editingProduct}
        loading={actionLoading || isUploadingImage} // 🟢
        categories={categories}
        isCategoriesLoading={isCategoriesLoading}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="حذف محصول"
        message={`آیا از حذف محصول "${deletingProduct?.productName}" اطمینان دارید؟`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        type="danger"
        isLoading={actionLoading} 
      />

      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        product={productDetails} 
        loading={detailsLoading} 
      />
    </div>
  );
};

export default ProductList;