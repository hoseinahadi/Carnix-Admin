// features/admin-order/components/AdminOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store/index'; 
import styles from './OrderModal.module.scss';
import { OrderDto, OrderItemRequestDto, PlaceOrderRequestDto } from '@/models/order/Order';

// --- Import Product Selectors & Thunks ---
import { selectProducts, selectProductsLoading } from '@/redux/features/product/ProductSelectors';
import { getAllProducts } from '@/redux/features/product/ProductThunks';

// --- Import User Thunks ---
import { getAllUsers } from '@/redux/features/user/userThunks';

interface AdminOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void; // برای پشتیبانی از هر دو مدل ایجاد و ویرایش
  editingOrder?: OrderDto | null; // ✅ اصلاح شد: نام پراپ با List یکی شد
  loading?: boolean; // ✅ اضافه شد: چون از List پاس داده می‌شود
}

const AdminOrderModal: React.FC<AdminOrderModalProps> = ({ isOpen, onClose, onSubmit, editingOrder, loading }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const products = useSelector(selectProducts);
  const productsLoading = useSelector(selectProductsLoading);

  const users = useSelector((state: RootState) => state.user.users);
  const usersLoading = useSelector((state: RootState) => state.user.loading);

  const [activeTab, setActiveTab] = useState<'info' | 'items'>('info');

  const [userId, setUserId] = useState<number | ''>('');
  const [userSearchTerm, setUserSearchTerm] = useState<string>(''); 
  const [cartId, setCartId] = useState<number | ''>('');
  const [zipCode, setZipCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [items, setItems] = useState<OrderItemRequestDto[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [productSKUId, setProductSKUId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [weight, setWeight] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      if (products.length === 0) {
        dispatch(getAllProducts(undefined));
      }
      if (users.length === 0) {
        dispatch(getAllUsers());
      }
    }
  }, [isOpen, dispatch, products.length, users.length]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
      if (editingOrder) {
        // ✅ پر کردن فرم در حالت ویرایش
        setUserId(editingOrder.userId || '');
        setCartId(editingOrder.cartId || '');
        setZipCode(editingOrder.zipCode || '');
        setPhoneNumber(editingOrder.phoneNumber || '');
        // پشتیبانی از نام‌های مختلف آرایه در بک‌اند
        setItems(editingOrder.items || (editingOrder as any).orderItems || []); 
      } else {
        setUserId('');
        setUserSearchTerm('');
        setCartId('');
        setZipCode('');
        setPhoneNumber('');
        setItems([]);
      }
    }
  }, [isOpen, editingOrder]);

  useEffect(() => {
    if (selectedProductId !== '') {
      const product = products.find(p => p.productId === selectedProductId);
      if (product) {
        setUnitPrice(product.basePrice || 0); 
      }
    } else {
      setUnitPrice(0);
      setWeight('');
    }
  }, [selectedProductId, products]);

  const filteredUsers = users.filter(user => {
    const term = userSearchTerm.toLowerCase();
    const fullName = `${user.name || ''} ${user.family || ''}`.toLowerCase();
    const phone = user.phoneNumber || '';
    return fullName.includes(term) || phone.includes(term);
  });

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (selectedProductId !== '' && quantity > 0 && unitPrice >= 0) {
      const newItem: OrderItemRequestDto = {
        productId: Number(selectedProductId),
        productSKUId: productSKUId !== '' ? Number(productSKUId) : null,
        quantity,
        unitPrice,
        discountAmount,
        taxAmount,
        weight: weight !== '' ? Number(weight) : null,
      };
      setItems([...items, newItem]);
      
      setSelectedProductId('');
      setProductSKUId('');
      setQuantity(1);
      setUnitPrice(0);
      setDiscountAmount(0);
      setTaxAmount(0);
      setWeight('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ اصلاح شد: ارسال دیتا هم برای ویرایش و هم ایجاد انجام شود
    const orderData = {
      ...editingOrder, // حفظ مقادیر قبلی مثل orderId در حالت ویرایش
      userId: Number(userId), 
      cartId: cartId ? Number(cartId) : undefined,
      zipCode,
      phoneNumber,
      items,
    };
    
    onSubmit(orderData);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{editingOrder ? `ویرایش سفارش #${editingOrder.orderNumber || editingOrder.orderId}` : 'ایجاد سفارش جدید'}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={loading}>&times;</button>
        </div>

        <div className={styles.tabs}>
          <button 
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'info' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('info')}
          >
            اطلاعات کلی
          </button>
          <button 
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'items' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('items')}
          >
            اقلام سفارش
            {items.length > 0 && <span className={styles.badge}>{items.length}</span>}
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          
          {activeTab === 'info' && (
            <div className={styles.tabContent}>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>جستجو کاربر {usersLoading && <small>(در حال لود...)</small>}</label>
                  <input 
                    type="text" 
                    placeholder="جستجو با نام یا شماره موبایل..." 
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    disabled={!!editingOrder} 
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label>انتخاب کاربر از لیست</label>
                  <select 
                    value={userId} 
                    onChange={e => setUserId(Number(e.target.value))} 
                    required 
                    disabled={!!editingOrder}
                  >
                    <option value="">یک کاربر را انتخاب کنید...</option>
                    {filteredUsers.map(u => (
                      <option key={u.userId} value={u.userId}>
                        {u.name} {u.family} - {u.phoneNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>شناسه سبد خرید (Cart ID)</label>
                <input type="number" value={cartId} onChange={e => setCartId(Number(e.target.value))} disabled={!!editingOrder} />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>کد پستی (Zip Code)</label>
                  {/* ✅ اجازه ویرایش آدرس و تلفن در حالت ویرایش داده شد */}
                  <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label>شماره تماس گیرنده (Phone Number)</label>
                  <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div className={styles.tabContent}>
              {/* ✅ فیلد افزودن آیتم در هر دو حالت ایجاد و ویرایش باز گذاشته شد تا بتوان کالا اضافه کرد */}
              <div className={styles.addItemSection}>
                <h4>افزودن محصول به سفارش</h4>
                <div className={styles.itemInputs}>
                  <div className={styles.formGroup}>
                    <label>محصول {productsLoading && <small>(در حال لود...)</small>}</label>
                    <select 
                      value={selectedProductId} 
                      onChange={e => setSelectedProductId(Number(e.target.value))}
                    >
                      <option value="">یک محصول انتخاب کنید...</option>
                      {products.map(p => (
                        <option key={p.productId} value={p.productId}>
                          {p.productName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>SKU (اختیاری)</label>
                    <input type="number" value={productSKUId} onChange={e => setProductSKUId(Number(e.target.value))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>تعداد</label>
                    <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>قیمت واحد</label>
                    <input type="number" min="0" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} />
                  </div>
                </div>
                
                <div className={styles.itemInputs}>
                  <div className={styles.formGroup}>
                    <label>تخفیف</label>
                    <input type="number" min="0" value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>مالیات (Tax)</label>
                    <input type="number" min="0" value={taxAmount} onChange={e => setTaxAmount(Number(e.target.value))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>وزن (اختیاری)</label>
                    <input type="number" min="0" value={weight} onChange={e => setWeight(Number(e.target.value))} />
                  </div>
                  <div className={styles.formGroup}>
                     <label>&nbsp;</label>
                     <button type="button" onClick={handleAddItem} className={styles.addBtn} disabled={selectedProductId === ''}>
                       افزودن به لیست
                     </button>
                  </div>
                </div>
              </div>

              <div className={styles.itemsList}>
                <h4>لیست اقلام ({items.length} کالا)</h4>
                {items.length > 0 ? (
                  <table className={styles.itemTable}>
                    <thead>
                      <tr>
                        <th>کد محصول</th>
                        <th>SKU</th>
                        <th>تعداد</th>
                        <th>قیمت واحد</th>
                        <th>تخفیف</th>
                        <th>مالیات</th>
                        <th>مبلغ نهایی ردیف</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => {
                         // $$Total = ((UnitPrice - Discount) * Quantity) + Tax$$
                         const total = ((item.unitPrice - (item.discountAmount || 0)) * item.quantity) + (item.taxAmount || 0);
                         return (
                          <tr key={index}>
                            <td>{item.productId}</td>
                            <td>{item.productSKUId || '-'}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unitPrice.toLocaleString()}</td>
                            <td>{item.discountAmount?.toLocaleString() || 0}</td>
                            <td>{item.taxAmount?.toLocaleString() || 0}</td>
                            <td>{total.toLocaleString()}</td>
                            <td>
                              <button type="button" onClick={() => handleRemoveItem(index)} className={styles.deleteItemBtn}>حذف</button>
                            </td>
                          </tr>
                         );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className={styles.noItems}>هیچ کالایی به سفارش اضافه نشده است.</p>
                )}
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>انصراف</button>
            {/* ✅ مشکل پنهان بودن دکمه ثبت در حالت ویرایش برطرف شد */}
            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={items.length === 0 || !zipCode || !phoneNumber || !userId || loading}
            >
              {loading ? 'در حال ثبت...' : (editingOrder ? 'ذخیره تغییرات سفارش' : 'ثبت سفارش نهایی')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminOrderModal;
